import {
  improperText,
  mixedText,
  wholeAsParts,
  type MixedKind,
  type MixedPlan,
} from "./plan";

/**
 * 仮分数・帯分数の1手ごとの問いと、間違えたときに返す言葉。
 *
 * 向きによって通る手がちがう。どちらも2手。
 *
 * - 仮分数→帯分数：`whole`（1が何こできる） → `rest`（のこりは何こ）
 * - 帯分数→仮分数：`wholeParts`（整数は何こ分） → `total`（合わせて何こ）
 *
 * 手を4つに分けているのは、**どちらの向きでつまずいたのかを分けたい**から。
 * 仮分数から帯分数にはできるが逆はできない、ということが普通に起きる。
 */

export type MixedStepKind = "whole" | "rest" | "wholeParts" | "total";

export const MIXED_STEP_KINDS: MixedStepKind[] = ["whole", "rest", "wholeParts", "total"];

export const MIXED_STEP_LABEL: Record<MixedStepKind, string> = {
  whole: "1が何こできるか",
  rest: "のこりは何こか",
  wholeParts: "整数を何こ分に直す",
  total: "合わせて何こか",
};

export const MIXED_STEP_SHORT: Record<MixedStepKind, string> = {
  whole: "1のこ数",
  rest: "のこり",
  wholeParts: "何こ分",
  total: "合わせて",
};

export const MIXED_ADVICE_PRIORITY: MixedStepKind[] = ["wholeParts", "whole", "total", "rest"];

/** その向きで通る手。 */
export const stepsFor = (kind: MixedKind): MixedStepKind[] =>
  kind === "toMixed" ? ["whole", "rest"] : ["wholeParts", "total"];

export function mixedStepPrompt(plan: MixedPlan, kind: MixedStepKind): string {
  switch (kind) {
    case "whole":
      return `ぬってある ところで、まるごとの 1 は 何こ できる？`;
    case "rest":
      return `のこりは 何こ？（1こは 1/${plan.denominator}）`;
    case "wholeParts":
      return `整数の ${plan.whole} は、1/${plan.denominator} が 何こ分？`;
    case "total":
      return `分子の ${plan.fractionNumerator}こ と 合わせると、ぜんぶで 何こ？`;
  }
}

/** その手の正解。 */
export function answerOf(plan: MixedPlan, kind: MixedStepKind): number {
  switch (kind) {
    case "whole":
      return plan.whole;
    case "rest":
      return plan.fractionNumerator;
    case "wholeParts":
      return wholeAsParts(plan);
    case "total":
      return plan.improperNumerator;
  }
}

export function diagnose(plan: MixedPlan, kind: MixedStepKind, typed: number): string | null {
  const want = answerOf(plan, kind);
  if (typed === want) return null;

  switch (kind) {
    case "whole":
      if (typed === plan.improperNumerator) {
        return `それは ぬってある こ数だね。聞いているのは、そのうち まるごとの 1 が 何こ できるか。${plan.denominator}こで 1 だから ${want}こ`;
      }
      if (typed === plan.denominator) {
        return `${plan.denominator} は、1 を 分けた こ数だよ。まるごと ぬれた 帯の 本数を 数えよう`;
      }
      return `まるごと ぬれている 帯を 数えると ${want}本。${want} だよ`;

    case "rest":
      if (typed >= plan.denominator) {
        return `${typed}こ だと また 1 が できてしまうね。のこりは 分母の ${plan.denominator} より 小さくなるよ。答えは ${want}`;
      }
      return `さいごの 帯で ぬってある こ数を 数えよう。${want}こ だね`;

    case "wholeParts":
      if (typed === plan.whole + plan.denominator) {
        return `たすのではなく かけるよ。1 が ${plan.denominator}こ分 なので、${plan.whole} × ${plan.denominator} = ${want}`;
      }
      if (typed === plan.improperNumerator) {
        return `それは 分子も たしたあとの 数だね。いまは 整数の ${plan.whole} だけを こ数に 直そう。${plan.whole} × ${plan.denominator} = ${want}`;
      }
      return `1 が ${plan.denominator}こ分 だから、${plan.whole} × ${plan.denominator} = ${want}`;

    case "total":
      if (typed === wholeAsParts(plan)) {
        return `分子の ${plan.fractionNumerator}こ を たし忘れているよ。${wholeAsParts(plan)} + ${plan.fractionNumerator} = ${want}`;
      }
      return `${wholeAsParts(plan)} + ${plan.fractionNumerator} = ${want} だよ`;
  }
}

/** 答えの形。結果に出す。 */
export const answerText = (plan: MixedPlan): string =>
  plan.kind === "toMixed" ? mixedText(plan) : improperText(plan);

export function mixedAdviceFor(kind: MixedStepKind): { text: string } | null {
  switch (kind) {
    case "whole":
      return { text: "分母の こ数で 1 が 1こ できる。帯が まるごと ぬれるたびに 1 が ふえるよ。" };
    case "rest":
      return { text: "のこりは 分母より 小さくなる。分母と同じか それ以上なら、まだ 1 が 作れるということ。" };
    case "wholeParts":
      return {
        text: "整数を こ数に 直すのは かけ算。1 が 分母のこ数ぶんだから、整数 × 分母 だよ。",
      };
    case "total":
      return { text: "整数を こ数に 直したら、最後に 分子を たすのを 忘れずに。" };
  }
}
