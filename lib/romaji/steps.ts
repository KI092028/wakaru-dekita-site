import { isCorrect, romajiTable, type RomajiEntry } from "./table";

/**
 * 打ったものが正しいか、まちがっていたら何と返すか。
 *
 * ## 「もう1つの書き方」で正解したときも、そう言う
 *
 * shi と打った子に「せいかい」だけを返すと、
 * 学校で si と書いたときに戸惑う。**どちらも正しいこと**と、
 * **学校でならうのはどちらか**を、その場で1行だけそえる。
 */

/**
 * ローマ字から かな を引く表。まちがえて別の字を書いたときに使う。
 * ヘボン式のほうも入れておく（shi と打って「し」を出せるように）。
 *
 * **学校でならう書き方（main）を先に立てる。**
 * 「o」は「お」の書き方であると同時に「を」の別の書き方でもあるので、
 * 後から入れると「o は『を』だね」と言ってしまう。
 * ここでは「お」と答える（「を」を出したいときは wo と打つ）。
 */
const KANA_BY_ROMAJI = new Map<string, string>();
for (const entry of romajiTable) {
  for (const alt of entry.alternates) KANA_BY_ROMAJI.set(alt, entry.kana);
}
for (const entry of romajiTable) KANA_BY_ROMAJI.set(entry.main, entry.kana);


export type RomajiJudge =
  | { kind: "correct" }
  /** もう1つの書き方で正解 */
  | { kind: "alternate"; note: string }
  | { kind: "wrong"; message: string };

export function judge(entry: RomajiEntry, typed: string): RomajiJudge {
  const lower = typed.toLowerCase();
  if (lower === entry.main) return { kind: "correct" };

  if (entry.alternates.includes(lower)) {
    return {
      kind: "alternate",
      note: `${lower} も 正しいよ。学校で ならうのは ${entry.main} のほう。どちらも 「${entry.kana}」`,
    };
  }

  return { kind: "wrong", message: diagnose(entry, lower) };
}

/**
 * まちがえたときの言葉。
 *
 * **どこがちがうのかを1つに絞って言う。** 「ちがいます」だけでは、
 * 次も同じところで止まる。
 */
function diagnose(entry: RomajiEntry, typed: string): string {
  const want = entry.main;

  if (typed === "") return `「${entry.kana}」は ${want} と 書くよ`;

  // 母音だけがちがう（子音は合っている）
  const consonant = want.slice(0, -1);
  if (consonant !== "" && typed.startsWith(consonant) && typed.length === want.length) {
    return `子音の ${consonant} は 合っているよ。「${entry.kana}」の 母音は ${want.slice(-1)}。${want} と 書く`;
  }

  // 子音だけがちがう（母音は合っている）
  if (typed.endsWith(want.slice(-1)) && typed.length === want.length && want.length > 1) {
    return `母音の ${want.slice(-1)} は 合っているよ。「${entry.kana}」の 子音は ${consonant}。${want} と 書く`;
  }

  // ほかの字を書いてしまった
  const mistaken = KANA_BY_ROMAJI.get(typed);
  if (mistaken !== undefined && mistaken !== entry.kana) {
    return `${typed} は 「${mistaken}」だね。「${entry.kana}」は ${want}`;
  }

  if (typed.length > want.length) {
    return `字が 多いよ。「${entry.kana}」は ${want} の ${want.length}字`;
  }
  if (typed.length < want.length) {
    return `字が 足りないよ。「${entry.kana}」は ${want} の ${want.length}字`;
  }

  return `「${entry.kana}」は ${want} と 書くよ`;
}

export { isCorrect };
