import {
  COMMON_LABEL,
  KIND_LABEL,
  TARGET_LABEL,
  commonOf,
  gcd,
  setOf,
  showFraction,
  type FactorPlan,
  type FactorStep,
} from "./plan";
import type { Fraction } from "@/lib/quiz/types";

/**
 * 公倍数・公約数の、1手ごとの問いと、間違えたときに返す言葉。
 *
 * 手は3種類。`mark` は1問に2回出てくる（片方ずつ並べるので）。
 */

export type FactorStepKind = "mark" | "pick" | "use";

export const FACTOR_STEP_KINDS: FactorStepKind[] = ["mark", "pick", "use"];

export const FACTOR_STEP_LABEL: Record<FactorStepKind, string> = {
  mark: "倍数・約数をならべる",
  pick: "重なりからえらぶ",
  use: "通分・約分につかう",
};

export const FACTOR_STEP_SHORT: Record<FactorStepKind, string> = {
  mark: "ならべる",
  pick: "えらぶ",
  use: "つかう",
};

/**
 * 助言するとき、先に見たい手の順。
 * 並べるところがあやしければ、そのあとは全部ずれる。
 */
export const FACTOR_ADVICE_PRIORITY: FactorStepKind[] = ["mark", "pick", "use"];

export function factorPrompt(plan: FactorPlan, step: FactorStep): string {
  switch (step.kind) {
    case "mark":
      return `${step.n}の${KIND_LABEL[plan.kind]}を ぜんぶ 押そう`;
    case "pick":
      return plan.kind === "multiple"
        ? "重なった 数の 中で、いちばん 小さいのは？"
        : "重なった 数の 中で、いちばん 大きいのは？";
    case "use":
      return plan.use?.mode === "denominator"
        ? "この 2つを たすには、分母を いくつに そろえる？"
        : "いちばん かんたんな 分数に すると？";
  }
}

/**
 * 盤の上でちがう数を押したとき。
 *
 * **倍数と約数は、言い直し方を変える。** どちらも「その数と仲のよい数」に
 * 見えていて、そこがごちゃまぜになっているのがつまずきの本体だから、
 * 「◯ずつ ふえる数」「わりきれる数」という別の言い方をそのつど渡す。
 */
export function diagnoseMark(plan: FactorPlan, n: number, tapped: number): string | null {
  if (plan.kind === "multiple" ? tapped % n === 0 : n % tapped === 0) return null;

  if (plan.kind === "multiple") {
    const first = [n, n * 2, n * 3].join(", ");
    return `${tapped} は ${n} で わりきれないよ。${n}の倍数は ${first} … と、${n}ずつ ふえていく 数`;
  }
  return `${n} ÷ ${tapped} は わりきれないね。${n}の約数は、${n} を わりきれる 数（${setOf(
    "divisor",
    n,
    plan.max
  ).join(", ")}）`;
}

/** 並べ終わる前に進もうとしたとき。 */
export function diagnoseMarkDone(plan: FactorPlan, n: number, marked: number[]): string | null {
  const want = setOf(plan.kind, n, plan.max);
  const missing = want.filter((x) => !marked.includes(x));
  if (missing.length === 0) return null;
  return `まだ ${missing.length}こ のこっているよ。${n}の${KIND_LABEL[plan.kind]}を、盤の さいごまで さがそう`;
}

/** 重なりから選ぶところ。 */
export function diagnosePick(plan: FactorPlan, tapped: number): string | null {
  if (tapped === plan.target) return null;

  const common = commonOf(plan.kind, plan.a, plan.b, plan.max);
  const label = COMMON_LABEL[plan.kind];

  if (!common.includes(tapped)) {
    const onlyA = tapped % plan.a === 0 || plan.a % tapped === 0;
    const other = onlyA ? plan.b : plan.a;
    return `${tapped} は ${other}の${KIND_LABEL[plan.kind]}では ないよ。${label}は、両方に しるしが ついた 数（${common.join(
      ", "
    )}）`;
  }

  return plan.kind === "multiple"
    ? `${tapped} も ${label}だけど、もっと 小さいのが あるよ。${label}は ${common.join(", ")}。いちばん 小さいのが ${TARGET_LABEL[plan.kind]}`
    : `${tapped} も ${label}だけど、もっと 大きいのが あるよ。${label}は ${common.join(", ")}。いちばん 大きいのが ${TARGET_LABEL[plan.kind]}`;
}

/**
 * 通分の分母を打ったとき。
 *
 * **分母どうしをかけた数を、いちばん先に拾う。** 答えは合うが、
 * そのあとの計算と約分が重くなる。ここで一度言われるかどうかで、
 * 6年の分数の計算がだいぶ変わる。
 */
export function diagnoseDenominator(plan: FactorPlan, typed: number): string | null {
  if (plan.use?.mode !== "denominator") return null;
  const want = plan.use.answer;
  if (typed === want) return null;

  const product = plan.a * plan.b;
  if (typed === product) {
    return `${plan.a} × ${plan.b} = ${product} でも 分母は そろうけれど、いちばん 小さい 分母は ${want}。大きい 分母に すると、たしたあとの 約分が 大変に なるよ`;
  }
  if (typed % plan.a === 0 && typed % plan.b === 0) {
    return `${typed} でも そろうけれど、もっと 小さく できるよ。${want} が いちばん 小さい`;
  }
  if (typed % plan.a !== 0) {
    return `${typed} は ${plan.a} で わりきれないので、${showFraction(plan.use.left)} を なおせないよ`;
  }
  return `${typed} は ${plan.b} で わりきれないので、${showFraction(plan.use.right)} を なおせないよ`;
}

/** 約分した分数を打ったとき。 */
export function diagnoseReduce(plan: FactorPlan, typed: Fraction): string | null {
  if (plan.use?.mode !== "reduce") return null;
  const want = plan.use.answer;
  const from = plan.use.from;
  if (typed.numerator === want.numerator && typed.denominator === want.denominator) return null;

  if (typed.denominator === 0) return "分母は 0 に できないよ";

  // 大きさは合っているが、まだ約分できる
  if (typed.numerator * from.denominator === from.numerator * typed.denominator) {
    const g = gcd(typed.numerator, typed.denominator);
    return `${showFraction(typed)} は 大きさは 合っているけれど、まだ ${g} で わりきれるよ。${showFraction(
      from
    )} は ${plan.target} で わると ${showFraction(want)}`;
  }

  if (typed.numerator === from.numerator / plan.target && typed.denominator === from.denominator) {
    return "分子だけ わっているね。分子と 分母を 同じ数で わらないと、大きさが 変わってしまうよ";
  }
  if (typed.numerator === from.numerator && typed.denominator === from.denominator / plan.target) {
    return `分母だけ わっているね。分子と 分母を 同じ数で わらないと、大きさが 変わってしまうよ`;
  }

  return `${showFraction(from)} の 分子と 分母を、${TARGET_LABEL[plan.kind]}の ${plan.target} で わると ${showFraction(want)}`;
}

export function factorAdviceFor(kind: FactorStepKind): { text: string } | null {
  switch (kind) {
    case "mark":
      return {
        text: "倍数は「その数ずつ ふえていく 数」、約数は「その数を わりきれる 数」。ふえていくのか、わりきるのか。まず そこを 分けよう。",
      };
    case "pick":
      return {
        text: "公倍数・公約数は いくつも ある。聞かれているのが いちばん 小さいのか、いちばん 大きいのかを、えらぶ前に たしかめよう。",
      };
    case "use":
      return {
        text: "通分は 分母の 最小公倍数、約分は 分子と分母の 最大公約数。分母どうしを かけても そろうけれど、あとの 計算が 大変に なるよ。",
      };
  }
}
