"use client";

import { cn } from "@/lib/utils";
import { barCount, filledIn, isWholeBar, type MixedPlan } from "@/lib/mixed/plan";

/**
 * 1 を分母のこ数に分けた帯を、必要なぶんだけ並べる。
 *
 * **仮分数→帯分数でも、帯分数→仮分数でも絵はまったく同じ。**
 * 向きがちがうだけで見ているものは1つだ、と分かるようにするため。
 *
 * まるごとぬれた帯は色を変える。「1 が何こできたか」がそのまま本数になる。
 */

type Props = {
  plan: MixedPlan;
  /** まるごとぬれた帯を強調する（1の こ数を数える手で使う） */
  highlightWholes: boolean;
  /** 最後の帯（あまり）を強調する */
  highlightRest: boolean;
};

export function FractionBars({ plan, highlightWholes, highlightRest }: Props) {
  const bars = barCount(plan);
  const last = bars - 1;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: bars }, (_, i) => {
          const filled = filledIn(plan, i);
          const whole = isWholeBar(plan, i);
          const emphasised = (highlightWholes && whole) || (highlightRest && i === last && !whole);

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex overflow-hidden rounded-lg border-2 transition-colors",
                  emphasised ? "border-primary" : "border-border"
                )}
              >
                {Array.from({ length: plan.denominator }, (_, j) => (
                  <div
                    key={j}
                    className={cn(
                      "h-9 w-6 border-r last:border-r-0 sm:w-7",
                      j < filled
                        ? whole
                          ? "bg-primary/70"
                          : "bg-secondary/70"
                        : "bg-white",
                      "border-border"
                    )}
                  />
                ))}
              </div>
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  emphasised ? "font-bold text-primary" : "text-muted-foreground"
                )}
              >
                {whole ? "1" : `${filled}/${plan.denominator}`}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-muted-foreground">
        1 を {plan.denominator}こに 分けた ものが {plan.improperNumerator}こ
      </p>
    </div>
  );
}
