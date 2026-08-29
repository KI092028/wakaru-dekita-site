"use client";

import { cn } from "@/lib/utils";
import { expressionOf, type DecimalPlan } from "@/lib/decimal/plan";

/**
 * もとの数と答えを、同じ数直線の上に置く。
 *
 * ## もとの数の左右を、色で塗り分ける
 *
 * 「大きくなる／小さくなる」をえらぶ手では、もとの数より右と左を
 * 別の帯にして、**どちらを選ぶのかが場所として見える**ようにする。
 * 言葉のボタンだけだと、選んだあとに何が起きたのかが残らない。
 *
 * 答えが出たら、そこにしるしを打つ。もとの数より左に落ちていれば、
 * 「かけたのに 小さくなった」が線の上に残る。
 */

type Props = {
  plan: DecimalPlan;
  /** 答えのしるしを出す */
  showAnswer: boolean;
  /** 左右の帯を出す（どっちかをえらぶ手で使う） */
  showSides: boolean;
  /** えらんだほう。えらんだ帯だけ濃くする */
  picked?: boolean | null;
};

const WIDTH = 320;
const HEIGHT = 92;
const LEFT = 18;
const RIGHT = WIDTH - 18;
const AXIS_Y = 58;

export function SizeLine({ plan, showAnswer, showSides, picked = null }: Props) {
  const x = (value: number) => LEFT + (value / plan.axisMax) * (RIGHT - LEFT);
  const baseX = x(plan.base);
  const answerX = x(plan.answer);

  const ticks: number[] = [];
  for (let v = 0; v <= plan.axisMax + 1e-9; v += plan.tickStep) ticks.push(Math.round(v * 10) / 10);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="mx-auto block h-auto w-full max-w-[22rem]"
      role="img"
      aria-label={`0から${plan.axisMax}の数直線。もとの数は${plan.base}${
        showAnswer ? `、答えは${plan.answer}` : ""
      }`}
    >
      {/* もとの数より小さいほう・大きいほうの帯 */}
      {showSides && (
        <g>
          <rect
            x={LEFT}
            y={AXIS_Y - 26}
            width={Math.max(baseX - LEFT, 0)}
            height={22}
            rx={6}
            fill={picked === false ? "hsl(24 95% 58% / 0.35)" : "hsl(24 20% 90%)"}
          />
          <rect
            x={baseX}
            y={AXIS_Y - 26}
            width={Math.max(RIGHT - baseX, 0)}
            height={22}
            rx={6}
            fill={picked === true ? "hsl(24 95% 58% / 0.35)" : "hsl(24 20% 90%)"}
          />
          <text
            x={(LEFT + baseX) / 2}
            y={AXIS_Y - 15}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={700}
            fill="hsl(20 15% 45%)"
          >
            小さい
          </text>
          <text
            x={(baseX + RIGHT) / 2}
            y={AXIS_Y - 15}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={700}
            fill="hsl(20 15% 45%)"
          >
            大きい
          </text>
        </g>
      )}

      {/* 数直線 */}
      <line x1={LEFT} y1={AXIS_Y} x2={RIGHT} y2={AXIS_Y} stroke="hsl(20 30% 25%)" strokeWidth={2} />
      {ticks.map((v) => (
        <g key={v}>
          <line
            x1={x(v)}
            y1={AXIS_Y - 4}
            x2={x(v)}
            y2={AXIS_Y + 4}
            stroke="hsl(20 30% 25%)"
            strokeWidth={1}
          />
          {v % (plan.tickStep * 2) === 0 && (
            <text
              x={x(v)}
              y={AXIS_Y + 15}
              textAnchor="middle"
              fontSize={9}
              fill="hsl(20 15% 45%)"
            >
              {v}
            </text>
          )}
        </g>
      ))}

      {/* もとの数 */}
      <g>
        <line
          x1={baseX}
          y1={AXIS_Y - 30}
          x2={baseX}
          y2={AXIS_Y + 6}
          stroke="hsl(20 30% 25%)"
          strokeWidth={2}
        />
        <text
          x={baseX}
          y={AXIS_Y + 30}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="hsl(20 30% 15%)"
        >
          {plan.base}
        </text>
      </g>

      {/* 答え */}
      {showAnswer && (
        <g>
          <circle cx={answerX} cy={AXIS_Y} r={6} fill="hsl(24 95% 58%)" />
          <line
            x1={answerX}
            y1={AXIS_Y}
            x2={answerX}
            y2={AXIS_Y + 18}
            stroke="hsl(24 95% 58%)"
            strokeWidth={2}
          />
          <text
            x={answerX}
            y={AXIS_Y + 30}
            textAnchor="middle"
            fontSize={12}
            fontWeight={700}
            fill="hsl(24 95% 58%)"
          >
            {plan.answer}
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * 4問かけて埋めていく、きまりの表。
 *
 * **4行そろってはじめて意味がある。** 「小数をかけると小さくなる」だけを
 * 覚えると、こんどは 1より大きい小数で また まちがえる。
 */
export function RuleTable({
  plans,
  solved,
}: {
  plans: DecimalPlan[];
  solved: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="px-3 py-1 text-left font-medium">式</th>
            <th className="px-2 py-1 text-center font-medium">1と くらべて</th>
            <th className="px-3 py-1 text-right font-medium">答えは</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, i) => {
            const known = i < solved;
            return (
              <tr key={plan.id} className={cn("border-t border-border", !known && "opacity-35")}>
                <td className="px-3 py-1 text-left tabular-nums">{expressionOf(plan)}</td>
                <td className="px-2 py-1 text-center text-muted-foreground">
                  {known ? (plan.factor < 1 ? "1より 小さい" : "1より 大きい") : "?"}
                </td>
                <td
                  className={cn(
                    "px-3 py-1 text-right font-bold",
                    known && (plan.bigger ? "text-primary" : "text-secondary")
                  )}
                >
                  {known ? (plan.bigger ? "大きくなる" : "小さくなる") : "?"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
