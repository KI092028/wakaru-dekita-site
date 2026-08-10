/**
 * 学級レク（教員向け）のデータ構造。
 *
 * 隙間時間に「その場で1つ選ぶ」ための情報だけを持つ。
 * 遊びの網羅が目的ではないので、条件を満たさないものは載せない
 * （→ docs/class-rec-spec.md 2.3）。
 */

/** 声の大きさ。隣のクラスが授業中かどうかで選べるようにするための軸。 */
export type Volume = "silent" | "normal" | "lively";

/** 隊形。教室のどこまで動くか。 */
export type Formation = "seated" | "stand" | "move";

export const VOLUME_LABEL: Record<Volume, string> = {
  silent: "静か",
  normal: "ふつう",
  lively: "にぎやか",
};

export const FORMATION_LABEL: Record<Formation, string> = {
  seated: "席のまま",
  stand: "立つ",
  move: "教室内を動く",
};

export type RecActivity = {
  slug: string;
  name: string;
  /** 一覧に出す1行。何をする遊びかが分かること */
  summary: string;
  /** 説明込みの所要時間の目安（分）。上限を書く */
  minutes: 2 | 3 | 5;
  volume: Volume;
  formation: Formation;
  /** 準備物。なければ空配列 */
  materials: string[];
  /** 学年の目安。[下限, 上限] */
  grades: [number, number];
  /** どんな遊びか。2〜3文 */
  description: string;
  /** 手順。1文1手順、5手順以内 */
  steps: string[];
  /** 現場での勘どころ */
  tips: string[];
  /** つまずきやすい点・やめどき */
  cautions: string[];
  /** 慣れてきたときの変化形 */
  variations?: string[];
  /** 算数と地続きなレクにだけ付ける。該当ドリルへのリンクになる */
  relatedUnit?: string;
};

export function materialsLabel(activity: RecActivity): string {
  return activity.materials.length === 0 ? "準備なし" : activity.materials.join("・");
}

export function gradesLabel(activity: RecActivity): string {
  const [from, to] = activity.grades;
  return from === to ? `${from}年` : `${from}〜${to}年`;
}
