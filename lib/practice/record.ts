/**
 * 「どの手でつまずいたか」の記録。手順を1手ずつ進める単元で共通に使う。
 *
 * 端末のlocalStorageにのみ保存し、サーバーには一切送らない。
 * 端末やブラウザを変えると引き継がれない。
 *
 * 1回分の結果だけでは「たまたま間違えた」と区別がつかない。
 * 何回やっても同じ手で止まっているのかどうかが分かって、はじめて見立てになる。
 *
 * 手の種類（StepKind）は単元ごとに違うので、ここでは文字列として扱い、
 * 呼び出し側が自分の手の一覧と優先順を渡す。
 */

/** 直近このセット数ぶんだけ、どの手で止まったかを覚えておく。 */
const RECENT_LIMIT = 5;

/**
 * この回数を通っていない手については、率を出さない。
 * 1〜2回のつまずきで「ここが苦手」と決めつけないため。
 */
const MIN_ATTEMPTS = 6;

export type Tally = Record<string, number>;

export type PracticeRecord = {
  /** 最後まで通したセット数 */
  sets: number;
  /** 1回で通せた問題の累計 */
  perfect: number;
  /** 取り組んだ問題の累計 */
  problems: number;
  /** 手ごとの、止まった回数の累計 */
  errors: Tally;
  /** 手ごとの、その手を通った回数の累計。率を出すのに要る */
  attempts: Tally;
  /** 直近のセットで止まった手（新しい順） */
  recent: string[][];
};

export type SetResult = {
  errors: Tally;
  attempts: Tally;
  perfect: number;
  problems: number;
};

export function emptyTally(kinds: readonly string[]): Tally {
  return Object.fromEntries(kinds.map((kind) => [kind, 0]));
}

export function emptyRecord(kinds: readonly string[]): PracticeRecord {
  return {
    sets: 0,
    perfect: 0,
    problems: 0,
    errors: emptyTally(kinds),
    attempts: emptyTally(kinds),
    recent: [],
  };
}

function readTally(value: unknown, kinds: readonly string[]): Tally | null {
  if (typeof value !== "object" || value === null) return null;
  const source = value as Record<string, unknown>;
  const out = emptyTally(kinds);
  for (const kind of kinds) {
    if (typeof source[kind] !== "number") return null;
    out[kind] = source[kind] as number;
  }
  return out;
}

/**
 * 保存済みの記録を読む。
 * localStorage が使えない環境や、保存内容が壊れている場合は
 * 記録なしとして扱い、例外を投げない。
 */
export function loadRecord(key: string, kinds: readonly string[]): PracticeRecord {
  if (typeof window === "undefined") return emptyRecord(kinds);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return emptyRecord(kinds);
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return emptyRecord(kinds);

    const v = parsed as Record<string, unknown>;
    const errors = readTally(v.errors, kinds);
    const attempts = readTally(v.attempts, kinds);
    if (!errors || !attempts) return emptyRecord(kinds);

    const recent = Array.isArray(v.recent)
      ? v.recent
          .filter((entry): entry is unknown[] => Array.isArray(entry))
          .map((entry) => entry.filter((k): k is string => kinds.includes(k as string)))
          .slice(0, RECENT_LIMIT)
      : [];

    return {
      sets: typeof v.sets === "number" ? v.sets : 0,
      perfect: typeof v.perfect === "number" ? v.perfect : 0,
      problems: typeof v.problems === "number" ? v.problems : 0,
      errors,
      attempts,
      recent,
    };
  } catch {
    return emptyRecord(kinds);
  }
}

export function saveRecord(key: string, record: PracticeRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // 保存できなくても練習そのものは続けられるので、握りつぶす
  }
}

function add(a: Tally, b: Tally, kinds: readonly string[]): Tally {
  const out = emptyTally(kinds);
  for (const kind of kinds) out[kind] = (a[kind] ?? 0) + (b[kind] ?? 0);
  return out;
}

/** 1セット分の結果を足した、新しい記録を返す（元の値は変更しない）。 */
export function addSet(
  record: PracticeRecord,
  result: SetResult,
  kinds: readonly string[]
): PracticeRecord {
  const stumbled = kinds.filter((kind) => (result.errors[kind] ?? 0) > 0);

  return {
    sets: record.sets + 1,
    perfect: record.perfect + result.perfect,
    problems: record.problems + result.problems,
    errors: add(record.errors, result.errors, kinds),
    attempts: add(record.attempts, result.attempts, kinds),
    recent: [stumbled, ...record.recent].slice(0, RECENT_LIMIT),
  };
}

export type Weakness = {
  kind: string;
  /** その手で止まった割合（0〜1） */
  rate: number;
  /** 直近のセットのうち、その手で止まった回数 */
  sets: number;
  /** 直近で数えたセット数 */
  ofSets: number;
};

/**
 * いちばん引っかかっている手。
 *
 * 回数ではなく割合で見る。「かける 3回」は、かけるを何回通ったかが分からないと
 * 多いのか少ないのか判断できないため。
 * 通った回数が少ない手は、まだ判断材料が足りないとみなして対象から外す。
 *
 * priority は同率のときの優先順。別の単元で練習し直せる手を先に見るとよい。
 */
export function weakness(
  record: PracticeRecord,
  kinds: readonly string[],
  priority: readonly string[]
): Weakness | null {
  const candidates = kinds.filter(
    (kind) => (record.attempts[kind] ?? 0) >= MIN_ATTEMPTS && (record.errors[kind] ?? 0) > 0
  );
  if (candidates.length === 0) return null;

  const rateOf = (kind: string) => record.errors[kind] / record.attempts[kind];
  const worst = candidates.sort(
    (a, b) => rateOf(b) - rateOf(a) || priority.indexOf(a) - priority.indexOf(b)
  )[0];

  return {
    kind: worst,
    rate: rateOf(worst),
    sets: record.recent.filter((set) => set.includes(worst)).length,
    ofSets: record.recent.length,
  };
}
