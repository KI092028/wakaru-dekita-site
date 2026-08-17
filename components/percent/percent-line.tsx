"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";
import {
  amountAt,
  amountTicks,
  markerTicks,
  percentAt,
  percentTicks,
  show,
  type PercentPlan,
} from "@/lib/percent/plan";

/**
 * 割合の二重数直線。上が量、下が割合。
 *
 * ## 割合の目もりは、はじめは無い
 *
 * **100% を置くまで、下の線には目もりが出ない。**
 * これがこの単元の核心で、割合はもとから紙に書いてある目もりではなく、
 * もとにする量を決めたことで**はじめて生まれる**目もりだから。
 *
 * 置いた瞬間に 10% きざみの目もりが一気に現れる。この順序を見せたくて
 * 単位量あたりの数直線（`components/rate/number-line.tsx`）とは
 * 別のコンポーネントにしてある。あちらは上下とも最初から目もりがある。
 *
 * ## 100% より右がある
 *
 * 線は もとにする量より長くしてある。「10%増量」が 100% の**右**に
 * 来ることを見せるため。ここが見えないと、増量なのに元より小さい数を
 * 答えてしまう誤り（全国学力調査で正答率41.3%）を目で正せない。
 */

type Props = {
  plan: PercentPlan;
  /** 100% を置いた位置（量の単位）。まだ置いていなければ null */
  placedAt: number | null;
  /** 求める側のしるし（割合）。まだ動かしていなければ null */
  marker: number | null;
  /** いま動かせるのはどれか */
  active: "place" | "mark" | null;
  onPlace: (value: number) => void;
  onMark: (percent: number) => void;
  /** 答え合わせのあと、正しい位置を見せる */
  reveal: boolean;
};

const WIDTH = 360;
const PAD_LEFT = 46;
const PAD_RIGHT = 26;
const AXIS = WIDTH - PAD_LEFT - PAD_RIGHT;
const HEIGHT = 132;
const TOP_Y = 46;
const BOTTOM_Y = 92;

export function PercentLine({ plan, placedAt, marker, active, onPlace, onMark, reveal }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  /** 量 v の x 座標。線の長さは axisMax で決まる */
  const xOfAmount = (v: number) => PAD_LEFT + (v / plan.axisMax) * AXIS;
  /** 割合 p の x 座標。100% を置いていないと決まらない */
  const xOfPercent = (p: number) => xOfAmount(amountAt(plan, p));

  const placed = placedAt !== null && Math.abs(placedAt - plan.baseValue) < 1e-6;

  function pointAt(event: ReactPointerEvent): number {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return 0;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    return ((p.x - PAD_LEFT) / AXIS) * plan.axisMax;
  }

  /** いちばん近い目もりに吸いつく。指で細かい位置は出せない */
  const snap = (raw: number, ticks: number[]) =>
    ticks.reduce((best, t) => (Math.abs(t - raw) < Math.abs(best - raw) ? t : best), ticks[0]);

  function handle(event: ReactPointerEvent) {
    if (active === null) return;
    const raw = pointAt(event);
    if (active === "place") {
      onPlace(snap(raw, amountTicks(plan)));
    } else {
      onMark(snap(percentAt(plan, raw), markerTicks(plan)));
    }
  }

  function down(event: ReactPointerEvent<SVGRectElement>) {
    if (active === null) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    handle(event);
  }
  function move(event: ReactPointerEvent<SVGRectElement>) {
    if (dragging.current) handle(event);
  }
  function up(event: ReactPointerEvent<SVGRectElement>) {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const baseX = xOfAmount(plan.baseValue);
  const markerX = marker === null ? null : xOfPercent(marker);
  const targetX = xOfPercent(plan.targetPercent);

  return (
    <div className="rounded-xl border border-border bg-white px-2 py-1">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block w-full select-none"
        style={{ touchAction: "none" }}
        role="img"
        aria-label={`${plan.baseLabel} ${show(plan.baseValue)}${plan.unit} の数直線`}
      >
        {/* 上：量の線。目もりは最初からある */}
        <text x={PAD_LEFT - 8} y={TOP_Y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
          {plan.unit}
        </text>
        <line
          x1={PAD_LEFT}
          y1={TOP_Y}
          x2={WIDTH - PAD_RIGHT}
          y2={TOP_Y}
          className="stroke-foreground"
          strokeWidth={1.5}
        />
        {amountTicks(plan).map((t) => (
          <line
            key={t}
            x1={xOfAmount(t)}
            y1={TOP_Y - 4}
            x2={xOfAmount(t)}
            y2={TOP_Y + 4}
            className="stroke-muted-foreground"
            strokeWidth={1}
          />
        ))}

        {/* もとにする量の位置。ここに 100% を置く */}
        <line
          x1={baseX}
          y1={TOP_Y - 9}
          x2={baseX}
          y2={TOP_Y + 9}
          className={cn(placed ? "stroke-success" : "stroke-foreground")}
          strokeWidth={2.5}
        />
        <text
          x={baseX}
          y={TOP_Y - 14}
          textAnchor="middle"
          className={cn("text-[11px] font-bold", placed ? "fill-success" : "fill-foreground")}
        >
          {show(plan.baseValue)}
          {plan.unit}
        </text>
        <text x={baseX} y={TOP_Y - 26} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          {plan.baseLabel}
        </text>

        {/* くらべる量が分かっている問題では、その位置も出す */}
        {plan.otherValue !== null && (
          <g>
            <line
              x1={xOfAmount(plan.otherValue)}
              y1={TOP_Y - 7}
              x2={xOfAmount(plan.otherValue)}
              y2={TOP_Y + 7}
              className="stroke-secondary"
              strokeWidth={2}
            />
            <text
              x={xOfAmount(plan.otherValue)}
              y={TOP_Y + 20}
              textAnchor="middle"
              className="fill-secondary text-[10px] font-bold"
            >
              {show(plan.otherValue)}
              {plan.unit}
            </text>
          </g>
        )}

        {/* 下：割合の線。100% を置くまで目もりが無い */}
        <text x={PAD_LEFT - 8} y={BOTTOM_Y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
          %
        </text>
        <line
          x1={PAD_LEFT}
          y1={BOTTOM_Y}
          x2={WIDTH - PAD_RIGHT}
          y2={BOTTOM_Y}
          className={cn(placed ? "stroke-foreground" : "stroke-border")}
          strokeWidth={1.5}
          strokeDasharray={placed ? undefined : "3 3"}
        />

        {placed ? (
          percentTicks(plan).map((p) => {
            const labelled = p % 50 === 0;
            return (
              <g key={p}>
                <line
                  x1={xOfPercent(p)}
                  y1={BOTTOM_Y - (p === 100 ? 9 : 4)}
                  x2={xOfPercent(p)}
                  y2={BOTTOM_Y + (p === 100 ? 9 : 4)}
                  className={cn(p === 100 ? "stroke-primary" : "stroke-muted-foreground")}
                  strokeWidth={p === 100 ? 2.5 : 1}
                />
                {labelled && (
                  <text
                    x={xOfPercent(p)}
                    y={BOTTOM_Y + 20}
                    textAnchor="middle"
                    className={cn(
                      "text-[10px] font-bold",
                      p === 100 ? "fill-primary" : "fill-muted-foreground"
                    )}
                  >
                    {p}
                  </text>
                )}
              </g>
            );
          })
        ) : (
          <text
            x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
            y={BOTTOM_Y + 20}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            100% を 置くと 目もりが 出ます
          </text>
        )}

        {/* 置いている途中の 100% */}
        {active === "place" && placedAt !== null && !placed && (
          <g>
            <line
              x1={xOfAmount(placedAt)}
              y1={TOP_Y - 4}
              x2={xOfAmount(placedAt)}
              y2={BOTTOM_Y + 4}
              className="stroke-primary"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            <circle cx={xOfAmount(placedAt)} cy={BOTTOM_Y} r={8} className="fill-primary" />
            <text
              x={xOfAmount(placedAt)}
              y={BOTTOM_Y + 3}
              textAnchor="middle"
              className="fill-white text-[8px] font-bold"
            >
              100
            </text>
          </g>
        )}

        {/* 答えのしるし */}
        {markerX !== null && placed && (
          <g>
            <line
              x1={markerX}
              y1={TOP_Y - 4}
              x2={markerX}
              y2={BOTTOM_Y + 4}
              className={cn(reveal ? "stroke-success" : "stroke-danger")}
              strokeWidth={2}
            />
            <circle
              cx={markerX}
              cy={plan.kind === "rate" ? TOP_Y : BOTTOM_Y}
              r={7}
              className={cn(reveal ? "fill-success" : "fill-danger")}
            />
            <text
              x={markerX}
              y={HEIGHT - 6}
              textAnchor="middle"
              className={cn("text-[11px] font-bold", reveal ? "fill-success" : "fill-danger")}
            >
              {plan.kind === "rate"
                ? `${show(amountAt(plan, marker!))}${plan.unit}`
                : `${show(marker!)}%`}
            </text>
          </g>
        )}

        {/* 答え合わせのあと、正しい位置に印を出す */}
        {reveal && (
          <g>
            <circle cx={targetX} cy={TOP_Y} r={4} className="fill-success" />
            <circle cx={targetX} cy={BOTTOM_Y} r={4} className="fill-success" />
          </g>
        )}

        {/* つかむ帯。線は細いので押せる高さを広くとる */}
        <rect
          x={0}
          y={TOP_Y - 10}
          width={WIDTH}
          height={BOTTOM_Y - TOP_Y + 24}
          fill="transparent"
          className={cn(active !== null && "cursor-pointer")}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </svg>
    </div>
  );
}
