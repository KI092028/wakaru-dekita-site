import { buildChoices } from "./choices";
import type { Question } from "./types";

/** Addition/subtraction problems for grade 1-2, kept within 1-20 with no negative results. */
export function generateAddSubQuestions(count: number): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    const isAddition = Math.random() < 0.5;
    let a: number;
    let b: number;
    let answer: number;

    if (isAddition) {
      a = 1 + Math.floor(Math.random() * 15);
      b = 1 + Math.floor(Math.random() * (20 - a));
      answer = a + b;
    } else {
      a = 2 + Math.floor(Math.random() * 19);
      b = 1 + Math.floor(Math.random() * a);
      answer = a - b;
    }

    questions.push({
      id: `add-sub-${i}`,
      terms: [a, isAddition ? "+" : "−", b],
      answer,
      choices: buildChoices(answer, 0, 20),
    });
  }

  return questions;
}
