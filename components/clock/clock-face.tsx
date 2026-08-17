"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";
import { hourHandDeg, minuteHandDeg, minuteOf, onDial, SNAP_MINUTES } from "@/lib/clock/plan";

/**
 * 動かせる時計。
 *
 * ## 回した量を積み上げる
 *
 * 長い針の角度だけを見ると、**12をまたいだかどうかが分からない。**
 * 10時40分から右へ30分回しても、左へ30分回しても、
 * 文字盤の上では同じ 10分 の位置に来てしまう。
 *
 * そこで、前回の角度との差を毎回たし込んで**通算の分**として持つ。
 * こうすると「12を1周こえた」ことが数として残り、
 * 短い針もそれに合わせて次の時に入る。
 *
 * ## 5分きざみに吸いつく
 *
 * 針の先を1分（6度）で止めるのは指では無理がある。
 * 分度器で角を5の倍数に限ったのと同じ判断。
 * 「5とびで読む」のは2年で習うやり方そのものでもある。
 */

type Props = {
  /** いまの時こく（0:00からの通算の分） */
  minutes: number;
  onChange: (minutes: number) => void;
  interactive: boolean;
  /** 合っているときに色を変える */
  settled?: boolean;
};

const SIZE = 240;
const C = SIZE / 2;
const R = 100;
/** 中心のすぐそばは、少し動かすだけで角度が飛ぶので受け付けない（分度器と同じ） */
const DEAD_ZONE = 22;

const MINUTE_HAND = 84;
const HOUR_HAND = 56;

export function ClockFace({ minutes, onChange, interactive, settled = false }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  /** 直前に指が指していた角度。差をとるために持つ */
  const lastDeg = useRef<number | null>(null);
  /**
   * 丸める前の通算の分。
   *
   * **丸めた値だけを持ち回すと、指を少し動かしただけの回では
   * 毎回もとの値に丸め戻されて、針がまったく動かない。**
   * 実際にこれで動かなくなった。細かい動きをここにためて、
   * 5分をこえたぶんだけを外へ出す。
   */
  const raw = useRef(minutes);

  /** 12時の向きを0とし、時計まわりに 0〜360 */
  function angleAt(event: ReactPointerEvent): number | null {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    const dx = p.x - C;
    const dy = p.y - C;
    if (Math.hypot(dx, dy) < DEAD_ZONE) return null;
    return (((Math.atan2(dx, -dy) * 180) / Math.PI) + 360) % 360;
  }

  function move(event: ReactPointerEvent<SVGRectElement>) {
    if (!dragging.current || !interactive) return;
    const deg = angleAt(event);
    if (deg === null) return;

    if (lastDeg.current === null) {
      lastDeg.current = deg;
      return;
    }
    // 近いほうの回り方を採る。359° → 1° は +2° であって −358° ではない
    let diff = deg - lastDeg.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    lastDeg.current = deg;

    // 通算の分に足し込む。ここが「12をまたいだか」を覚えている場所
    raw.current += diff / 6;
    const snapped = Math.round(raw.current / SNAP_MINUTES) * SNAP_MINUTES;
    if (snapped !== minutes) onChange(snapped);
  }

  function down(event: ReactPointerEvent<SVGRectElement>) {
    if (!interactive) return;
    dragging.current = true;
    lastDeg.current = angleAt(event);
    // つかみ直すたびに、いまの値から数え直す
    raw.current = minutes;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function up(event: ReactPointerEvent<SVGRectElement>) {
    dragging.current = false;
    lastDeg.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const mDeg = minuteHandDeg(minutes);
  const hDeg = hourHandDeg(minutes);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto block w-full max-w-[16rem] select-none"
      style={{ touchAction: "none" }}
      role="img"
      aria-label={`時計：${Math.floor(onDial(minutes) / 60) === 0 ? 12 : Math.floor(onDial(minutes) / 60)}時${minuteOf(minutes)}分`}
    >
      <circle
        cx={C}
        cy={C}
        r={R + 12}
        className={cn("fill-white", settled ? "stroke-success" : "stroke-border")}
        strokeWidth={3}
      />

      {/* 1分ごとの目もり。5分ごとを長くする */}
      {Array.from({ length: 60 }, (_, i) => {
        const deg = i * 6;
        const long = i % 5 === 0;
        return (
          <line
            key={i}
            x1={C}
            y1={C - R - 6}
            x2={C}
            y2={C - R + (long ? 4 : 0)}
            className={long ? "stroke-foreground" : "stroke-muted-foreground/40"}
            strokeWidth={long ? 2 : 1}
            transform={`rotate(${deg} ${C} ${C})`}
          />
        );
      })}

      {/* 文字盤の数字と、その外がわの分（5とびで読む練習） */}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i === 0 ? 12 : i;
        const rad = ((i * 30 - 90) * Math.PI) / 180;
        return (
          <g key={n}>
            <text
              x={C + Math.cos(rad) * (R - 22)}
              y={C + Math.sin(rad) * (R - 22) + 7}
              textAnchor="middle"
              className="fill-foreground text-[20px] font-bold"
            >
              {n}
            </text>
            <text
              x={C + Math.cos(rad) * (R + 5)}
              y={C + Math.sin(rad) * (R + 5) + 3}
              textAnchor="middle"
              className="fill-secondary text-[9px] font-bold"
            >
              {i * 5}
            </text>
          </g>
        );
      })}

      {/* 短い針。分に合わせて連続で動く */}
      <line
        x1={C}
        y1={C}
        x2={C}
        y2={C - HOUR_HAND}
        className="stroke-foreground"
        strokeWidth={7}
        strokeLinecap="round"
        transform={`rotate(${hDeg} ${C} ${C})`}
      />
      {/* 長い針 */}
      <line
        x1={C}
        y1={C}
        x2={C}
        y2={C - MINUTE_HAND}
        className={cn(settled ? "stroke-success" : "stroke-primary")}
        strokeWidth={4}
        strokeLinecap="round"
        transform={`rotate(${mDeg} ${C} ${C})`}
      />
      {/* 長い針の先。ここをつかむ目印 */}
      <circle
        cx={C}
        cy={C - MINUTE_HAND}
        r={interactive ? 9 : 5}
        className={cn(settled ? "fill-success" : "fill-primary")}
        transform={`rotate(${mDeg} ${C} ${C})`}
      />
      <circle cx={C} cy={C} r={6} className="fill-foreground" />

      {/* つかむ面。針そのものは細いので、円全体で受ける */}
      <rect
        x={0}
        y={0}
        width={SIZE}
        height={SIZE}
        fill="transparent"
        className={cn(interactive && "cursor-grab")}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
    </svg>
  );
}
