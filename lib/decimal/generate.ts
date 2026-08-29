import { computeOf, shouldBeBigger, type DecimalOp, type DecimalPlan } from "./plan";

/**
 * 小数のかけ算・わり算の出題。
 *
 * ## 4問の並びは固定
 *
 * 1. **× で 小さくなる**（かける数が 1より小さい）← 思い込みが いちばん出るところ
 * 2. × で 大きくなる
 * 3. **÷ で 大きくなる**（わる数が 1より小さい）← もう一方の山
 * 4. ÷ で 小さくなる
 *
 * 「思い込みどおりにならない形」を先に出す。
 * 2と4は、思い込みどおりになる形。**両方を出さないと、
 * 「小数のときは いつも 逆」という新しい思い込みに変わる。**
 *
 * ## 数の決め方
 *
 * - 答えは小数第1位まで。それ以上は、この単元で見せたいこととは関係のない
 *   計算の重さになる
 * - かける数・わる数は 1 をまたいで両側を使う
 * - もとの数と答えが同じ値にならないこと（1をかける・1でわる形は出さない）
 */

export const DECIMAL_PROBLEM_COUNT = 4;

export const DECIMAL_STORAGE_KEY = "wakaru-dekita:decimal-size:v1";

/**
 * 場面。
 *
 * **「1mあたり」の形にそろえる。** 小数をかける・わる意味が通るのは
 * この形のときで、「3人に配る」のような場面では 0.8人 が出てきてしまう。
 */
type Scene = {
  /** かけ算のときの文。もとの数 × かける数 */
  times: (base: number, factor: number) => string;
  /** わり算のときの文 */
  divide: (base: number, factor: number) => string;
};

const SCENES: Scene[] = [
  {
    times: (b, f) => `1mで ${b}円の リボンを、${f}m 買います。だいは いくら？`,
    divide: (b, f) => `リボンを ${f}m 買ったら ${b}円でした。1mでは いくら？`,
  },
  {
    times: (b, f) => `1mの おもさが ${b}g の はり金が、${f}m あります。おもさは 何g？`,
    divide: (b, f) => `はり金 ${f}m の おもさが ${b}g でした。1mの おもさは 何g？`,
  },
  {
    times: (b, f) => `1Lで ${b}m² ぬれる ペンキが、${f}L あります。何m² ぬれる？`,
    divide: (b, f) => `ペンキ ${f}L で ${b}m² ぬれました。1Lでは 何m²？`,
  },
];

/** × 小さくなる（かける数 < 1） */
const TIMES_DOWN: [number, number][] = [
  [6, 0.8],
  [5, 0.6],
  [8, 0.5],
  [7, 0.4],
  [9, 0.2],
];
/** × 大きくなる（かける数 > 1） */
const TIMES_UP: [number, number][] = [
  [6, 1.2],
  [5, 1.4],
  [8, 1.5],
  [7, 1.2],
  [4, 2.5],
];
/** ÷ 大きくなる（わる数 < 1） */
const DIVIDE_UP: [number, number][] = [
  [6, 0.8],
  [4, 0.5],
  [3, 0.6],
  [6, 0.4],
  [9, 0.6],
];
/** ÷ 小さくなる（わる数 > 1） */
const DIVIDE_DOWN: [number, number][] = [
  [6, 1.2],
  [9, 1.5],
  [8, 1.6],
  [12, 1.5],
  [7, 1.4],
];

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

/**
 * 数直線の右はし。
 *
 * **もとの数の左右が、どちらも押せる広さになること。**
 * 答えが入る幅ぎりぎりで切ると、たとえば もとの数 6・答え 4.8 のときに
 * 右はしが 7 になり、「大きい」の帯が線の 1/7 しかなくなる。
 * えらぶ前から答えが見えてしまうので、もとの数の 1.6倍 までは必ず取る。
 *
 * 目もりが 16本 を超えると線がつぶれるので、そのときは 2 きざみにする。
 */
function axisFor(base: number, answer: number): { axisMax: number; tickStep: number } {
  const needed = Math.max(base, answer) + 1;
  const balanced = base * 1.6;
  const target = Math.max(needed, balanced);
  const tickStep = target > 12 ? 2 : 1;
  return { axisMax: Math.ceil(target / tickStep) * tickStep, tickStep };
}

function build(index: number, op: DecimalOp, pair: [number, number], stage: string): DecimalPlan {
  const [base, factor] = pair;
  const answer = computeOf(op, base, factor);
  const scene = pick(SCENES);
  return {
    id: `decimal-${index}`,
    op,
    base,
    factor,
    answer,
    bigger: shouldBeBigger(op, factor),
    story: op === "×" ? scene.times(base, factor) : scene.divide(base, factor),
    stage,
    ...axisFor(base, answer),
  };
}

export function generateDecimalPlans(): DecimalPlan[] {
  return [
    build(0, "×", pick(TIMES_DOWN), "かけたのに 小さくなる"),
    build(1, "×", pick(TIMES_UP), "こちらは 大きくなる"),
    build(2, "÷", pick(DIVIDE_UP), "わったのに 大きくなる"),
    build(3, "÷", pick(DIVIDE_DOWN), "こちらは 小さくなる"),
  ];
}
