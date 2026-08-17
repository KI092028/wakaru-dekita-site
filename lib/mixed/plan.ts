/**
 * 仮分数と帯分数（4年）。
 *
 * ## つまずきの本体
 *
 * 手順（分子÷分母、整数×分母＋分子）を覚えるのは難しくない。
 * 難しいのは、**その手順が何をしているのかが見えないこと。**
 * 「7/3 の 7÷3 の商が 2」と言われても、なぜ商が整数部分になるのかが分からない。
 *
 * ## そこで、同じ絵を両方向で使う
 *
 * 1 を分母の数に分けた帯を並べて、分子のぶんだけ色をつける。
 * 7/3 なら、3等分した帯が3本あって7こぶん塗られている。
 * **2本ぬりつぶせて、1こあまる。** これが 2と1/3 そのもの。
 *
 * 仮分数→帯分数でも、帯分数→仮分数でも**絵はまったく同じ**にしてある。
 * 向きがちがうだけで見ているものは1つだ、と分かるようにするため。
 */

export type MixedKind =
  /** 仮分数 → 帯分数（7/3 → 2と1/3） */
  | "toMixed"
  /** 帯分数 → 仮分数（2と1/3 → 7/3） */
  | "toImproper";

export type MixedPlan = {
  id: string;
  kind: MixedKind;
  /** 分母。両方の形で共通 */
  denominator: number;
  /** 仮分数の分子（＝ぬる こ数） */
  improperNumerator: number;
  /** 帯分数の整数部分 */
  whole: number;
  /** 帯分数の分子 */
  fractionNumerator: number;
  question: string;
  stage: string;
};

/** 帯を何本ならべるか。ぬる こ数を分母で切り上げる */
export const barCount = (plan: MixedPlan): number =>
  Math.max(1, Math.ceil(plan.improperNumerator / plan.denominator));

/** i 本目（0から）の帯で、ぬられている こ数。 */
export function filledIn(plan: MixedPlan, index: number): number {
  const before = index * plan.denominator;
  return Math.min(plan.denominator, Math.max(0, plan.improperNumerator - before));
}

/** その帯がまるごとぬられているか（＝「1」が1こできている） */
export const isWholeBar = (plan: MixedPlan, index: number): boolean =>
  filledIn(plan, index) === plan.denominator;

/** 「7/3」「2と1/3」 */
export const improperText = (plan: MixedPlan): string =>
  `${plan.improperNumerator}/${plan.denominator}`;

export const mixedText = (plan: MixedPlan): string =>
  plan.fractionNumerator === 0
    ? String(plan.whole)
    : `${plan.whole}と${plan.fractionNumerator}/${plan.denominator}`;

/** 帯分数の整数部分を、分数のこ数に直すといくつか（2と1/3 なら 2×3＝6） */
export const wholeAsParts = (plan: MixedPlan): number => plan.whole * plan.denominator;
