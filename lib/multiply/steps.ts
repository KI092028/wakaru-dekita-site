import { diagnoseColumnStep, placeName } from "@/lib/column/steps";

import { isOverflowCell, type MultiplyCell, type MultiplyPlan, type Partial } from "./plan";

/**
 * かけ算のひっ算の1手ごとの問いと、間違えたときに返す言葉。
 *
 * つまずきを4つに分けて扱う。
 * 九九そのもの（product）／くり上がりを覚えておくこと（carry）／
 * 2だんめをひとつ左からはじめること（shift）／最後のたし算（add）は別の力で、
 * まとめて「不正解」にすると何ができていないのか本人にも分からない。
 *
 * とくに shift を独立した手にしてあるのが、この単元の中心。
 * 「なぜ1つずらすのか」が分からないまま形だけ覚えている子は、
 * ここで必ず止まるので、それが記録に残る。
 *
 * 最後のたし算の「くり上がりの1」は、たし算のひっ算とちがって手にしていない
 * （手数が増えすぎるため）。かわりに問いの中で「+ 1」と示している。
 */

export type MultiplyStepKind = "product" | "carry" | "shift" | "add";

export const MULTIPLY_STEP_KINDS: MultiplyStepKind[] = ["product", "carry", "shift", "add"];

export const MULTIPLY_STEP_LABEL: Record<MultiplyStepKind, string> = {
  product: "九九",
  carry: "くり上がり",
  shift: "ずらす",
  add: "たす",
};

export type MultiplyStep = {
  kind: MultiplyStepKind;
  /** 何だんめか（部分積の番号）。add のときは -1 */
  partial: number;
  /** その段の中の何番目のセルか。add のときは答えの位 */
  cell: number;
  /** 盤のどの位に書くか（右から0） */
  column: number;
  input: "number" | "column";
  answer: number;
};

const digitAt = (value: number, index: number) => Math.floor(value / 10 ** index) % 10;

/** そのセルで実際に足し合わせた値（くり上がりを足したあと）。 */
export function cellTotal(cell: MultiplyCell): number {
  return cell.product + cell.carryIn;
}

export function buildMultiplySteps(plan: MultiplyPlan): MultiplyStep[] {
  const steps: MultiplyStep[] = [];

  plan.partials.forEach((partial, j) => {
    // 2だんめ以降は、まず「どこから書きはじめるか」を決めさせる
    if (j > 0) {
      steps.push({
        kind: "shift",
        partial: j,
        cell: 0,
        column: partial.digitIndex,
        input: "column",
        answer: partial.digitIndex,
      });
    }

    partial.cells.forEach((cell, i) => {
      steps.push({
        kind: "product",
        partial: j,
        cell: i,
        column: partial.digitIndex + i,
        input: "number",
        answer: cell.digit,
      });

      // いちばん左からあふれる分は、上に書かずにそのまま答えの位に書く。
      // 同じ数を2回書かせないため、次が「あふれたけた」のときは手にしない
      const nextIsOverflow = cell.index + 1 >= plan.aWidth;
      if (cell.carryOut > 0 && !nextIsOverflow) {
        steps.push({
          kind: "carry",
          partial: j,
          cell: i,
          column: partial.digitIndex + i + 1,
          input: "number",
          answer: cell.carryOut,
        });
      }
    });
  });

  if (plan.sumPlan) {
    plan.sumPlan.columns.forEach((column, i) => {
      steps.push({
        kind: "add",
        partial: -1,
        cell: i,
        column: i,
        input: "number",
        answer: column.answer,
      });
    });
  }

  return steps;
}

function cellOf(plan: MultiplyPlan, step: MultiplyStep): { partial: Partial; cell: MultiplyCell } {
  const partial = plan.partials[step.partial];
  return { partial, cell: partial.cells[step.cell] };
}

export function multiplyStepPrompt(plan: MultiplyPlan, step: MultiplyStep): string {
  if (step.kind === "add") {
    const column = plan.sumPlan!.columns[step.cell];
    const carry = column.carryIn === 1 ? " + 1" : "";
    return `${placeName(step.cell)}：${column.top} + ${column.bottom}${carry} は いくつ？`;
  }

  if (step.kind === "shift") {
    return `${step.partial + 1}だんめは どこから 書きはじめる？ ますを タップ`;
  }

  const { partial, cell } = cellOf(plan, step);

  if (step.kind === "carry") {
    return `${digitAt(plan.a, cell.index)} × ${partial.multiplierDigit}${
      cell.carryIn > 0 ? ` + ${cell.carryIn}` : ""
    } = ${cellTotal(cell)}。くり上げる 数は？`;
  }

  // いちばん左からあふれる分は、上に書かずにそのまま答えの位に書く。
  // 書きとめる場所がないので、直前の計算を問いの中で示しておく
  if (isOverflowCell(plan, cell)) {
    const prev = partial.cells[step.cell - 1];
    return `${digitAt(plan.a, prev.index)} × ${partial.multiplierDigit}${
      prev.carryIn > 0 ? ` + ${prev.carryIn}` : ""
    } = ${cellTotal(prev)}。くり上げる 数を、いちばん 左に 書こう`;
  }

  const face = `${digitAt(plan.a, cell.index)} × ${partial.multiplierDigit}`;
  return cell.carryIn > 0
    ? `${face} に くり上がりの ${cell.carryIn} を たすと いくつ？`
    : `${face} は いくつ？`;
}

function diagnoseProduct(plan: MultiplyPlan, step: MultiplyStep, typed: number): string | null {
  const { partial, cell } = cellOf(plan, step);
  const total = cellTotal(cell);
  const top = digitAt(plan.a, cell.index);

  if (isOverflowCell(plan, cell)) {
    const prev = partial.cells[step.cell - 1];
    return `${cellTotal(prev)} の 十の位の ${cell.carryIn} を、いちばん 左に 書くよ`;
  }
  if (typed === total && total >= 10) {
    return `${total} のうち、この位に 書くのは 一の位の ${cell.digit} だけ。${cell.carryOut} は くり上げるよ`;
  }
  if (cell.carryIn > 0 && typed === cell.product % 10) {
    return `くり上がりの ${cell.carryIn} を たしわすれていないかな`;
  }
  if (typed === top + partial.multiplierDigit) {
    return "かけ算だよ。たし算に なっていないかな";
  }
  // 九九のとなりの段（1つ多い・1つ少ない段）と取りちがえている
  if (top > 0 && (typed === (total + top) % 10 || typed === (total + 10 - (top % 10)) % 10)) {
    return `${partial.multiplierDigit}の段の となりの 段に なっていないかな`;
  }
  return `${partial.multiplierDigit}の段を 思い出してみよう`;
}

function diagnoseCarry(plan: MultiplyPlan, step: MultiplyStep, typed: number): string | null {
  const { cell } = cellOf(plan, step);
  const total = cellTotal(cell);

  if (typed === total) return `くり上げるのは 十の位の ${cell.carryOut} だけだよ`;
  if (typed === cell.digit) return "くり上げるのは、いま 書いた 数ではなく 十の位のほうだよ";
  return `${total} の 十の位が、くり上げる 数だよ`;
}

export function diagnoseMultiplyStep(
  plan: MultiplyPlan,
  step: MultiplyStep,
  typed: number
): string | null {
  switch (step.kind) {
    case "product":
      return diagnoseProduct(plan, step, typed);
    case "carry":
      return diagnoseCarry(plan, step, typed);
    case "shift":
      if (typed < step.answer) {
        return "2だんめは かける数の 十の位を かけているね。だから ひとつ 左から 書きはじめるよ";
      }
      return "ずらしすぎだよ。ひとつだけ 左に ずらそう";
    case "add":
      return diagnoseColumnStep(
        plan.sumPlan!,
        { kind: "write", index: step.cell, input: "number", answer: step.answer },
        typed
      );
  }
}

/**
 * 同率のときの優先順。別の単元で練習し直せる手を先に見る。
 */
export const MULTIPLY_ADVICE_PRIORITY: MultiplyStepKind[] = ["product", "add", "shift", "carry"];

export function multiplyAdviceFor(kind: MultiplyStepKind): { text: string; unit?: string } {
  switch (kind) {
    case "product":
      return {
        text: "九九そのもので つまずいていたよ。ひっ算の前に、九九を もう少し れんしゅうすると 楽になる",
        unit: "times-table",
      };
    case "carry":
      return {
        text: "くり上がりを 覚えておくところで まよったみたい。頭で 覚えずに、かならず 上に 書いてから 次に 進もう",
      };
    case "shift":
      return {
        text: "2だんめを ずらすところで とまっていたよ。2だんめは かける数の 十の位を かけているから、一の位は 空けて ひとつ 左から 書くんだね",
      };
    case "add":
      return {
        text: "さいごの たし算で つまずいていたよ。たし算の ひっ算を もう一度 やってみよう",
        unit: "column-add-sub",
      };
  }
}
