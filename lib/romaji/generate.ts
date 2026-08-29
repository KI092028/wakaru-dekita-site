import { isMastered, type RomajiProgress } from "./progress";
import { hasAlternate, romajiTable, type RomajiEntry } from "./table";

/**
 * ローマ字の出題。1セット10問。
 *
 * ## まだ書けない字から出す
 *
 * 九九と同じ考え方。**おぼえた字ばかり出しても、表は埋まらない。**
 * まだ「おぼえた」になっていない字を先に、足りなければ全体から足す。
 *
 * ## 2通りある字を、1セットに必ず1つ入れる
 *
 * し・ち・つ・ふ・を・ん。ここでつまずくので、
 * 毎回どれかに当たるようにしておく。
 */

export const ROMAJI_QUESTION_COUNT = 10;

const shuffle = <T,>(items: T[]): T[] => [...items].sort(() => Math.random() - 0.5);

export function generateRomajiSet(progress: RomajiProgress): RomajiEntry[] {
  const notYet = shuffle(romajiTable.filter((x) => !isMastered(progress, x.kana)));
  const rest = shuffle(romajiTable.filter((x) => isMastered(progress, x.kana)));

  const picked = [...notYet, ...rest].slice(0, ROMAJI_QUESTION_COUNT);

  // 2通りある字が1つも入らなかったら、最後の1問を差しかえる
  if (!picked.some(hasAlternate)) {
    const tricky = shuffle(romajiTable.filter(hasAlternate));
    const candidate = tricky.find((x) => !picked.some((p) => p.kana === x.kana));
    if (candidate) picked[picked.length - 1] = candidate;
  }

  return shuffle(picked);
}
