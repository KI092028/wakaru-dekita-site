/**
 * ローマ字（国語3年）。
 *
 * ## つまずきは「2通りある」こと
 *
 * 学校でならうのは**訓令式**（si・ti・tu・hu）。
 * ところが駅名の看板もパスポートもローマ字入力も**ヘボン式**（shi・chi・tsu・fu）で、
 * 子どもは毎日その両方を目にしている。
 *
 * 「し」を shi と書いて ✕ をもらうと、**どちらも正しいのに間違いだと思う。**
 * ここでは**両方を正解にして、そのうえで「学校では si をならう」と伝える。**
 * 消すべきなのは書き方の片方ではなく、混乱のほうなので。
 *
 * ## 表そのものを画面に置く
 *
 * 九九の81マスと同じ考え方で、46字の表を持ち、
 * できた字に色をつけていく。**終わりが見えること**に意味がある。
 */

export type RomajiEntry = {
  kana: string;
  /** 学校でならう書き方（訓令式）。表に出すのはこちら */
  main: string;
  /** ほかにも正しい書き方。ヘボン式など */
  alternates: string[];
  /** 行（表の並びに使う）。「あ」「か」… */
  row: string;
  /** 段（母音）。a i u e o */
  vowel: string;
};

const e = (
  kana: string,
  main: string,
  row: string,
  vowel: string,
  alternates: string[] = []
): RomajiEntry => ({ kana, main, alternates, row, vowel });

/**
 * 清音46字。濁音・半濁音・拗音・促音はまだ入れていない
 * （まず「子音＋母音」の形をつかむところまで）。
 */
export const romajiTable: RomajiEntry[] = [
  e("あ", "a", "あ", "a"), e("い", "i", "あ", "i"), e("う", "u", "あ", "u"),
  e("え", "e", "あ", "e"), e("お", "o", "あ", "o"),

  e("か", "ka", "か", "a"), e("き", "ki", "か", "i"), e("く", "ku", "か", "u"),
  e("け", "ke", "か", "e"), e("こ", "ko", "か", "o"),

  e("さ", "sa", "さ", "a"), e("し", "si", "さ", "i", ["shi"]), e("す", "su", "さ", "u"),
  e("せ", "se", "さ", "e"), e("そ", "so", "さ", "o"),

  e("た", "ta", "た", "a"), e("ち", "ti", "た", "i", ["chi"]), e("つ", "tu", "た", "u", ["tsu"]),
  e("て", "te", "た", "e"), e("と", "to", "た", "o"),

  e("な", "na", "な", "a"), e("に", "ni", "な", "i"), e("ぬ", "nu", "な", "u"),
  e("ね", "ne", "な", "e"), e("の", "no", "な", "o"),

  e("は", "ha", "は", "a"), e("ひ", "hi", "は", "i"), e("ふ", "hu", "は", "u", ["fu"]),
  e("へ", "he", "は", "e"), e("ほ", "ho", "は", "o"),

  e("ま", "ma", "ま", "a"), e("み", "mi", "ま", "i"), e("む", "mu", "ま", "u"),
  e("め", "me", "ま", "e"), e("も", "mo", "ま", "o"),

  e("や", "ya", "や", "a"), e("ゆ", "yu", "や", "u"), e("よ", "yo", "や", "o"),

  e("ら", "ra", "ら", "a"), e("り", "ri", "ら", "i"), e("る", "ru", "ら", "u"),
  e("れ", "re", "ら", "e"), e("ろ", "ro", "ら", "o"),

  // を は 訓令式では o、ローマ字入力では wo。どちらも受ける
  e("わ", "wa", "わ", "a"), e("を", "wo", "わ", "o", ["o"]),
  // ん は うつときに nn とも打つ
  e("ん", "n", "ん", "n", ["nn"]),
];

export const TOTAL_KANA = romajiTable.length;

/** 表の並び。行ごとに、a i u e o の順で並べる（無いところは空ける） */
export const ROMAJI_ROWS = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ", "ん"];
export const ROMAJI_VOWELS = ["a", "i", "u", "e", "o"];

export const entryOf = (kana: string): RomajiEntry | undefined =>
  romajiTable.find((x) => x.kana === kana);

/** その行・その段の字。無ければ null */
export function cellAt(row: string, vowel: string): RomajiEntry | null {
  return romajiTable.find((x) => x.row === row && x.vowel === vowel) ?? null;
}

/** 書き方が2通りある字。**ここがいちばん混乱するところ** */
export const hasAlternate = (entry: RomajiEntry): boolean => entry.alternates.length > 0;

/** 打ったものが正しいか。訓令式もヘボン式も正解にする。 */
export function isCorrect(entry: RomajiEntry, typed: string): boolean {
  const lower = typed.toLowerCase();
  return lower === entry.main || entry.alternates.includes(lower);
}

/** ローマ字で使う文字だけ。**母音と子音を分けて並べる** */
export const VOWEL_KEYS = ["a", "i", "u", "e", "o"];
export const CONSONANT_KEYS = ["k", "s", "t", "n", "h", "m", "y", "r", "w", "c", "f"];
