import { pickCells, type Progress } from "./progress";
import type { Question } from "./types";

/**
 * 九九（2〜3年生）。
 *
 * 出題は乱数ではなく、81マスの習得状況から選ぶ（pickCells）。
 * にがて → あと1回でマスター → 未挑戦 の順に優先することで、
 * 毎回どこかのマスが埋まるようにしている。
 */
export function generateTimesTableQuestions(count: number, progress: Progress): Question[] {
  return pickCells(progress, count).map(([a, b], i) => ({
    id: `times-table-${i}`,
    a,
    op: "×" as const,
    b,
    answer: a * b,
  }));
}
