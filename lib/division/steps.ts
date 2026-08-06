import { diagnose } from "@/lib/quiz/diagnose";
import { roundedDivisor, type DivisionLevel, type DivisionPlan, type Rung } from "./plan";

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

/** 打ってよい桁数。商は1けた、かけた数は2けたでわると3けたになりうる。 */
export function stepMaxDigits(plan: DivisionPlan, step: Step): number {
  if (step.kind === "quotient") return 1;
  return String(plan.dividend).length;
}

/**
 * たてる のときだけ出す、仮の商の見当のつけ方。
 * 2けたでわるときは、わる数をがい数にして見当をつけるのが定石なので、
 * その手順を毎回画面に出しておく（覚えているかどうかを試す場面ではない）。
 */
export function stepHint(plan: DivisionPlan, step: Step): string | null {
  if (step.kind !== "quotient" || plan.divisor < 10) return null;
  const rung = plan.rungs[step.rungIndex];
  const rounded = roundedDivisor(plan.divisor);
  return `${plan.divisor} は だいたい ${rounded}。${rung.dividendPart} ÷ ${rounded} で 見当を つけよう`;
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
  // 「大きすぎ／小さすぎ」で終わらせず、次にやることまで言う。
  // 2けたでわるときは、仮の商を1つ増減して直すのがこの単元の中心なので
  if (product > rung.dividendPart) {
    return `${plan.divisor} × ${typed} = ${product}。${rung.dividendPart} より 大きすぎるね。ひとつ 減らしてみよう`;
  }
  if (rung.dividendPart - product >= plan.divisor) {
    return `あまりが ${rung.dividendPart - product} で、まだ ${plan.divisor} で わけられるよ。ひとつ ふやしてみよう`;
  }
  return null;
}

/**
 * 2けた × 1けた の誤り。1けたでわるときは九九そのものなので、
 * 九九の言葉で返せる diagnose() に任せている（→ diagnoseStep）。
 */
function diagnoseWideMultiply(divisor: number, quotient: number, typed: number): string | null {
  const product = divisor * quotient;
  const tens = Math.floor(divisor / 10);
  const ones = divisor % 10;

  for (const near of [quotient - 1, quotient + 1]) {
    if (near >= 0 && typed === divisor * near) {
      return `おしい！ ${divisor} × ${near} の こたえに なっているよ`;
    }
  }
  // 一の位のくり上がりを、十の位に たしわすれた形
  const withoutCarry = tens * quotient * 10 + ((ones * quotient) % 10);
  if (typed === withoutCarry && withoutCarry !== product) {
    return `${ones} × ${quotient} の くり上がりを、十の位に たしわすれていないかな`;
  }
  if (typed === ones * quotient) return "一の位だけ かけているよ。十の位も かけよう";
  if (typed === tens * quotient * 10) return "十の位だけ かけているよ。一の位も かけよう";
  return null;
}

/** けたの多いひき算の誤り。くり下がりの取りこぼしは 10・100 のずれとして出る。 */
function diagnoseWideSubtract(minuend: number, subtrahend: number, typed: number): string | null {
  const gap = Math.abs(typed - (minuend - subtrahend));
  if (gap === 10 || gap === 100) return "くり下がりを わすれていないかな";
  if (gap === 1) return "あと 1 だけ ちがうよ";
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
      return plan.divisor < 10
        ? diagnose(
            { id: "div-multiply", a: plan.divisor, op: "×", b: rung.quotient, answer: rung.product },
            typed
          )
        : diagnoseWideMultiply(plan.divisor, rung.quotient, typed);
    case "subtract":
      return plan.divisor < 10
        ? diagnose(
            {
              id: "div-subtract",
              a: rung.dividendPart,
              op: "−",
              b: rung.product,
              answer: rung.remainder,
            },
            typed
          )
        : diagnoseWideSubtract(rung.dividendPart, rung.product, typed);
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
 * 回数が同じときの優先順。
 * 九九・ひき算を先に見るのは、この2つだけが別の単元で直接練習できる＝
 * 打ち手のあるつまずきだから。手順のまよいは、土台が固まると自然に減ることが多い。
 */
export const ADVICE_PRIORITY: StepKind[] = ["multiply", "subtract", "quotient", "start", "bringDown"];

/**
 * いちばん多かったつまずきに対する見立て。
 * 「ひっ算が苦手」で終わらせず、戻るべき場所を名指しする。
 */
export function advice(
  errors: StepErrors,
  level: DivisionLevel = "one-digit"
): { text: string; unit?: string } | null {
  const worst = (Object.keys(errors) as StepKind[])
    .filter((kind) => errors[kind] > 0)
    .sort(
      (a, b) =>
        errors[b] - errors[a] || ADVICE_PRIORITY.indexOf(a) - ADVICE_PRIORITY.indexOf(b)
    )[0];

  return worst ? adviceFor(worst, level) : null;
}

export function adviceFor(
  kind: StepKind,
  level: DivisionLevel = "one-digit"
): { text: string; unit?: string } {
  const wide = level === "two-digit";

  switch (kind) {
    case "start":
      return { text: "商を どこに 立てるかで まよったみたい。左から ひとけたずつ 見ていこう" };
    case "quotient":
      return {
        text: wide
          ? "仮の商の 見当を つけるのが むずかしかったね。わる数を がい数に してから 見当を つけ、合わなければ ひとつ 増減しよう"
          : "商の 見当を つけるのが むずかしかったね。九九を 上から たどると 見つけやすいよ",
      };
    case "multiply":
      return {
        text: wide
          ? "かけ算で つまずいていたよ。2けた × 1けた の くり上がりを 見なおそう"
          : "かけ算で つまずいていたよ。九九を もう少し れんしゅうすると ぐっと 楽になる",
        unit: "times-table",
      };
    case "subtract":
      return { text: "ひき算で つまずいていたよ。くり下がりを もう少し れんしゅうしよう", unit: "add-sub" };
    case "bringDown":
      return { text: "おろす ところで まよったみたい。ひく→おろす の 順番を おぼえよう" };
  }
}
