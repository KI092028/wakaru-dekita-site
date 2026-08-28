/**
 * 面積と周りの長さ（4年）。
 *
 * ## なぜここを作るか
 *
 * **面積と周りの長さを取りちがえる**のは、4年でいちばん多いつまずきのひとつ。
 * 「たて×よこ」と「（たて＋よこ）×2」のどちらだったかを思い出せない、
 * という形で出る。式を覚え直させても、次の週にはまた入れかわる。
 *
 * 入れかわるのは、**2つが別の量だと分かっていない**から。
 * どちらも「長方形の大きさ」を表す数に見えている。
 *
 * ## そこで、やることを変える
 *
 * - **まわりの長さ … ふちを なぞる**（4つの辺を順にタップして、たしていく）
 * - **面積 … 中の マスを 数える**（方眼のマスの数）
 *
 * 手の動きが別なので、式を思い出せなくても取りちがえようがない。
 * なぞる形にしたのは、**たて＋よこ で止まる**（2辺しか数えない）誤りを
 * その場でつかまえるため。2辺なぞって決定を押せば、残り2辺が
 * 灰色のまま残っているのが見える。
 *
 * ## そして、2つが独立に動くことを見せる
 *
 * 後半2問は形を変える問題。
 *
 * - まわりの長さを **20cm のまま**にして、面積をいちばん大きくする
 * - 面積を **12cm² のまま**にして、まわりの長さをいちばん短くする
 *
 * どちらも答えは「いちばん正方形に近い形」。
 * **同じ周りの長さでも面積はちがう**が体で分かると、
 * 2つを混ぜて覚えることがなくなる。
 */

/** 1マスの1辺が表す長さ。方眼は 1cm 方眼にする。 */
export const CELL_CM = 1;

export type AreaPlanKind =
  /** 出された長方形の、まわりの長さと面積を求める */
  | "count"
  /** まわりの長さを変えずに、面積をいちばん大きくする */
  | "keepPerimeter"
  /** 面積を変えずに、まわりの長さをいちばん短くする */
  | "keepArea";

export type AreaPlan = {
  id: string;
  kind: AreaPlanKind;
  /** たて（マス） */
  rows: number;
  /** よこ（マス） */
  cols: number;
  story: string;
  stage: string;
  /**
   * 方眼の枠。**形を変えても枠は変えない。**
   * 枠まで一緒に伸び縮みすると、形が変わったことが見えなくなる。
   */
  frameRows: number;
  frameCols: number;
  /** 形を変える問題で、変えないほうの数 */
  fixed?: number;
  /**
   * 1つ前の問題との比べ。2問目で
   * 「まわりは 長いのに 面積は 小さい」を言うために使う。
   */
  compareWith?: { rows: number; cols: number };
};

/** 長方形の4つの辺。まわりの長さを「なぞる」ときの単位。 */
export type Edge = "top" | "right" | "bottom" | "left";

export const EDGES: Edge[] = ["top", "right", "bottom", "left"];

/** その辺の長さ（cm）。上下は よこ、左右は たて。 */
export const edgeLength = (rows: number, cols: number, edge: Edge): number =>
  edge === "top" || edge === "bottom" ? cols : rows;

export const sumOfEdges = (rows: number, cols: number, edges: Edge[]): number =>
  edges.reduce((sum, edge) => sum + edgeLength(rows, cols, edge), 0);

export const perimeterOf = (rows: number, cols: number): number => 2 * (rows + cols);

export const areaOf = (rows: number, cols: number): number => rows * cols;

/** 「たて4cm・よこ6cm」 */
export const sizeLabel = (rows: number, cols: number): string =>
  `たて${rows}cm・よこ${cols}cm`;

/**
 * 形を変える問題で、選べる形をぜんぶ。**たて ≦ よこ にそろえる。**
 *
 * 2×8 と 8×2 は回すと同じ形なので、両方出すと
 * 「ちがう形をさがす」つもりが同じ絵を2度見ることになる。
 */
export function shapeOptions(plan: AreaPlan): { rows: number; cols: number }[] {
  const options: { rows: number; cols: number }[] = [];

  if (plan.kind === "keepPerimeter") {
    const half = (plan.fixed ?? 0) / 2;
    for (let rows = 1; rows * 2 <= half; rows++) options.push({ rows, cols: half - rows });
    return options;
  }

  if (plan.kind === "keepArea") {
    const area = plan.fixed ?? 0;
    for (let rows = 1; rows * rows <= area; rows++) {
      if (area % rows === 0) options.push({ rows, cols: area / rows });
    }
    return options;
  }

  return options;
}

/** その問題で目ざす形。いちばん正方形に近いもの。 */
export function goalShape(plan: AreaPlan): { rows: number; cols: number } {
  const options = shapeOptions(plan);
  return options.reduce((best, o) => (o.cols - o.rows < best.cols - best.rows ? o : best), options[0]);
}

/** いま動かしている値。keepPerimeter なら面積、keepArea ならまわりの長さ。 */
export const movingValueOf = (plan: AreaPlan, rows: number, cols: number): number =>
  plan.kind === "keepArea" ? perimeterOf(rows, cols) : areaOf(rows, cols);

export const movingLabelOf = (plan: AreaPlan): string =>
  plan.kind === "keepArea" ? "まわりの長さ" : "面積";

export const movingUnitOf = (plan: AreaPlan): string =>
  plan.kind === "keepArea" ? "cm" : "cm²";

export const fixedLabelOf = (plan: AreaPlan): string =>
  plan.kind === "keepArea" ? "面積" : "まわりの長さ";

export const fixedUnitOf = (plan: AreaPlan): string =>
  plan.kind === "keepArea" ? "cm²" : "cm";
