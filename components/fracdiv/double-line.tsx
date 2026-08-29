"use client";

import { show, unitLength, type FracDivPlan } from "@/lib/fracdiv/plan";
import type { Fraction } from "@/lib/quiz/types";

/**
 * 二重数直線。上に量、下に長さ。
 *
 * 単位量あたりの大きさ（`/learn/per-unit`）と同じ見た目にそろえてある。
 * 5年でやったことの続きとして入れるため。
 *
 * 目もりは4か所だけ。0・1つ分・わる数・1。
 * **わる数と 1 の どちらが右にあるか**が、答えが大きくなるか
 * 小さくなるかと そのまま つながる。
 */

const WIDTH = 320;
const HEIGHT = 118;
const LEFT = 26;
const RIGHT = WIDTH - 26;
const TOP_Y = 40;
const BOTTOM_Y = 82;

type Props = {
  plan: FracDivPlan;
  /** 1つ分の量を出す */
  showUnitPart: boolean;
  /** 答えを出す */
  showAnswer: boolean;
};

export function DoubleLine({ plan, showUnitPart, showAnswer }: Props) {
  const unit = unitLength(plan);
  const lengthValue = plan.length.numerator / plan.length.denominator;
  const unitValue = 1 / plan.length.denominator;
  // 右はしは、わる数と 1 の 大きいほうより すこし先
  const axisMax = Math.max(lengthValue, 1) * 1.18;
  const x = (v: number) => LEFT + (v / axisMax) * (RIGHT - LEFT);

  const marks: { at: number; length: Fraction | string; amount: Fraction | null; strong: boolean }[] = [
    { at: unitValue, length: unit, amount: showUnitPart ? plan.unitPart : null, strong: false },
    { at: lengthValue, length: plan.length, amount: plan.total, strong: true },
    { at: 1, length: "1", amount: showAnswer ? plan.answer : null, strong: true },
  ];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="mx-auto block h-auto w-full max-w-[22rem]"
      role="img"
      aria-label={`二重数直線。${show(plan.length)}${plan.lengthUnit} のとき ${show(plan.total)}${plan.unit}`}
    >
      <text x={2} y={TOP_Y - 12} fontSize={9} fontWeight={700} fill="hsl(20 15% 45%)">
        {plan.quantity}（{plan.unit}）
      </text>
      <text x={2} y={BOTTOM_Y + 26} fontSize={9} fontWeight={700} fill="hsl(20 15% 45%)">
        長さ（{plan.lengthUnit}）
      </text>

      {[TOP_Y, BOTTOM_Y].map((y) => (
        <line key={y} x1={LEFT} y1={y} x2={RIGHT} y2={y} stroke="hsl(20 30% 25%)" strokeWidth={2} />
      ))}
      <text x={LEFT} y={TOP_Y - 8} textAnchor="middle" fontSize={10} fill="hsl(20 15% 45%)">
        0
      </text>
      <text x={LEFT} y={BOTTOM_Y + 14} textAnchor="middle" fontSize={10} fill="hsl(20 15% 45%)">
        0
      </text>

      {marks.map((m, i) => {
        const px = x(m.at);
        const color = m.strong ? "hsl(24 95% 58%)" : "hsl(172 60% 40%)";
        return (
          <g key={i}>
            <line
              x1={px}
              y1={TOP_Y}
              x2={px}
              y2={BOTTOM_Y}
              stroke={color}
              strokeWidth={m.strong ? 2 : 1.5}
              strokeDasharray={m.strong ? undefined : "4 3"}
            />
            {/* 上：量 */}
            <text
              x={px}
              y={TOP_Y - 8}
              textAnchor="middle"
              fontSize={m.amount ? 12 : 12}
              fontWeight={700}
              fill={m.amount ? color : "hsl(20 15% 60%)"}
            >
              {m.amount ? show(m.amount) : "?"}
            </text>
            {/* 下：長さ */}
            <text
              x={px}
              y={BOTTOM_Y + 14}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill="hsl(20 30% 25%)"
            >
              {typeof m.length === "string" ? m.length : show(m.length)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
