import {
  digitAt,
  digitCount,
  keepExpForSignificant,
  placeName,
  rounded,
  type RoundKind,
  type RoundPlan,
} from "./plan";

/**
 * がい数の出題。
 *
 * ## 4問の並び
 *
 * 1. 「◯の位までの」で切り捨て
 * 2. 「◯の位までの」で切り上げ
 * 3. 「上から◯けたの」で切り捨て
 * 4. 「上から◯けたの」で切り上げ ← けたが1つ増える場合もここで出る
 *
 * **切り上げと切り捨てを必ず両方入れる。** 片方だけだと
 * 「いつも上げる」で当たってしまう。
 *
 * ## 見る位が 5 ちょうどになる問題を混ぜる
 *
 * 「5は上げる」は約束ごとで、数の大小からは出てこない。
 * ここだけは覚えるしかないので、出題に必ず入れておく。
 */

export const ROUND_PROBLEM_COUNT = 4;

export const ROUND_STORAGE_KEY = "wakaru-dekita:rounding:v1";

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/**
 * 条件に合う数ができるまで作り直す。
 *
 * 位を直接組み立てるより読みやすく、けた数も一定に保てる。
 * 条件は「けた数」「見る位の数字が5以上か」の2つだけなので、数回で当たる。
 */
function pickValue(
  digits: number,
  keepExp: number,
  lookExp: number,
  up: boolean,
  exactFive: boolean
): number {
  for (let i = 0; i < 300; i++) {
    const min = 10 ** (digits - 1);
    const value = randInt(min, 10 ** digits - 1);
    const d = digitAt(value, lookExp);
    if (up !== d >= 5) continue;
    if (exactFive && d !== 5) continue;
    // のこす位より下がすべて0だと、がい数にしても数が変わらない。
    // 「四捨五入したのに同じ」は、何をしたのか分からない問題になるので外す
    if (value % 10 ** keepExp === 0) continue;
    return value;
  }
  // まず起きないが、条件を満たす形を返しておく
  return 10 ** (digits - 1) + (up ? 5 : 1) * 10 ** lookExp;
}

type Spec = { kind: RoundKind; up: boolean; exactFive: boolean; stage: string };

const SPECS: Spec[] = [
  { kind: "place", up: false, exactFive: false, stage: "位を指定・切り捨て" },
  { kind: "place", up: true, exactFive: true, stage: "位を指定・切り上げ（ちょうど5）" },
  { kind: "significant", up: false, exactFive: false, stage: "上からのけた・切り捨て" },
  { kind: "significant", up: true, exactFive: false, stage: "上からのけた・切り上げ" },
];

function build(spec: Spec, index: number): RoundPlan {
  const digits = randInt(4, 5);

  // 残す位を決める。「一の位まで」は四捨五入にならないので keepExp は 1 以上
  const keepExp =
    spec.kind === "place"
      ? randInt(1, digits - 2)
      : keepExpForSignificant(10 ** (digits - 1), randInt(2, digits - 2));

  const lookExp = keepExp - 1;
  const value = pickValue(digits, keepExp, lookExp, spec.up, spec.exactFive);

  const question =
    spec.kind === "place"
      ? `${value} を ${placeName(keepExp)}までの がい数に しよう`
      : `${value} を 上から ${digitCount(value) - keepExp}けたの がい数に しよう`;

  return {
    id: `round-${index}`,
    kind: spec.kind,
    value,
    keepExp,
    lookExp,
    roundUp: digitAt(value, lookExp) >= 5,
    answer: rounded(value, keepExp),
    question,
    stage: spec.stage,
  };
}

export function generateRoundPlans(): RoundPlan[] {
  return SPECS.map((spec, i) => build(spec, i));
}
