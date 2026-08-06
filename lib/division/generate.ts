import { buildPlan, provisionalQuotient, type DivisionLevel, type DivisionPlan } from "./plan";

/**
 * わり算のひっ算の出題。
 *
 * 1けたでわる（3〜4年生）と2けたでわる（4年生）を別の単元として扱う。
 * 2けたでわるほうは「仮の商の見当をつけて、合わなければ1つ増減する」という
 * 別の技能が要るため、同じセットに混ぜない。
 *
 * 1セットは4問。ひっ算は1問に何手もかかるため、10問だと最後まで持たない。
 * 段階は固定で、つまずきの種類ごとに1問ずつ当たるようにしてある。
 */

export const PROBLEM_COUNT = 4;

export type DivisionProblem = {
  id: string;
  dividend: number;
  divisor: number;
  /** 何を練習する問題か（画面には出さず、設計意図の記録） */
  stage: string;
};

const hasZeroInQuotient = (p: DivisionPlan) => p.rungs.some((rung) => rung.quotient === 0);

/** 仮の商と本当の商のずれ。0 ならそのまま合う */
function estimateGap(p: DivisionPlan): number | null {
  if (p.rungs.length !== 1) return null;
  const rung = p.rungs[0];
  return provisionalQuotient(rung.dividendPart, p.divisor) - rung.quotient;
}

type Stage = {
  name: string;
  /** わられる数を引く範囲。狭めておくと、当たりを引くまでの試行が少なくて済む */
  dividends: [number, number];
  test: (p: DivisionPlan) => boolean;
};

const ONE_DIGIT_STAGES: Stage[] = [
  {
    // わりきれる・最初のけたから割れる。手順そのものに集中させる。
    // 商に0が立つ形（90÷3=30 など）は難所なので、ここでは避ける
    name: "わりきれる2けた",
    dividends: [10, 99],
    test: (p) =>
      p.dividend < 100 &&
      p.startPosition === 0 &&
      p.remainder === 0 &&
      p.rungs.length === 2 &&
      !hasZeroInQuotient(p),
  },
  {
    name: "あまりのある2けた",
    dividends: [10, 99],
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
    dividends: [100, 999],
    test: (p) => p.dividend >= 100 && p.startPosition === 1 && !hasZeroInQuotient(p),
  },
  {
    // 商の途中に0が立つ。ここでつまずく子が多い
    name: "商に0が立つ3けた",
    dividends: [100, 999],
    test: (p) => p.dividend >= 100 && p.startPosition === 0 && hasZeroInQuotient(p),
  },
];

const TWO_DIGIT_STAGES: Stage[] = [
  {
    // 仮の商がそのまま合う。まず「がい数で見当をつける」やり方に慣れさせる
    name: "仮の商がそのまま合う",
    dividends: [10, 999],
    test: (p) => p.rungs.length === 1 && p.rungs[0].quotient >= 2 && estimateGap(p) === 0,
  },
  {
    // わる数を切り捨てて見たぶん、仮の商が大きく出る（23 を 20 と見るなど）
    name: "仮の商を1つ減らす",
    dividends: [10, 999],
    test: (p) => p.rungs.length === 1 && p.rungs[0].quotient >= 1 && estimateGap(p) === 1,
  },
  {
    // わる数を切り上げて見たぶん、仮の商が小さく出る（19 を 20 と見るなど）
    name: "仮の商を1つふやす",
    dividends: [10, 999],
    test: (p) => p.rungs.length === 1 && estimateGap(p) === -1,
  },
  {
    // 商が2けたになる。段を2回まわす
    name: "商が2けた",
    dividends: [100, 999],
    test: (p) => p.dividend >= 100 && p.rungs.length === 2 && !hasZeroInQuotient(p),
  },
];

const DIVISORS: Record<DivisionLevel, [number, number]> = {
  "one-digit": [2, 9],
  "two-digit": [11, 89],
};

const STAGES: Record<DivisionLevel, Stage[]> = {
  "one-digit": ONE_DIGIT_STAGES,
  "two-digit": TWO_DIGIT_STAGES,
};

/**
 * 条件に合う問題を引くまで、ランダムに引いては手順を組んで確かめる。
 *
 * 段階の判定にひっ算の手順そのものを使うほうが、条件を数式で書き下すより間違いが少ない。
 * いちばん当たりにくい段階でも 20回に1回は当たるので、数十回引けば十分。
 * 全部の組み合わせを先に並べる作りにすると、端末で7万通り分の計算が走るためやめた。
 */
const MAX_TRIES = 500;

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

function pickForStage(stage: Stage, level: DivisionLevel): [number, number] {
  const [minDivisor, maxDivisor] = DIVISORS[level];
  const [minDividend, maxDividend] = stage.dividends;

  for (let i = 0; i < MAX_TRIES; i++) {
    const divisor = randInt(minDivisor, maxDivisor);
    const dividend = randInt(minDividend, maxDividend);
    if (dividend < divisor) continue;
    if (stage.test(buildPlan(dividend, divisor))) return [dividend, divisor];
  }

  // まず起きないが、引き当てられなかったときのために総当たりで探す
  for (let divisor = minDivisor; divisor <= maxDivisor; divisor++) {
    for (let dividend = Math.max(minDividend, divisor); dividend <= maxDividend; dividend++) {
      if (stage.test(buildPlan(dividend, divisor))) return [dividend, divisor];
    }
  }
  throw new Error(`条件に合う問題が作れませんでした: ${stage.name}`);
}

export function generateDivisionProblems(level: DivisionLevel): DivisionProblem[] {
  return STAGES[level].map((stage, index) => {
    const [dividend, divisor] = pickForStage(stage, level);
    return { id: `${level}-${index}`, dividend, divisor, stage: stage.name };
  });
}
