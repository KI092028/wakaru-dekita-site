export type Fraction = { numerator: number; denominator: number };

/** 問題に登場する値。整数か分数。 */
export type Value = number | Fraction;

/**
 * 問題文の左辺。値と演算子を並べたもの。
 * 例: [7, "+", 5] / [{numerator:1,denominator:2}, "+", {numerator:1,denominator:3}]
 * 末尾の「= ?」は表示側で共通に付けるため含めない。
 */
export type Term = Value | string;

export type Question = {
  id: string;
  terms: Term[];
  choices: Value[];
  answer: Value;
};

export type QuizUnit = {
  slug: string;
  title: string;
  gradeLabel: string;
  description: string;
  available: boolean;
};
