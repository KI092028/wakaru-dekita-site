import { buildMultiplyPlan, type MultiplyPlan } from "./plan";

/**
 * かけ算のひっ算（3〜4年）の出題。
 *
 * 1セット4問。1問あたりの手数が多い（2けた×2けたで15手前後）ので、
 * 他の単元の6問より少なくしてある。
 *
 * ならう順に固定で並べる。2けた×1けたで「九九＋くり上がり」を通したあとに、
 * 2けた×2けたの「ずらす」に入る。
 * 3問目は わざと くり上がりの出ない数にして、ずらすことだけに集中させる。
 */

export const MULTIPLY_PROBLEM_COUNT = 4;

export const MULTIPLY_STORAGE_KEY = "wakaru-dekita:column-multiply:v1";

export type MultiplyProblem = {
  id: string;
  a: number;
  b: number;
  /** 何を練習する問題か（画面には出さず、設計意図の記録） */
  stage: string;
};

/** 九九のくり上がりが起きた回数（あふれたけたは数えない）。 */
function carryCount(plan: MultiplyPlan): number {
  return plan.partials.reduce(
    (sum, partial) =>
      sum + partial.cells.filter((c) => c.index < plan.aWidth && c.carryOut > 0).length,
    0
  );
}

type Stage = {
  name: string;
  /** かけられる数・かける数の範囲 */
  a: [number, number];
  b: [number, number];
  test: (plan: MultiplyPlan) => boolean;
};

const STAGES: Stage[] = [
  {
    name: "2けた×1けた・くり上がりなし",
    a: [11, 99],
    b: [2, 9],
    test: (p) => carryCount(p) === 0,
  },
  {
    name: "2けた×1けた・くり上がりあり",
    a: [11, 99],
    b: [3, 9],
    // 一の位から くり上がる形にする。十の位だけで くり上がる問題は
    // 「くり上がりを覚えておく」練習にならないため
    test: (p) => p.partials[0].cells[0].carryOut > 0,
  },
  {
    name: "2けた×2けた・ずらすことに集中",
    a: [11, 44],
    b: [11, 44],
    // 22×33 のように全部同じ九九になると、考えずに同じ数を書けてしまう
    test: (p) => carryCount(p) === 0 && Math.floor(p.a / 10) !== p.a % 10,
  },
  {
    name: "2けた×2けた",
    a: [12, 99],
    b: [12, 99],
    test: (p) => carryCount(p) >= 2,
  },
];

const MAX_TRIES = 500;
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/** 一の位が0の数は、九九の手がひとつ無くなって練習にならないので使わない。 */
const usable = (value: number) => value % 10 !== 0;

function pickForStage(stage: Stage): [number, number] {
  for (let i = 0; i < MAX_TRIES; i++) {
    const a = randInt(stage.a[0], stage.a[1]);
    const b = randInt(stage.b[0], stage.b[1]);
    if (!usable(a) || !usable(b)) continue;
    if (stage.test(buildMultiplyPlan(a, b))) return [a, b];
  }

  // まず起きないが、引き当てられなかったときのために総当たりで探す
  for (let a = stage.a[0]; a <= stage.a[1]; a++) {
    for (let b = stage.b[0]; b <= stage.b[1]; b++) {
      if (!usable(a) || !usable(b)) continue;
      if (stage.test(buildMultiplyPlan(a, b))) return [a, b];
    }
  }
  throw new Error(`条件に合う問題が作れませんでした: ${stage.name}`);
}

export function generateMultiplyProblems(): MultiplyProblem[] {
  return STAGES.map((stage, index) => {
    const [a, b] = pickForStage(stage);
    return { id: `multiply-${index}`, a, b, stage: stage.name };
  });
}
