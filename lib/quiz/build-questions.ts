import { generateAddSubQuestions } from "./generate-add-sub";
import { generateFractionsQuestions } from "./generate-fractions";
import { generateTimesTableQuestions } from "./generate-times-table";
import type { Progress } from "./progress";
import type { Question, UnitSlug } from "./types";

/** 1セットの問題数。3単元で共通。 */
export const QUESTION_COUNT = 10;

/**
 * 単元スラッグから問題を組み立てる。
 *
 * サーバーコンポーネントは関数をクライアントコンポーネントに渡せないため、
 * ページからは文字列だけを渡し、解決はここで行う。
 * 九九だけが習得状況を使うが、呼び出し側を単純にするため引数はそろえている。
 */
export function buildQuestions(unit: UnitSlug, count: number, progress: Progress): Question[] {
  switch (unit) {
    case "times-table":
      return generateTimesTableQuestions(count, progress);
    case "fractions":
      return generateFractionsQuestions(count);
    case "add-sub":
      return generateAddSubQuestions(count);
  }
}

/** 81マスの習得状況を保存・表示する単元か。 */
export function usesProgress(unit: UnitSlug): boolean {
  return unit === "times-table";
}
