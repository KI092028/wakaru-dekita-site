/**
 * 角の大きさ（分度器）の幾何。
 *
 * ひっ算の単元（B型）と違い、ここで練習するのは**道具の当て方**そのもの。
 * 紙の上では教師が横について直すしかない場面なので、
 * 分度器を実際に動かせること自体が中心になる。
 *
 * 座標は SVG のもの（yは下向き）だが、角度は**数学と同じ向き**で扱う。
 * 0度が右、正の向きが画面上で反時計回り。そのため点を求めるとき y を引く。
 */

export type Point = { x: number; y: number };

/** 分度器の置かれ方。中心の位置と、まっすぐなへりの向き（度）。 */
export type Pose = { x: number; y: number; rotation: number };

export type AnglePlan = {
  vertex: Point;
  /** 0 を合わせる辺の向き（度） */
  baseDeg: number;
  /** 測る角の大きさ（度） */
  angle: number;
  /** 辺の長さ */
  rayLength: number;
  /** 分度器のはじめの置かれ方。わざとずらしてある */
  start: Pose;
};

export const PROTRACTOR_RADIUS = 130;

/** 中心を合わせたと認める距離。指で動かすので、紙より広くとる。 */
export const PLACE_TOLERANCE = 16;

/** へりを合わせたと認める角度のずれ。 */
export const ALIGN_TOLERANCE = 4;

/** −180 < d <= 180 に直す。 */
export function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** 頂点から向き deg・長さ len の先の点。 */
export function pointAt(from: Point, deg: number, len: number): Point {
  return { x: from.x + len * Math.cos(toRad(deg)), y: from.y - len * Math.sin(toRad(deg)) };
}

/** もう一方の辺の向き。 */
export function otherDeg(plan: AnglePlan): number {
  return plan.baseDeg + plan.angle;
}

export function rayEnd(plan: AnglePlan, which: "base" | "other"): Point {
  return pointAt(plan.vertex, which === "base" ? plan.baseDeg : otherDeg(plan), plan.rayLength);
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** 中心が頂点に合っているか。 */
export function isPlaced(plan: AnglePlan, pose: Pose): boolean {
  return distance(pose, plan.vertex) <= PLACE_TOLERANCE;
}

/**
 * まっすぐなへりを、どちらの辺に合わせたか。
 *
 * **合わせ方は2通りとも正しい。** 右はしを一方の辺に合わせても、
 * 左はしを合わせてもよく、そのとき 0 から数える目もりが入れかわるだけ。
 * これが内側・外側の目もりが2つある理由そのものなので、両方を認める。
 */
export function alignedSide(plan: AnglePlan, pose: Pose): "base" | "other" | null {
  if (Math.abs(normalizeDeg(pose.rotation - plan.baseDeg)) <= ALIGN_TOLERANCE) return "base";
  if (Math.abs(normalizeDeg(pose.rotation - (otherDeg(plan) + 180))) <= ALIGN_TOLERANCE) {
    return "other";
  }
  return null;
}

/** その合わせ方のとき、0 は分度器のどちらのはしにあるか。 */
export function zeroEnd(side: "base" | "other"): "right" | "left" {
  return side === "base" ? "right" : "left";
}

/** いちばん近い正しい向き。回しすぎ／足りないを言うのに使う。 */
export function nearestAlignment(plan: AnglePlan, pose: Pose): number {
  const candidates = [plan.baseDeg, otherDeg(plan) + 180];
  return candidates.reduce((best, deg) =>
    Math.abs(normalizeDeg(pose.rotation - deg)) < Math.abs(normalizeDeg(pose.rotation - best))
      ? deg
      : best
  );
}
