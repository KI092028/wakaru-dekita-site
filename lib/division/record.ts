import type { DivisionLevel } from "./plan";
import { ADVICE_PRIORITY, NO_ERRORS, type StepErrors, type StepKind } from "./steps";

/**
 * わり算のひっ算の取り組み記録。端末のlocalStorageにのみ保存する。
 * サーバーには一切送らないため、端末やブラウザを変えると引き継がれない。
 *
 * 1回分の結果だけでは「たまたま間違えた」と区別がつかない。
 * 何回やっても同じ手で止まっているのかどうかが分かって、はじめて見立てになる。
 */

/** 1けたでわる／2けたでわるは別の単元なので、記録も分けて持つ。 */
const STORAGE_KEY: Record<DivisionLevel, string> = {
  "one-digit": "wakaru-dekita:long-division:v1",
  "two-digit": "wakaru-dekita:long-division-2:v1",
};

/** 直近このセット数ぶんだけ、どの手で止まったかを覚えておく。 */
const RECENT_LIMIT = 5;

/**
 * この回数を通っていない手については、率を出さない。
 * 1〜2回のつまずきで「ここが苦手」と決めつけないため。
 */
const MIN_ATTEMPTS = 6;

export type DivisionRecord = {
  /** 最後まで通したセット数 */
  sets: number;
  /** 1回で通せた問題の累計 */
  perfect: number;
  /** 取り組んだ問題の累計 */
  problems: number;
  /** 手ごとの、止まった回数の累計 */
  errors: StepErrors;
  /** 手ごとの、その手を通った回数の累計。率を出すのに要る */
  attempts: StepErrors;
  /** 直近のセットで止まった手（新しい順） */
  recent: StepKind[][];
};

export type SetResult = {
  errors: StepErrors;
  attempts: StepErrors;
  perfect: number;
  problems: number;
};

export const EMPTY_RECORD: DivisionRecord = {
  sets: 0,
  perfect: 0,
  problems: 0,
  errors: NO_ERRORS,
  attempts: NO_ERRORS,
  recent: [],
};

const STEP_KINDS = Object.keys(NO_ERRORS) as StepKind[];

function isStepErrors(value: unknown): value is StepErrors {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return STEP_KINDS.every((kind) => typeof v[kind] === "number");
}

/**
 * 保存済みの記録を読む。
 * localStorage が使えない環境や、保存内容が壊れている場合は
 * 記録なしとして扱い、例外を投げない。
 */
export function loadRecord(level: DivisionLevel): DivisionRecord {
  if (typeof window === "undefined") return EMPTY_RECORD;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY[level]);
    if (!raw) return EMPTY_RECORD;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_RECORD;

    const v = parsed as Record<string, unknown>;
    if (!isStepErrors(v.errors) || !isStepErrors(v.attempts)) return EMPTY_RECORD;

    const recent = Array.isArray(v.recent)
      ? v.recent
          .filter((entry): entry is unknown[] => Array.isArray(entry))
          .map((entry) => entry.filter((k): k is StepKind => STEP_KINDS.includes(k as StepKind)))
          .slice(0, RECENT_LIMIT)
      : [];

    return {
      sets: typeof v.sets === "number" ? v.sets : 0,
      perfect: typeof v.perfect === "number" ? v.perfect : 0,
      problems: typeof v.problems === "number" ? v.problems : 0,
      errors: v.errors,
      attempts: v.attempts,
      recent,
    };
  } catch {
    return EMPTY_RECORD;
  }
}

export function saveRecord(level: DivisionLevel, record: DivisionRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY[level], JSON.stringify(record));
  } catch {
    // 保存できなくても練習そのものは続けられるので、握りつぶす
  }
}

function add(a: StepErrors, b: StepErrors): StepErrors {
  const out = { ...a };
  STEP_KINDS.forEach((kind) => {
    out[kind] = a[kind] + b[kind];
  });
  return out;
}

/** 1セット分の結果を足した、新しい記録を返す（元の値は変更しない）。 */
export function addSet(record: DivisionRecord, result: SetResult): DivisionRecord {
  const stumbled = STEP_KINDS.filter((kind) => result.errors[kind] > 0);

  return {
    sets: record.sets + 1,
    perfect: record.perfect + result.perfect,
    problems: record.problems + result.problems,
    errors: add(record.errors, result.errors),
    attempts: add(record.attempts, result.attempts),
    recent: [stumbled, ...record.recent].slice(0, RECENT_LIMIT),
  };
}

export type Weakness = {
  kind: StepKind;
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
 */
export function weakness(record: DivisionRecord): Weakness | null {
  const candidates = STEP_KINDS.filter(
    (kind) => record.attempts[kind] >= MIN_ATTEMPTS && record.errors[kind] > 0
  );
  if (candidates.length === 0) return null;

  const rateOf = (kind: StepKind) => record.errors[kind] / record.attempts[kind];
  const worst = candidates.sort(
    (a, b) => rateOf(b) - rateOf(a) || ADVICE_PRIORITY.indexOf(a) - ADVICE_PRIORITY.indexOf(b)
  )[0];

  return {
    kind: worst,
    rate: rateOf(worst),
    sets: record.recent.filter((set) => set.includes(worst)).length,
    ofSets: record.recent.length,
  };
}
