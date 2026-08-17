"use client";

import { cn } from "@/lib/utils";
import { digitAt, exponents, placeName, type RoundPlan } from "@/lib/round/plan";

/**
 * 数を位ごとの箱に分けて並べる。
 *
 * **位の名前を、数字のすぐ下に書いておく。**
 * 「百の位までのがい数」という言葉と、数のどこを指すのかが結びつかないのが
 * この単元のつまずきなので、言葉と場所を同時に見せる。
 *
 * 見る位をタップさせる手（`look`）では、この箱がそのままボタンになる。
 */

type Props = {
  plan: RoundPlan;
  /** タップできるか */
  interactive: boolean;
  onPick: (exp: number) => void;
  /** 押した位（まちがえたときに赤く出す） */
  picked: number | null;
  /** 正しい位を見せる */
  reveal: boolean;
  /** のこす位から上を、答えに残るぶんとして色づける */
  showKeep: boolean;
};

export function NumberPlaces({ plan, interactive, onPick, picked, reveal, showKeep }: Props) {
  const exps = exponents(plan.value);

  return (
    <div className="flex justify-center gap-1 sm:gap-1.5">
      {exps.map((exp) => {
        const isLook = exp === plan.lookExp;
        const isKeep = exp >= plan.keepExp;
        const isPicked = picked === exp;

        return (
          <button
            key={exp}
            type="button"
            disabled={!interactive}
            onClick={() => onPick(exp)}
            className={cn(
              "flex w-[3.1rem] flex-col items-center rounded-xl border-2 px-1 py-2 transition-colors sm:w-16",
              interactive && "hover:border-primary hover:bg-primary/5",
              reveal && isLook
                ? "border-success bg-success/10"
                : isPicked
                  ? "border-danger bg-danger/10"
                  : showKeep && isKeep
                    ? "border-primary/40 bg-primary/5"
                    : "border-input"
            )}
          >
            <span
              className={cn(
                "text-2xl font-bold tabular-nums sm:text-3xl",
                reveal && isLook && "text-success",
                isPicked && !(reveal && isLook) && "text-danger"
              )}
            >
              {digitAt(plan.value, exp)}
            </span>
            <span className="mt-0.5 text-[9px] leading-tight text-muted-foreground sm:text-[10px]">
              {placeName(exp)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
