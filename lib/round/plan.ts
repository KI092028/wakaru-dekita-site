/**
 * がい数（四捨五入・4年）。
 *
 * ## つまずきの本体
 *
 * 計算ではなく、**どの位を見ればよいかが決まらない**こと。
 *
 * 「百の位までのがい数にしましょう」と言われて、百の位の数字を四捨五入してしまう。
 * 見るのはその1つ下、十の位のほう。**「までの位」と「見る位」がずれている**ことが
 * 言葉から読み取れていない。
 *
 * 「上から2けたのがい数」はさらに難しい。位の名前が出てこないので、
 * 数そのものを見て「上から数えて3つ目」を自分で決めることになる。
 *
 * ## そこで、位を指させる
 *
 * 答えを打たせる前に、**見る位を自分でタップさせる。**
 * ここを外したまま先へ進むと、そのあとの切り上げ・切り捨ても答えも全部ずれるので、
 * この手だけを独立させれば、どこで間違えたのかが分かれるようになる。
 */

export type RoundKind =
  /** 「百の位までのがい数に」 */
  | "place"
  /** 「上から2けたのがい数に」 */
  | "significant";

export type RoundPlan = {
  id: string;
  kind: RoundKind;
  /** もとの数 */
  value: number;
  /** 残す位のいちばん下（10^keepExp の位）。「百の位まで」なら 2 */
  keepExp: number;
  /** 四捨五入で見る位。いつも keepExp の1つ下 */
  lookExp: number;
  /** 切り上げるか（見る位が5以上か） */
  roundUp: boolean;
  answer: number;
  question: string;
  stage: string;
};

/** 位の名前。一の位から上へ。 */
const PLACE_NAMES = ["一", "十", "百", "千", "一万", "十万", "百万"];

export const placeName = (exp: number): string => `${PLACE_NAMES[exp] ?? `10^${exp}`}の位`;

/** その数のけた数。 */
export const digitCount = (value: number): number => String(value).length;

/** 10^exp の位の数字。 */
export const digitAt = (value: number, exp: number): number =>
  Math.floor(value / 10 ** exp) % 10;

/** 上位から並べた各けたの指数。34567 なら [4,3,2,1,0] */
export function exponents(value: number): number[] {
  const n = digitCount(value);
  return Array.from({ length: n }, (_, i) => n - 1 - i);
}

/** 切り捨てた値。 */
export const truncated = (value: number, keepExp: number): number =>
  Math.floor(value / 10 ** keepExp) * 10 ** keepExp;

/** 四捨五入した値。 */
export function rounded(value: number, keepExp: number): number {
  const base = truncated(value, keepExp);
  return digitAt(value, keepExp - 1) >= 5 ? base + 10 ** keepExp : base;
}

/**
 * 「上から◯けた」で残す位。
 *
 * けた数から数えるので、**位の名前が使えない。**
 * 34567（5けた）を上から2けたなら、残すのは 10^3（千の位）まで。
 */
export const keepExpForSignificant = (value: number, keep: number): number =>
  digitCount(value) - keep;

/** 見る位を取りちがえた典型：残す位そのものを見てしまった。 */
export const isKeepPlace = (plan: RoundPlan, exp: number): boolean => exp === plan.keepExp;

/** 見る位が正しいか。 */
export const isLookPlace = (plan: RoundPlan, exp: number): boolean => exp === plan.lookExp;

/** 「◯の位までのがい数」「上から◯けたのがい数」 */
export function targetText(plan: RoundPlan): string {
  return plan.kind === "place"
    ? `${placeName(plan.keepExp)}までの がい数`
    : `上から ${digitCount(plan.value) - plan.keepExp}けたの がい数`;
}
