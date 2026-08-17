import {
  amountAt,
  isWrongDirection,
  labelOf,
  percentAt,
  show,
  type PercentPlan,
  type Which,
} from "./plan";

/**
 * 割合の1手ごとの問いと、間違えたときに返す言葉。
 *
 * 手は4つ。
 *
 * 1. `base`  もとにする量を、文から見つける **← ここが単元の本体**
 * 2. `place` その量の上に 100% を置く。置くと割合の目もりが生まれる
 * 3. `mark`  求める場所にしるしを動かす
 * 4. `read`  読んだ数を打つ
 *
 * `base` に誤答があるのが、単位量あたり（どちらを選んでも正しい）との違い。
 */

export type PercentStepKind = "base" | "place" | "mark" | "read";

export const PERCENT_STEP_KINDS: PercentStepKind[] = ["base", "place", "mark", "read"];

export const PERCENT_STEP_LABEL: Record<PercentStepKind, string> = {
  base: "もとにする量をさがす",
  place: "100%を置く",
  mark: "しるしを動かす",
  read: "読む",
};

export const PERCENT_STEP_SHORT: Record<PercentStepKind, string> = {
  base: "もとをさがす",
  place: "100%を置く",
  mark: "しるし",
  read: "読む",
};

/** 助言するとき、先に見たい手の順。もとを外していれば、その先は全部ずれる。 */
export const PERCENT_ADVICE_PRIORITY: PercentStepKind[] = ["base", "mark", "place", "read"];

export function percentStepPrompt(plan: PercentPlan, kind: PercentStepKind): string {
  switch (kind) {
    case "base":
      return "もとにする量は どっち？";
    case "place":
      return `${plan.baseLabel}の ところに 100% の しるしを 動かそう`;
    case "mark":
      return plan.kind === "rate"
        ? `${plan.otherLabel}（${show(plan.otherValue ?? 0)}${plan.unit}）の ところに しるしを 動かそう`
        : `${plan.targetPercent}% の ところに しるしを 動かそう`;
    case "read":
      return plan.kind === "rate"
        ? "しるしの 下の 数を 打とう"
        : "しるしの 上の 数を 打とう";
  }
}

/**
 * もとにする量を取りちがえたときの言葉。
 *
 * 「〜の」の前にある量がもと、という見分け方を毎回そえる。
 * ここを外したまま先へ進むと、置く場所も読む数も全部ずれるので、
 * **この手だけは理由まで言う。**
 */
export function diagnoseBase(plan: PercentPlan, picked: Which): string | null {
  if (picked === "base") return null;

  const said = plan.kind === "rate" ? "何%" : `${plan.givenPercent}%`;
  return (
    `もとにする量は ${plan.baseLabel}のほう。` +
    `「${plan.baseLabel}の ${said}」と 言っているから、${plan.baseLabel}を 100% と みることに なるよ。` +
    `「〜の」の 前に ある ほうが もとにする量。`
  );
}

/** 100% を置きちがえたとき。 */
export function diagnosePlace(plan: PercentPlan, placedAt: number): string {
  if (placedAt === 0) {
    return `0 の ところには 置けないよ。${plan.baseLabel}の ${show(plan.baseValue)}${plan.unit} の ところに 動かそう`;
  }
  if (plan.otherValue !== null && Math.abs(placedAt - plan.otherValue) < 1e-6) {
    return (
      `そこは ${plan.otherLabel}の ところだね。100% を 置くのは、` +
      `もとにする量の ${plan.baseLabel}（${show(plan.baseValue)}${plan.unit}）のほう。` +
      `もとにする量が いつも 100% に なるよ`
    );
  }
  return `${plan.baseLabel}は ${show(plan.baseValue)}${plan.unit}。そこに 100% を 合わせよう`;
}

/** しるしを置きちがえたとき。 */
export function diagnoseMark(plan: PercentPlan, percent: number): string {
  // 増量なのに 100% より左（＝減らしている）。全国学力調査の誤答そのもの
  if (isWrongDirection(plan, percent)) {
    const up = plan.targetPercent > 100;
    return up
      ? `${plan.givenPercent}% ふえるのだから、もとの 100% より 右だよ。ふえたのに 少なく なっては おかしいね`
      : `${plan.givenPercent}% へるのだから、もとの 100% より 左だよ`;
  }

  if (plan.kind === "rate") {
    const at = show(amountAt(plan, percent));
    return `いまの しるしは ${at}${plan.unit} の ところ。${plan.otherLabel}は ${show(plan.otherValue ?? 0)}${plan.unit} だから、そこまで 動かそう`;
  }

  return `いまの しるしは ${show(percent)}% の ところ。${plan.targetPercent}% まで 動かそう`;
}

/** 読んだ数がちがうとき。 */
export function diagnoseRead(plan: PercentPlan, typed: number): string | null {
  if (typed === plan.answer) return null;

  // 100倍・100分の1のまちがい（%と小数の取りちがえ）
  if (plan.kind === "rate") {
    if (Math.abs(typed * 100 - plan.answer) < 1e-6) {
      return `${typed} は 小数で 表したときの 数だね。百分率で 聞かれているので、100倍して ${plan.answer}% と 答えよう`;
    }
    if (Math.abs(typed - plan.answer * 100) < 1e-6) {
      return `100 を かけすぎているよ。${plan.answer}% が 答え`;
    }
  }

  // 「10%増量」を 0.1倍 と読んだ形
  if (plan.kind === "increase" && plan.givenPercent !== null) {
    const asFraction = (plan.baseValue * plan.givenPercent) / 100;
    if (Math.abs(typed - asFraction) < 1e-6) {
      return (
        `それは ふえた ぶんだけの 数だね。聞かれているのは ` +
        `もとの ${show(plan.baseValue)}${plan.unit} に ふえた ぶんを たした 数だから、${show(plan.answer)}${plan.unit}`
      );
    }
  }

  const at = plan.kind === "rate" ? `${show(plan.targetPercent)}%` : `${show(plan.answer)}${plan.unit}`;
  return `しるしの ところを 読むと ${at} だよ`;
}

/** 結果画面に出す、この問題で見ていたこと。 */
export function stageNote(plan: PercentPlan): string {
  switch (plan.kind) {
    case "rate":
      return "くらべる量が 分かっていて、割合を 求める形";
    case "amount":
      return "割合が 分かっていて、くらべる量を 求める形";
    case "increase":
      return "100% より 外を 求める形（ふえる・へる）";
  }
}

/** 読み取り位置の説明。数直線の下に出す。 */
export function readingHint(plan: PercentPlan): string {
  return plan.kind === "rate"
    ? `${plan.otherLabel}の 下にある 割合が 答え`
    : `${plan.targetPercent}% の 上にある 量が 答え`;
}

export const percentOfAmount = percentAt;

/**
 * 何回もそこで止まっている子への、次にやることの提案。
 *
 * 「気をつけよう」では何も変わらないので、**手でやることを1つ**書く。
 */
export function percentAdviceFor(kind: PercentStepKind): { text: string } | null {
  switch (kind) {
    case "base":
      return {
        text: "文の中の「〜の」を まず さがしてみよう。その 前に ある ほうが もとにする量で、いつも 100% に なるよ。",
      };
    case "place":
      return {
        text: "100% を 置くのは いつも もとにする量の ところ。数の 大きいほう・小さいほうでは 決まらないよ。",
      };
    case "mark":
      return {
        text: "ふえる話なら 100% より 右、へる話なら 左。動かす前に、右と左の どちらかを 先に 決めよう。",
      };
    case "read":
      return {
        text: "しるしの 上には 量、下には 割合が ある。どちらを 聞かれているのかを、答える前に たしかめよう。",
      };
  }
}

/** その位置に置いた「量」。誤答の記録に使う。 */
export const amountOfPercent = amountAt;

export { labelOf };
