/**
 * 10のなかま（10の合成・分解、1年）。
 *
 * ## なぜ独立した単元にするか
 *
 * さくらんぼ計算（`lib/sakura/`）でいちばん止まるのが
 * 「8 は あと いくつで 10」の手。ここが出れば くり上がりは通るし、
 * 「10 から 8 を ひくと」も同じ知識で解ける。
 *
 * **9つしかない。** 1と9、2と8、3と7、4と6、5と5、6と4、7と3、8と2、9と1。
 * 九九の81マスに対してこれだけなので、**全部おぼえきれる**のが強み。
 * 終わりが見えることは、苦手な子にはそれ自体が大きい。
 *
 * ## 2つの向きを両方やる
 *
 * - 合成：「7 と いくつで 10？」（たし算のくり上がりで使う）
 * - 分解：「10 は 7 と いくつ？」（ひき算のくり下がりで使う）
 *
 * 数としては同じだが、**出てくる場面がちがう**ので両方出す。
 */

export type TensDirection =
  /** 7 と いくつで 10？ */
  | "compose"
  /** 10 は 7 と いくつ？ */
  | "decompose";

export type TensQuestion = {
  id: string;
  /** 見せる数（1〜9） */
  given: number;
  /** 答え（10 − given） */
  answer: number;
  direction: TensDirection;
};

/** 10 のなかまは 1〜9 の 9 とおり。 */
export const PARTNERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const TOTAL_PAIRS = PARTNERS.length;

export const partnerOf = (given: number): number => 10 - given;

export function promptOf(question: TensQuestion): string {
  return question.direction === "compose"
    ? `${question.given} と いくつで 10？`
    : `10 は ${question.given} と いくつ？`;
}

/**
 * 間違えたときの言葉。
 *
 * **足りない／多いを言う。** 「ちがうよ」だけでは、
 * どちらへ動かせばよいのか分からない。
 */
export function diagnoseTens(question: TensQuestion, typed: number): string | null {
  if (typed === question.answer) return null;

  const total = question.given + typed;
  if (total < 10) {
    return `${question.given} と ${typed} で ${total}。10 まで あと ${10 - total} たりないよ`;
  }
  if (total > 10) {
    return `${question.given} と ${typed} で ${total}。10 を ${total - 10} こえているよ`;
  }
  return `${question.given} と ${question.answer} で 10 だね`;
}
