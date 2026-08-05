import { diagnose } from "@/lib/quiz/diagnose";
import type { DivisionPlan, Rung } from "./plan";

/**
 * ひっ算の1手ごとの問いと、間違えたときに返す言葉。
 *
 * つまずきを4つに分けて、それぞれ別の手として扱う。
 * どこに商を立てるか（start）／九九が出るか（multiply）／
 * ひき算ができるか（subtract）／手順を覚えているか（順番そのもの）は別の力なので、
 * まとめて「不正解」にすると何ができていないのか分からなくなる。
 */

export type StepKind = "start" | "quotient" | "multiply" | "subtract" | "bringDown";

export type Step = {
  kind: StepKind;
  /** plan.rungs のどの段か */
  rungIndex: number;
  /** 数字を打つのか、けたをタップするのか */
  input: "number" | "column";
  /** 正解。number なら打つ数、column なら被除数のけた番号 */
  answer: number;
};

export const STEP_LABEL: Record<StepKind, string> = {
  start: "はじめ",
  quotient: "たてる",
  multiply: "かける",
  subtract: "ひく",
  bringDown: "おろす",
};

/** 画面に出す4つの手順（「はじめ」は最初の1回だけなので含めない）。 */
export const STEP_CYCLE: StepKind[] = ["quotient", "multiply", "subtract", "bringDown"];

export function buildSteps(plan: DivisionPlan): Step[] {
  const steps: Step[] = [
    { kind: "start", rungIndex: 0, input: "column", answer: plan.startPosition },
  ];

  plan.rungs.forEach((rung, rungIndex) => {
    steps.push({ kind: "quotient", rungIndex, input: "number", answer: rung.quotient });
    steps.push({ kind: "multiply", rungIndex, input: "number", answer: rung.product });
    steps.push({ kind: "subtract", rungIndex, input: "number", answer: rung.remainder });
    if (rung.bringDownDigit !== null) {
      steps.push({ kind: "bringDown", rungIndex, input: "column", answer: rung.position + 1 });
    }
  });

  return steps;
}

export function stepPrompt(plan: DivisionPlan, step: Step): string {
  const rung = plan.rungs[step.rungIndex];

  switch (step.kind) {
    case "start":
      return "はじめの 商は どこに 立つかな？";
    case "quotient":
      return `${rung.dividendPart} を ${plan.divisor} で わると いくつ？`;
    case "multiply":
      return `${plan.divisor} × ${rung.quotient} は いくつ？`;
    case "subtract":
      return `${rung.dividendPart} − ${rung.product} は いくつ？`;
    case "bringDown":
      return "つぎの けたを おろそう。下の数字を タップ";
  }
}

/** 被除数の左から column けた目までを数にする（「1」「12」「128」）。 */
function prefixValue(plan: DivisionPlan, column: number): number {
  return Number(plan.digits.slice(0, column + 1).join(""));
}

function diagnoseStart(plan: DivisionPlan, correct: number, tapped: number): string | null {
  if (tapped < correct) {
    return `${prefixValue(plan, tapped)} は ${plan.divisor} より 小さいから、まだ わけられないよ。ひとつ 右だね`;
  }
  return `${prefixValue(plan, correct)} なら ${plan.divisor} で わけられるよ。もっと 左からだね`;
}

function diagnoseQuotient(plan: DivisionPlan, rung: Rung, typed: number): string | null {
  const product = typed * plan.divisor;

  if (rung.quotient === 0) {
    return `${rung.dividendPart} は ${plan.divisor} で わけられないね。こういうときは 0 を たてるよ`;
  }
  if (product > rung.dividendPart) {
    return `${plan.divisor} × ${typed} = ${product} は ${rung.dividendPart} より 大きいよ。大きすぎるね`;
  }
  if (rung.dividendPart - product >= plan.divisor) {
    return `あまりが ${rung.dividendPart - product} で、まだ ${plan.divisor} で わけられるよ。もう少し 大きいね`;
  }
  return null;
}

/**
 * 打たれた答えから、何を間違えたかを1行で返す。判定できないときは null。
 *
 * かける・ひく は九九・ひき算そのものなので、既存の diagnose() を使い回す。
 * ひっ算でつまずいている子が、実は九九やくり下がりでつまずいていることを
 * その場の言葉で返せるようにするため。
 */
export function diagnoseStep(plan: DivisionPlan, step: Step, typed: number): string | null {
  const rung = plan.rungs[step.rungIndex];

  switch (step.kind) {
    case "start":
      return diagnoseStart(plan, step.answer, typed);
    case "quotient":
      return diagnoseQuotient(plan, rung, typed);
    case "multiply":
      return diagnose(
        { id: "div-multiply", a: plan.divisor, op: "×", b: rung.quotient, answer: rung.product },
        typed
      );
    case "subtract":
      return diagnose(
        {
          id: "div-subtract",
          a: rung.dividendPart,
          op: "−",
          b: rung.product,
          answer: rung.remainder,
        },
        typed
      );
    case "bringDown":
      return `下ろすのは つぎの けたの ${plan.digits[step.answer]} だよ`;
  }
}

/** 結果画面で「どこでつまずいたか」を言うための集計。 */
export type StepErrors = Record<StepKind, number>;

export const NO_ERRORS: StepErrors = {
  start: 0,
  quotient: 0,
  multiply: 0,
  subtract: 0,
  bringDown: 0,
};

/**
 * いちばん多かったつまずきに対する見立て。
 * 「ひっ算が苦手」で終わらせず、戻るべき場所を名指しする。
 */
/**
 * 回数が同じときの優先順。
 * 九九・ひき算を先に見るのは、この2つだけが別の単元で直接練習できる＝
 * 打ち手のあるつまずきだから。手順のまよいは、土台が固まると自然に減ることが多い。
 */
const ADVICE_PRIORITY: StepKind[] = ["multiply", "subtract", "quotient", "start", "bringDown"];

export function advice(errors: StepErrors): { text: string; unit?: string } | null {
  const worst = (Object.keys(errors) as StepKind[])
    .filter((kind) => errors[kind] > 0)
    .sort(
      (a, b) =>
        errors[b] - errors[a] || ADVICE_PRIORITY.indexOf(a) - ADVICE_PRIORITY.indexOf(b)
    )[0];

  if (!worst) return null;

  switch (worst) {
    case "start":
      return { text: "商を どこに 立てるかで まよったみたい。左から ひとけたずつ 見ていこう" };
    case "quotient":
      return { text: "商の 見当を つけるのが むずかしかったね。九九を 上から たどると 見つけやすいよ" };
    case "multiply":
      return { text: "かけ算で つまずいていたよ。九九を もう少し れんしゅうすると ぐっと 楽になる", unit: "times-table" };
    case "subtract":
      return { text: "ひき算で つまずいていたよ。くり下がりを もう少し れんしゅうしよう", unit: "add-sub" };
    case "bringDown":
      return { text: "おろす ところで まよったみたい。ひく→おろす の 順番を おぼえよう" };
  }
}
