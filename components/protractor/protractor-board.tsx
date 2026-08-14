"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";
import { VIEW_BOX, clampPose } from "@/lib/protractor/generate";
import {
  PROTRACTOR_RADIUS,
  alignedSide,
  otherDeg,
  pointAt,
  rayEnd,
  zeroEnd,
  type AnglePlan,
  type Point,
  type Pose,
} from "@/lib/protractor/plan";
import type { ProtractorStepKind } from "@/lib/protractor/steps";

/**
 * 角と、動かせる分度器。
 *
 * ここだけは「1手ずつ書き足す盤」ではなく**道具そのもの**を出す。
 * 分度器の当て方は、説明を読んで分かるものではなく、
 * ずれた状態から自分で合わせてみないと身につかないため。
 *
 * 手によって、同じドラッグの意味を変えている。
 * - place: 分度器全体が動く（中心を いただきに 合わせる）
 * - align: 中心を軸に まわる（0 を 辺に 合わせる）
 * - read : 動かせない。**自分が置いた分度器のまま読ませる**
 *
 * 目もりの数字は分度器といっしょに傾く。紙の分度器と同じで、
 * 傾いた状態で読むこと自体がこの単元の難しさだから。
 */

type Props = {
  plan: AnglePlan;
  pose: Pose;
  step: ProtractorStepKind;
  /** 動かせるか（誤答の指摘中は止める） */
  interactive: boolean;
  onPoseChange: (pose: Pose) => void;
  /** 答え合わせのときだけ、測った角に色をつける */
  reveal?: boolean;
};

const R = PROTRACTOR_RADIUS;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const on = (radius: number, deg: number) => ({
  x: radius * Math.cos(toRad(deg)),
  y: -radius * Math.sin(toRad(deg)),
});

/** 目もり。1度ごとに引き、5度・10度で長くする。 */
const TICKS = Array.from({ length: 181 }, (_, t) => {
  const len = t % 10 === 0 ? 15 : t % 5 === 0 ? 10 : 5;
  return { t, outer: on(R, t), inner: on(R - len, t) };
});

const LABELS = Array.from({ length: 19 }, (_, i) => i * 10);

type Drag =
  | { kind: "move"; dx: number; dy: number }
  | { kind: "turn"; startPointer: number; startRotation: number };

export function ProtractorBoard({
  plan,
  pose,
  step,
  interactive,
  onPoseChange,
  reveal,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<Drag | null>(null);

  /** 画面の座標を、図の座標に直す。 */
  function toLocal(event: ReactPointerEvent): Point {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  }

  /** 分度器の中心から見た、その点の向き（度）。 */
  const bearing = (p: Point) => (Math.atan2(-(p.y - pose.y), p.x - pose.x) * 180) / Math.PI;

  function handleDown(event: ReactPointerEvent<SVGGElement>) {
    if (!interactive || step === "read") return;
    const p = toLocal(event);
    drag.current =
      step === "place"
        ? { kind: "move", dx: p.x - pose.x, dy: p.y - pose.y }
        : { kind: "turn", startPointer: bearing(p), startRotation: pose.rotation };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleMove(event: ReactPointerEvent<SVGGElement>) {
    const state = drag.current;
    if (!state) return;
    const p = toLocal(event);

    if (state.kind === "move") {
      const next = clampPose(p.x - state.dx, p.y - state.dy);
      onPoseChange({ ...pose, ...next });
    } else {
      onPoseChange({ ...pose, rotation: state.startRotation + (bearing(p) - state.startPointer) });
    }
  }

  function handleUp(event: ReactPointerEvent<SVGGElement>) {
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const base = rayEnd(plan, "base");
  const other = rayEnd(plan, "other");
  // 測る角がどちらかを示す小さな弧。これがないと大きいほうの角と区別できない
  const markRadius = 38;
  const markStart = pointAt(plan.vertex, plan.baseDeg, markRadius);
  const markEnd = pointAt(plan.vertex, otherDeg(plan), markRadius);

  const side = alignedSide(plan, pose);
  const grabbable = interactive && step !== "read";

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_BOX.width} ${VIEW_BOX.height}`}
      className="mx-auto block w-full max-w-md select-none"
      style={{ touchAction: "none" }}
      role="img"
      aria-label={`分度器で 角を はかる 図。いまの 手は ${step}`}
    >
      {/* 測る角 */}
      <g className="stroke-foreground" strokeWidth={2.5} strokeLinecap="round">
        <line x1={plan.vertex.x} y1={plan.vertex.y} x2={base.x} y2={base.y} />
        <line x1={plan.vertex.x} y1={plan.vertex.y} x2={other.x} y2={other.y} />
      </g>
      <path
        d={`M ${markStart.x} ${markStart.y} A ${markRadius} ${markRadius} 0 0 0 ${markEnd.x} ${markEnd.y}`}
        className={cn("fill-none", reveal ? "stroke-success" : "stroke-muted-foreground")}
        strokeWidth={reveal ? 4 : 2}
      />
      <circle
        cx={plan.vertex.x}
        cy={plan.vertex.y}
        r={4}
        className={cn(step === "place" ? "fill-danger" : "fill-foreground")}
      />
      {step === "place" && (
        <circle
          cx={plan.vertex.x}
          cy={plan.vertex.y}
          r={13}
          className="fill-none stroke-danger"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      )}

      {/* 分度器 */}
      <g
        transform={`translate(${pose.x} ${pose.y}) rotate(${-pose.rotation})`}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        className={cn(grabbable && "cursor-grab")}
      >
        <path
          d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0 Z`}
          className={cn(
            "fill-primary/10 stroke-primary",
            grabbable && "hover:fill-primary/20"
          )}
          strokeWidth={2}
        />

        <g className="stroke-primary" strokeWidth={1}>
          {TICKS.map(({ t, outer, inner }) => (
            <line key={t} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} />
          ))}
        </g>

        {/* 2つの目もりを分ける線。紙の分度器と同じで、これがないと どちらの数字か分からない */}
        <path
          d={`M ${-(R - 36)} 0 A ${R - 36} ${R - 36} 0 0 1 ${R - 36} 0`}
          className="fill-none stroke-primary/50"
          strokeWidth={1}
        />

        {/* 右はしが0の目もり */}
        <g className="fill-foreground" fontSize={10} textAnchor="middle" dominantBaseline="middle">
          {LABELS.map((value) => {
            const p = on(R - 25, value);
            return (
              <text key={`r${value}`} x={p.x} y={p.y}>
                {value}
              </text>
            );
          })}
        </g>
        {/* 左はしが0の目もり */}
        <g
          className="fill-muted-foreground"
          fontSize={10}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {LABELS.map((value) => {
            const p = on(R - 48, value);
            return (
              <text key={`l${value}`} x={p.x} y={p.y}>
                {180 - value}
              </text>
            );
          })}
        </g>

        {/* まっすぐなへり（0の線）と、中心のしるし */}
        <line
          x1={-R}
          y1={0}
          x2={R}
          y2={0}
          className={cn(side !== null ? "stroke-success" : "stroke-primary")}
          strokeWidth={3}
        />
        <g className={cn(side !== null ? "stroke-success" : "stroke-primary")} strokeWidth={2}>
          <circle r={5} className="fill-none" />
          <line x1={-9} y1={0} x2={9} y2={0} />
          <line x1={0} y1={-9} x2={0} y2={9} />
        </g>
      </g>

      {reveal && side !== null && (
        <text
          x={VIEW_BOX.width - 8}
          y={20}
          textAnchor="end"
          className="fill-success text-sm font-bold"
        >
          0 は {zeroEnd(side) === "right" ? "右" : "左"}はし
        </text>
      )}
    </svg>
  );
}
