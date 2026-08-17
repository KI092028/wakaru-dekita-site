import type { PercentKind, PercentPlan } from "./plan";

/**
 * 割合の出題。
 *
 * ## 場面の選び方
 *
 * 数直線に描けることが先。1つの線に「もとにする量」と「くらべる量」の
 * 両方が乗り、かつ**もとにする量が線の右はしに来ない**ようにする。
 * 右はしに固定されると、100% を置く手が「いちばん右」で当たってしまい、
 * もとにする量を読み取る練習にならない。
 *
 * ## 4問の並び
 *
 * 1. 割合を求める（100% より内がわ）
 * 2. くらべる量を求める
 * 3. ふえる（100% より外がわ）  ← 全国学力調査で正答率 41.3% だった形
 * 4. へる（100% より内がわだが、引いた残り）
 *
 * ふえる・へるを両方入れるのは、「100%より右か左か」を
 * 一方だけで覚えさせないため。
 */

export const PERCENT_PROBLEM_COUNT = 4;

export const PERCENT_STORAGE_KEY = "wakaru-dekita:percent:v1";

/**
 * 量の目もりは、**もとにする量を10等分した幅**にする。
 *
 * こうすると目もり1つがちょうど 10% になり、量の目もりと割合の目もりが
 * 同じ場所で重なる。重ならないと、しるしが吸いつく先に答えがなくて
 * 「合わせたいのに合わせられない」ことが起きる（最初にこれで作って失敗した）。
 *
 * そのため、もとにする量は 10 の倍数だけを使う。
 */
const tickStepFor = (baseValue: number): number => baseValue / 10;

type Scene = {
  unit: string;
  baseLabel: string;
  otherLabel: string;
  /** もとにする量の候補。10 の倍数にすること */
  baseValues: number[];
  /** その場面の言い回し */
  story: (base: number, other: string) => string;
  question: (base: number, percent: number | null) => string;
};

/** 割合を求める場面。くらべる量が分かっている */
const RATE_SCENES: Scene[] = [
  {
    unit: "人",
    baseLabel: "5年生ぜんいん",
    otherLabel: "犬をかっている人",
    baseValues: [40, 50, 60],
    story: (base) => `5年生は ぜんぶで ${base}人。`,
    question: () => "犬をかっている人は、5年生ぜんいんの 何%？",
  },
  {
    unit: "cm",
    baseLabel: "白いテープ",
    otherLabel: "赤いテープ",
    baseValues: [40, 50, 80],
    story: (base) => `白いテープは ${base}cm。`,
    question: () => "赤いテープは、白いテープの 何%？",
  },
];

/** くらべる量を求める場面。割合が分かっている */
const AMOUNT_SCENES: Scene[] = [
  {
    unit: "円",
    baseLabel: "ていか",
    otherLabel: "はらう お金",
    baseValues: [400, 500, 800],
    story: (base) => `ていかが ${base}円の 本。`,
    question: (_b, p) => `ていかの ${p}% を はらうと、いくら？`,
  },
  {
    unit: "mL",
    baseLabel: "はじめの ジュース",
    otherLabel: "コップに 入れた ぶん",
    baseValues: [400, 500, 600],
    story: (base) => `ジュースが ${base}mL ある。`,
    question: (_b, p) => `その ${p}% を コップに 入れると、何mL？`,
  },
];

/** ふえる場面 */
const INCREASE_SCENES: Scene[] = [
  {
    unit: "mL",
    baseLabel: "もとの パック",
    otherLabel: "ふえた パック",
    baseValues: [500, 600, 800],
    story: (base) => `いつもの ジュースは ${base}mL。`,
    question: (_b, p) => `「${p}% ぞうりょう」と 書いてある パックは 何mL？`,
  },
];

/** へる場面 */
const DECREASE_SCENES: Scene[] = [
  {
    unit: "円",
    baseLabel: "ていか",
    otherLabel: "セールの ねだん",
    baseValues: [400, 500, 800],
    story: (base) => `ていかが ${base}円の ふでばこ。`,
    question: (_b, p) => `「${p}% びき」の ねだんは いくら？`,
  },
];

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

/**
 * 線の右はし。もとにする量より必ず大きくして、
 * **もとにする量が右はしに来ないようにする。**
 */
function axisMaxFor(base: number, target: number, step: number): number {
  const needed = Math.max(base, (base * target) / 100);
  // 目もり1つぶんは必ず余らせる
  return Math.ceil((needed + step) / step) * step;
}

function build(kind: PercentKind, scene: Scene, index: number): PercentPlan {
  const baseValue = pick(scene.baseValues);
  const tickStep = tickStepFor(baseValue);

  if (kind === "rate") {
    // 答えが 10% きざみに乗る割合だけを使う
    const percent = pick([20, 30, 40, 60, 70, 80]);
    const otherValue = (baseValue * percent) / 100;
    return {
      id: `percent-${index}`,
      kind,
      question: scene.question(baseValue, null),
      story: `${scene.story(baseValue, scene.otherLabel)}${scene.otherLabel}は ${otherValue}${scene.unit}。`,
      unit: scene.unit,
      baseLabel: scene.baseLabel,
      baseValue,
      otherLabel: scene.otherLabel,
      otherValue,
      givenPercent: null,
      targetPercent: percent,
      answer: percent,
      answerUnit: "%",
      tickStep,
      axisMax: axisMaxFor(baseValue, 100, tickStep),
      stage: "割合を求める",
    };
  }

  if (kind === "amount") {
    const percent = pick([20, 30, 40, 60, 70, 80]);
    const answer = (baseValue * percent) / 100;
    return {
      id: `percent-${index}`,
      kind,
      question: scene.question(baseValue, percent),
      story: scene.story(baseValue, scene.otherLabel),
      unit: scene.unit,
      baseLabel: scene.baseLabel,
      baseValue,
      otherLabel: scene.otherLabel,
      otherValue: null,
      givenPercent: percent,
      targetPercent: percent,
      answer,
      answerUnit: scene.unit,
      tickStep,
      axisMax: axisMaxFor(baseValue, 100, tickStep),
      stage: "くらべる量を求める",
    };
  }

  // ふえる／へる
  const up = scene === INCREASE_SCENES[0];
  const percent = pick([10, 20, 30]);
  const target = up ? 100 + percent : 100 - percent;
  const answer = (baseValue * target) / 100;

  return {
    id: `percent-${index}`,
    kind: "increase",
    question: scene.question(baseValue, percent),
    story: scene.story(baseValue, scene.otherLabel),
    unit: scene.unit,
    baseLabel: scene.baseLabel,
    baseValue,
    otherLabel: scene.otherLabel,
    otherValue: null,
    givenPercent: percent,
    targetPercent: target,
    answer,
    answerUnit: scene.unit,
    tickStep,
    axisMax: axisMaxFor(baseValue, target, tickStep),
    stage: up ? "ふえる（100%より外）" : "へる",
  };
}

/** 1セット4問。並びは固定で、やさしい形から。 */
export function generatePercentPlans(): PercentPlan[] {
  return [
    build("rate", pick(RATE_SCENES), 0),
    build("amount", pick(AMOUNT_SCENES), 1),
    build("increase", INCREASE_SCENES[0], 2),
    build("increase", DECREASE_SCENES[0], 3),
  ];
}
