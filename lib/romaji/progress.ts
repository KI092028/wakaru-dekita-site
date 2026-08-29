import { TOTAL_KANA, romajiTable } from "./table";

/**
 * どの字を書けたかの記録。**九九の81マスと同じ作りにそろえる。**
 *
 * ## 3つの段階を持つ
 *
 * 「おぼえた（2回つづけて書けた）」だけを色づけにすると、
 * 10問ぜんぶ正解しても表が 0/46 のまま変わらない。
 * 正解したのに何も起きない画面は、続ける気をいちばん削ぐ。
 * **1回書けた字も「やりかけ」として色を変える。**
 *
 * ## おぼえたら、下がらない
 *
 * 一度おぼえた字は、あとでまちがえても「おぼえた」のままにする（九九と同じ）。
 * 表が減っていくのを見せても、次にやることが分かるわけではない。
 *
 * 端末の localStorage にだけ置く。サーバーには送らない。
 * 一覧は lib/storage/keys.ts にまとめてある。
 */

export const ROMAJI_STORAGE_KEY = "wakaru-dekita:romaji:v1";

/** 続けてこの回数書けたら「おぼえた」 */
const MASTERY_STREAK = 2;

export type KanaState = { streak: number; mastered: boolean };
export type RomajiProgress = Record<string, KanaState>;

export type KanaStatus = "untouched" | "learning" | "mastered";

const isState = (value: unknown): value is KanaState => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.streak === "number" && typeof v.mastered === "boolean";
};

export function loadRomajiProgress(): RomajiProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ROMAJI_STORAGE_KEY);
    if (raw === null) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: RomajiProgress = {};
    for (const [kana, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (isState(value)) out[kana] = value;
    }
    return out;
  } catch {
    // 壊れていても、記録が無いのと同じ扱いにする。ここで投げると画面が出ない
    return {};
  }
}

export function saveRomajiProgress(progress: RomajiProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ROMAJI_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // いっぱいで書けないことがある。書けなくても続けられるようにする
  }
}

export function statusOf(progress: RomajiProgress, kana: string): KanaStatus {
  const state = progress[kana];
  if (state === undefined) return "untouched";
  if (state.mastered) return "mastered";
  return state.streak > 0 ? "learning" : "untouched";
}

export const isMastered = (progress: RomajiProgress, kana: string): boolean =>
  progress[kana]?.mastered === true;

export const masteredCount = (progress: RomajiProgress): number =>
  romajiTable.filter((x) => isMastered(progress, x.kana)).length;

/** 「1回書けた」だけの字の数。表の中くらいの色。 */
export const learningCount = (progress: RomajiProgress): number =>
  romajiTable.filter((x) => statusOf(progress, x.kana) === "learning").length;

/** 正解なら1つ進める。まちがえたら続けた回数だけ0に戻す（おぼえた印は消さない）。 */
export function record(progress: RomajiProgress, kana: string, correct: boolean): RomajiProgress {
  const current = progress[kana] ?? { streak: 0, mastered: false };
  const next: KanaState = correct
    ? {
        streak: Math.min(current.streak + 1, MASTERY_STREAK),
        mastered: current.mastered || current.streak + 1 >= MASTERY_STREAK,
      }
    : { streak: 0, mastered: current.mastered };
  return { ...progress, [kana]: next };
}

export { TOTAL_KANA };
