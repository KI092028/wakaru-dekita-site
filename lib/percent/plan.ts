/**
 * 割合・百分率（5年）。
 *
 * ## つまずきの本体
 *
 * 公式（くらべる量 ÷ もとにする量）を覚えても解けない。
 * **どれが「もとにする量」なのかが決められない**ことが本体で、
 * 令和7年度の全国学力・学習状況調査では「10%増量」の意味を問う設問の正答率が
 * **41.3%**、誤答に「0.1倍」「10倍」が並んでいる。
 * 10% を 0.1倍 と読む子は、**増量なのに元より小さくなる**ことに気づいていない。
 *
 * ## そこでここでは、式を立てさせない
 *
 * 練習するのは次の2つだけ。
 *
 * 1. **もとにする量を、文から見つける**（「〜の」の前にあるほう）
 * 2. **その量の上に 100% を置く**。置いた瞬間、割合の目もりが全部決まる
 *
 * 100% を置くと目もりが生まれる、という順序がこの単元の要。
 * 割合は数直線に**もとから書いてある目もりではなく、
 * もとにする量を決めたことで初めて生まれる目もり**だから。
 *
 * そして 110% は 100% より右にある。**増量なら元より右**が目で見える。
 * これが 41.3% の設問で問われていたことそのもの。
 *
 * ## 単位量あたりとの違い
 *
 * 単位量あたり（`lib/rate/`）では、どちらの量を 1 にそろえても正しかった。
 * **割合では、もとにする量は1つに決まる。** 選び方に正誤があるので、
 * `base` の手は誤答を持つ。ここが2つの単元の設計上のいちばんの違い。
 */

/** 何を求める問題か。 */
export type PercentKind =
  /** くらべる量が分かっていて、割合を求める（「何%？」） */
  | "rate"
  /** 割合が分かっていて、くらべる量を求める（「25%は何人？」） */
  | "amount"
  /** 100% より外を求める（「10%増量」「20%引き」） */
  | "increase";

export type PercentPlan = {
  id: string;
  kind: PercentKind;
  /** 「赤いテープは 白いテープの 何%？」 */
  question: string;
  /** 場面の説明。数はここに出す */
  story: string;
  /** 量の単位（cm・人・mL・円） */
  unit: string;

  /** もとにする量の名前（「白いテープ」） */
  baseLabel: string;
  /** もとにする量。いつも分かっている */
  baseValue: number;

  /** くらべる量の名前（「赤いテープ」） */
  otherLabel: string;
  /** くらべる量。rate では分かっていて、それ以外は求めるので null */
  otherValue: number | null;

  /** 与えられる割合（%）。rate では null */
  givenPercent: number | null;

  /** しるしを置くべき割合。rate ではここが答えになる */
  targetPercent: number;

  /** 打たせる答えと、その単位 */
  answer: number;
  answerUnit: string;

  /** 量の数直線の目もり間かく。baseValue も答えもこの倍数にする */
  tickStep: number;
  /** 量の数直線の右はし。もとにする量が右はしに来ないようにする */
  axisMax: number;

  /** 何を練習する問題か（画面には出さない） */
  stage: string;
};

/** もとにする量か、くらべる量か。 */
export type Which = "base" | "other";

export const labelOf = (plan: PercentPlan, which: Which): string =>
  which === "base" ? plan.baseLabel : plan.otherLabel;

/**
 * 割合 p% が、量でいくつにあたるか。
 * もとにする量に 100% を置いたので、比例で決まる。
 */
export const amountAt = (plan: PercentPlan, percent: number): number =>
  (plan.baseValue * percent) / 100;

/** 量 v が、割合でいくつにあたるか。 */
export const percentAt = (plan: PercentPlan, value: number): number =>
  (value / plan.baseValue) * 100;

/** 量の数直線に打つ目もり。 */
export function amountTicks(plan: PercentPlan): number[] {
  const ticks: number[] = [];
  for (let v = 0; v <= plan.axisMax + 1e-9; v += plan.tickStep) ticks.push(round(v));
  return ticks;
}

/**
 * 割合の数直線に打つ目もり。**100% を置いてはじめて決まる。**
 * 10% きざみ。1度きざみが指で読めなかった分度器と同じ理由で、細かくしない。
 */
export function percentTicks(plan: PercentPlan): number[] {
  const max = percentAt(plan, plan.axisMax);
  const ticks: number[] = [];
  for (let p = 0; p <= max + 1e-9; p += 10) ticks.push(p);
  return ticks;
}

/**
 * しるしを動かせる位置。
 *
 * 何を求めるかで、**どちらの線の目もりに吸いつくかが変わる。**
 * 割合を求める問題では量の目もりへ、量を求める問題では割合の目もりへ。
 * 求めるものそのものの上を自由に動けてしまうと、
 * 「合うまで動かす」で当たってしまう。
 */
export function markerTicks(plan: PercentPlan): number[] {
  return plan.kind === "rate"
    ? amountTicks(plan).map((v) => percentAt(plan, v))
    : percentTicks(plan);
}

const round = (v: number) => Math.round(v * 1000) / 1000;

/** 表示用。わりきれない値は小数第1位まで。 */
export function show(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
}

/**
 * 100% を置いたと認めるずれの幅（量の単位で）。
 * 目もりに吸いつくので、ふつうは 0 か tickStep のどちらかになる。
 */
export const PLACE_TOLERANCE = 1e-6;

export const isBasePlaced = (plan: PercentPlan, placedAt: number): boolean =>
  Math.abs(placedAt - plan.baseValue) < PLACE_TOLERANCE;

export const isMarkerOnTarget = (plan: PercentPlan, percent: number): boolean =>
  Math.abs(percent - plan.targetPercent) < 1e-6;

/**
 * 「10%を0.1倍と読む」誤り。
 *
 * 増量の問題で、100% より**左**に置いたら、増えるはずなのに減らしている。
 * 全国学力調査の誤答そのものなので、名指しできるようにしておく。
 */
export function isWrongDirection(plan: PercentPlan, percent: number): boolean {
  if (plan.kind !== "increase") return false;
  const up = plan.targetPercent > 100;
  return up ? percent < 100 : percent > 100;
}
