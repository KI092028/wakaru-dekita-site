/**
 * 47都道府県のデータと、地図の模式図。
 *
 * ## 正確な地図ではなく、マス目の模式図にしている
 *
 * 県の形をそのまま使うと、スマホでは香川県や大阪府が指で押せない大きさになる。
 * ここで覚えたいのは県の形ではなく**どこにあるか（並びと地方）**なので、
 * 1県＝1マスの模式図にして、どのマスも同じ大きさで押せるようにした。
 *
 * マスの位置（col は西→東、row は北→南）は、実際の並びをなぞってある。
 * 隣どうしのマスは、だいたい実際にも隣。
 * **正確な地図ではないことは画面にも書く。**
 *
 * ## 方角のヒントはマスの差から出す
 *
 * 47県ぶんの「隣接する県の一覧」を手で書くと間違えるので持たない。
 * かわりに、押したマスと正解のマスの差から「もっと 北 のほうだよ」を作る。
 * 模式図の並びが実際をなぞっているので、これで用が足りる。
 */

export type Region =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "chubu"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushu";

export const REGION_LABEL: Record<Region, string> = {
  hokkaido: "北海道",
  tohoku: "東北",
  kanto: "関東",
  chubu: "中部",
  kinki: "近畿",
  chugoku: "中国",
  shikoku: "四国",
  kyushu: "九州・沖縄",
};

/** 北から順。地方をえらぶ画面もこの順に並べる。 */
export const REGIONS: Region[] = [
  "hokkaido",
  "tohoku",
  "kanto",
  "chubu",
  "kinki",
  "chugoku",
  "shikoku",
  "kyushu",
];

export type Prefecture = {
  /** 都道府県コード（総務省の番号）。記録のキーに使う */
  code: number;
  /** 「東京都」ではなく「東京」。画面では suffix を足して出す */
  name: string;
  /** 都・道・府・県 */
  suffix: "都" | "道" | "府" | "県";
  kana: string;
  region: Region;
  /** 模式図のマス。col は西→東、row は北→南 */
  col: number;
  row: number;
};

export const PREFECTURES: Prefecture[] = [
  { code: 1, name: "北海道", suffix: "道", kana: "ほっかいどう", region: "hokkaido", col: 9, row: 0 },

  { code: 2, name: "青森", suffix: "県", kana: "あおもり", region: "tohoku", col: 9, row: 1 },
  { code: 3, name: "岩手", suffix: "県", kana: "いわて", region: "tohoku", col: 9, row: 2 },
  { code: 5, name: "秋田", suffix: "県", kana: "あきた", region: "tohoku", col: 8, row: 2 },
  { code: 4, name: "宮城", suffix: "県", kana: "みやぎ", region: "tohoku", col: 9, row: 3 },
  { code: 6, name: "山形", suffix: "県", kana: "やまがた", region: "tohoku", col: 8, row: 3 },
  { code: 7, name: "福島", suffix: "県", kana: "ふくしま", region: "tohoku", col: 9, row: 4 },

  { code: 8, name: "茨城", suffix: "県", kana: "いばらき", region: "kanto", col: 10, row: 5 },
  { code: 9, name: "栃木", suffix: "県", kana: "とちぎ", region: "kanto", col: 9, row: 5 },
  { code: 10, name: "群馬", suffix: "県", kana: "ぐんま", region: "kanto", col: 8, row: 5 },
  { code: 11, name: "埼玉", suffix: "県", kana: "さいたま", region: "kanto", col: 9, row: 6 },
  { code: 12, name: "千葉", suffix: "県", kana: "ちば", region: "kanto", col: 10, row: 6 },
  { code: 13, name: "東京", suffix: "都", kana: "とうきょう", region: "kanto", col: 9, row: 7 },
  { code: 14, name: "神奈川", suffix: "県", kana: "かながわ", region: "kanto", col: 9, row: 8 },

  { code: 15, name: "新潟", suffix: "県", kana: "にいがた", region: "chubu", col: 8, row: 4 },
  { code: 16, name: "富山", suffix: "県", kana: "とやま", region: "chubu", col: 7, row: 5 },
  { code: 17, name: "石川", suffix: "県", kana: "いしかわ", region: "chubu", col: 6, row: 5 },
  { code: 18, name: "福井", suffix: "県", kana: "ふくい", region: "chubu", col: 6, row: 6 },
  { code: 20, name: "長野", suffix: "県", kana: "ながの", region: "chubu", col: 8, row: 6 },
  { code: 21, name: "岐阜", suffix: "県", kana: "ぎふ", region: "chubu", col: 7, row: 6 },
  { code: 19, name: "山梨", suffix: "県", kana: "やまなし", region: "chubu", col: 8, row: 7 },
  { code: 23, name: "愛知", suffix: "県", kana: "あいち", region: "chubu", col: 7, row: 7 },
  { code: 22, name: "静岡", suffix: "県", kana: "しずおか", region: "chubu", col: 8, row: 8 },

  { code: 26, name: "京都", suffix: "府", kana: "きょうと", region: "kinki", col: 5, row: 6 },
  { code: 25, name: "滋賀", suffix: "県", kana: "しが", region: "kinki", col: 6, row: 7 },
  { code: 28, name: "兵庫", suffix: "県", kana: "ひょうご", region: "kinki", col: 4, row: 6 },
  { code: 27, name: "大阪", suffix: "府", kana: "おおさか", region: "kinki", col: 5, row: 7 },
  { code: 29, name: "奈良", suffix: "県", kana: "なら", region: "kinki", col: 6, row: 8 },
  { code: 24, name: "三重", suffix: "県", kana: "みえ", region: "kinki", col: 7, row: 8 },
  { code: 30, name: "和歌山", suffix: "県", kana: "わかやま", region: "kinki", col: 5, row: 8 },

  { code: 32, name: "島根", suffix: "県", kana: "しまね", region: "chugoku", col: 2, row: 6 },
  { code: 31, name: "鳥取", suffix: "県", kana: "とっとり", region: "chugoku", col: 3, row: 6 },
  { code: 35, name: "山口", suffix: "県", kana: "やまぐち", region: "chugoku", col: 1, row: 7 },
  { code: 34, name: "広島", suffix: "県", kana: "ひろしま", region: "chugoku", col: 2, row: 7 },
  { code: 33, name: "岡山", suffix: "県", kana: "おかやま", region: "chugoku", col: 3, row: 7 },

  { code: 38, name: "愛媛", suffix: "県", kana: "えひめ", region: "shikoku", col: 2, row: 8 },
  { code: 37, name: "香川", suffix: "県", kana: "かがわ", region: "shikoku", col: 3, row: 8 },
  { code: 36, name: "徳島", suffix: "県", kana: "とくしま", region: "shikoku", col: 4, row: 8 },
  { code: 39, name: "高知", suffix: "県", kana: "こうち", region: "shikoku", col: 3, row: 9 },

  { code: 41, name: "佐賀", suffix: "県", kana: "さが", region: "kyushu", col: 0, row: 8 },
  { code: 40, name: "福岡", suffix: "県", kana: "ふくおか", region: "kyushu", col: 1, row: 8 },
  { code: 42, name: "長崎", suffix: "県", kana: "ながさき", region: "kyushu", col: 0, row: 9 },
  { code: 43, name: "熊本", suffix: "県", kana: "くまもと", region: "kyushu", col: 1, row: 9 },
  { code: 44, name: "大分", suffix: "県", kana: "おおいた", region: "kyushu", col: 2, row: 9 },
  { code: 46, name: "鹿児島", suffix: "県", kana: "かごしま", region: "kyushu", col: 1, row: 10 },
  { code: 45, name: "宮崎", suffix: "県", kana: "みやざき", region: "kyushu", col: 2, row: 10 },
  { code: 47, name: "沖縄", suffix: "県", kana: "おきなわ", region: "kyushu", col: 0, row: 11 },
];

export const prefectureByCode = (code: number): Prefecture =>
  PREFECTURES.find((p) => p.code === code)!;

/** 「東京都」「北海道」。北海道は name にすでに「道」が入っている */
export const fullName = (p: Prefecture): string =>
  p.name.endsWith(p.suffix) ? p.name : `${p.name}${p.suffix}`;

export const prefecturesOf = (region: Region): Prefecture[] =>
  PREFECTURES.filter((p) => p.region === region);

/** その範囲のマスがどこからどこまでか。地方だけを大きく描くのに使う。 */
export function bounds(list: Prefecture[]): { minCol: number; maxCol: number; minRow: number; maxRow: number } {
  return {
    minCol: Math.min(...list.map((p) => p.col)),
    maxCol: Math.max(...list.map((p) => p.col)),
    minRow: Math.min(...list.map((p) => p.row)),
    maxRow: Math.max(...list.map((p) => p.row)),
  };
}

type Direction = { dx: number; dy: number; label: string };

const DIRECTIONS: Direction[] = [
  { dx: 0, dy: -1, label: "北" },
  { dx: 1, dy: -1, label: "北東" },
  { dx: 1, dy: 0, label: "東" },
  { dx: 1, dy: 1, label: "南東" },
  { dx: 0, dy: 1, label: "南" },
  { dx: -1, dy: 1, label: "南西" },
  { dx: -1, dy: 0, label: "西" },
  { dx: -1, dy: -1, label: "北西" },
];

/** 押したマスから見て、正解はどの方角か。 */
export function directionTo(from: Prefecture, to: Prefecture): string {
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  let best = DIRECTIONS[0];
  let bestScore = -Infinity;
  const length = Math.hypot(dx, dy) || 1;
  for (const dir of DIRECTIONS) {
    // 向きの近さ（内積）で選ぶ。斜めも同じ扱いにするため正規化する
    const norm = Math.hypot(dir.dx, dir.dy);
    const score = (dx * dir.dx + dy * dir.dy) / (length * norm);
    if (score > bestScore) {
      bestScore = score;
      best = dir;
    }
  }
  return best.label;
}
