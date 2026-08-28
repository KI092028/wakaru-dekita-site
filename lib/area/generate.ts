import { areaOf, perimeterOf, type AreaPlan } from "./plan";

/**
 * 面積と周りの長さの出題。
 *
 * ## 4問の並び
 *
 * 1. 長方形の まわりの長さと 面積を 求める（なぞる／数える）
 * 2. **1問目より 細長い** 長方形で 同じことをする
 * 3. まわりの長さを 変えずに 面積を いちばん 大きくする
 * 4. 面積を 変えずに まわりの長さを いちばん 短くする
 *
 * ## 2問目の形は、必ず「まわりは長く、面積は小さい」ものにする
 *
 * ここが仕込み。1問目が 4×6（まわり20cm・面積24cm²）なら、
 * 2問目は 2×9（まわり22cm・面積18cm²）を出す。
 * **まわりは 2cm 長いのに、面積は 6cm² 小さい。**
 *
 * 適当な長方形を2つ出しても、この関係になるとは限らない。
 * なるかどうかを運にまかせると、この単元でいちばん見せたいことが
 * 出たり出なかったりする。だから組を作り置きしてある。
 */

export const AREA_PROBLEM_COUNT = 4;

export const AREA_STORAGE_KEY = "wakaru-dekita:area-perimeter:v1";

/**
 * 1問目と2問目の組。
 *
 * 条件は3つ。
 * - まわりの長さ … 2問目のほうが **長い**
 * - 面積 … 2問目のほうが **4cm² 以上 小さい**
 *   （1cm² しか ちがわないと「ほとんど同じ」に見えて、何も伝わらない）
 * - どちらの長方形も、まわりの長さと面積の数がちがう
 *   （4×4 は まわり16cm・面積16cm² で 同じ数になり、
 *    取りちがえていても気づけない）
 */
const PAIRS: { first: [number, number]; second: [number, number] }[] = [
  { first: [4, 6], second: [2, 9] },
  { first: [4, 5], second: [2, 8] },
  { first: [5, 6], second: [2, 10] },
  { first: [4, 7], second: [2, 10] },
];

/** まわりの長さを変えない問題で使う値。 */
const FIXED_PERIMETERS = [20, 24];

/** 面積を変えない問題で使う値。約数が3つ以上あるものを選ぶ。 */
const FIXED_AREAS = [12, 16];

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

function countPlan(
  index: number,
  rows: number,
  cols: number,
  stage: string,
  compareWith?: { rows: number; cols: number }
): AreaPlan {
  return {
    id: `area-${index}`,
    kind: "count",
    rows,
    cols,
    frameRows: rows,
    frameCols: cols,
    story: `1cm方眼の 上に かいた 長方形です。たて${rows}cm、よこ${cols}cm。`,
    stage,
    compareWith,
  };
}

export function generateAreaPlans(): AreaPlan[] {
  const pair = pick(PAIRS);
  const [r1, c1] = pair.first;
  const [r2, c2] = pair.second;

  const perimeter = pick(FIXED_PERIMETERS);
  const half = perimeter / 2;
  // 枠は「いちばん細長い形」と「いちばん正方形に近い形」の両方が入る大きさ
  const pFrameRows = Math.floor(half / 2);
  const pFrameCols = half - 1;

  const area = pick(FIXED_AREAS);
  const aFrameRows = Math.floor(Math.sqrt(area));
  const aFrameCols = area;

  return [
    countPlan(0, r1, c1, "まわりと 面積は べつのもの"),
    countPlan(1, r2, c2, "細長く すると どうなる", { rows: r1, cols: c1 }),
    {
      id: "area-2",
      kind: "keepPerimeter",
      // 動かしはじめは、いちばん細長い形の ひとつ となり
      rows: 2,
      cols: half - 2,
      frameRows: pFrameRows,
      frameCols: pFrameCols,
      fixed: perimeter,
      story: `まわりの長さが ${perimeter}cm の 長方形を つくります。たてを 変えると、よこも いっしょに 変わって、まわりの長さは ${perimeter}cm の ままです。`,
      stage: "まわりは そのまま",
    },
    {
      id: "area-3",
      kind: "keepArea",
      rows: 2,
      cols: area / 2,
      frameRows: aFrameRows,
      frameCols: aFrameCols,
      fixed: area,
      story: `面積が ${area}cm² の 長方形を つくります。たてを 変えると、よこも いっしょに 変わって、面積は ${area}cm² の ままです。`,
      stage: "面積は そのまま",
    },
  ];
}

/** 2問目のあとに出す、1問目との比べ。 */
export function comparison(plan: AreaPlan): { perimeter: string; area: string } | null {
  if (plan.compareWith === undefined) return null;
  const { rows, cols } = plan.compareWith;
  const dp = perimeterOf(plan.rows, plan.cols) - perimeterOf(rows, cols);
  const da = areaOf(rows, cols) - areaOf(plan.rows, plan.cols);
  return {
    perimeter: `まわりの長さは ${dp}cm 長い`,
    area: `なのに 面積は ${da}cm² 小さい`,
  };
}
