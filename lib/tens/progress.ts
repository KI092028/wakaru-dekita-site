/**
 * 10のなかまの、なかま9つぶんの習得状況。
 *
 * 九九マップ（`lib/quiz/progress.ts`）と同じ考え方で、
 * **連続2回せいかいで「おぼえた」**にし、一度おぼえたら取り消さない。
 *
 * ちがうのは数が9つしかないこと。**全部うまるところまで行ける**ので、
 * 九九のような「81マスの遠さ」がない。苦手な子にはこれが効く。
 */

import { PARTNERS, TOTAL_PAIRS, type TensQuestion } from "./plan";

export const TENS_STORAGE_KEY = "wakaru-dekita:tens:v1";

export const MASTERY_STREAK = 2;

export type CellState = { streak: number; mastered: boolean; missed: boolean };
export type TensProgress = Record<string, CellState>;
export type TensStatus = "untouched" | "learning" | "mastered" | "weak";

function isCellState(value: unknown): value is CellState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.streak === "number" && typeof v.mastered === "boolean" && typeof v.missed === "boolean"
  );
}

/** 保存内容が壊れていても例外を投げず、記録なしとして扱う。 */
export function loadTensProgress(): TensProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TENS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: TensProgress = {};
    for (const [key, cell] of Object.entries(parsed as Record<string, unknown>)) {
      if (isCellState(cell)) out[key] = cell;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveTensProgress(progress: TensProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TENS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 保存できなくても練習は続けられる
  }
}

/**
 * 見せた数そのものを記録の単位にする。1〜9 の 9つ。
 *
 * 7と3 と 3と7 を「同じ1組」とまとめることも考えたが、**やめた。**
 *
 * - 画面に出しているのは 9つのなかま。数え方だけ5組にすると食い違う
 * - 「7 と いくつ」と「3 と いくつ」は、思い出す向きがちがう。
 *   苦手な子には、どちらも別に出てくる必要がある
 */
export const pairKey = (given: number): string => String(given);

export function recordTensAnswer(
  progress: TensProgress,
  given: number,
  correct: boolean
): TensProgress {
  const key = pairKey(given);
  const current = progress[key] ?? { streak: 0, mastered: false, missed: false };
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

export function tensStatus(progress: TensProgress, given: number): TensStatus {
  const cell = progress[pairKey(given)];
  if (!cell) return "untouched";
  if (cell.mastered) return "mastered";
  if (cell.missed && cell.streak === 0) return "weak";
  if (cell.streak > 0) return "learning";
  return "untouched";
}

/** 記録の単位。1〜9 の 9つ。画面に出している数と同じ。 */
export const PAIR_KEYS = PARTNERS.map((n) => pairKey(n));

export const masteredPairs = (progress: TensProgress): number =>
  PAIR_KEYS.filter((key) => progress[key]?.mastered).length;

export const TOTAL_PAIR_KEYS = PAIR_KEYS.length;

/**
 * 次に出す数を選ぶ。にがて → あと1回 → まだ → おぼえた の順。
 * 九九と同じ理由（未挑戦を先に消化すると、進んでいる実感が出ない）。
 */
export function pickGiven(progress: TensProgress, count: number): number[] {
  const buckets: number[][] = [[], [], [], []];
  for (const n of PARTNERS) {
    const status = tensStatus(progress, n);
    const rank = status === "weak" ? 0 : status === "learning" ? 1 : status === "untouched" ? 2 : 3;
    buckets[rank].push(n);
  }

  const shuffle = (list: number[]) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const picked: number[] = [];
  for (const bucket of buckets) {
    for (const n of shuffle(bucket)) {
      if (picked.length >= count) break;
      picked.push(n);
    }
  }
  // 9つしかないので、10問出すには一巡してから足す
  while (picked.length < count) picked.push(...shuffle([...PARTNERS]).slice(0, count - picked.length));
  return picked.slice(0, count);
}

export { TOTAL_PAIRS };
