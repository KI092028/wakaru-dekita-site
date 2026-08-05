import { buildPlan, type DivisionPlan } from "./plan";

/**
 * わり算のひっ算（3〜4年生）。1桁でわる場合にしぼる。
 *
 * 1セットは4問。ひっ算は1問に何手もかかるため、10問だと最後まで持たない。
 *
 * 段階は固定で、やさしい順に4問出す。レベル選択のUIは置かない。
 * つまずきの種類ごとに1問ずつ当たるようにしてあり、
 * どこで転ぶかが1セットで見えるようにしている。
 */

export const PROBLEM_COUNT = 4;

export type DivisionProblem = {
  id: string;
  dividend: number;
  divisor: number;
  /** 何を練習する問題か（画面には出さず、設計意図の記録） */
  stage: string;
};

type StagePredicate = (plan: DivisionPlan) => boolean;

const hasZeroInQuotient = (plan: DivisionPlan) => plan.rungs.some((rung) => rung.quotient === 0);

const STAGES: { name: string; test: StagePredicate }[] = [
  {
    // わりきれる・最初のけたから割れる。手順そのものに集中させる。
    // 商に0が立つ形（90÷3=30 など）は難所なので、ここでは避ける
    name: "わりきれる2けた",
    test: (p) =>
      p.dividend < 100 &&
      p.startPosition === 0 &&
      p.remainder === 0 &&
      p.rungs.length === 2 &&
      !hasZeroInQuotient(p),
  },
  {
    // あまりが出る。ひく の意味が効いてくる
    name: "あまりのある2けた",
    test: (p) =>
      p.dividend < 100 &&
      p.startPosition === 0 &&
      p.remainder > 0 &&
      p.rungs.length === 2 &&
      !hasZeroInQuotient(p),
  },
  {
    // 最初のけたでは割れない。「どこに商を立てるか」が本題
    name: "はじめのけたで割れない3けた",
    test: (p) => p.dividend >= 100 && p.startPosition === 1 && !hasZeroInQuotient(p),
  },
  {
    // 商の途中に0が立つ。ここでつまずく子が多い
    name: "商に0が立つ3けた",
    test: (p) => p.dividend >= 100 && p.startPosition === 0 && hasZeroInQuotient(p),
  },
];

/** 候補を総当たりで作る。1桁でわる範囲なので全部数えても数千通りしかない。 */
function candidates(test: StagePredicate): [number, number][] {
  const found: [number, number][] = [];
  for (let divisor = 2; divisor <= 9; divisor++) {
    for (let dividend = 10; dividend <= 999; dividend++) {
      if (dividend < divisor) continue;
      if (test(buildPlan(dividend, divisor))) found.push([dividend, divisor]);
    }
  }
  return found;
}

// 段階ごとの候補は毎回同じなので、最初に1度だけ作る
const POOLS = STAGES.map((stage) => ({ ...stage, pool: candidates(stage.test) }));

export function generateDivisionProblems(): DivisionProblem[] {
  return POOLS.map(({ name, pool }, index) => {
    const [dividend, divisor] = pool[Math.floor(Math.random() * pool.length)];
    return { id: `long-division-${index}`, dividend, divisor, stage: name };
  });
}
