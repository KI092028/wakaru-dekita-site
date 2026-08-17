import { partnerOf, type TensDirection, type TensQuestion } from "./plan";
import { pickGiven, type TensProgress } from "./progress";

/**
 * 10のなかまの出題。
 *
 * 1セット10問。**にがてな組から先に出す**（→ progress.ts）。
 *
 * 向きは問題ごとに変える。同じ組でも
 * 「7 と いくつで 10」（たし算で使う）と
 * 「10 は 7 と いくつ」（ひき算で使う）では出てくる場面がちがうため。
 */

export const TENS_QUESTION_COUNT = 10;

export function generateTensQuestions(progress: TensProgress): TensQuestion[] {
  return pickGiven(progress, TENS_QUESTION_COUNT).map((given, index) => {
    // 前半は合成、後半は分解。まぜるが、かたよらせない
    const direction: TensDirection = index % 2 === 0 ? "compose" : "decompose";
    return {
      id: `tens-${index}-${given}-${direction}`,
      given,
      answer: partnerOf(given),
      direction,
    };
  });
}
