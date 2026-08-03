import {
  addFractions,
  fraction,
  gcd,
  isProperFraction,
  simplify,
  subtractFractions,
  valueKey,
} from "./fraction";
import type { Fraction, Question } from "./types";

/**
 * 分数のたし算・ひき算（4〜5年生）。
 *
 * 1セットの中で、同分母 → 片方が倍数 → 最小公倍数で通分 → 約分あり の順に
 * 難しくなるよう並べる。いきなり全滅させず、つまずきの本丸である通分・約分まで
 * 到達させるための構成。
 */

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 誤答の候補。子どもが実際にやりがちな間違いを混ぜることで、
 * 計算せずに消去法で解けないようにする。
 */
function distractorCandidates(a: Fraction, b: Fraction, isAdd: boolean, answer: Fraction): Fraction[] {
  const candidates: Fraction[] = [];

  // 分子どうし・分母どうしを計算してしまう誤り（1/2 + 1/3 = 2/5 とするタイプ）
  candidates.push(
    isAdd
      ? fraction(a.numerator + b.numerator, a.denominator + b.denominator)
      : fraction(a.numerator - b.numerator, a.denominator - b.denominator)
  );

  // 通分したのに分子を直し忘れる誤り
  const common = (a.denominator * b.denominator) / gcd(a.denominator, b.denominator);
  candidates.push(
    isAdd
      ? fraction(a.numerator + b.numerator, common)
      : fraction(a.numerator - b.numerator, common)
  );

  // 約分し忘れ（約分が必要な問題のときだけ意味を持つ）
  const unreduced = isAdd
    ? fraction(
        (a.numerator * common) / a.denominator + (b.numerator * common) / b.denominator,
        common
      )
    : fraction(
        (a.numerator * common) / a.denominator - (b.numerator * common) / b.denominator,
        common
      );
  candidates.push(unreduced);

  // 惜しい値
  candidates.push(fraction(answer.numerator + 1, answer.denominator));
  candidates.push(fraction(answer.numerator - 1, answer.denominator));
  candidates.push(fraction(answer.numerator, answer.denominator + 1));
  candidates.push(fraction(answer.numerator + 1, answer.denominator + 1));
  candidates.push(fraction(answer.numerator, answer.denominator + 2));

  return candidates;
}

function buildFractionChoices(a: Fraction, b: Fraction, isAdd: boolean, answer: Fraction): Fraction[] {
  const seen = new Set<string>([valueKey(answer)]);
  const choices: Fraction[] = [answer];

  const consider = (candidate: Fraction) => {
    if (choices.length >= 4) return;
    if (!Number.isInteger(candidate.numerator) || !Number.isInteger(candidate.denominator)) return;
    if (!isProperFraction(candidate)) return;
    const key = valueKey(candidate);
    if (seen.has(key)) return;
    seen.add(key);
    choices.push(simplify(candidate));
  };

  distractorCandidates(a, b, isAdd, answer).forEach(consider);

  // 足りなければ、答えと分母が近い真分数で埋める
  for (let d = answer.denominator; d <= answer.denominator + 6 && choices.length < 4; d++) {
    for (let n = 1; n < d && choices.length < 4; n++) {
      consider(fraction(n, d));
    }
  }

  return shuffle(choices);
}

/**
 * 問題に出す分数は既約にそろえる。
 * 3/6 − 1/6 のように問題側が約分できると、答えを約分する練習の前に
 * 問題を約分してしまい、何を問われているかがぼやけるため。
 */
function isReduced({ numerator, denominator }: Fraction): boolean {
  return gcd(numerator, denominator) === 1;
}

function makeQuestion(a: Fraction, b: Fraction, isAdd: boolean, id: string): Question | null {
  const answer = isAdd ? addFractions(a, b) : subtractFractions(a, b);
  if (!isProperFraction(answer)) return null;

  return {
    id,
    terms: [a, isAdd ? "+" : "−", b],
    choices: buildFractionChoices(a, b, isAdd, answer),
    answer,
  };
}

/** 同分母のたし算・ひき算。 */
function stageSameDenominator(): Fraction[] | null {
  const d = randInt(4, 10);
  const n1 = randInt(1, d - 2);
  const n2 = randInt(1, d - n1 - 1);
  return [fraction(n1, d), fraction(n2, d)];
}

/** 片方の分母がもう片方の倍数（通分の入口）。 */
function stageMultiple(): Fraction[] | null {
  const base = randInt(2, 5);
  const d2 = base * randInt(2, 3);
  if (d2 > 12) return null;
  return [fraction(randInt(1, base - 1) || 1, base), fraction(randInt(1, d2 - 1), d2)];
}

/** 分母が互いに素（最小公倍数で通分する必要がある）。 */
function stageCoprime(): Fraction[] | null {
  const d1 = randInt(2, 5);
  const d2 = randInt(2, 7);
  if (d1 === d2 || gcd(d1, d2) !== 1) return null;
  return [fraction(randInt(1, d1 - 1), d1), fraction(randInt(1, d2 - 1), d2)];
}

/** 答えが約分できる問題。 */
function stageNeedsReducing(): Fraction[] | null {
  const d = pick([4, 6, 8, 9, 10, 12]);
  const n1 = randInt(1, d - 2);
  const n2 = randInt(1, d - n1 - 1);
  if (gcd(n1 + n2, d) === 1) return null; // 約分できないならやり直し
  return [fraction(n1, d), fraction(n2, d)];
}

const STAGES = [
  { build: stageSameDenominator, count: 2, allowSubtraction: true },
  { build: stageMultiple, count: 3, allowSubtraction: true },
  { build: stageCoprime, count: 3, allowSubtraction: true },
  { build: stageNeedsReducing, count: 2, allowSubtraction: false },
] as const;

export function generateFractionsQuestions(count: number): Question[] {
  const questions: Question[] = [];

  // 指定された問題数に合わせて、各段階の配分を按分する
  const plan: (typeof STAGES)[number][] = [];
  STAGES.forEach((stage) => {
    const n = Math.max(1, Math.round((stage.count / 10) * count));
    for (let i = 0; i < n; i++) plan.push(stage);
  });
  while (plan.length > count) plan.pop();
  while (plan.length < count) plan.push(STAGES[STAGES.length - 1]);

  plan.forEach((stage, index) => {
    for (let attempt = 0; attempt < 60; attempt++) {
      const pair = stage.build();
      if (!pair) continue;

      let [a, b] = pair;
      if (!isReduced(a) || !isReduced(b)) continue;

      const isAdd = !stage.allowSubtraction || Math.random() < 0.6;

      if (!isAdd) {
        // ひき算は答えが負にならないよう、大きい方を先にする
        const aValue = a.numerator / a.denominator;
        const bValue = b.numerator / b.denominator;
        if (aValue === bValue) continue;
        if (aValue < bValue) [a, b] = [b, a];
      }

      const question = makeQuestion(a, b, isAdd, `fractions-${index}`);
      if (question) {
        questions.push(question);
        return;
      }
    }

    // 万一どの組み合わせも作れなかった場合の保険
    questions.push(makeQuestion(fraction(1, 2), fraction(1, 3), true, `fractions-${index}`)!);
  });

  return questions;
}
