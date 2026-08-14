import { additiveSide, correctSide, perUnit, type RatePlan, type Situation } from "./plan";

/**
 * 単位量あたりの出題。
 *
 * 1セット**4問**。1問4手だが、考えるところが重いので数は少なくする。
 *
 * ## 差で比べると合わない問題を必ず入れる
 *
 * 子どもは既定で差で比べる。「12人8まい」と「9人6まい」はどちらも差が3なので、
 * 差で比べる子はここで「同じ」と答える。
 * この食い違いがないと、加法的な考え方のまま最後まで通せてしまうので、
 * 1問目は差が同じになる形、2問目は差では逆になる形に固定してある。
 *
 * ## どちらの量も 12 以下にする
 *
 * 「1 にそろえる量」は2通りとも選べる必要がある（それがこの単元の要）。
 * ということは**どちらの量も数直線に目もりを引ける大きさ**でなければならない。
 * 単価（4本で320円）のような組は、円のほうを 1 にそろえる操作が図にできないので使わない。
 * かわりに、両方の量が小さいままで意味が通る場面（混み具合・こさ・速さ）を選んでいる。
 *
 * ジュースのこさは、比の考え方の研究で古くから使われてきた場面でもある。
 */

export const RATE_PROBLEM_COUNT = 4;

export const RATE_STORAGE_KEY = "wakaru-dekita:per-unit:v1";

/** 差で比べたときに、どう食い違ってほしいか。 */
type AdditiveTrap = "equal" | "opposite" | "any";

type Context = {
  stage: string;
  question: string;
  moreWord: string;
  quantityA: { name: string; unit: string };
  quantityB: { name: string; unit: string };
  labels: [string, string];
  answerIsLarger: boolean;
  rangeA: [number, number];
  rangeB: [number, number];
  additive: AdditiveTrap;
};

const CONTEXTS: Context[] = [
  {
    stage: "混み具合・差で比べると同じになる",
    question: "どちらが こんでいる？",
    moreWord: "こんでいる",
    quantityA: { name: "子ども", unit: "人" },
    quantityB: { name: "たたみ", unit: "まい" },
    labels: ["あかい へや", "あおい へや"],
    answerIsLarger: true,
    rangeA: [4, 12],
    rangeB: [2, 10],
    additive: "equal",
  },
  {
    stage: "混み具合・差で比べると逆になる",
    question: "どちらが こんでいる？",
    moreWord: "こんでいる",
    quantityA: { name: "子ども", unit: "人" },
    quantityB: { name: "シート", unit: "まい" },
    labels: ["1組", "2組"],
    answerIsLarger: true,
    rangeA: [4, 12],
    rangeB: [2, 10],
    additive: "opposite",
  },
  {
    stage: "こさ・小さいほうが答えになる",
    question: "どちらが うすい？",
    moreWord: "うすい",
    quantityA: { name: "げんえき", unit: "はい" },
    quantityB: { name: "水", unit: "はい" },
    labels: ["ポットA", "ポットB"],
    answerIsLarger: false,
    rangeA: [2, 9],
    rangeB: [3, 12],
    additive: "any",
  },
  {
    stage: "速さ",
    question: "どちらが 速い？",
    moreWord: "速い",
    quantityA: { name: "道のり", unit: "m" },
    quantityB: { name: "時間", unit: "秒" },
    labels: ["あかい ミニカー", "あおい ミニカー"],
    answerIsLarger: true,
    rangeA: [4, 12],
    rangeB: [2, 10],
    additive: "any",
  },
];

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/**
 * 1つ分にそろえた値が、どちらの選び方でも見分けられるだけ離れているか。
 * 丸めて同じ数に見えてしまうと、くらべる手が運になる。
 */
function distinguishable(plan: RatePlan): boolean {
  return (
    Math.abs(perUnit(plan, "left", "b") - perUnit(plan, "right", "b")) >= 0.15 &&
    Math.abs(perUnit(plan, "left", "a") - perUnit(plan, "right", "a")) >= 0.06
  );
}

function trapHolds(plan: RatePlan, trap: AdditiveTrap): boolean {
  const additive = additiveSide(plan);
  if (trap === "equal") return additive === null;
  if (trap === "opposite") return additive !== null && additive !== correctSide(plan, "b");
  return true;
}

const MAX_TRIES = 4000;

function draw(context: Context, index: number): RatePlan {
  for (let i = 0; i < MAX_TRIES; i++) {
    const left: Situation = {
      label: context.labels[0],
      a: randInt(...context.rangeA),
      b: randInt(...context.rangeB),
    };
    const right: Situation = {
      label: context.labels[1],
      a: randInt(...context.rangeA),
      b: randInt(...context.rangeB),
    };
    // 片方の量がそろっていると、そろえる操作をせずに見比べるだけで分かってしまう
    if (left.b === right.b || left.a === right.a) continue;

    const plan: RatePlan = {
      id: `rate-${index}`,
      question: context.question,
      moreWord: context.moreWord,
      quantityA: context.quantityA,
      quantityB: context.quantityB,
      left,
      right,
      answerIsLarger: context.answerIsLarger,
      stage: context.stage,
    };

    if (!distinguishable(plan)) continue;
    // どちらの選び方でも答えの側が同じでなければ、問題として壊れている
    if (correctSide(plan, "a") !== correctSide(plan, "b")) continue;
    if (!trapHolds(plan, context.additive)) continue;

    return plan;
  }
  throw new Error(`条件に合う問題が作れませんでした: ${context.stage}`);
}

export function generateRateProblems(): RatePlan[] {
  return CONTEXTS.map((context, index) => draw(context, index));
}
