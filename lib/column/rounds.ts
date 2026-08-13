import { buildDecimalProblem, decimalAnswerText, decimalPlan } from "./decimal";
import { generateColumnProblems } from "./generate";
import { buildColumnPlan, type ColumnOp, type ColumnPlan } from "./plan";
import type { DecimalInfo } from "./steps";

/**
 * 列のひっ算の1問分。整数でも小数でも同じ形にそろえ、UI からは中身を意識しない。
 *
 * サーバーコンポーネントから関数を渡せないため、ページからは mode（文字列）だけを渡し、
 * ここで問題の作り方を解決する（→ design-guidelines.md 3.2）。
 */

export type ColumnMode = "integer" | "decimal";

export type ColumnRound = {
  id: string;
  /** 画面右上に出す式 */
  headline: string;
  plan: ColumnPlan;
  /** 小数のときだけ */
  decimal?: DecimalInfo;
  /** 完成したときに見せる答え */
  answerText: string;
  /** 何を練習する問題か（画面には出さない） */
  stage: string;
};

export const ROUND_COUNT = 6;

export const STORAGE_KEY: Record<ColumnMode, string> = {
  integer: "wakaru-dekita:column-add-sub:v1",
  decimal: "wakaru-dekita:column-decimal:v1",
};

export const MODE_TITLE: Record<ColumnMode, string> = {
  integer: "たし算・ひき算のひっ算",
  decimal: "小数のたし算・ひき算",
};

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/** 10^decimals 倍された整数を、表示用の文字列に戻す。 */
function toText(scaled: number, decimals: number): string {
  if (decimals === 0) return String(scaled);
  const digits = String(scaled).padStart(decimals + 1, "0");
  const cut = digits.length - decimals;
  return `${digits.slice(0, cut)}.${digits.slice(cut)}`;
}

const carryCount = (plan: ColumnPlan) => plan.columns.filter((c) => c.carryOut === 1).length;
const borrowCount = (plan: ColumnPlan) => plan.columns.filter((c) => c.borrows).length;

type DecimalStage = {
  name: string;
  op: ColumnOp;
  /** 条件に合う [aの文字列, bの文字列] を引く */
  draw: () => [string, string] | null;
  test: (plan: ColumnPlan) => boolean;
};

/** 小数第1位どうし。1.1〜9.9 の範囲（整数ちょうどは避ける）。 */
function drawTenths(op: ColumnOp): [string, string] | null {
  let a = randInt(11, 99);
  let b = randInt(11, 99);
  if (a % 10 === 0 || b % 10 === 0) return null;
  if (op === "−") {
    if (a === b) return null;
    if (a < b) [a, b] = [b, a];
  }
  return [toText(a, 1), toText(b, 1)];
}

/** 片方だけ小数。けたをそろえる練習になる形。 */
function drawMixed(op: ColumnOp, decimalSide: "a" | "b"): [string, string] | null {
  const withPoint = randInt(11, 99);
  if (withPoint % 10 === 0) return null;
  const whole = randInt(10, 99);

  const aScaled = decimalSide === "a" ? withPoint : whole * 10;
  const bScaled = decimalSide === "a" ? whole * 10 : withPoint;
  if (op === "−" && aScaled <= bScaled) return null;

  return [
    decimalSide === "a" ? toText(withPoint, 1) : String(whole),
    decimalSide === "a" ? String(whole) : toText(withPoint, 1),
  ];
}

const DECIMAL_STAGES: DecimalStage[] = [
  {
    name: "小数第1位どうし・くり上がりなし",
    op: "+",
    draw: () => drawTenths("+"),
    test: (p) => carryCount(p) === 0,
  },
  {
    name: "小数第1位どうし・くり上がりあり",
    op: "+",
    draw: () => drawTenths("+"),
    test: (p) => carryCount(p) >= 1 && p.columns[0].carryOut === 1,
  },
  {
    name: "けた数がちがうたし算",
    op: "+",
    draw: () => drawMixed("+", "a"),
    test: () => true,
  },
  {
    name: "小数第1位どうし・くり下がりなし",
    op: "−",
    draw: () => drawTenths("−"),
    test: (p) => borrowCount(p) === 0,
  },
  {
    name: "小数第1位どうし・くり下がりあり",
    op: "−",
    draw: () => drawTenths("−"),
    test: (p) => borrowCount(p) >= 1 && p.columns[0].borrows,
  },
  {
    name: "けた数がちがうひき算",
    op: "−",
    draw: () => drawMixed("−", "b"),
    test: () => true,
  },
];

const MAX_TRIES = 500;

function buildDecimalRounds(): ColumnRound[] {
  return DECIMAL_STAGES.map((stage, index) => {
    for (let i = 0; i < MAX_TRIES; i++) {
      const drawn = stage.draw();
      if (!drawn) continue;

      const problem = buildDecimalProblem(
        `decimal-${index}`,
        drawn[0],
        drawn[1],
        stage.op,
        stage.name
      );
      const plan = decimalPlan(problem);
      if (plan.answer < 0 || !stage.test(plan)) continue;

      return {
        id: problem.id,
        headline: `${problem.aText} ${problem.op} ${problem.bText}`,
        plan,
        decimal: {
          decimals: problem.decimals,
          padColumns: problem.padColumns,
          padTarget: problem.padTarget,
        },
        answerText: decimalAnswerText(problem, plan),
        stage: stage.name,
      };
    }
    throw new Error(`条件に合う問題が作れませんでした: ${stage.name}`);
  });
}

function buildIntegerRounds(): ColumnRound[] {
  return generateColumnProblems().map((problem) => {
    const plan = buildColumnPlan(problem.a, problem.b, problem.op);
    return {
      id: problem.id,
      headline: `${problem.a} ${problem.op} ${problem.b}`,
      plan,
      answerText: String(plan.answer),
      stage: problem.stage,
    };
  });
}

export function buildRounds(mode: ColumnMode): ColumnRound[] {
  return mode === "decimal" ? buildDecimalRounds() : buildIntegerRounds();
}
