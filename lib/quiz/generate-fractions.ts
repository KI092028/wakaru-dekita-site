import { addFractions, fraction, gcd, isProperFraction, subtractFractions } from "./fraction";
import type { Fraction, Question } from "./types";

/**
 * 分数のたし算・ひき算（4〜5年生）。
 *
 * 1セットの中で、同分母 → 片方が倍数 → 最小公倍数で通分 → 約分あり の順に
 * 難しくなるよう並べる。いきなり全滅させず、つまずきの本丸である通分・約分まで
 * 到達させるための構成。
 *
 * 答えは既約分数で持つ。入力式では約分し終えた形だけを正解とし、
 * 約分前の形（2/4 など）は誤答として「もっとかんたんにできる」と返す（diagnose.ts）。
 */

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

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

  return { id, a, op: isAdd ? "+" : "−", b, answer };
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
