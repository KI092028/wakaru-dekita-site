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

/**
 * 単元の種類。**1問にかかる時間も、やることも違う**ので、開く前に分かるようにする。
 *
 * - drill: 1セット10問、1問10秒ほど。答えを打つ
 * - steps: ひっ算など。1問に10手前後かかり、どの手で止まったかを記録する
 * - figure: 図を動かして考える。答えを打つ場面がないこともある
 */
export type UnitKind = "drill" | "steps" | "figure" | "game" | "tool";

export const UNIT_KIND_LABEL: Record<UnitKind, string> = {
  drill: "ドリル",
  steps: "1手ずつ",
  figure: "図で考える",
  game: "ゲーム",
  tool: "道具",
};

/**
 * 教科。**単元マスタに持たせて、画面はそこから組み立てる。**
 * 教科を増やすときに直すのはこの表と units.ts だけで済むようにしておく。
 */
export type Subject = "math" | "social" | "japanese";

export const SUBJECT_LABEL: Record<Subject, string> = {
  math: "算数",
  social: "社会",
  japanese: "国語",
};

export type QuizUnit = {
  slug: string;
  title: string;
  subject: Subject;
  /** 並べ替えと見出しに使う学年。「1〜2年生」なら 1 */
  grade: number;
  gradeLabel: string;
  kind: UnitKind;
  description: string;
  available: boolean;
  /**
   * その単元の大きさ。「全47県」「9段・81マス」など。
   *
   * **開く前に、中身がどれくらいあるのかが分かるようにする。**
   * 説明文とは別に持たせているのは、説明が「何をするか」で、
   * これは「どれだけあるか」だから。片方だけでは、
   * 5分で終わるのか毎日使えるのかが分からない。
   */
  scale?: string;
};
