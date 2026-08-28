import {
  areaOf,
  edgeLength,
  sumOfEdges,
  type Edge,
  goalShape,
  movingLabelOf,
  movingUnitOf,
  movingValueOf,
  perimeterOf,
  shapeOptions,
  sizeLabel,
  type AreaPlan,
} from "./plan";

/**
 * 面積と周りの長さの1手ごとの問いと、間違えたときに返す言葉。
 *
 * 手は3種類。**問題によって使う手がちがう。**
 *
 * - `trace` ふちを なぞって、まわりの長さを 出す（前半2問）
 * - `area`  中の マスを 数えて、面積を 出す（前半2問）
 * - `shape` 形を 変える（後半2問）
 *
 * 手をそろえずに問題ごとに変えているのは、この単元が
 * 「同じ手続きを速くする」ものではなく、
 * **2つの量が別物だと分かる**ためのものだから。
 */

export type AreaStepKind = "trace" | "area" | "shape";

export const AREA_STEP_KINDS: AreaStepKind[] = ["trace", "area", "shape"];

export const AREA_STEP_LABEL: Record<AreaStepKind, string> = {
  trace: "まわりの長さ（ふちを なぞる）",
  area: "面積（マスを 数える）",
  shape: "形を 変える",
};

export const AREA_STEP_SHORT: Record<AreaStepKind, string> = {
  trace: "まわり",
  area: "面積",
  shape: "形をかえる",
};

/**
 * 助言するとき、先に見たい手の順。
 *
 * `trace` を先に置くのは、まわりの長さを 2辺で 止めている子が
 * いちばん多く、しかも直しやすいから。
 */
export const AREA_ADVICE_PRIORITY: AreaStepKind[] = ["trace", "area", "shape"];

/** その問題で通る手。 */
export function stepsFor(plan: AreaPlan): AreaStepKind[] {
  return plan.kind === "count" ? ["trace", "area"] : ["shape"];
}

export function areaPrompt(plan: AreaPlan, kind: AreaStepKind): string {
  switch (kind) {
    case "trace":
      return "まわりの ふちを ぜんぶ なぞろう";
    case "area":
      return "中の マスは ぜんぶで いくつ？";
    case "shape":
      return plan.kind === "keepArea"
        ? `まわりの長さが いちばん 短く なる 形に しよう`
        : `面積が いちばん 大きく なる 形に しよう`;
  }
}

/**
 * ふちを なぞりきる前に決定を押したとき。
 *
 * **これがこの単元でいちばん多い誤り**（たて＋よこ で止まる）。
 * 数を直すのではなく、**なぞれていない辺を名指しする。**
 *
 * 足りない本数だけでなく、どの向きの辺が残っているかまで見る。
 * 「たてと よこを 1本ずつ」で止まった子と、「よこ2本」で止まった子とでは、
 * 頭の中が別なので、返す言葉も別にする。
 */
export function diagnoseTrace(plan: AreaPlan, traced: Edge[]): string | null {
  if (traced.length === 4) return null;

  const { rows, cols } = plan;
  const done = sumOfEdges(rows, cols, traced);
  const whole = perimeterOf(rows, cols);
  const verticals = traced.filter((e) => e === "left" || e === "right").length;
  const horizontals = traced.length - verticals;

  if (traced.length === 2 && verticals === 1) {
    // たてと よこを 1本ずつ。まさに「（たて＋よこ）で止まる」形
    return (
      `いま たしたのは たて1本と よこ1本で ${done}cm。` +
      `長方形の ふちは たてが 2本、よこが 2本 で ぜんぶで 4本 あるよ。` +
      `1しゅう すると ${whole}cm`
    );
  }
  if (traced.length === 2) {
    const kind = verticals === 2 ? "たて" : "よこ";
    const other = verticals === 2 ? "よこ" : "たて";
    return `${kind}の ふち 2本だけ なぞったね。${other}の ふちも 2本 あるよ。ぐるっと 1しゅう しよう`;
  }
  if (traced.length === 3) {
    const missing = verticals === 2 ? "よこ" : "たて";
    return `あと 1本。${missing}の ふちが 1本 のこっているよ`;
  }
  if (traced.length === 1) {
    const kind = horizontals === 1 ? "よこ" : "たて";
    return `${kind}の ふち 1本だけだね。まわりの長さは、ふちを ぐるっと 1しゅう した 長さ。あと 3本 あるよ`;
  }
  return `まだ どの ふちも なぞれていないよ。ふちを 押すと、その 長さが たされていく`;
}

/** 面積の答えがちがうとき。 */
export function diagnoseArea(plan: AreaPlan, typed: number): string | null {
  const want = areaOf(plan.rows, plan.cols);
  if (typed === want) return null;

  const perimeter = perimeterOf(plan.rows, plan.cols);

  if (typed === perimeter) {
    return (
      `それは さっき なぞった まわりの長さだね。` +
      `面積は ふちの 長さでは なくて、中の マスの 数。` +
      `たて${plan.rows}こ ならんだ 列が よこに ${plan.cols}列 あるので、` +
      `${plan.rows} × ${plan.cols} = ${want}`
    );
  }
  if (typed === plan.rows + plan.cols) {
    return (
      `たてと よこを たしただけだね。マスは たてに ${plan.rows}こ、` +
      `よこに ${plan.cols}こ ならんでいるので、かけ算で ${plan.rows} × ${plan.cols} = ${want}`
    );
  }
  return `たて${plan.rows}こ × よこ${plan.cols}こ で ${want}こ。面積は ${want}cm² だよ`;
}

/**
 * 形がまだ答えではないとき。
 *
 * **数を出して終わりにしない。** 「もっと正方形に近づける」という
 * 動かし方をそのまま言う。ここが分かれば、次の問題は自分で解ける。
 */
export function diagnoseShape(plan: AreaPlan, rows: number, cols: number): string | null {
  const goal = goalShape(plan);
  if (rows === goal.rows && cols === goal.cols) return null;

  const now = movingValueOf(plan, rows, cols);
  const label = movingLabelOf(plan);
  const unit = movingUnitOf(plan);
  const wants = plan.kind === "keepArea" ? "もっと 短く" : "もっと 大きく";

  return (
    `${sizeLabel(rows, cols)} だと、${label}は ${now}${unit}。` +
    `${plan.kind === "keepArea" ? "面積" : "まわりの長さ"}は ${plan.fixed}${
      plan.kind === "keepArea" ? "cm²" : "cm"
    } の ままだけれど、${label}は ${wants} できるよ。` +
    `たてと よこを 近づけて、正方形に 近い 形に してみよう`
  );
}

/** できたときに出す、この問題で分かること。 */
export function shapeConclusion(plan: AreaPlan): string {
  const goal = goalShape(plan);
  return plan.kind === "keepArea"
    ? `面積が ${plan.fixed}cm² でも、まわりの長さは ${extremes(plan).max}cm から ${extremes(plan).min}cm まで 変わる。いちばん 短いのは 正方形に 近い ${sizeLabel(goal.rows, goal.cols)} のとき。`
    : `まわりの長さが ${plan.fixed}cm でも、面積は ${extremes(plan).min}cm² から ${extremes(plan).max}cm² まで 変わる。いちばん 大きいのは 正方形に 近い ${sizeLabel(goal.rows, goal.cols)} のとき。`;
}

/** 選べる形の中での、いちばん小さい値といちばん大きい値。 */
export function extremes(plan: AreaPlan): { min: number; max: number } {
  const values = shapeOptions(plan).map((o) => movingValueOf(plan, o.rows, o.cols));
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function areaAdviceFor(kind: AreaStepKind): { text: string } | null {
  switch (kind) {
    case "trace":
      return {
        text: "まわりの長さは「ふちを 1しゅう」。長方形の ふちは たて2本・よこ2本の 4本 あるよ。たてと よこを 1回ずつ たして 止まっていないか、たしかめよう。",
      };
    case "area":
      return {
        text: "面積は「中の マスの 数」。ふちの 長さでは ないよ。たてに ならんだ 数 × よこに ならんだ 数 で 出せる。",
      };
    case "shape":
      return {
        text: "まわりの長さが 同じでも、面積は 同じに ならない。正方形に 近いほど 面積は 大きく、まわりの長さは 短く なるよ。",
      };
  }
}
