import { onDial, SNAP_MINUTES, type ClockPlan } from "./plan";

/**
 * 時こく・時間の出題。
 *
 * ## 4問の並び
 *
 * 1. またがない（時が変わらない）      … 動かし方に慣れる
 * 2. またぐ（60をこえる）              **← この単元の本体**
 * 3. もどす（またがない）              … 向きを取りちがえていないか
 * 4. もどしてまたぐ（60を下にこえる）  … いちばん難しい形
 *
 * またぐ問題だけを並べない。またがない問題を混ぜておかないと、
 * 「いつも時が1つ増える」で当てられてしまう。
 */

export const CLOCK_PROBLEM_COUNT = 4;

export const CLOCK_STORAGE_KEY = "wakaru-dekita:time:v1";

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/** 5分きざみの分。 */
const randMinute = (min: number, max: number) =>
  randInt(min / SNAP_MINUTES, max / SNAP_MINUTES) * SNAP_MINUTES;

type Spec = {
  /** すすめる（+1）か もどす（-1）か */
  sign: 1 | -1;
  /** 60 をまたぐか */
  cross: boolean;
  stage: string;
};

const SPECS: Spec[] = [
  { sign: 1, cross: false, stage: "またがずに すすめる" },
  { sign: 1, cross: true, stage: "またいで すすめる" },
  { sign: -1, cross: false, stage: "またがずに もどす" },
  { sign: -1, cross: true, stage: "またいで もどす" },
];

function build(spec: Spec, index: number): ClockPlan {
  const hour = randInt(1, 11);
  let startMinute: number;
  let amount: number;

  if (spec.sign === 1) {
    if (spec.cross) {
      // 60 をこえる。出発の分＋動かす分 > 60 になるように取る
      startMinute = randMinute(35, 55);
      amount = randMinute(Math.max(SNAP_MINUTES, 65 - startMinute), 50);
    } else {
      startMinute = randMinute(0, 30);
      amount = randMinute(SNAP_MINUTES, 55 - startMinute);
    }
  } else {
    if (spec.cross) {
      // 0 を下にこえる
      startMinute = randMinute(5, 25);
      amount = randMinute(startMinute + SNAP_MINUTES, 50);
    } else {
      startMinute = randMinute(30, 55);
      amount = randMinute(SNAP_MINUTES, startMinute);
    }
  }

  const start = hour * 60 + startMinute;
  const delta = spec.sign * amount;

  return {
    id: `clock-${index}`,
    start,
    delta,
    end: onDial(start + delta),
    question:
      delta >= 0
        ? `${hour}時${startMinute}分の ${delta}分後は 何時何分？`
        : `${hour}時${startMinute}分の ${-delta}分前は 何時何分？`,
    stage: spec.stage,
  };
}

export function generateClockPlans(): ClockPlan[] {
  return SPECS.map((spec, i) => build(spec, i));
}
