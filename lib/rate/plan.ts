/**
 * 単位量あたりの大きさ。
 *
 * つまずきの本体は割り算ではなく、**どちらの量を 1 にそろえるかを決められない**ことと、
 * 出てきた商が何を表しているのか分からないこと
 * （令和6年度 全国学力・学習状況調査でも「単位量当たりの大きさについて、
 * 深い理解を伴う知識の習得やその活用に課題」と指摘されている）。
 *
 * さらに、子どもは既定で**差で比べる**（加法的方略）。
 * 「12人と8まい、9人と6まい、どちらも差は3だから同じ混み具合」と考える。
 * これは比の問題に足し算の考えを持ち込む誤りで、国際的にも繰り返し報告されている。
 *
 * そこでこの単元では、答えを当てさせるのではなく次の2つを操作させる。
 *
 * 1. **どちらの量を 1 にそろえるかを自分で選ぶ**（2通りとも正しい）
 * 2. 二重数直線のマーカーを 1 まで動かし、**もう一方の量がいくつになるかを見る**
 *
 * そのうえで「どちらがこんでいるか」を答えさせる。
 * ここで **選んだ量によって「多いほうが答え」が反転する**。
 * たたみ1まいあたりの人数なら多いほうがこんでいるが、
 * 1人あたりのたたみ枚数なら少ないほうがこんでいる。
 * この反転こそが「商が何を表すか」であり、分度器の
 * 「右の0か左の0か」とまったく同じ形をしている。
 */

export type Quantity = {
  /** 「子ども」 */
  name: string;
  /** 「人」 */
  unit: string;
};

export type Side = "left" | "right";

/** くらべる2つのうちの1つ。 */
export type Situation = {
  /** 「あかい へや」 */
  label: string;
  /** 上の量（子ども・代金・道のり） */
  a: number;
  /** 下の量（たたみ・本数・時間） */
  b: number;
};

/** どちらの量を 1 にそろえるか。 */
export type Base = "a" | "b";

export type RatePlan = {
  id: string;
  /** 「どちらが こんでいる？」 */
  question: string;
  /** 「こんでいる」 */
  moreWord: string;
  quantityA: Quantity;
  quantityB: Quantity;
  left: Situation;
  right: Situation;
  /**
   * 答えの側は a/b が大きいほうか。
   * 「こんでいる」なら true、「安い」なら false（1本あたりの値段は小さいほうが安い）
   */
  answerIsLarger: boolean;
  /** 何を練習する問題か（画面には出さない） */
  stage: string;
};

export const situation = (plan: RatePlan, side: Side): Situation =>
  side === "left" ? plan.left : plan.right;

export const quantityOf = (plan: RatePlan, base: Base): Quantity =>
  base === "a" ? plan.quantityA : plan.quantityB;

/**
 * 「水 1はい」のような、量の名前つきの言い方。
 *
 * 単位だけで「1はいあたり」と書くと、こさの場面のように
 * **2つの量が同じ単位を使う**とき、どちらのことか分からなくなる。
 */
export const unitPhrase = (quantity: Quantity): string => `${quantity.name} 1${quantity.unit}`;

/** 1 にそろえたときの、もう一方の量。 */
export function perUnit(plan: RatePlan, side: Side, base: Base): number {
  const s = situation(plan, side);
  return base === "b" ? s.a / s.b : s.b / s.a;
}

/** 画面に出す値。わりきれない向きもあるので2けたで丸める。 */
export function perUnitText(plan: RatePlan, side: Side, base: Base): string {
  const value = perUnit(plan, side, base);
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

/**
 * その選び方のとき、答えは値の大きいほうか。
 *
 * b を 1 にそろえると a/b、a を 1 にそろえると b/a になり、**大小が反対になる**。
 * ここがこの単元の要。
 */
export function answerIsLargerUnder(plan: RatePlan, base: Base): boolean {
  return base === "b" ? plan.answerIsLarger : !plan.answerIsLarger;
}

/** 正解の側。選び方によらず同じ側になる（同じ側にならなければ問題が壊れている）。 */
export function correctSide(plan: RatePlan, base: Base): Side {
  const larger = perUnit(plan, "left", base) > perUnit(plan, "right", base) ? "left" : "right";
  const smaller: Side = larger === "left" ? "right" : "left";
  return answerIsLargerUnder(plan, base) ? larger : smaller;
}

/**
 * 差で比べたらどちらを選ぶか。
 *
 * 「12人と8まい」「9人と6まい」を差 4 と 3 で比べるような、加法的な考え方。
 * 答えと食い違う問題をわざと出しておき、選んでしまったらそれと名指しできるようにする。
 */
export function additiveSide(plan: RatePlan): Side | null {
  const dl = plan.left.a - plan.left.b;
  const dr = plan.right.a - plan.right.b;
  if (dl === dr) return null;
  const larger: Side = dl > dr ? "left" : "right";
  const smaller: Side = larger === "left" ? "right" : "left";
  return plan.answerIsLarger ? larger : smaller;
}

/** マーカーが止まれる位置（その量の目もり）。1 は必ず含む。 */
export function ticksFor(plan: RatePlan, side: Side, base: Base): number[] {
  const max = situation(plan, side)[base];
  return Array.from({ length: max + 1 }, (_, i) => i);
}

/** 2つの数直線で共通に使う、いちばん大きい目もり。同じ長さが同じ量を表すようにする。 */
export function axisMax(plan: RatePlan, base: Base): number {
  return Math.max(plan.left[base], plan.right[base]);
}
