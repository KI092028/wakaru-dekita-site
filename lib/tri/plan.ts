/**
 * 三角形・平行四辺形の面積（5年）。
 *
 * ## つまずきは2つ。どちらも公式では直らない
 *
 * 1. **なぜ ÷2 なのか分からない。** だから三角形でも忘れ、
 *    平行四辺形では要らないのに付けてしまう
 * 2. **高さがどこか分からない。** ななめの辺を高さにして計算する。
 *    とくに、高さが底辺の外に出る三角形で必ず止まる
 *
 * 公式を書かせても直らないのは、公式が**動かした結果**だから。
 * 動かすところを飛ばして結果だけ渡している。
 *
 * ## 動かす順にこだわる
 *
 * - 平行四辺形 … 左のはしを 切って 右へ うつすと **長方形**。だから 底辺 × 高さ
 * - 三角形     … 同じものを もう1つ 回して つけると **平行四辺形**。だから その 半分
 *
 * 三角形の ÷2 は、平行四辺形が 底辺 × 高さ だと分かってはじめて意味を持つ。
 * **平行四辺形を先にやる。** 逆順にすると、÷2 が宙に浮く。
 *
 * ## ななめの辺は、長くなっても面積を変えない
 *
 * 最後の問題では、底辺と高さをそのままに**頂点だけを横へ動かす。**
 * ななめの辺はどんどん長くなるのに、面積は動かない。
 * 「ななめの辺は面積に関係ない」＝「あれは高さではない」を、
 * 言葉ではなく目で見せる。
 *
 * ## 数の選び方
 *
 * ななめの辺が **5cm**（3-4-5）になる形だけを使う。
 * こうすると「底辺 × 5 ÷ 2」という誤答が整数で出るので、
 * **その数を打った子に「5cm は ななめの 辺だね」と名指しで返せる。**
 * 辺の長さが半端だと、この誤答をつかまえられない。
 */

/** 方眼の1マスが表す長さ。 */
export const CELL_CM = 1;

export type Figure =
  | {
      kind: "parallelogram";
      /** 底辺（下の辺）のマス数 */
      base: number;
      /** 高さのマス数 */
      height: number;
      /** 上の辺が右にずれている量。0 なら長方形 */
      offset: number;
    }
  | {
      kind: "triangle";
      base: number;
      height: number;
      /** 頂点の横の位置。0〜base の外なら、高さが底辺の外に出る */
      apex: number;
    };

export type Point = { x: number; y: number };

/**
 * 図形の頂点。**底辺は下（y = height）に置く。**
 * SVG に合わせて y は下向き。
 */
export function verticesOf(figure: Figure): Point[] {
  const { base, height } = figure;
  if (figure.kind === "parallelogram") {
    const d = figure.offset;
    return [
      { x: 0, y: height },
      { x: base, y: height },
      { x: d + base, y: 0 },
      { x: d, y: 0 },
    ];
  }
  return [
    { x: 0, y: height },
    { x: base, y: height },
    { x: figure.apex, y: 0 },
  ];
}

/** 高さの足（底辺の線の上で、高さが下りてくる場所）。 */
export const footOf = (figure: Figure): number =>
  figure.kind === "parallelogram" ? figure.offset : figure.apex;

/** 高さの足が底辺の外に出ているか。**ここが5年でいちばん止まるところ。** */
export const heightIsOutside = (figure: Figure): boolean => {
  const foot = footOf(figure);
  return foot < 0 || foot > figure.base;
};

export const areaOf = (figure: Figure): number =>
  figure.kind === "parallelogram"
    ? figure.base * figure.height
    : (figure.base * figure.height) / 2;

/** 図形をぜんぶ入れるのに要る枠。 */
export function frameOf(figure: Figure): { cols: number; rows: number } {
  const xs = verticesOf(figure).map((p) => p.x);
  return { cols: Math.max(...xs, figure.base), rows: figure.height };
}

export type SegmentName = "base" | "height" | "slant";

export type Segment = {
  name: SegmentName;
  from: Point;
  to: Point;
  /** 長さ（cm）。ななめの辺は 5 になるようにしてある */
  length: number;
  label: string;
};

const lengthOf = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);

/**
 * 高さをさがす手で押せるようにする、3本の辺。
 *
 * **ななめの辺を必ず入れる。** これを選ぶのが、この単元でいちばん多い誤り。
 * 選択肢に無ければ、間違えようがない代わりに、直しようもない。
 */
export function segmentsOf(figure: Figure): Segment[] {
  const { base, height } = figure;
  const foot = footOf(figure);
  const vertices = verticesOf(figure);

  // ななめの辺は、長さが 5 になるほうを選ぶ（誤答を名指しできるようにするため）
  const candidates: [Point, Point][] =
    figure.kind === "parallelogram"
      ? [[vertices[0], vertices[3]]]
      : [
          [vertices[0], vertices[2]],
          [vertices[1], vertices[2]],
        ];
  const slant =
    candidates.find(([a, b]) => Math.abs(lengthOf(a, b) - 5) < 1e-9) ?? candidates[0];

  return [
    {
      name: "base",
      from: { x: 0, y: height },
      to: { x: base, y: height },
      length: base,
      label: "底辺",
    },
    {
      name: "height",
      from: { x: foot, y: 0 },
      to: { x: foot, y: height },
      length: height,
      label: "高さ",
    },
    {
      name: "slant",
      from: slant[0],
      to: slant[1],
      length: Math.round(lengthOf(slant[0], slant[1]) * 10) / 10,
      label: "ななめの辺",
    },
  ];
}

export const segment = (figure: Figure, name: SegmentName): Segment =>
  segmentsOf(figure).find((s) => s.name === name)!;

/**
 * 左のななめの辺の長さ。頂点を右へ動かすほど、まっすぐ長くなる。
 *
 * 頂点を動かす問題で、**この数だけが動いて面積は動かない**ことを
 * 見せるのに使う。小数第1位まで。
 */
export const leftSideLength = (figure: Figure): number => {
  const apex = figure.kind === "triangle" ? figure.apex : figure.offset;
  return Math.round(Math.hypot(apex, figure.height) * 10) / 10;
};

/** 「底辺6cm・高さ4cm」 */
export const sizeLabel = (figure: Figure): string =>
  `底辺${figure.base}cm・高さ${figure.height}cm`;

export const figureLabel = (figure: Figure): string =>
  figure.kind === "parallelogram" ? "平行四辺形" : "三角形";

/**
 * 動かし方。
 *
 * - slide  … 平行四辺形の左はしを切って、右へうつす → 長方形
 * - rotate … 三角形を もう1つ 180度 回してつける → 平行四辺形
 * - apex   … 頂点だけを 横へ 動かす（面積は 変わらない）
 */
export type Motion = "slide" | "rotate" | "apex";

/** 動かしたあと、何になるか。 */
export const resultOf = (motion: Motion): string =>
  motion === "slide" ? "長方形" : motion === "rotate" ? "平行四辺形" : "同じ面積の三角形";
