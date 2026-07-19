import { buildChoices } from "./choices";
import type { Question } from "./types";

/** Multiplication table problems (1-9 x 1-9) for grade 2-3. */
export function generateTimesTableQuestions(count: number): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * 9);
    const answer = a * b;

    questions.push({
      id: `times-table-${i}`,
      prompt: `${a} × ${b} = ?`,
      answer,
      choices: buildChoices(answer, 1, 81),
    });
  }

  return questions;
}
