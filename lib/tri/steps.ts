import {
  areaOf,
  figureLabel,
  heightIsOutside,
  resultOf,
  segment,
  type Figure,
  type Motion,
  type SegmentName,
} from "./plan";

/**
 * 三角形・平行四辺形の面積の、1手ごとの問いと、間違えたときに返す言葉。
 *
 * 手は3つ。**問題によって使う手がちがう。**
 *
 * - `height` 高さは どれか（辺を押す）
 * - `move`   動かす（スライダーを 動かしきる）
 * - `area`   面積を 打つ
 *
 * 4問目は `height` を使わない。あれは「動かしても 面積は 変わらない」を
 * 見せる問題で、高さをさがす問題ではないから。
 */

export type TriStepKind = "height" | "move" | "area";

export const TRI_STEP_KINDS: TriStepKind[] = ["height", "move", "area"];

export const TRI_STEP_LABEL: Record<TriStepKind, string> = {
  height: "高さをさがす",
  move: "動かして たしかめる",
  area: "面積を もとめる",
};

export const TRI_STEP_SHORT: Record<TriStepKind, string> = {
  height: "高さ",
  move: "動かす",
  area: "面積",
};

/**
 * 助言するとき、先に見たい手の順。
 * 高さを取りちがえていたら、そのあとの計算は全部ずれる。
 */
export const TRI_ADVICE_PRIORITY: TriStepKind[] = ["height", "area", "move"];

/**
 * `move` に誤答の道はない。**動かしきるまで、進むボタンが押せない**ようにしてある。
 * とちゅうで止めることは「まちがい」ではなく、ただ終わっていないだけなので、
 * 回数に数えると、つまずきの記録が意味のない数でにごる。
 */

export function triPrompt(figure: Figure, motion: Motion, kind: TriStepKind): string {
  switch (kind) {
    case "height":
      return "高さは どれ？ 押してみよう";
    case "move":
      return motion === "slide"
        ? "左の はしを 切って、右へ うつしてみよう"
        : motion === "rotate"
          ? "もう1つ 同じ 三角形を 回して つけてみよう"
          : "頂点を 横に 動かしてみよう";
    case "area":
      return `${figureLabel(figure)}の 面積は 何cm²？`;
  }
}

/**
 * 高さを取りちがえたとき。
 *
 * **ななめの辺を選んだ子には、理由まで言う。** ここを直さないと、
 * 6年以降もずっと ななめの辺で計算し続ける。
 */
export function diagnoseHeight(figure: Figure, picked: SegmentName): string | null {
  if (picked === "height") return null;

  const height = segment(figure, "height");
  const slant = segment(figure, "slant");

  if (picked === "slant") {
    const outside = heightIsOutside(figure)
      ? "この 形では、高さは 底辺の 外がわに 出るよ。"
      : "";
    return (
      `それは ななめの 辺（${slant.length}cm）だね。` +
      `高さは、底辺から まっすぐ 上に はかった 長さ。` +
      `ななめの 辺は 高さより 長いので、そのまま 使うと 面積が 大きく 出てしまう。` +
      outside +
      `直角の しるしが ついている ${height.length}cm の ほうだよ`
    );
  }

  return `それは 底辺（${segment(figure, "base").length}cm）だね。高さは、底辺から まっすぐ 上に はかった 長さ`;
}

/**
 * 面積の答えがちがうとき。
 *
 * 誤りの型ごとに、**どこで何を間違えたか**を言う。
 * 「ちがいます」だけでは、次も同じところで止まる。
 */
export function diagnoseArea(figure: Figure, typed: number): string | null {
  const want = areaOf(figure);
  if (typed === want) return null;

  const { base, height } = figure;
  const slant = segment(figure, "slant").length;
  const product = base * height;

  if (figure.kind === "triangle") {
    if (typed === product) {
      return (
        `÷2 を わすれているね。${base} × ${height} = ${product} は、` +
        `2つ 合わせた 平行四辺形の 面積。三角形は その 半分で ${want}cm²`
      );
    }
    if (typed === (base * slant) / 2) {
      return (
        `${slant}cm は ななめの 辺の 長さだね。高さは ${height}cm。` +
        `${base} × ${height} ÷ 2 = ${want}`
      );
    }
    if (typed === base * slant) {
      return `ななめの 辺で 計算して、÷2 も わすれているよ。${base} × ${height} ÷ 2 = ${want}`;
    }
  } else {
    if (typed === product / 2) {
      return (
        `÷2 は いらないよ。切って うつすと 長方形に なるので、` +
        `${base} × ${height} = ${want}。÷2 が いるのは 三角形のほう`
      );
    }
    if (typed === base * slant) {
      return `${slant}cm は ななめの 辺の 長さだね。高さは ${height}cm。${base} × ${height} = ${want}`;
    }
  }

  if (typed === base + height || typed === 2 * (base + height)) {
    return `それは まわりの 長さの 計算だね。面積は 中の 広さ。${formula(figure)} = ${want}`;
  }

  return `${formula(figure)} = ${want} cm² だよ`;
}

/** 「6 × 4 ÷ 2」。答えは入れない。 */
export const formula = (figure: Figure): string =>
  figure.kind === "parallelogram"
    ? `${figure.base} × ${figure.height}`
    : `${figure.base} × ${figure.height} ÷ 2`;

/** 動かし終わったときに出す、この問題で分かること。 */
export function movedNote(figure: Figure, motion: Motion): string {
  const { base, height } = figure;
  switch (motion) {
    case "slide":
      return `たて${height}cm・よこ${base}cm の 長方形に なったね。切って うつしただけなので 面積は 同じ。だから 平行四辺形は 底辺 × 高さ`;
    case "rotate":
      return `同じ 三角形が 2つで、底辺${base}cm・高さ${height}cm の 平行四辺形に なったね。三角形は その 半分`;
    case "apex":
      return `ななめの 辺は のびたり ちぢんだり するのに、面積は ${areaOf(figure)}cm² のまま。ななめの 辺は 面積に かんけいない——だから あれは 高さでは ないんだね`;
  }
}

/** 動かした先が何になるか。ボタンの言葉に使う。 */
export const motionResult = resultOf;

export function triAdviceFor(kind: TriStepKind): { text: string } | null {
  switch (kind) {
    case "height":
      return {
        text: "高さは いつも、底辺から まっすぐ 上に はかった 長さ。ななめの 辺では ないよ。底辺を 決めたら、そこに 直角に 当たる 線をさがそう。",
      };
    case "area":
      return {
        text: "平行四辺形は 底辺 × 高さ、三角形は そこから ÷2。÷2 が つく 理由は「同じ 三角形 2つで 平行四辺形に なる」から。理由ごと おぼえると、逆に つけてしまわないよ。",
      };
    case "move":
      return {
        text: "動かして 形が 変わっても、切って うつしただけなら 面積は 変わらない。公式は、この 動かし方を 短く 書いたもの。",
      };
  }
}
