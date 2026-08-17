/**
 * 47都道府県のデータ。
 *
 * ## 地図は実際の県境を使う
 *
 * 形は `@svg-maps/japan`（CC BY 4.0）のパスをそのまま描く。
 * viewBox は 0 0 438 516 で、`cx` `cy` `box` はその座標系の値。
 *
 * - `cx` `cy`：名前を置く場所。**離島があると bbox の中心が海の上に来る**ので、
 *   中心が本体の中に入っているときだけ bbox の中心を使い、
 *   入らない県（東京・長崎・沖縄など9県）は輪郭をたどって点が集まるところを使った
 * - `box`：その県の外わく。地方だけを大きく描くときの範囲に使う
 *
 * これらは実際のパスから測って書き出した値で、手で置いたものではない。
 *
 * ## 方角のヒントは実際の座標から出す
 *
 * 47県ぶんの「隣接する県の一覧」を手で書くと間違えるので持たない。
 * かわりに、押した県と正解の県の座標の差から「もっと 北 のほうだよ」を作る。
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
  /** @svg-maps/japan のパスID */
  mapId: string;
  /** 名前を置く場所（本体の中） */
  cx: number;
  cy: number;
  /** [x, y, width, height]。地方を大きく描くときの範囲 */
  box: [number, number, number, number];
  /** 県庁所在地。「市」は付けない（画面で足す） */
  capital: string;
  capitalKana: string;
};

/**
 * 県庁所在地の名前が、都道府県の名前とちがう県。
 *
 * 覚えるところはここしかない。同じ名前の29県を混ぜて出すと、
 * **半分以上が「県名をそのまま言えばよい問題」になってしまう。**
 * 出題を絞れるように、判定をここに置く。
 */
export const capitalDiffers = (p: Prefecture): boolean => p.capital !== p.name;

/** 「盛岡市」。 */
export const capitalName = (p: Prefecture): string => `${p.capital}市`;

export const PREFECTURES: Prefecture[] = [
  { code: 1, name: "北海道", suffix: "道", kana: "ほっかいどう", region: "hokkaido", mapId: "hokkaido", cx: 373.8, cy: 56.1, box: [310.5, 0.3, 126.4, 111.7], capital: "札幌", capitalKana: "さっぽろ" },

  { code: 2, name: "青森", suffix: "県", kana: "あおもり", region: "tohoku", mapId: "aomori", cx: 344.2, cy: 118, box: [319.6, 108, 35.9, 34.5], capital: "青森", capitalKana: "あおもり" },
  { code: 3, name: "岩手", suffix: "県", kana: "いわて", region: "tohoku", mapId: "iwate", cx: 349.2, cy: 158.3, box: [335.3, 136.7, 27.8, 43.2], capital: "盛岡", capitalKana: "もりおか" },
  { code: 5, name: "秋田", suffix: "県", kana: "あきた", region: "tohoku", mapId: "akita", cx: 329.1, cy: 155.9, box: [316.3, 135.1, 25.7, 41.7], capital: "秋田", capitalKana: "あきた" },
  { code: 4, name: "宮城", suffix: "県", kana: "みやぎ", region: "tohoku", mapId: "miyagi", cx: 341.6, cy: 189, box: [327.8, 173.7, 27.5, 30.7], capital: "仙台", capitalKana: "せんだい" },
  { code: 6, name: "山形", suffix: "県", kana: "やまがた", region: "tohoku", mapId: "yamagata", cx: 324.3, cy: 187.8, box: [313.4, 170.3, 21.6, 35.1], capital: "山形", capitalKana: "やまがた" },
  { code: 7, name: "福島", suffix: "県", kana: "ふくしま", region: "tohoku", mapId: "fukushima", cx: 324.4, cy: 213.9, box: [305.9, 199.3, 36.9, 29.2], capital: "福島", capitalKana: "ふくしま" },

  { code: 8, name: "茨城", suffix: "県", kana: "いばらき", region: "kanto", mapId: "ibaraki", cx: 327.9, cy: 239.7, box: [316.3, 224.8, 23.1, 29.8], capital: "水戸", capitalKana: "みと" },
  { code: 9, name: "栃木", suffix: "県", kana: "とちぎ", region: "kanto", mapId: "tochigi", cx: 318.6, cy: 231.3, box: [309.1, 219.7, 18.9, 23.2], capital: "宇都宮", capitalKana: "うつのみや" },
  { code: 10, name: "群馬", suffix: "県", kana: "ぐんま", region: "kanto", mapId: "gunma", cx: 303.2, cy: 235.1, box: [290.8, 222, 24.9, 26.1], capital: "前橋", capitalKana: "まえばし" },
  { code: 11, name: "埼玉", suffix: "県", kana: "さいたま", region: "kanto", mapId: "saitama", cx: 308.7, cy: 247.4, box: [297, 241.1, 23.4, 12.5], capital: "さいたま", capitalKana: "さいたま" },
  { code: 12, name: "千葉", suffix: "県", kana: "ちば", region: "kanto", mapId: "chiba", cx: 328.5, cy: 260, box: [317.4, 245.6, 22, 28.8], capital: "千葉", capitalKana: "ちば" },
  { code: 13, name: "東京", suffix: "都", kana: "とうきょう", region: "kanto", mapId: "tokyo", cx: 313.5, cy: 255.5, box: [301.6, 250.4, 19.7, 67.8], capital: "東京", capitalKana: "とうきょう" },
  { code: 14, name: "神奈川", suffix: "県", kana: "かながわ", region: "kanto", mapId: "kanagawa", cx: 309.4, cy: 262.2, box: [301, 255.8, 16.7, 12.8], capital: "横浜", capitalKana: "よこはま" },

  { code: 15, name: "新潟", suffix: "県", kana: "にいがた", region: "chubu", mapId: "niigata", cx: 298.1, cy: 207.5, box: [275.8, 185, 44.6, 44.9], capital: "新潟", capitalKana: "にいがた" },
  { code: 16, name: "富山", suffix: "県", kana: "とやま", region: "chubu", mapId: "toyama", cx: 268.6, cy: 232.5, box: [258.9, 223.9, 19.4, 17.3], capital: "富山", capitalKana: "とやま" },
  { code: 17, name: "石川", suffix: "県", kana: "いしかわ", region: "chubu", mapId: "ishikawa", cx: 259.3, cy: 228.2, box: [248.3, 210.2, 22, 36], capital: "金沢", capitalKana: "かなざわ" },
  { code: 18, name: "福井", suffix: "県", kana: "ふくい", region: "chubu", mapId: "fukui", cx: 246.3, cy: 252.2, box: [232.7, 240.6, 27.3, 23.1], capital: "福井", capitalKana: "ふくい" },
  { code: 20, name: "長野", suffix: "県", kana: "ながの", region: "chubu", mapId: "nagano", cx: 283.6, cy: 245, box: [269.7, 222.7, 27.8, 44.5], capital: "長野", capitalKana: "ながの" },
  { code: 21, name: "岐阜", suffix: "県", kana: "ぎふ", region: "chubu", mapId: "gifu", cx: 262.5, cy: 252.5, box: [249, 236.6, 27.1, 31.9], capital: "岐阜", capitalKana: "ぎふ" },
  { code: 19, name: "山梨", suffix: "県", kana: "やまなし", region: "chubu", mapId: "yamanashi", cx: 295.9, cy: 258.2, box: [286.5, 248.6, 18.7, 19.2], capital: "甲府", capitalKana: "こうふ" },
  { code: 23, name: "愛知", suffix: "県", kana: "あいち", region: "chubu", mapId: "aichi", cx: 268.1, cy: 271.9, box: [256.7, 261.8, 22.9, 20.2], capital: "名古屋", capitalKana: "なごや" },
  { code: 22, name: "静岡", suffix: "県", kana: "しずおか", region: "chubu", mapId: "shizuoka", cx: 289.1, cy: 269, box: [272.7, 256.5, 32.8, 25.1], capital: "静岡", capitalKana: "しずおか" },

  { code: 26, name: "京都", suffix: "府", kana: "きょうと", region: "kinki", mapId: "kyoto", cx: 232.8, cy: 266.2, box: [221.2, 253.4, 23.2, 25.7], capital: "京都", capitalKana: "きょうと" },
  { code: 25, name: "滋賀", suffix: "県", kana: "しが", region: "kinki", mapId: "shiga", cx: 245.7, cy: 266, box: [239, 255.1, 13.5, 21.9], capital: "大津", capitalKana: "おおつ" },
  { code: 28, name: "兵庫", suffix: "県", kana: "ひょうご", region: "kinki", mapId: "hyogo", cx: 221.1, cy: 273.5, box: [209.1, 255.7, 23.9, 35.5], capital: "神戸", capitalKana: "こうべ" },
  { code: 27, name: "大阪", suffix: "府", kana: "おおさか", region: "kinki", mapId: "osaka", cx: 233.7, cy: 279.3, box: [225.6, 270.8, 12.9, 18.5], capital: "大阪", capitalKana: "おおさか" },
  { code: 29, name: "奈良", suffix: "県", kana: "なら", region: "kinki", mapId: "nara", cx: 241.2, cy: 288, box: [234.5, 277.2, 13.5, 21.5], capital: "奈良", capitalKana: "なら" },
  { code: 24, name: "三重", suffix: "県", kana: "みえ", region: "kinki", mapId: "mie", cx: 251.3, cy: 284.1, box: [240.7, 265.8, 21.1, 36.5], capital: "津", capitalKana: "つ" },
  { code: 30, name: "和歌山", suffix: "県", kana: "わかやま", region: "kinki", mapId: "wakayama", cx: 234.3, cy: 297.9, box: [224.9, 286.7, 18.8, 22.4], capital: "和歌山", capitalKana: "わかやま" },

  { code: 32, name: "島根", suffix: "県", kana: "しまね", region: "chugoku", mapId: "shimane", cx: 187.3, cy: 244.2, box: [140.9, 209.8, 51.1, 78.8], capital: "松江", capitalKana: "まつえ" },
  { code: 31, name: "鳥取", suffix: "県", kana: "とっとり", region: "chugoku", mapId: "tottori", cx: 200.7, cy: 263.9, box: [187.2, 257.2, 27.1, 13.4], capital: "鳥取", capitalKana: "とっとり" },
  { code: 35, name: "山口", suffix: "県", kana: "やまぐち", region: "chugoku", mapId: "yamaguchi", cx: 158.1, cy: 289.7, box: [142.2, 279.6, 31.7, 20], capital: "山口", capitalKana: "やまぐち" },
  { code: 34, name: "広島", suffix: "県", kana: "ひろしま", region: "chugoku", mapId: "hiroshima", cx: 179.4, cy: 281.6, box: [165.5, 269.5, 27.9, 24.2], capital: "広島", capitalKana: "ひろしま" },
  { code: 33, name: "岡山", suffix: "県", kana: "おかやま", region: "chugoku", mapId: "okayama", cx: 201, cy: 274.7, box: [189.7, 263.6, 22.5, 22.3], capital: "岡山", capitalKana: "おかやま" },

  { code: 38, name: "愛媛", suffix: "県", kana: "えひめ", region: "shikoku", mapId: "ehime", cx: 181.5, cy: 307, box: [164.9, 292.4, 33.1, 29.1], capital: "松山", capitalKana: "まつやま" },
  { code: 37, name: "香川", suffix: "県", kana: "かがわ", region: "shikoku", mapId: "kagawa", cx: 204.3, cy: 290.8, box: [195.7, 286.2, 17.2, 9.3], capital: "高松", capitalKana: "たかまつ" },
  { code: 36, name: "徳島", suffix: "県", kana: "とくしま", region: "shikoku", mapId: "tokushima", cx: 208.1, cy: 298.2, box: [197.4, 290, 21.4, 16.3], capital: "徳島", capitalKana: "とくしま" },
  { code: 39, name: "高知", suffix: "県", kana: "こうち", region: "shikoku", mapId: "kochi", cx: 182.1, cy: 319.4, box: [176.8, 298.6, 33.3, 27.2], capital: "高知", capitalKana: "こうち" },

  { code: 41, name: "佐賀", suffix: "県", kana: "さが", region: "kyushu", mapId: "saga", cx: 127, cy: 309.6, box: [118.2, 299, 17.7, 21.3], capital: "佐賀", capitalKana: "さが" },
  { code: 40, name: "福岡", suffix: "県", kana: "ふくおか", region: "kyushu", mapId: "fukuoka", cx: 137.4, cy: 307.8, box: [126, 296.4, 22.7, 22.7], capital: "福岡", capitalKana: "ふくおか" },
  { code: 42, name: "長崎", suffix: "県", kana: "ながさき", region: "kyushu", mapId: "nagasaki", cx: 122.8, cy: 320.6, box: [97.6, 278.9, 35.1, 50.4], capital: "長崎", capitalKana: "ながさき" },
  { code: 43, name: "熊本", suffix: "県", kana: "くまもと", region: "kyushu", mapId: "kumamoto", cx: 132.4, cy: 333.2, box: [124.6, 314.8, 26.9, 25.7], capital: "熊本", capitalKana: "くまもと" },
  { code: 44, name: "大分", suffix: "県", kana: "おおいた", region: "kyushu", mapId: "oita", cx: 153.9, cy: 314.2, box: [141.6, 303, 24.7, 22.4], capital: "大分", capitalKana: "おおいた" },
  { code: 46, name: "鹿児島", suffix: "県", kana: "かごしま", region: "kyushu", mapId: "kagoshima", cx: 134.4, cy: 354.3, box: [118.5, 338.2, 30.5, 44.9], capital: "鹿児島", capitalKana: "かごしま" },
  { code: 45, name: "宮崎", suffix: "県", kana: "みやざき", region: "kyushu", mapId: "miyazaki", cx: 150.7, cy: 340.1, box: [139.1, 323.1, 23.1, 34], capital: "宮崎", capitalKana: "みやざき" },
  { code: 47, name: "沖縄", suffix: "県", kana: "おきなわ", region: "kyushu", mapId: "okinawa", cx: 83.7, cy: 466.3, box: [0.3, 421.3, 125.6, 94.3], capital: "那覇", capitalKana: "なは" },
];

export const prefectureByCode = (code: number): Prefecture =>
  PREFECTURES.find((p) => p.code === code)!;

/** 「東京都」「北海道」。北海道は name にすでに「道」が入っている */
export const fullName = (p: Prefecture): string =>
  p.name.endsWith(p.suffix) ? p.name : `${p.name}${p.suffix}`;

export const prefecturesOf = (region: Region): Prefecture[] =>
  PREFECTURES.filter((p) => p.region === region);

/** 地図ぜんたいの大きさ（@svg-maps/japan の viewBox）。 */
export const MAP_VIEW_BOX = { width: 438, height: 516 };

/** その県ぜんぶが入る四角。地方だけを大きく描くのに使う。 */
export function bounds(list: Prefecture[]): { x: number; y: number; width: number; height: number } {
  const minX = Math.min(...list.map((p) => p.box[0]));
  const minY = Math.min(...list.map((p) => p.box[1]));
  const maxX = Math.max(...list.map((p) => p.box[0] + p.box[2]));
  const maxY = Math.max(...list.map((p) => p.box[1] + p.box[3]));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
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

/** 押した県から見て、正解はどの方角か。 */
export function directionTo(from: Prefecture, to: Prefecture): string {
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
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
