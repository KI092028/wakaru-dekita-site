import { areaOf, frameOf, heightIsOutside, type Figure, type Motion } from "./plan";
import type { TriStepKind } from "./steps";

/**
 * 三角形・平行四辺形の面積の出題。
 *
 * ## 4問の並びは固定。**順番そのものが教える内容**
 *
 * 1. **平行四辺形**。切って うつすと 長方形 → 底辺 × 高さ（÷2 は いらない）
 * 2. **三角形**。2つ 合わせると 平行四辺形 → その 半分（ここで ÷2 が出る）
 * 3. **高さが 底辺の 外に 出る 三角形**。同じ やり方が そのまま 通る
 * 4. **頂点を 横へ 動かす**。ななめの辺が のびても 面積は 変わらない
 *
 * 1 と 2 は入れかえられない。三角形の ÷2 は、
 * **平行四辺形が 底辺 × 高さ だと分かってはじめて意味を持つ。**
 *
 * ## 形は、ななめの辺が 5cm になるものだけ
 *
 * 3-4-5 にそろえてある。こうすると「底辺 × 5 ÷ 2」という
 * よくある誤答が整数で出るので、**その数を打った子に
 * 「5cm は ななめの 辺だね」と名指しで返せる。**
 */

export const TRI_PROBLEM_COUNT = 4;

export const TRI_STORAGE_KEY = "wakaru-dekita:triangle-area:v1";

export type TriPlan = {
  id: string;
  figure: Figure;
  motion: Motion;
  steps: TriStepKind[];
  story: string;
  stage: string;
  frameCols: number;
  frameRows: number;
  answer: number;
  /** 頂点を動かす問題で、頂点が取りうる位置 */
  apexRange?: { min: number; max: number };
};

/** 平行四辺形。ななめの辺が 5cm になる（3-4-5） */
const PARALLELOGRAMS: { base: number; height: number; offset: number }[] = [
  { base: 6, height: 4, offset: 3 },
  { base: 5, height: 4, offset: 3 },
  { base: 8, height: 3, offset: 4 },
  { base: 6, height: 3, offset: 4 },
];

/** 高さが底辺の中に収まる三角形 */
const INSIDE: { base: number; height: number; apex: number }[] = [
  { base: 6, height: 4, apex: 3 },
  { base: 8, height: 4, apex: 3 },
  { base: 7, height: 4, apex: 3 },
  { base: 6, height: 3, apex: 4 },
];

/** 高さが底辺の外に出る三角形。**この単元の本丸** */
const OUTSIDE: { base: number; height: number; apex: number }[] = [
  { base: 4, height: 3, apex: 8 },
  { base: 5, height: 4, apex: 8 },
  { base: 4, height: 4, apex: 7 },
  { base: 6, height: 3, apex: 10 },
];

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

function build(
  index: number,
  figure: Figure,
  motion: Motion,
  steps: TriStepKind[],
  story: string,
  stage: string,
  apexRange?: { min: number; max: number }
): TriPlan {
  const frame = frameOf(figure);
  // 枠の広さは動かし方で決まる。
  // - rotate … 回してつけた形（平行四辺形）まで入れる。右へ 底辺のぶん のびる
  // - apex   … 頂点が動く先まで入れる
  // - slide  … 元の形のままで足りる（切ったぶんは欠けにはまるだけ）
  const rotateCols =
    motion === "rotate" && figure.kind === "triangle" ? figure.apex + figure.base : 0;
  const cols = Math.max(frame.cols, rotateCols, apexRange?.max ?? 0);
  return {
    id: `tri-${index}`,
    figure,
    motion,
    steps,
    story,
    stage,
    frameCols: cols,
    frameRows: frame.rows,
    answer: areaOf(figure),
    apexRange,
  };
}

export function generateTriPlans(): TriPlan[] {
  const p = pick(PARALLELOGRAMS);
  const inside = pick(INSIDE);
  const outside = pick(OUTSIDE);

  // 4問目は、頂点を動かしても面積が変わらないことを見せる形
  const slide = pick(INSIDE);
  const slideMax = slide.base + 5;

  return [
    build(
      0,
      { kind: "parallelogram", ...p },
      "slide",
      ["height", "move", "area"],
      "1cm方眼の 上に かいた 平行四辺形です。",
      "切って うつすと 長方形"
    ),
    build(
      1,
      { kind: "triangle", ...inside },
      "rotate",
      ["height", "move", "area"],
      "1cm方眼の 上に かいた 三角形です。",
      "2つ 合わせると 平行四辺形"
    ),
    build(
      2,
      { kind: "triangle", ...outside },
      "rotate",
      ["height", "move", "area"],
      "1cm方眼の 上に かいた 三角形です。とがった 頂点が、底辺より 右に 出ています。",
      "高さが 外に 出る 三角形"
    ),
    build(
      3,
      { kind: "triangle", ...slide },
      "apex",
      ["move", "area"],
      "頂点だけを 横に 動かします。底辺と 高さは 変わりません。",
      "ななめの辺が のびても",
      { min: 0, max: slideMax }
    ),
  ];
}

/** 3問目が本当に「高さが外」になっているか、呼ぶ側から確かめられるように。 */
export const isOutsideProblem = (plan: TriPlan): boolean => heightIsOutside(plan.figure);
