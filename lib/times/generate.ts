import type { TimesPlan, TimesScene } from "./plan";

/**
 * かけ算の意味の出題。
 *
 * ## 4問の並び
 *
 * 1. 小さい数（絵で数えきれる）
 * 2. 別の場面（入れものと中身が変わる）
 * 3. 1つ分が大きい（たし算で書くと大変＝かけ算の良さ）
 * 4. **1つ分といくつ分を入れかえた場面**を最後に見せる
 *
 * 4問目がこの単元のねらい。**答えが同じでも場面はちがう。**
 * 「3こずつ4さら」と「4こずつ3さら」はどちらも12だが、
 * 絵にすると別のものになる。ここが分かると、文章題で
 * どちらの数が「1つ分」なのかを読み取れるようになる。
 */

export const TIMES_PROBLEM_COUNT = 4;

export const TIMES_STORAGE_KEY = "wakaru-dekita:times-meaning:v1";

const SCENES: TimesScene[] = [
  { container: "さら", item: "クッキー", itemUnit: "まい", containerUnit: "さら", verb: "のっています" },
  { container: "はこ", item: "えんぴつ", itemUnit: "本", containerUnit: "はこ", verb: "入っています" },
  { container: "ふくろ", item: "あめ", itemUnit: "こ", containerUnit: "ふくろ", verb: "入っています" },
  { container: "かご", item: "ボール", itemUnit: "こ", containerUnit: "かご", verb: "入っています" },
];

/**
 * 1つ分といくつ分は、**必ずちがう数にする。**
 *
 * 同じ数（2さらに2こずつ）だと、どちらを聞かれても同じ答えになり、
 * 2つを区別する練習にならない。この単元でいちばん問いたいところが消える。
 */
function differing(a: number, min: number, max: number): number {
  const options = [];
  for (let n = min; n <= max; n++) if (n !== a) options.push(n);
  return options[Math.floor(Math.random() * options.length)];
}

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

function build(
  scene: TimesScene,
  per: number,
  groups: number,
  index: number,
  stage: string,
  showsSwap: boolean
): TimesPlan {
  return {
    id: `times-${index}`,
    scene,
    per,
    groups,
    answer: per * groups,
    story: `${scene.container}が ${groups}${scene.containerUnit} あります。どの ${scene.container}にも ${scene.item}が ${per}${scene.itemUnit}ずつ ${scene.verb}。`,
    stage,
    showsSwap,
  };
}

export function generateTimesPlans(): TimesPlan[] {
  // 場面が重ならないように、シャッフルして順に使う
  const scenes = [...SCENES].sort(() => Math.random() - 0.5);

  // 4問目は、1つ分といくつ分がはっきり違う数にする（入れかえの意味が出る）
  const swapPer = randInt(2, 4);
  const swapGroups = randInt(swapPer + 2, 8);

  const per0 = randInt(2, 4);
  const per1 = randInt(2, 5);
  const per2 = randInt(6, 9);

  return [
    build(scenes[0], per0, differing(per0, 2, 5), 0, "小さい数で つかむ", false),
    build(scenes[1], per1, differing(per1, 3, 6), 1, "場面が かわる", false),
    build(scenes[2], per2, differing(per2, 4, 7), 2, "たし算だと 大変な数", false),
    build(scenes[3], swapPer, swapGroups, 3, "入れかえると 場面が かわる", true),
  ];
}
