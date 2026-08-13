import { buildColumnPlan, type ColumnOp, type ColumnPlan } from "./plan";

/**
 * たし算・ひき算のひっ算（2〜3年）の出題。
 *
 * 1セット6問。やさしい順に固定で並べ、つまずきの種類ごとに1問ずつ当たるようにする。
 * わり算のひっ算と同じく、条件に合う問題を引くまでランダムに引いては
 * 手順を組んで確かめる方式（条件を数式で書き下すより間違いが少ない）。
 */

export const COLUMN_PROBLEM_COUNT = 6;

export type ColumnProblem = {
  id: string;
  a: number;
  b: number;
  op: ColumnOp;
  /** 何を練習する問題か（画面には出さず、設計意図の記録） */
  stage: string;
};

const carryCount = (plan: ColumnPlan) => plan.columns.filter((c) => c.carryOut === 1).length;
const borrowCount = (plan: ColumnPlan) => plan.columns.filter((c) => c.borrows).length;

/**
 * 0 のとなりから借りる形（302−158 など）は、借りが2つ左まで連鎖する。
 * 別の難所なので、この単元では出さない。
 */
const hasCascade = (plan: ColumnPlan) =>
  plan.columns.some((c) => c.borrows && plan.columns[c.index + 1]?.top === 0);

type Stage = {
  name: string;
  op: ColumnOp;
  range: [number, number];
  test: (plan: ColumnPlan) => boolean;
};

const STAGES: Stage[] = [
  {
    name: "くり上がりなし（2けた）",
    op: "+",
    range: [10, 99],
    test: (p) => carryCount(p) === 0,
  },
  {
    name: "くり上がり1回（2けた）",
    op: "+",
    range: [10, 99],
    // 一の位から くり上がる形にする。十の位だけで くり上がる問題（54+83）は
    // 指導の順序が違うので、この段階では出さない
    test: (p) => carryCount(p) === 1 && p.columns[0].carryOut === 1,
  },
  {
    name: "くり上がり2回（3けた）",
    op: "+",
    range: [100, 999],
    test: (p) => carryCount(p) === 2 && p.columns[0].carryOut === 1,
  },
  {
    name: "くり下がりなし（2けた）",
    op: "−",
    range: [10, 99],
    test: (p) => borrowCount(p) === 0,
  },
  {
    name: "くり下がり1回（2けた）",
    op: "−",
    range: [10, 99],
    test: (p) => borrowCount(p) === 1,
  },
  {
    name: "くり下がり2回（3けた）",
    op: "−",
    range: [100, 999],
    test: (p) => borrowCount(p) === 2 && p.columns[0].borrows && !hasCascade(p),
  },
];

const MAX_TRIES = 500;
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

function pickForStage(stage: Stage): [number, number] {
  const [min, max] = stage.range;

  for (let i = 0; i < MAX_TRIES; i++) {
    let a = randInt(min, max);
    let b = randInt(min, max);
    if (stage.op === "−") {
      if (a === b) continue;
      if (a < b) [a, b] = [b, a];
    }
    if (stage.test(buildColumnPlan(a, b, stage.op))) return [a, b];
  }

  // まず起きないが、引き当てられなかったときのために総当たりで探す
  for (let a = min; a <= max; a++) {
    for (let b = min; b <= (stage.op === "−" ? a - 1 : max); b++) {
      if (stage.test(buildColumnPlan(a, b, stage.op))) return [a, b];
    }
  }
  throw new Error(`条件に合う問題が作れませんでした: ${stage.name}`);
}

export function generateColumnProblems(): ColumnProblem[] {
  return STAGES.map((stage, index) => {
    const [a, b] = pickForStage(stage);
    return { id: `column-${index}`, a, b, op: stage.op, stage: stage.name };
  });
}
