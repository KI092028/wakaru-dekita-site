/**
 * 小数のかけ算・わり算（5年）。**大きくなるのか、小さくなるのか。**
 *
 * ## つまずき
 *
 * 「かけたら大きくなる」「わったら小さくなる」——整数だけを見てきた3年ぶんの
 * 経験が、そのまま思い込みになっている。だから
 *
 * - 6 × 0.8 = 4.8（**かけたのに 小さくなる**）
 * - 6 ÷ 0.8 = 7.5（**わったのに 大きくなる**）
 *
 * が受け入れられない。計算のしかたは教わったとおりにできるのに、
 * 出てきた答えを見て「まちがえた」と思って消してしまう。
 * 文章題では、そもそも かけ算か わり算かを選べなくなる。
 *
 * ## 計算より先に、向きを決めさせる
 *
 * この単元では、**計算する前に「大きくなる？ 小さくなる？」を選ばせる。**
 * 分度器で「だいたい何度か」を先に見当づけるのと同じ形。
 * 先に計算させてしまうと、思い込みは表に出てこないまま素通りする。
 *
 * ## 分かれ目は 1
 *
 * - かける数が **1より小さい** → 小さくなる
 * - わる数が **1より小さい** → 大きくなる
 *
 * この2行を、4問かけて自分で埋めていく形にする。
 */

export type DecimalOp = "×" | "÷";

export type DecimalPlan = {
  id: string;
  op: DecimalOp;
  /** もとの数 */
  base: number;
  /** かける数・わる数 */
  factor: number;
  answer: number;
  /** 答えが もとの数より 大きいか */
  bigger: boolean;
  story: string;
  stage: string;
  /** 数直線の右はし */
  axisMax: number;
  /** 目もりの間かく */
  tickStep: number;
};

/** 小数の計算は、そのまま書くと 4.800000000000001 になる。1桁で丸める。 */
export const round1 = (value: number): number => Math.round(value * 10) / 10;

export const computeOf = (op: DecimalOp, base: number, factor: number): number =>
  round1(op === "×" ? base * factor : base / factor);

/** 「6 × 0.8」 */
export const expressionOf = (plan: DecimalPlan): string =>
  `${plan.base} ${plan.op} ${plan.factor}`;

/**
 * 向きを決めるのは、**かける数・わる数と 1 の大きさくらべ**だけ。
 * もとの数がいくつかは関係ない。
 */
export const shouldBeBigger = (op: DecimalOp, factor: number): boolean =>
  op === "×" ? factor > 1 : factor < 1;

/** その問題で埋まる、きまりの1行。 */
export function ruleOf(plan: DecimalPlan): string {
  const side = plan.factor < 1 ? "1より 小さい" : "1より 大きい";
  const way = plan.bigger ? "大きく" : "小さく";
  return plan.op === "×"
    ? `かける数が ${side} → 答えは もとの数より ${way} なる`
    : `わる数が ${side} → 答えは もとの数より ${way} なる`;
}

/** 「6の 0.8つ分」。かけ算で小さくなる理由を、言葉でも渡す。 */
export function meaningOf(plan: DecimalPlan): string {
  if (plan.op === "×") {
    return plan.factor < 1
      ? `${plan.base} × ${plan.factor} は「${plan.base}の ${plan.factor}つ分」。1つ分より 少ないので、${plan.base} より 小さくなる`
      : `${plan.base} × ${plan.factor} は「${plan.base}の ${plan.factor}つ分」。1つ分より 多いので、${plan.base} より 大きくなる`;
  }
  return plan.factor < 1
    ? `${plan.base} ÷ ${plan.factor} は「${plan.factor}つ分で ${plan.base} に なる もとの数」。1つ分より 少ない量で ${plan.base} に なるのだから、もとの数は ${plan.base} より 大きい`
    : `${plan.base} ÷ ${plan.factor} は「${plan.factor}つ分で ${plan.base} に なる もとの数」。1つ分より 多い量で ${plan.base} に なるのだから、もとの数は ${plan.base} より 小さい`;
}
