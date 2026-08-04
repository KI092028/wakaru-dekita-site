import type { Question } from "./types";

/** 1〜2年生のたし算・ひき算。20までにおさめ、答えは負にしない。 */
export function generateAddSubQuestions(count: number): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    const isAddition = Math.random() < 0.5;

    if (isAddition) {
      const a = 1 + Math.floor(Math.random() * 15);
      const b = 1 + Math.floor(Math.random() * (20 - a));
      questions.push({ id: `add-sub-${i}`, a, op: "+", b, answer: a + b });
    } else {
      const a = 2 + Math.floor(Math.random() * 19);
      const b = 1 + Math.floor(Math.random() * a);
      questions.push({ id: `add-sub-${i}`, a, op: "−", b, answer: a - b });
    }
  }

  return questions;
}
