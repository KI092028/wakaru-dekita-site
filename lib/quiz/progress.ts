/**
 * 九九の81マスごとの習得状況。端末のlocalStorageにのみ保存する。
 * サーバーには一切送らないため、端末やブラウザを変えると引き継がれない。
 */

const STORAGE_KEY = "wakaru-dekita:times-table:v1";

/**
 * マスターと判定するのに必要な連続正解数。
 * 入力式にしてまぐれ当たりは減ったが、1回正解しただけでは定着したとは言えないので
 * 2回のままにしている（別のセットでもう一度出会って正解する必要がある）。
 */
export const MASTERY_STREAK = 2;

export const TABLE_SIZE = 9;
export const TOTAL_CELLS = TABLE_SIZE * TABLE_SIZE;

export type CellState = {
  /** 連続正解数 */
  streak: number;
  /** 一度マスターしたら外さない（罰にしないため） */
  mastered: boolean;
  /** 直近で間違えた。優先的に出題する */
  missed: boolean;
};

export type Progress = Record<string, CellState>;

export type CellStatus = "untouched" | "learning" | "mastered" | "weak";

export function cellKey(a: number, b: number): string {
  return `${a}x${b}`;
}

export function allCells(): [number, number][] {
  const cells: [number, number][] = [];
  for (let a = 1; a <= TABLE_SIZE; a++) {
    for (let b = 1; b <= TABLE_SIZE; b++) cells.push([a, b]);
  }
  return cells;
}

function isCellState(value: unknown): value is CellState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.streak === "number" && typeof v.mastered === "boolean" && typeof v.missed === "boolean";
}

/**
 * 保存済みの進捗を読む。
 * localStorage が使えない環境（プライベートモード等）や、
 * 保存内容が壊れている場合は空の進捗として扱い、例外を投げない。
 */
export function loadProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};

    const result: Progress = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (isCellState(value)) result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 保存できなくても学習そのものは続けられるので、握りつぶす
  }
}

export function clearProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 同上
  }
}

/** 解答を1件反映した新しい進捗を返す（元の値は変更しない）。 */
export function recordAnswer(progress: Progress, a: number, b: number, correct: boolean): Progress {
  const key = cellKey(a, b);
  const current: CellState = progress[key] ?? { streak: 0, mastered: false, missed: false };

  const next: CellState = correct
    ? {
        streak: current.streak + 1,
        mastered: current.mastered || current.streak + 1 >= MASTERY_STREAK,
        missed: false,
      }
    : {
        streak: 0,
        // 間違えてもマスターは取り消さない
        mastered: current.mastered,
        missed: true,
      };

  return { ...progress, [key]: next };
}

/**
 * 表示上の状態。
 * 一度マスターしたマスは、あとで間違えても「にがて」に落とさない。
 * マスター数が減って見えるのは罰になるため（出題では引き続き優先する → pickCells）。
 */
export function cellStatus(progress: Progress, a: number, b: number): CellStatus {
  const state = progress[cellKey(a, b)];
  if (!state) return "untouched";
  if (state.mastered) return "mastered";
  if (state.missed) return "weak";
  if (state.streak > 0) return "learning";
  return "untouched";
}

export function masteredCount(progress: Progress): number {
  return allCells().filter(([a, b]) => progress[cellKey(a, b)]?.mastered).length;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 次に出題するマスを選ぶ。優先順位は
 * にがて → あと1回でマスター → 未挑戦 → マスター済み。
 *
 * 「あと1回でマスター」を未挑戦より先に出すのが要点。
 * 未挑戦を先に消化すると、81マスを一巡するまでマスターが1つも増えず、
 * 何回やっても進んでいる実感が出ない。
 *
 * 同じ優先度の中はシャッフルするので、毎回同じ並びにはならない。
 */
export function pickCells(progress: Progress, count: number): [number, number][] {
  const buckets: [number, number][][] = [[], [], [], []];

  for (const [a, b] of allCells()) {
    const state = progress[cellKey(a, b)];
    const rank = !state
      ? 2
      : state.missed
        ? 0
        : state.mastered
          ? 3
          : state.streak > 0
            ? 1
            : 2;
    buckets[rank].push([a, b]);
  }

  const picked: [number, number][] = [];

  // にがては最優先で全部入れる
  picked.push(...shuffle(buckets[0]).slice(0, count));

  // 「あと1回でマスター」と「未挑戦」を交互に混ぜる。
  // 片方に寄せると、マスター数が増える回と増えない回が交互になり、
  // 進んでいる実感が途切れるため。
  const learning = shuffle(buckets[1]);
  const untouched = shuffle(buckets[2]);
  let li = 0;
  let ui = 0;
  while (picked.length < count && (li < learning.length || ui < untouched.length)) {
    if (li < learning.length) picked.push(learning[li++]);
    if (picked.length < count && ui < untouched.length) picked.push(untouched[ui++]);
  }

  // それでも足りなければマスター済みから復習として補う
  if (picked.length < count) {
    picked.push(...shuffle(buckets[3]).slice(0, count - picked.length));
  }

  return picked;
}
