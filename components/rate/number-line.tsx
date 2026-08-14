"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";
import {
  axisMax,
  perUnitText,
  quantityOf,
  situation,
  ticksFor,
  unitPhrase,
  type Base,
  type RatePlan,
  type Side,
} from "@/lib/rate/plan";

/**
 * 二重数直線。上下の線が同じ長さで、同じ場所が対応する量を表す。
 *
 * マーカーを動かすと**上下の数がいっしょに動く**。
 * これが「そろえる」という操作の中身そのもので、
 * 割り算の式を先に見せてしまうと、この動きが見えなくなる。
 *
 * 左右2つの数直線で**同じ長さが同じ量を表す**ようにしてある。
 * そうしておくと「1 のところ」が左右で同じ位置に来るので、
 * そろえたあとの上の数を、そのまま目で見比べられる。
 *
 * マーカーは目もりに吸いつく。指で 0.1 の精度を出させる場面ではないし、
 * ここで問うているのは位置の細かさではなく「1 に そろえる」という判断だから。
 */

type Props = {
  plan: RatePlan;
  side: Side;
  base: Base;
  /** いまのマーカー位置（base の量で数えた値） */
  marker: number;
  /** 動かせるか */
  interactive: boolean;
  onMarkerChange: (value: number) => void;
  /** 1 に合っているときに色を変える */
  settled: boolean;
};

const WIDTH = 320;
const PAD_LEFT = 58;
const PAD_RIGHT = 24;
const AXIS = WIDTH - PAD_LEFT - PAD_RIGHT;
const HEIGHT = 96;
const TOP_Y = 32;
const BOTTOM_Y = 64;

export function NumberLine({
  plan,
  side,
  base,
  marker,
  interactive,
  onMarkerChange,
  settled,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const s = situation(plan, side);
  const max = axisMax(plan, base);
  const ticks = ticksFor(plan, side, base);

  /** base の量 v が、線のどこに来るか。 */
  const x = (v: number) => PAD_LEFT + (v / max) * AXIS;
  /** 上の線（base ではないほう）の、その位置での値。 */
  const other = base === "b" ? s.a / s.b : s.b / s.a;
  const otherName = quantityOf(plan, base === "a" ? "b" : "a");
  const baseName = quantityOf(plan, base);

  const end = x(s[base]);

  function valueAt(event: ReactPointerEvent): number {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return marker;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    const raw = ((p.x - PAD_LEFT) / AXIS) * max;
    // いちばん近い目もりに吸いつく
    return ticks.reduce((best, t) => (Math.abs(t - raw) < Math.abs(best - raw) ? t : best), 0);
  }

  function handleDown(event: ReactPointerEvent<SVGRectElement>) {
    if (!interactive) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onMarkerChange(valueAt(event));
  }

  function handleMove(event: ReactPointerEvent<SVGRectElement>) {
    if (!dragging.current) return;
    onMarkerChange(valueAt(event));
  }

  function handleUp(event: ReactPointerEvent<SVGRectElement>) {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const mx = x(marker);
  const markerOther = Math.round(other * marker * 100) / 100;

  return (
    <div className="rounded-xl border border-border px-2 py-1">
      <p className="px-1 pt-1 text-xs font-bold text-muted-foreground">{s.label}</p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block w-full select-none"
        style={{ touchAction: "none" }}
        role="img"
        aria-label={`${s.label}：${otherName.name} ${base === "b" ? s.a : s.b}${otherName.unit}、${baseName.name} ${s[base]}${baseName.unit}`}
      >
        {/* 上の線（そろえない量） */}
        <line x1={PAD_LEFT} y1={TOP_Y} x2={end} y2={TOP_Y} className="stroke-foreground" strokeWidth={1.5} />
        <text x={PAD_LEFT - 6} y={TOP_Y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
          {otherName.name}
        </text>
        <text x={end} y={TOP_Y - 6} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
          {base === "b" ? s.a : s.b}
          {otherName.unit}
        </text>

        {/* 下の線（1 にそろえる量）と、その目もり */}
        <line
          x1={PAD_LEFT}
          y1={BOTTOM_Y}
          x2={end}
          y2={BOTTOM_Y}
          className="stroke-foreground"
          strokeWidth={1.5}
        />
        <text x={PAD_LEFT - 6} y={BOTTOM_Y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
          {baseName.name}
        </text>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={x(t)}
              y1={BOTTOM_Y - 4}
              x2={x(t)}
              y2={BOTTOM_Y + 4}
              className={cn(t === 1 ? "stroke-primary" : "stroke-muted-foreground")}
              strokeWidth={t === 1 ? 2 : 1}
            />
            {(t === 1 || t === s[base]) && (
              <text
                x={x(t)}
                y={BOTTOM_Y + 17}
                textAnchor="middle"
                className={cn("text-[11px] font-bold", t === 1 ? "fill-primary" : "fill-foreground")}
              >
                {t}
                {baseName.unit}
              </text>
            )}
          </g>
        ))}

        {/* マーカー。上下をつなぐ縦線がそのまま「対応」を表す */}
        <g className={cn(settled ? "stroke-success" : "stroke-primary")}>
          <line x1={mx} y1={TOP_Y - 4} x2={mx} y2={BOTTOM_Y + 4} strokeWidth={2} />
        </g>
        <circle cx={mx} cy={BOTTOM_Y} r={7} className={cn(settled ? "fill-success" : "fill-primary")} />
        <text
          x={mx}
          y={TOP_Y - 19}
          textAnchor="middle"
          className={cn("text-[13px] font-bold", settled ? "fill-success" : "fill-primary")}
        >
          {markerOther}
          {otherName.unit}
        </text>

        {/* つかむ帯。線そのものは細いので、押せる高さを広くとる */}
        <rect
          x={0}
          y={TOP_Y - 6}
          width={WIDTH}
          height={BOTTOM_Y - TOP_Y + 22}
          fill="transparent"
          className={cn(interactive && "cursor-pointer")}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
        />
      </svg>
      <p className="px-1 pb-1 text-center text-xs">
        <span className={cn("font-bold", settled ? "text-success" : "text-muted-foreground")}>
          {baseName.name} {marker}
          {baseName.unit}
        </span>
        <span className="text-muted-foreground"> あたり </span>
        <span className={cn("font-bold", settled ? "text-success" : "text-muted-foreground")}>
          {otherName.name} {markerOther}
          {otherName.unit}
        </span>
      </p>
    </div>
  );
}

/** そろえたあとの2つを、長さで見くらべる帯。数だけだと差で比べに戻りやすい。 */
export function CompareBars({ plan, base }: { plan: RatePlan; base: Base }) {
  const values: [Side, number][] = [
    ["left", Number(perUnitText(plan, "left", base))],
    ["right", Number(perUnitText(plan, "right", base))],
  ];
  const top = Math.max(...values.map(([, v]) => v));
  const otherName = quantityOf(plan, base === "a" ? "b" : "a");
  const baseName = quantityOf(plan, base);

  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-muted-foreground">
        {unitPhrase(baseName)}あたりの {otherName.name}
      </p>
      {values.map(([side, value]) => (
        <div key={side} className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-right text-xs">{situation(plan, side).label}</span>
          <div className="h-5 flex-1 rounded bg-muted">
            <div
              className="h-full rounded bg-primary/70 transition-all"
              style={{ width: `${(value / top) * 100}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-xs font-bold tabular-nums">
            {value}
            {otherName.unit}
          </span>
        </div>
      ))}
    </div>
  );
}
