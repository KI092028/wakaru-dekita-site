import type { DivisionLevel } from "./plan";
import { ADVICE_PRIORITY, NO_ERRORS, type StepErrors, type StepKind } from "./steps";
import {
  addSet as addSetGeneric,
  emptyRecord,
  loadRecord as loadGeneric,
  saveRecord as saveGeneric,
  weakness as weaknessGeneric,
  type PracticeRecord,
  type SetResult as GenericSetResult,
  type Weakness as GenericWeakness,
} from "@/lib/practice/record";

/**
 * わり算のひっ算の取り組み記録。
 *
 * 中身は `lib/practice/record.ts` の共通実装で、ここは手の種類（StepKind）を
 * 固定するための薄い層。列のひっ算など、他の手順型の単元も同じ実装を使う。
 */

/** 1けたでわる／2けたでわるは別の単元なので、記録も分けて持つ。 */
export const DIVISION_STORAGE_KEY: Record<DivisionLevel, string> = {
  "one-digit": "wakaru-dekita:long-division:v1",
  "two-digit": "wakaru-dekita:long-division-2:v1",
};

const STEP_KINDS = Object.keys(NO_ERRORS) as StepKind[];

export type DivisionRecord = PracticeRecord & {
  errors: StepErrors;
  attempts: StepErrors;
};

export type SetResult = GenericSetResult & {
  errors: StepErrors;
  attempts: StepErrors;
};

export type Weakness = GenericWeakness & { kind: StepKind };

export const EMPTY_RECORD = emptyRecord(STEP_KINDS) as DivisionRecord;

export function loadRecord(level: DivisionLevel): DivisionRecord {
  return loadGeneric(DIVISION_STORAGE_KEY[level], STEP_KINDS) as DivisionRecord;
}

export function saveRecord(level: DivisionLevel, record: DivisionRecord): void {
  saveGeneric(DIVISION_STORAGE_KEY[level], record);
}

export function addSet(record: DivisionRecord, result: SetResult): DivisionRecord {
  return addSetGeneric(record, result, STEP_KINDS) as DivisionRecord;
}

export function weakness(record: DivisionRecord): Weakness | null {
  return weaknessGeneric(record, STEP_KINDS, ADVICE_PRIORITY) as Weakness | null;
}
