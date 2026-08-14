import { PROTRACTOR_RADIUS, type AnglePlan, type Point } from "./plan";

/**
 * 角の大きさ（分度器）の出題。
 *
 * 1セット**5問**。1問は3手（当てる・合わせる・読む）と短いので、ひっ算より多くとれる。
 *
 * 角の大きさは**5の倍数に限る。** 4年では1度きざみまで読むが、
 * 画面では半径130pxに180本の目もりが並ぶため、1度の差は指では読み分けられない。
 * ここで測るのは「当て方」と「どちらの目もりを見るか」なので、
 * 読みの細かさを問うのは紙にゆずる（→ curriculum-map.md 5.1）。
 */

export const ANGLE_PROBLEM_COUNT = 5;

export const ANGLE_STORAGE_KEY = "wakaru-dekita:angle:v1";

/** 図の中心。辺がはみ出さないように、下寄りに置く。 */
const VERTEX: Point = { x: 200, y: 250 };
const RAY_LENGTH = 168;

export type AngleProblem = AnglePlan & {
  id: string;
  /** 何を練習する問題か（画面には出さず、設計意図の記録） */
  stage: string;
};

type Stage = {
  name: string;
  /** 角の大きさの範囲（5の倍数で引く） */
  angle: [number, number];
  /** 辺のかたむきの範囲。0 は水平・右向き */
  base: [number, number];
};

const STAGES: Stage[] = [
  { name: "鋭角・辺が水平", angle: [25, 80], base: [0, 0] },
  { name: "鈍角・辺が水平", angle: [100, 160], base: [0, 0] },
  { name: "鋭角・かたむいている", angle: [30, 80], base: [-20, 55] },
  { name: "鈍角・かたむいている", angle: [95, 145], base: [-20, 40] },
  { name: "直角に近い角", angle: [80, 100], base: [-15, 50] },
];

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
/** 5の倍数で引く。 */
const randStep5 = (min: number, max: number) => randInt(Math.ceil(min / 5), Math.floor(max / 5)) * 5;

/**
 * はじめの置かれ方。中心も向きもわざとずらす。
 * ずらし方が毎回同じだと、動かす向きを覚えてしまうため乱数で決める。
 */
function startPose(baseDeg: number) {
  return {
    x: VERTEX.x + randInt(-70, 70),
    y: VERTEX.y - randInt(40, 90),
    // 正しい向きから 30〜120 度ずらす
    rotation: baseDeg + (Math.random() < 0.5 ? -1 : 1) * randInt(30, 120),
  };
}

export function generateAngleProblems(): AngleProblem[] {
  return STAGES.map((stage, index) => {
    const angle = randStep5(stage.angle[0], stage.angle[1]);
    // 直角ちょうどは「分度器を使わなくても分かる」ので避ける
    const value = angle === 90 ? angle + (Math.random() < 0.5 ? -5 : 5) : angle;
    const baseDeg = stage.base[0] === stage.base[1] ? stage.base[0] : randStep5(...stage.base);

    return {
      id: `angle-${index}`,
      vertex: VERTEX,
      baseDeg,
      angle: value,
      rayLength: RAY_LENGTH,
      start: startPose(baseDeg),
      stage: stage.name,
    };
  });
}

/** 図の外わく。分度器を動かせる範囲もこれに合わせる。 */
export const VIEW_BOX = { width: 400, height: 340 };

/** 分度器の中心を、図の外に出しすぎないようにする。 */
export function clampPose(x: number, y: number): { x: number; y: number } {
  const margin = PROTRACTOR_RADIUS * 0.35;
  return {
    x: Math.min(Math.max(x, margin), VIEW_BOX.width - margin),
    y: Math.min(Math.max(y, margin), VIEW_BOX.height - margin),
  };
}
