/**
 * 端末に保存しているものの一覧。**ここが保存キーの正。**
 *
 * ## なぜ集めるか
 *
 * 保存キーは単元ごとのファイルにばらばらに書かれていて、いま10か所ある。
 * 単元が増えるほど、
 *
 * - 自分の記録をまとめて消す手段がない
 * - プライバシーポリシーに書き忘れる
 * - どこに何が入っているのか、誰にも分からなくなる
 *
 * この3つが確実に起きる。**単元が増える前に**一覧を作っておく。
 *
 * ## 増やすときにやること
 *
 * 新しく localStorage に保存する単元を作ったら、必ずこの表に1行足す。
 * 足し忘れは `scripts/check-storage-keys` で機械的に見つかる
 * （ソースにある "wakaru-dekita:" の文字列と、この表を突き合わせている）。
 *
 * 実際の保存キーの文字列は、単元側のファイルから import して持ってくる。
 * ここに書き写すと、片方だけ直したときに気づけない。
 */

import { AREA_STORAGE_KEY } from "@/lib/area/generate";
import { CLOCK_STORAGE_KEY } from "@/lib/clock/generate";
import { SAKURA_STORAGE_KEY } from "@/lib/sakura/generate";
import { TENS_STORAGE_KEY } from "@/lib/tens/progress";
import { TIMES_STORAGE_KEY } from "@/lib/times/generate";
import { TRI_STORAGE_KEY } from "@/lib/tri/generate";
import { COLUMN_STORAGE_KEY } from "@/lib/column/rounds";
import { DIVISION_STORAGE_KEY } from "@/lib/division/record";
import { GEO_STORAGE_KEY } from "@/lib/geo/progress";
import { MANUSCRIPT_STORAGE_KEY } from "@/lib/manuscript/layout";
import { MIXED_STORAGE_KEY } from "@/lib/mixed/generate";
import { MULTIPLY_STORAGE_KEY } from "@/lib/multiply/generate";
import { PERCENT_STORAGE_KEY } from "@/lib/percent/generate";
import { ANGLE_STORAGE_KEY } from "@/lib/protractor/generate";
import { ROUND_STORAGE_KEY } from "@/lib/round/generate";
import { TIMES_TABLE_STORAGE_KEY } from "@/lib/quiz/progress";
import { RATE_STORAGE_KEY } from "@/lib/rate/generate";

/**
 * 保存しているものの種類。記録ページでの見せ方が変わる。
 *
 * - map: マスや県ごとの おぼえた／まだ
 * - practice: 手順型の単元の、どの手で止まったか
 * - draft: 書きかけの文章そのもの
 */
export type StoredKind = "map" | "practice" | "draft";

export type StoredItem = {
  key: string;
  /** どの単元のものか。記録ページからその単元へ行けるようにする */
  slug: string;
  label: string;
  kind: StoredKind;
  /** 何を保存しているか。プライバシーポリシーの説明もここから作る */
  what: string;
};

export const storedItems: StoredItem[] = [
  {
    key: TIMES_TABLE_STORAGE_KEY,
    slug: "times-table",
    label: "九九",
    kind: "map",
    what: "81マスのうち、どの九九を覚えたか",
  },
  {
    key: GEO_STORAGE_KEY.prefecture,
    slug: "prefectures",
    label: "都道府県",
    kind: "map",
    what: "47県のうち、どの県を覚えたか",
  },
  {
    key: GEO_STORAGE_KEY.capital,
    slug: "capitals",
    label: "県庁所在地",
    kind: "map",
    what: "県名とちがう18県のうち、どこを覚えたか",
  },
  {
    key: TENS_STORAGE_KEY,
    slug: "tens",
    label: "10のなかま",
    kind: "map",
    what: "9つの なかまのうち、どれを覚えたか",
  },
  {
    key: SAKURA_STORAGE_KEY,
    slug: "carry",
    label: "くり上がり・くり下がり",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: TIMES_STORAGE_KEY,
    slug: "times-meaning",
    label: "かけ算の意味",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: AREA_STORAGE_KEY,
    slug: "area-perimeter",
    label: "面積と周りの長さ",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: TRI_STORAGE_KEY,
    slug: "triangle-area",
    label: "三角形・平行四辺形の面積",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: CLOCK_STORAGE_KEY,
    slug: "time",
    label: "時こく・時間",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: COLUMN_STORAGE_KEY.integer,
    slug: "column-add-sub",
    label: "たし算・ひき算のひっ算",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: COLUMN_STORAGE_KEY.decimal,
    slug: "column-decimal",
    label: "小数のたし算・ひき算",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: MULTIPLY_STORAGE_KEY,
    slug: "column-multiply",
    label: "かけ算のひっ算",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: DIVISION_STORAGE_KEY["one-digit"],
    slug: "long-division",
    label: "わり算のひっ算",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: DIVISION_STORAGE_KEY["two-digit"],
    slug: "long-division-2",
    label: "わり算のひっ算（2けたでわる）",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: MIXED_STORAGE_KEY,
    slug: "mixed",
    label: "仮分数・帯分数",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: ROUND_STORAGE_KEY,
    slug: "rounding",
    label: "がい数（四捨五入）",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: ANGLE_STORAGE_KEY,
    slug: "angle",
    label: "角の大きさ",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: RATE_STORAGE_KEY,
    slug: "per-unit",
    label: "単位量あたりの大きさ",
    kind: "practice",
    what: "どの手順でまよったかと、取り組んだ回数",
  },
  {
    key: PERCENT_STORAGE_KEY,
    slug: "percent",
    label: "割合・百分率",
    kind: "practice",
    what: "どの手順でつまずいたかと、取り組んだ回数",
  },
  {
    key: MANUSCRIPT_STORAGE_KEY,
    slug: "manuscript",
    label: "原稿用紙",
    kind: "draft",
    what: "書きかけの文章と、縦書き・横書きのえらび",
  },
];

/** その単元の記録が、この端末にあるか。 */
export function hasStored(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/** 記録が残っている単元だけを返す。 */
export function storedInUse(): StoredItem[] {
  return storedItems.filter((item) => hasStored(item.key));
}

/**
 * この端末の記録をぜんぶ消す。
 *
 * 消すのは**この表にあるキーだけ**にする。`localStorage.clear()` は
 * 同じドメインの他のものまで巻き添えにするので使わない。
 */
export function clearAllStored(): void {
  if (typeof window === "undefined") return;
  for (const item of storedItems) {
    try {
      window.localStorage.removeItem(item.key);
    } catch {
      // 消せないものがあっても、残りは消しにいく
    }
  }
}

export function clearStored(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // 消せなくても画面は動きつづける
  }
}
