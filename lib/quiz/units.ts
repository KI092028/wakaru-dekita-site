import type { QuizUnit } from "./types";

export const quizUnits: QuizUnit[] = [
  {
    slug: "add-sub",
    title: "たし算・ひき算",
    gradeLabel: "1〜2年生",
    description: "20までのかずで、たし算とひき算をれんしゅうしよう。",
    available: true,
  },
  {
    slug: "times-table",
    title: "九九",
    gradeLabel: "2〜3年生",
    description: "1の段から9の段まで、九九をマスターしよう。",
    available: true,
  },
  {
    slug: "column-add-sub",
    title: "たし算・ひき算のひっ算",
    gradeLabel: "2〜3年生",
    description: "くり上がりの1を書く、となりから借りる。1手ずつ進めます。",
    available: true,
  },
  {
    slug: "long-division",
    title: "わり算のひっ算",
    gradeLabel: "3〜4年生",
    description: "たてる・かける・ひく・おろすを1手ずつ。どこでつまずくかが分かります。",
    available: true,
  },
  {
    slug: "long-division-2",
    title: "わり算のひっ算（2けたでわる）",
    gradeLabel: "4年生",
    description: "がい数で 見当を つけて、合わなければ ひとつ 増減する れんしゅう。",
    available: true,
  },
  {
    slug: "column-decimal",
    title: "小数のたし算・ひき算",
    gradeLabel: "4年生",
    description: "けたをそろえて、小数点をたてにそろえる練習。",
    available: true,
  },
  {
    slug: "fractions",
    title: "分数",
    gradeLabel: "4〜5年生",
    description: "通分・約分をふくむ、分数のたし算・ひき算にちょうせん。",
    available: true,
  },
  {
    slug: "time",
    title: "時こく・時間",
    gradeLabel: "2〜3年生",
    description: "とけいの読み方や時間の計算をれんしゅうしよう。",
    available: false,
  },
  {
    slug: "figures",
    title: "図形",
    gradeLabel: "4〜6年生",
    description: "面積・体積など、図形の問題にちょうせん。",
    available: false,
  },
];
