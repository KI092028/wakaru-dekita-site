import type { QuizUnit, Subject } from "./types";

/**
 * 単元マスタ。**教科書でならう順に並べる。**
 *
 * 単元が増えたので、一覧では `grade` ごとに見出しを付けて区切る（→ requirements.md 5.5）。
 * ここの並び順が、そのまま画面の並び順になる。
 */
export const quizUnits: QuizUnit[] = [
  {
    slug: "add-sub",
    title: "たし算・ひき算",
    subject: "math",
    grade: 1,
    gradeLabel: "1〜2年生",
    kind: "drill",
    description: "20までのかずで、たし算とひき算をれんしゅうしよう。",
    available: true,
  },
  {
    slug: "times-table",
    title: "九九",
    subject: "math",
    grade: 2,
    gradeLabel: "2〜3年生",
    kind: "drill",
    description: "1の段から9の段まで、九九をマスターしよう。",
    available: true,
  },
  {
    slug: "column-add-sub",
    title: "たし算・ひき算のひっ算",
    subject: "math",
    grade: 2,
    gradeLabel: "2〜3年生",
    kind: "steps",
    description: "くり上がりの1を書く、となりから借りる。1手ずつ進めます。",
    available: true,
  },
  {
    slug: "column-multiply",
    title: "かけ算のひっ算",
    subject: "math",
    grade: 3,
    gradeLabel: "3〜4年生",
    kind: "steps",
    description: "2だんめを ひとつ 左に ずらす理由から。九九・くり上がりも1手ずつ。",
    available: true,
  },
  {
    slug: "long-division",
    title: "わり算のひっ算",
    subject: "math",
    grade: 3,
    gradeLabel: "3〜4年生",
    kind: "steps",
    description: "たてる・かける・ひく・おろすを1手ずつ。どこでつまずくかが分かります。",
    available: true,
  },
  {
    slug: "long-division-2",
    title: "わり算のひっ算（2けたでわる）",
    subject: "math",
    grade: 4,
    gradeLabel: "4年生",
    kind: "steps",
    description: "がい数で 見当を つけて、合わなければ ひとつ 増減する れんしゅう。",
    available: true,
  },
  {
    slug: "column-decimal",
    title: "小数のたし算・ひき算",
    subject: "math",
    grade: 4,
    gradeLabel: "4年生",
    kind: "steps",
    description: "けたをそろえて、小数点をたてにそろえる練習。",
    available: true,
  },
  {
    slug: "angle",
    title: "角の大きさ",
    subject: "math",
    grade: 4,
    gradeLabel: "4年生",
    kind: "figure",
    description: "分度器を 自分で 当てて はかる。内がわ・外がわの 読みちがいも その場で。",
    available: true,
  },
  {
    slug: "fractions",
    title: "分数",
    subject: "math",
    grade: 4,
    gradeLabel: "4〜5年生",
    kind: "drill",
    description: "通分・約分をふくむ、分数のたし算・ひき算にちょうせん。",
    available: true,
  },
  {
    slug: "per-unit",
    title: "単位量あたりの大きさ",
    subject: "math",
    grade: 5,
    gradeLabel: "5年生",
    kind: "figure",
    description: "こみぐあい・こさ・速さ。1つ分に そろえて くらべる 考え方を 図で。",
    available: true,
  },
  {
    slug: "prefectures",
    title: "都道府県",
    subject: "social",
    grade: 4,
    gradeLabel: "4年生〜",
    kind: "game",
    description: "地図の上でさがす。おしいときは「同じ地方だよ」「もっと北だよ」と方角が返ります。",
    available: true,
  },
  {
    slug: "manuscript",
    title: "原稿用紙",
    subject: "japanese",
    grade: 1,
    gradeLabel: "全学年",
    kind: "tool",
    description: "300字づめ（15行×20マス）。打った文がマスに入り、文字数も数えます。A4で印刷できます。",
    available: true,
  },
  {
    slug: "time",
    title: "時こく・時間",
    subject: "math",
    grade: 2,
    gradeLabel: "2〜3年生",
    kind: "drill",
    description: "とけいの読み方や時間の計算をれんしゅうしよう。",
    available: false,
  },
  {
    slug: "figures",
    title: "図形",
    subject: "math",
    grade: 4,
    gradeLabel: "4〜6年生",
    kind: "figure",
    description: "面積・体積など、図形の問題にちょうせん。",
    available: false,
  },
];

/** その教科の、公開中の単元。 */
export const unitsOfSubject = (subject: Subject): QuizUnit[] =>
  quizUnits.filter((unit) => unit.available && unit.subject === subject);

/** いま単元がある教科を、units.ts の並び順で返す。画面の見出しはこれで作る。 */
export function subjectsInUse(): Subject[] {
  const seen: Subject[] = [];
  for (const unit of quizUnits) {
    if (unit.available && !seen.includes(unit.subject)) seen.push(unit.subject);
  }
  return seen;
}

/** 公開中の単元だけを、学年ごとにまとめる。 */
export function unitsByGrade(subject?: Subject): { grade: number; label: string; units: QuizUnit[] }[] {
  const groups: { grade: number; label: string; units: QuizUnit[] }[] = [];
  for (const unit of quizUnits) {
    if (!unit.available) continue;
    if (subject !== undefined && unit.subject !== subject) continue;
    const found = groups.find((g) => g.grade === unit.grade);
    if (found) found.units.push(unit);
    else groups.push({ grade: unit.grade, label: `${unit.grade}年生から`, units: [unit] });
  }
  return groups;
}

export const upcomingUnits = (): QuizUnit[] => quizUnits.filter((unit) => !unit.available);
