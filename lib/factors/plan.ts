import type { Fraction } from "@/lib/quiz/types";

/**
 * 公倍数・公約数（5年）。
 *
 * ## この単元は、それ自体が目的ではない
 *
 * 公倍数・公約数だけを取り出して覚えても、子どもには使いどころがない。
 * **実際に要るのは、通分（最小公倍数）と約分（最大公約数）のとき。**
 *
 * だから4問のうち後半2問は、見つけた数を**そのまま分数に使う。**
 * 前半で「見つけ方」、後半で「何のために見つけたか」。
 *
 * ## つまずき
 *
 * - **倍数と約数がごちゃまぜになる。** どちらも「その数と仲のよい数」に見える
 * - **公倍数と最小公倍数を取りちがえる。** 公倍数は いくつも ある
 * - 通分のとき、**分母どうしを かけてしまう。** 12 でよいところを 24 にする。
 *   答えは合うが、あとの計算と約分が重くなる
 *
 * ## 盤の上に、両方のしるしを重ねる
 *
 * 1〜24 を並べた盤に、片方の倍数（約数）を押して しるしを つける。
 * つぎに もう片方を押す。**両方の しるしが 重なった 数**が公倍数（公約数）。
 * 「重なり」は、言葉より先に目で分かる。
 */

/**
 * 盤に並べる数。6列にすると、指で押せる大きさに収まる。
 *
 * **倍数と約数で盤の大きさを変える。**
 *
 * 約数は 24 までで足りる。倍数のほうは、24 までにすると
 * **重なりが1つしか盤に載らない組がほとんどになる**（6と8なら24だけ）。
 * 重なりが1つでは「いちばん小さいのをえらぶ」ことができず、
 * 公倍数はいくつもある、というこの単元の要が消える。
 * そこで倍数の盤は 36 まで広げ、**重なりが2つ以上ある組だけ**を使う。
 */
export type FactorKind = "multiple" | "divisor";

export const BOARD_MAX: Record<FactorKind, number> = { multiple: 36, divisor: 24 };
export const BOARD_COLUMNS = 6;

export const KIND_LABEL: Record<FactorKind, string> = {
  multiple: "倍数",
  divisor: "約数",
};

/** 「公倍数」「公約数」 */
export const COMMON_LABEL: Record<FactorKind, string> = {
  multiple: "公倍数",
  divisor: "公約数",
};

/** 「最小公倍数」「最大公約数」 */
export const TARGET_LABEL: Record<FactorKind, string> = {
  multiple: "最小公倍数",
  divisor: "最大公約数",
};

/** 盤の上にある、その数の倍数（または約数）。 */
export function setOf(kind: FactorKind, n: number, max: number): number[] {
  const found: number[] = [];
  for (let i = 1; i <= max; i++) {
    if (kind === "multiple" ? i % n === 0 : n % i === 0) found.push(i);
  }
  return found;
}

/** 両方にしるしが付く数。 */
export function commonOf(kind: FactorKind, a: number, b: number, max: number): number[] {
  const inB = new Set(setOf(kind, b, max));
  return setOf(kind, a, max).filter((n) => inB.has(n));
}

/** さがす数。倍数なら いちばん小さい、約数なら いちばん大きい。 */
export function targetOf(kind: FactorKind, a: number, b: number, max: number): number {
  const common = commonOf(kind, a, b, max);
  return kind === "multiple" ? common[0] : common[common.length - 1];
}

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
export const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

/** 後半2問の「何のために見つけたか」。 */
export type Use =
  | {
      mode: "denominator";
      left: Fraction;
      right: Fraction;
      /** そろえた分母＝最小公倍数 */
      answer: number;
    }
  | {
      mode: "reduce";
      from: Fraction;
      /** 約分し終えた形 */
      answer: Fraction;
    };

export type FactorStep =
  /** その数の倍数（約数）を、盤の上でぜんぶ押す */
  | { kind: "mark"; n: number }
  /** 重なった数の中から、いちばん小さい（大きい）ものを押す */
  | { kind: "pick" }
  /** 見つけた数を、通分・約分に使う */
  | { kind: "use" };

export type FactorPlan = {
  id: string;
  kind: FactorKind;
  a: number;
  b: number;
  max: number;
  steps: FactorStep[];
  story: string;
  stage: string;
  /** 最小公倍数または最大公約数 */
  target: number;
  use?: Use;
};

export const showFraction = (f: Fraction): string => `${f.numerator}/${f.denominator}`;
