import { buildColumnPlan, type ColumnOp, type ColumnPlan } from "./plan";

/**
 * 小数のたし算・ひき算のひっ算（4年）。
 *
 * 小数はそのまま計算すると誤差が出るので、**10^n 倍した整数**に直して
 * 整数のひっ算（plan.ts）をそのまま使う。画面では小数点を1つ描き足すだけ。
 *
 * この単元のつまずきは「小数点をそろえず右づめで足す」。
 * そこで、けたをそろえる（0を書き足す）ことと、答えの小数点を打つ位置を、
 * それぞれ独立した手にしてある。
 */

export type DecimalProblem = {
  id: string;
  /** 表示する数（丸め誤差を避けるため文字列で持つ） */
  aText: string;
  bText: string;
  op: ColumnOp;
  /** そろえたあとの小数点以下のけた数 */
  decimals: number;
  /** 10^decimals 倍した整数 */
  aScaled: number;
  bScaled: number;
  /** けたをそろえるために 0 を書き足す位（右から。空なら不要） */
  padColumns: number[];
  /** 0 を書き足すのは上と下のどちらか */
  padTarget: "a" | "b" | null;
  stage: string;
};

const decimalsOf = (text: string) => (text.includes(".") ? text.split(".")[1].length : 0);
const scale = (text: string, decimals: number) =>
  Math.round(Number(text) * 10 ** decimals);

export function buildDecimalProblem(
  id: string,
  aText: string,
  bText: string,
  op: ColumnOp,
  stage: string
): DecimalProblem {
  const da = decimalsOf(aText);
  const db = decimalsOf(bText);
  const decimals = Math.max(da, db);

  // けたが少ない方に 0 を書き足す。右の位から順に
  const shortSide = da === db ? null : da < db ? "a" : "b";
  const shortDecimals = Math.min(da, db);
  const padColumns =
    shortSide === null
      ? []
      : Array.from({ length: decimals - shortDecimals }, (_, i) => i);

  return {
    id,
    aText,
    bText,
    op,
    decimals,
    aScaled: scale(aText, decimals),
    bScaled: scale(bText, decimals),
    padColumns,
    padTarget: shortSide,
    stage,
  };
}

export function decimalPlan(problem: DecimalProblem): ColumnPlan {
  return buildColumnPlan(problem.aScaled, problem.bScaled, problem.op);
}

/** 答えを表示用の文字列にする（末尾の0も残す。1.50 を 1.5 と書き換えない）。 */
export function decimalAnswerText(problem: DecimalProblem, plan: ColumnPlan): string {
  const digits = String(plan.answer).padStart(problem.decimals + 1, "0");
  const cut = digits.length - problem.decimals;
  return `${digits.slice(0, cut)}.${digits.slice(cut)}`;
}
