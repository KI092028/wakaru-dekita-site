import {
  additiveSide,
  answerIsLargerUnder,
  perUnitText,
  quantityOf,
  situation,
  unitPhrase,
  type Base,
  type RatePlan,
  type Side,
} from "./plan";

/**
 * 単位量あたりの1手ごとの問いと、間違えたときに返す言葉。
 *
 * 手は3つ。そろえる量を選ぶ（base）／マーカーを 1 に合わせる（align）／
 * どちらが多いかを答える（compare）。
 *
 * **base には誤りがない。** どちらの量を 1 にそろえても正しいから。
 * 手として置いてあるのは、選んだことを本人に意識させるため。
 * 何を選んだかで、このあとの「多いほうが答えか」が変わる。
 */

export type RateStepKind = "base" | "align" | "compare";

export const RATE_STEP_KINDS: RateStepKind[] = ["base", "align", "compare"];

export const RATE_STEP_LABEL: Record<RateStepKind, string> = {
  base: "1にそろえる量をえらぶ",
  align: "1に合わせる",
  compare: "くらべる",
};

export const RATE_STEP_SHORT: Record<RateStepKind, string> = {
  base: "えらぶ",
  align: "1に合わせる",
  compare: "くらべる",
};

/** 手の並び。align は左右それぞれで1回ずつ通る。 */
export type RateStep =
  | { kind: "base" }
  | { kind: "align"; side: Side }
  | { kind: "compare" };

export const RATE_STEPS: RateStep[] = [
  { kind: "base" },
  { kind: "align", side: "left" },
  { kind: "align", side: "right" },
  { kind: "compare" },
];

export function rateStepPrompt(plan: RatePlan, step: RateStep, base: Base | null): string {
  if (step.kind === "base") {
    return "どちらの 量を 1 に そろえて くらべる？ どちらでも いいよ";
  }

  const per = unitPhrase(quantityOf(plan, base ?? "b"));

  if (step.kind === "align") {
    return `${situation(plan, step.side).label}の しるしを ${per} まで 動かそう`;
  }

  const other = quantityOf(plan, base === "a" ? "b" : "a");
  return `${per}あたりの ${other.name}で くらべると、${plan.question}`;
}

function diagnoseAlign(plan: RatePlan, side: Side, base: Base, marker: number): string {
  const q = quantityOf(plan, base);
  const per = unitPhrase(q);
  if (marker === 0) {
    return `0 では くらべられないよ。ちょうど ${per} の ところに 動かそう`;
  }
  const other = quantityOf(plan, base === "a" ? "b" : "a");
  return `いまは ${q.name} ${marker}${q.unit} の ところだね。${situation(plan, side).label}の ${per}あたりの ${other.name}が 知りたいので、${per} まで もどそう`;
}

function diagnoseCompare(plan: RatePlan, base: Base, picked: Side): string {
  const per = unitPhrase(quantityOf(plan, base));
  const other = quantityOf(plan, base === "a" ? "b" : "a");
  const values = `${plan.left.label} ${perUnitText(plan, "left", base)}${other.unit}、${plan.right.label} ${perUnitText(plan, "right", base)}${other.unit}`;

  // そろえる量を入れかえると、多い・少ないが反対になる。ここがこの単元の要。
  // 「うすい」「安い」のように、もともと小さいほうが答えになる問いでも同じ形になる
  if (!answerIsLargerUnder(plan, base)) {
    return `いま くらべているのは ${per}あたりの ${other.name}（${values}）。この くらべ方では「少ない」ほうが ${plan.moreWord}ね`;
  }

  // 差で比べてしまったとき
  if (additiveSide(plan) === picked) {
    return `${plan.quantityA.name}と ${plan.quantityB.name}の 差で くらべていないかな。差では くらべられないよ。${per}あたりで くらべると ${values}`;
  }

  return `${per}あたりの ${other.name}は ${values}。多いほうが ${plan.moreWord}ね`;
}

export function diagnoseRateStep(
  plan: RatePlan,
  step: RateStep,
  base: Base,
  value: number | Side
): string {
  if (step.kind === "align") return diagnoseAlign(plan, step.side, base, value as number);
  if (step.kind === "compare") return diagnoseCompare(plan, base, value as Side);
  return "";
}

/** 同率のときの優先順。考え方のつまずき（くらべる）を先に見る。 */
export const RATE_ADVICE_PRIORITY: RateStepKind[] = ["compare", "align", "base"];

export function rateAdviceFor(kind: RateStepKind): { text: string } {
  switch (kind) {
    case "compare":
      return {
        text: "くらべるところで つまずいていたよ。1つ分に そろえた あとの 数が 何を あらわしているかを、声に出して 言ってみよう（「たたみ 1まいに 1.5人」）",
      };
    case "align":
      return {
        text: "1 に そろえるところで まよったみたい。くらべたい ときは、かならず どちらかの 量を 1 に そろえる、と おぼえよう",
      };
    case "base":
      return { text: "どちらの 量を 1 に そろえても くらべられるよ" };
  }
}
