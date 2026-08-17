/**
 * 原稿用紙にマスをうめる。
 *
 * 1枚は **縦15マス × 横20マス = 300字**。
 *
 * - 横書き：1行20マスが15行。左から右へ、上から下へ
 * - 縦書き：1行15マスが20行。上から下へ、右から左へ
 *
 * どちらも同じ 15×20 のマス目で、**流し込む向きだけが変わる。**
 *
 * ## 禁則処理（行頭にきてはいけない字）
 *
 * 「、」「。」「）」などが行のいちばん上に来ないように、
 * **前の行の最後のマスに一緒に入れる（ぶら下げ）。**
 * 原稿用紙を手で書くときと同じやり方で、これをやらないと
 * 縦書きで句読点が行頭に落ちて読みにくくなる。
 */

export type Orientation = "vertical" | "horizontal";

/** 書きかけの保存先。一覧は lib/storage/keys.ts にまとめてある。 */
export const MANUSCRIPT_STORAGE_KEY = "wakaru-dekita:manuscript:v1";

/** 1行のマス数。横書きなら20、縦書きなら15。 */
export const COLUMNS = 20;
export const ROWS = 15;
export const CHARS_PER_SHEET = COLUMNS * ROWS;

/** 行頭にきてはいけない字。前のマスにぶら下げる。 */
const NO_LINE_START = "、。，．）］｝」』】〉》〕”’ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶーぐー！？!?：；・";

/** 行末にきてはいけない字。次の行に送る。 */
const NO_LINE_END = "（［｛「『【〈《〔“‘";

export type Cell = {
  /** そのマスの字。空なら null */
  char: string | null;
  /** ぶら下げで2字入っているとき、2字目 */
  hung: string | null;
};

export type Sheet = {
  /** [行][マス]。行の長さは lineLength */
  lines: Cell[][];
};

export type Layout = {
  sheets: Sheet[];
  /** 1行のマス数 */
  lineLength: number;
  /** 1枚の行数 */
  lineCount: number;
};

const emptyCell = (): Cell => ({ char: null, hung: null });

/**
 * 文字列をマスに流し込む。
 *
 * 改行は段落の区切りとして、その行を終わらせる。
 * 段落の1字下げは書き手にまかせる（半角・全角スペースがそのまま1マスになる）。
 */
export function layoutText(text: string, orientation: Orientation): Layout {
  const lineLength = orientation === "horizontal" ? COLUMNS : ROWS;
  const lineCount = orientation === "horizontal" ? ROWS : COLUMNS;

  const lines: Cell[][] = [];
  let line: Cell[] = [];

  const pushLine = () => {
    while (line.length < lineLength) line.push(emptyCell());
    lines.push(line);
    line = [];
  };

  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (ch === "\n") {
      pushLine();
      continue;
    }
    // 改行そのものは字にしない。CR は捨てる
    if (ch === "\r") continue;

    if (line.length >= lineLength) {
      // 行頭にきてはいけない字は、前の行の最後のマスにぶら下げる
      if (NO_LINE_START.includes(ch) && line.length > 0) {
        const last = line[line.length - 1];
        if (last.hung === null) {
          last.hung = ch;
          continue;
        }
      }
      pushLine();
    }

    // 行末にきてはいけない字（開きカッコ）は、次の行へ送る
    if (NO_LINE_END.includes(ch) && line.length === lineLength - 1) {
      pushLine();
    }

    line.push({ char: ch, hung: null });
  }
  if (line.length > 0) pushLine();

  // 1枚ぶんずつに切り分ける。空でも1枚は出す
  const sheets: Sheet[] = [];
  for (let i = 0; i < Math.max(lines.length, 1); i += lineCount) {
    const chunk = lines.slice(i, i + lineCount);
    while (chunk.length < lineCount) chunk.push(Array.from({ length: lineLength }, emptyCell));
    sheets.push({ lines: chunk });
  }

  return { sheets, lineLength, lineCount };
}

export type Counts = {
  /** 改行をのぞいた字数 */
  chars: number;
  /** 空白もぬいた字数 */
  withoutSpaces: number;
  /** 段落の数 */
  paragraphs: number;
  /** 原稿用紙の枚数 */
  sheets: number;
  /** 最後の1枚で、何マスまで進んだか */
  usedOnLastSheet: number;
};

export function count(text: string, layout: Layout): Counts {
  const chars = [...text].filter((c) => c !== "\n" && c !== "\r").length;
  const withoutSpaces = [...text].filter((c) => !/[\s　]/.test(c)).length;
  const paragraphs = text.trim() === "" ? 0 : text.split("\n").filter((l) => l.trim() !== "").length;

  const used = layout.sheets[layout.sheets.length - 1].lines.reduce(
    (sum, line) => sum + line.filter((cell) => cell.char !== null).length,
    0
  );

  return {
    chars,
    withoutSpaces,
    paragraphs,
    sheets: layout.sheets.length,
    usedOnLastSheet: used,
  };
}
