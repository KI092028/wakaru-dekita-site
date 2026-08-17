"use client";

import { cn } from "@/lib/utils";
import { type TimesPlan } from "@/lib/times/plan";

/**
 * 「1つ分」のかたまりを並べた絵。
 *
 * ## 1つ目のかたまりだけ、囲いを強くする
 *
 * 「1つ分は いくつ？」と聞かれたときに、**どこを見ればよいかが分かる**ように。
 * ここが分からないまま数えると、ぜんぶの数を答えてしまう。
 *
 * ## 入れかえた場面を並べて見せられる
 *
 * `swap` を渡すと、1つ分といくつ分を入れかえた絵になる。
 * 答えは同じでも**絵はまったくちがう**ことを、並べて見せるために使う。
 */

type Props = {
  plan: TimesPlan;
  /** 1つ分といくつ分を入れかえて描く */
  swap?: boolean;
  /** 最初のかたまりを強調する（「1つ分」を聞く手で使う） */
  highlightFirst?: boolean;
  /** 入れものの枠を強調する（「いくつ分」を聞く手で使う） */
  highlightAll?: boolean;
};

export function GroupsPicture({
  plan,
  swap = false,
  highlightFirst = false,
  highlightAll = false,
}: Props) {
  const per = swap ? plan.groups : plan.per;
  const groups = swap ? plan.per : plan.groups;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length: groups }, (_, g) => (
        <div
          key={g}
          className={cn(
            "rounded-xl border-2 px-2 py-2 transition-colors",
            highlightAll || (highlightFirst && g === 0)
              ? "border-primary bg-primary/5"
              : "border-border"
          )}
        >
          <div
            className={cn(
              "grid gap-1",
              per <= 3 ? "grid-cols-1" : per <= 6 ? "grid-cols-2" : "grid-cols-3"
            )}
          >
            {Array.from({ length: per }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-4 w-4 rounded-full border sm:h-5 sm:w-5",
                  highlightFirst && g === 0
                    ? "border-primary bg-primary/70"
                    : "border-secondary bg-secondary/60"
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 入れかえた2つの場面を、並べて見せる。
 *
 * **答えが同じでも場面はちがう**、がこの単元のねらい。
 * 「3こずつ4さら」と「4こずつ3さら」はどちらも12だが、絵は別のものになる。
 */
export function SwapCompare({ plan }: { plan: TimesPlan }) {
  const { itemUnit, containerUnit } = plan.scene;
  return (
    <div className="space-y-3 rounded-xl bg-muted/60 p-3">
      <p className="text-center text-xs font-bold text-muted-foreground">
        入れかえると、答えは 同じでも 絵は ちがう
      </p>
      {[false, true].map((swap) => {
        const per = swap ? plan.groups : plan.per;
        const groups = swap ? plan.per : plan.groups;
        return (
          <div key={String(swap)} className="space-y-1">
            <p className="text-center text-[11px] tabular-nums">
              <span className={cn("font-bold", swap ? "text-secondary" : "text-primary")}>
                {per} × {groups}
              </span>
              <span className="text-muted-foreground">
                {" "}
                … {per}{itemUnit}ずつ {groups}{containerUnit} = {plan.answer}
              </span>
            </p>
            <GroupsPicture plan={plan} swap={swap} />
          </div>
        );
      })}
    </div>
  );
}
