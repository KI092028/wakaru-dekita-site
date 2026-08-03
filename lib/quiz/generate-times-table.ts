import { buildChoices } from "./choices";
import type { Question } from "./types";

/** 指定した a × b の問題を1問作る。 */
export function buildTimesTableQuestion(a: number, b: number, id: string): Question {
  const answer = a * b;
  return {
    id,
    terms: [a, "×", b],
    answer,
    choices: buildChoices(answer, 1, 81),
  };
}

/** Multiplication table problems (1-9 x 1-9) for grade 2-3. */
export function generateTimesTableQuestions(count: number): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * 9);
    questions.push(buildTimesTableQuestion(a, b, `times-table-${i}`));
  }

  return questions;
}
