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
    slug: "fractions",
    title: "分数",
    gradeLabel: "4〜5年生",
    description: "分数のたし算・ひき算にちょうせん。",
    available: false,
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
