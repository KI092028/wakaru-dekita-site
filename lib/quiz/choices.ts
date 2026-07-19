function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Builds 4 shuffled choices containing the answer plus distractors near it. */
export function buildChoices(answer: number, min: number, max: number): number[] {
  const choices = new Set<number>([answer]);
  let guard = 0;
  while (choices.size < 4 && guard < 100) {
    guard++;
    const spread = 1 + Math.floor(Math.random() * 5);
    const candidate = answer + (Math.random() < 0.5 ? -spread : spread);
    if (candidate >= min && candidate <= max) {
      choices.add(candidate);
    }
  }
  // Fallback: fill from the valid range if distractors ran out (small ranges).
  let filler = min;
  while (choices.size < 4 && filler <= max) {
    choices.add(filler);
    filler++;
  }
  return shuffle([...choices]);
}
