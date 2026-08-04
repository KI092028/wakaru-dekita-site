export type Fraction = { numerator: number; denominator: number };

/** 問題に登場する値。整数か分数。 */
export type Value = number | Fraction;

export type Operator = "+" | "−" | "×";

/**
 * 出題は「a op b = ?」の形にそろえている。
 *
 * 表示用の文字列ではなく値のまま持つのは、誤答の型を判定する（diagnose.ts）ときに
 * 演算子と両辺が必要になるため。選択肢は持たない（入力式にしたため）。
 */
export type Question = {
  id: string;
  a: Value;
  op: Operator;
  b: Value;
  answer: Value;
};

export type UnitSlug = "add-sub" | "times-table" | "fractions";

export type QuizUnit = {
  slug: string;
  title: string;
  gradeLabel: string;
  description: string;
  available: boolean;
};
