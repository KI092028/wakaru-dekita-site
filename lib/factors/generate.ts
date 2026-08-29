import {
  BOARD_MAX,
  commonOf,
  gcd,
  lcm,
  setOf,
  targetOf,
  type FactorPlan,
  type FactorStep,
} from "./plan";

/**
 * 公倍数・公約数の出題。
 *
 * ## 4問の並び
 *
 * 1. **倍数** を並べて、重なりの いちばん小さいものを見つける
 * 2. **約数** を並べて、重なりの いちばん大きいものを見つける
 * 3. 1と同じことをして、見つけた数を **通分** に使う
 * 4. 2と同じことをして、見つけた数を **約分** に使う
 *
 * 前半で「見つけ方」、後半で「何のために見つけたか」。
 * 後半を付けないと、この単元は覚えるだけのものになる。
 *
 * ## 数の選び方
 *
 * - **重なりが2つ以上、盤に載ること。** 1つしか載らないと「いちばん小さい」が
 *   えらべず、公倍数はいくつもある、という要が消える。
 *   最初これを見落として、6と8（重なりは24だけ）などを入れていた
 * - 1問目は、**どちらも相手を割り切らない組**にする。
 *   割り切れる組（4と8）ばかり出すと「最小公倍数＝大きいほう」と
 *   おぼえてしまう。3問目では割り切れる組も出して、両方を見せる
 * - 盤の上のしるしは9個まで。それ以上は押すだけで疲れる
 * - 約数のほうは、最大公約数が 1 にならない組だけ。
 *   1しか重ならないと、見つけた数を約分に使えない
 */

export const FACTOR_PROBLEM_COUNT = 4;

export const FACTOR_STORAGE_KEY = "wakaru-dekita:multiples-factors:v1";

/**
 * 倍数の組。盤は 36 まで。**重なりが2つ以上あるものだけ。**
 *
 * 重なりが1つでは「いちばん小さいのをえらぶ」ができず、
 * 公倍数はいくつもある、という要が消える（6と8は 24 だけになる）。
 */
const MULTIPLE_PAIRS: { a: number; b: number; divides: boolean }[] = [
  // どちらも相手を割り切らない。最小公倍数がどちらの数とも別になる
  { a: 4, b: 6, divides: false }, // 12, 24, 36
  { a: 6, b: 9, divides: false }, // 18, 36
  // 片方がもう片方を割り切る。**最小公倍数が大きいほうと同じになる形。**
  // 4と8で 32 と答えてしまう子が多いので、これも出す
  { a: 4, b: 8, divides: true }, // 8, 16, 24, 32
  { a: 6, b: 12, divides: true }, // 12, 24, 36
  { a: 5, b: 15, divides: true }, // 15, 30
  { a: 7, b: 14, divides: true }, // 14, 28
];

/** 約数の組。最大公約数が2以上 */
const DIVISOR_PAIRS: [number, number][] = [
  [12, 18],
  [8, 12],
  [16, 24],
  [9, 12],
  [10, 15],
  [12, 20],
  [18, 24],
  [14, 21],
];

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

/** 同じ組を2回使わない。1問目と3問目、2問目と4問目で数が変わる */
function pickTwo<T>(items: T[]): [T, T] {
  const first = Math.floor(Math.random() * items.length);
  let second = Math.floor(Math.random() * (items.length - 1));
  if (second >= first) second += 1;
  return [items[first], items[second]];
}

function build(
  index: number,
  kind: FactorPlan["kind"],
  a: number,
  b: number,
  stage: string,
  extra?: FactorStep
): FactorPlan {
  const steps: FactorStep[] = [{ kind: "mark", n: a }, { kind: "mark", n: b }, { kind: "pick" }];
  if (extra) steps.push(extra);

  const story =
    kind === "multiple"
      ? `${a}の倍数と ${b}の倍数を、1から${BOARD_MAX.multiple}の 盤の 上に ならべます。`
      : `${a}の約数と ${b}の約数を、1から${BOARD_MAX.divisor}の 盤の 上に ならべます。`;

  const max = BOARD_MAX[kind];
  return {
    id: `factors-${index}`,
    kind,
    a,
    b,
    max,
    steps,
    story,
    stage,
    target: targetOf(kind, a, b, max),
  };
}

export function generateFactorPlans(): FactorPlan[] {
  // 1問目は、どちらも相手を割り切らない組にする。
  // 「最小公倍数＝大きいほう」とおぼえてしまわないように
  const plain = MULTIPLE_PAIRS.filter((p) => !p.divides);
  const first = pick(plain);
  const third = pick(MULTIPLE_PAIRS.filter((p) => p !== first));
  const [d1, d2] = pickTwo(DIVISOR_PAIRS);

  const useMultiple = build(2, "multiple", third.a, third.b, "見つけた数を 通分に つかう", {
    kind: "use",
  });
  useMultiple.use = {
    mode: "denominator",
    left: { numerator: 1, denominator: third.a },
    right: { numerator: 1, denominator: third.b },
    answer: lcm(third.a, third.b),
  };

  const useDivisor = build(3, "divisor", d2[0], d2[1], "見つけた数を 約分に つかう", {
    kind: "use",
  });
  const g = gcd(d2[0], d2[1]);
  useDivisor.use = {
    mode: "reduce",
    from: { numerator: d2[0], denominator: d2[1] },
    answer: { numerator: d2[0] / g, denominator: d2[1] / g },
  };

  return [
    build(0, "multiple", first.a, first.b, "重なりを さがす"),
    build(1, "divisor", d1[0], d1[1], "こんどは 約数で"),
    useMultiple,
    useDivisor,
  ];
}

/** 呼ぶ側から確かめられるように出しておく。 */
export { commonOf, setOf, targetOf };
