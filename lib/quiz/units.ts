import type { QuizUnit, Subject, UnitKind } from "./types";

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
    scale: "1セット10問・20までのかず",
  },
  {
    slug: "tens",
    title: "10のなかま",
    subject: "math",
    grade: 1,
    gradeLabel: "1年生〜",
    kind: "drill",
    description: "「7といくつで10？」ぜんぶで9つ。くり上がり・くり下がりの土台です。",
    available: true,
    scale: "9組・1セット10問",
  },
  {
    slug: "carry",
    title: "くり上がり・くり下がり",
    subject: "math",
    grade: 1,
    gradeLabel: "1〜2年生",
    kind: "steps",
    description: "8+5、13−8。さくらんぼの図と10のわくで、10のまとまりを作る手を1つずつ。",
    available: true,
    scale: "1セット4問・たし算とひき算",
  },
  {
    slug: "times-meaning",
    title: "かけ算の意味",
    subject: "math",
    grade: 2,
    gradeLabel: "2〜3年生",
    kind: "figure",
    description: "九九は言えるのに文しょうだいで式が立てられない、を正面から。絵から1つ分といくつ分をさがします。",
    available: true,
    scale: "1セット4問・入れかえも見る",
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
    scale: "9段81マス・1セット10問",
  },
  {
    slug: "time",
    title: "時こく・時間",
    subject: "math",
    grade: 2,
    gradeLabel: "2〜3年生",
    kind: "figure",
    description: "針を自分で回して、12をまたいでみる。10時40分の30分後が10時70分にならない理由が見えます。",
    available: true,
    scale: "1セット4問・すすめる／もどす",
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
    scale: "1セット6問・4段階",
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
    scale: "1セット4問・4段階",
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
    scale: "1セット4問・4段階",
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
    scale: "1セット4問・見当をつける練習",
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
    scale: "1セット6問・4段階",
  },
  {
    slug: "rounding",
    title: "がい数（四捨五入）",
    subject: "math",
    grade: 4,
    gradeLabel: "4年生",
    kind: "steps",
    description: "「百の位まで」で見るのは十の位。四捨五入する位を自分でタップしてさがします。",
    available: true,
    scale: "1セット4問・位の指定と上からのけた",
  },
  {
    slug: "area-perimeter",
    title: "面積と周りの長さ",
    subject: "math",
    grade: 4,
    gradeLabel: "4年生",
    kind: "figure",
    description: "まわりの長さは ふちを なぞる、面積は マスを 数える。同じまわりでも面積が変わることを動かして見ます。",
    available: true,
    scale: "1セット4問・形を変える2問つき",
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
    scale: "1セット6問・右まわり左まわり両方",
  },
  {
    slug: "mixed",
    title: "仮分数・帯分数",
    subject: "math",
    grade: 4,
    gradeLabel: "4年生",
    kind: "steps",
    description: "7/3 と 2と1/3 は同じ大きさ。帯の図を見ながら、両方の向きに書きかえます。",
    available: true,
    scale: "1セット4問・両方の向き",
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
    scale: "1セット10問・通分と約分",
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
    scale: "1セット4問・4つの場面",
  },
  {
    slug: "percent",
    title: "割合・百分率",
    subject: "math",
    grade: 5,
    gradeLabel: "5年生",
    kind: "figure",
    description: "式は書かない。もとにする量をさがして、その上に100%を置くと、割合の目もりが生まれます。",
    available: true,
    scale: "1セット4問・ふえる／へるも",
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
    scale: "全47県・地方ごとに選べる",
  },
  {
    slug: "capitals",
    title: "県庁所在地",
    subject: "social",
    grade: 4,
    gradeLabel: "4年生〜",
    kind: "game",
    description: "「盛岡市はどこの県？」を地図でさがす。県名とちがう18県だけを出します。",
    available: true,
    scale: "県名とちがう18県",
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
    scale: "1まい300字・A4で印刷できる",
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
    scale: "1セット10問",
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

/** 公開中の単元ぜんぶ。 */
export const availableUnits = (): QuizUnit[] => quizUnits.filter((unit) => unit.available);

/**
 * 絞り込みに使う学年の選択肢。**単元がある学年だけを出す。**
 * 空振りする選択肢を並べると、押しても何も起きない場所が増える。
 */
export function gradesInUse(): number[] {
  const grades = new Set(availableUnits().map((unit) => unit.grade));
  return [...grades].sort((a, b) => a - b);
}

/** 絞り込みに使う種類の選択肢。単元がある種類だけ。 */
export function kindsInUse(): UnitKind[] {
  const seen: UnitKind[] = [];
  for (const unit of availableUnits()) {
    if (!seen.includes(unit.kind)) seen.push(unit.kind);
  }
  return seen;
}

/**
 * その日の1単元。**日付だけで決まる**ので、同じ日に何度開いても同じものが出る。
 *
 * ランダムにしないのは、「今日はこれ」と決まっていることに意味があるから。
 * 開くたびに変わると、選ばなくていい入口ではなく、ただのくじ引きになる。
 *
 * 日付は端末の時計で決まるので、**呼び出しは useEffect の中から行うこと。**
 * サーバー側の日付で書き出すと、日付が変わったあとも古いままになる。
 */
export function unitOfDay(date: Date): QuizUnit {
  const units = availableUnits();
  // 「その年の何日目か」ではなく通日にする。年をまたいでも並びが飛ばない
  const days = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
  );
  return units[((days % units.length) + units.length) % units.length];
}
