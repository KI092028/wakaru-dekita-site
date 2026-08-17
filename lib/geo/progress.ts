/**
 * 都道府県ごとの おぼえた／まだ の記録。
 *
 * 九九マップ（lib/quiz/progress.ts）と同じ考え方。
 * **連続2回せいかいで「おぼえた」**にし、一度おぼえたら取り消さない。
 * 減っていく記録は罰として働くため。
 *
 * ちがうのは、地図そのものが記録の表示になっていること。
 * おぼえた県から色がついていくので、白いところが残りの県になる。
 *
 * 端末のlocalStorageにのみ保存し、サーバーには送らない。
 */

import { PREFECTURES, type Region } from "./prefectures";

export const GEO_STORAGE_KEY = "wakaru-dekita:prefectures:v1";

export const MASTERY_STREAK = 2;

export type CellState = {
  /** 連続せいかい数 */
  streak: number;
  mastered: boolean;
  /** 一度でも間違えたか。出題を寄せるのに使う */
  missed: boolean;
};

/** 都道府県コード → 状態 */
export type GeoProgress = Record<string, CellState>;

export type GeoStatus = "untouched" | "learning" | "mastered" | "weak";

function isCellState(value: unknown): value is CellState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.streak === "number" &&
    typeof v.mastered === "boolean" &&
    typeof v.missed === "boolean"
  );
}

/** 保存内容が壊れていても例外を投げず、記録なしとして扱う。 */
export function loadGeoProgress(): GeoProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(GEO_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: GeoProgress = {};
    for (const [code, cell] of Object.entries(parsed as Record<string, unknown>)) {
      if (isCellState(cell)) out[code] = cell;
    }
    return out;
  } catch {
    return {};
  }
}

/** 記録を消して、はじめからやり直せるようにする。 */
export function clearGeoProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GEO_STORAGE_KEY);
  } catch {
    // 消せなくても練習は続けられるので握りつぶす
  }
}

export function saveGeoProgress(progress: GeoProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 保存できなくても練習は続けられるので握りつぶす
  }
}

export function recordGeoAnswer(
  progress: GeoProgress,
  code: number,
  correct: boolean
): GeoProgress {
  const key = String(code);
  const current: CellState = progress[key] ?? { streak: 0, mastered: false, missed: false };
  return {
    ...progress,
    [key]: correct
      ? {
          streak: current.streak + 1,
          mastered: current.mastered || current.streak + 1 >= MASTERY_STREAK,
          missed: current.missed,
        }
      : { streak: 0, mastered: current.mastered, missed: true },
  };
}

export function geoStatus(progress: GeoProgress, code: number): GeoStatus {
  const cell = progress[String(code)];
  if (!cell) return "untouched";
  if (cell.mastered) return "mastered";
  if (cell.missed && cell.streak === 0) return "weak";
  if (cell.streak > 0) return "learning";
  return "untouched";
}

const inScope = (region: Region | null) =>
  PREFECTURES.filter((p) => region === null || p.region === region);

export function masteredCount(progress: GeoProgress, region: Region | null = null): number {
  return inScope(region).filter((p) => progress[String(p.code)]?.mastered).length;
}

/** あと1回せいかいすれば「おぼえた」になる県の数（→ quiz/progress.ts と同じ理由）。 */
export function nearMasteryCount(progress: GeoProgress, region: Region | null = null): number {
  return inScope(region).filter((p) => {
    const cell = progress[String(p.code)];
    return cell !== undefined && !cell.mastered && cell.streak >= MASTERY_STREAK - 1;
  }).length;
}

export const totalOf = (region: Region | null = null): number => inScope(region).length;
