import { normalizeDeg, type AnglePlan, type Point } from "./plan";

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

export const ANGLE_PROBLEM_COUNT = 6;

export const ANGLE_STORAGE_KEY = "wakaru-dekita:angle:v1";

/**
 * 角のいただきの位置と、図の外わく。
 *
 * **分度器がどちらを向いても図の中に収まる**ようにとってある。
 * 左の 0 を使う問題では半円が下を向く場面があり、
 * 上向きだけを想定した大きさだと、そこで分度器が画面の外に出てつかめなくなる。
 */
const VERTEX: Point = { x: 200, y: 230 };
const RAY_LENGTH = 165;

export type AngleProblem = AnglePlan & {
  id: string;
  /** 何を練習する問題か（画面には出さず、設計意図の記録） */
  stage: string;
};

type Stage = {
  name: string;
  /** 角の大きさの範囲（5の倍数で引く） */
  angle: [number, number];
  /**
   * 水平に置く辺をどちらにするか。
   *
   * - right: 右向きの辺にへりを重ねるのが自然な形。0 は**右はし**になる
   * - left : 左向きの辺にへりを重ねるのが自然な形。0 は**左はし**になる
   *
   * left の形を入れておかないと、右の 0 だけで最後まで通せてしまい、
   * **目もりが2しゅるいある理由に出会えない。**
   * さらに left では、水平な辺にそのままへりを重ねると半円が反対を向くので、
   * 「ひっくり返す」という気づきもここで起きる。
   */
  layout: "right" | "left";
  /** 水平からのかたむき */
  tilt: [number, number];
};

const STAGES: Stage[] = [
  { name: "鋭角・右に0・水平", angle: [25, 80], layout: "right", tilt: [0, 0] },
  { name: "鈍角・右に0・水平", angle: [100, 160], layout: "right", tilt: [0, 0] },
  { name: "鋭角・左に0・水平", angle: [30, 80], layout: "left", tilt: [0, 0] },
  { name: "鈍角・左に0・水平", angle: [100, 150], layout: "left", tilt: [0, 0] },
  { name: "直角に近い角・かたむき（右に0）", angle: [80, 100], layout: "right", tilt: [-20, 50] },
  { name: "鈍角・かたむき（左に0）", angle: [95, 145], layout: "left", tilt: [-15, 15] },
];

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
/** 5の倍数で引く。 */
const randStep5 = (min: number, max: number) => randInt(Math.ceil(min / 5), Math.floor(max / 5)) * 5;

/** 正しい向きから、この角度は離しておく。近すぎると最初から合っていることになる。 */
const START_GAP = 25;

/**
 * はじめの置かれ方。中心も向きもわざとずらす。
 * ずらし方が毎回同じだと、動かす向きを覚えてしまうため乱数で決める。
 *
 * **正しい向きは2つある**（右はしを合わせる／左はしを合わせる）ので、
 * その両方から離れた向きを引く。片方しか見ていないと、
 * たまたま最初から合っている問題が出てしまう。
 */
function startPose(valid: number[]) {
  let rotation = 0;
  do {
    rotation = randInt(-179, 180);
  } while (valid.some((deg) => Math.abs(normalizeDeg(rotation - deg)) < START_GAP));

  return { x: VERTEX.x + randInt(-70, 70), y: VERTEX.y - randInt(40, 90), rotation };
}

export function generateAngleProblems(): AngleProblem[] {
  return STAGES.map((stage, index) => {
    const drawn = randStep5(stage.angle[0], stage.angle[1]);
    // 直角ちょうどは「分度器を使わなくても分かる」ので避ける
    const value = drawn === 90 ? drawn + (Math.random() < 0.5 ? -5 : 5) : drawn;
    const tilt = stage.tilt[0] === stage.tilt[1] ? stage.tilt[0] : randStep5(...stage.tilt);
    // left では、水平にしたい辺が otherDeg のほうになる（→ Stage.layout）
    const baseDeg = stage.layout === "right" ? tilt : 180 + tilt - value;

    return {
      id: `angle-${index}`,
      vertex: VERTEX,
      baseDeg,
      angle: value,
      rayLength: RAY_LENGTH,
      start: startPose([baseDeg, baseDeg + value + 180]),
      stage: stage.name,
    };
  });
}

/** 図の外わく。いただき(200,230) を中心に半径130の円がすっぽり入る大きさ。 */
export const VIEW_BOX = { width: 400, height: 380 };

/** 分度器の中心を動かせる範囲。ここから出すと、つかめない場所に置けてしまう。 */
const MARGIN = 60;

export function clampPose(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.min(Math.max(x, MARGIN), VIEW_BOX.width - MARGIN),
    y: Math.min(Math.max(y, MARGIN), VIEW_BOX.height - MARGIN),
  };
}
