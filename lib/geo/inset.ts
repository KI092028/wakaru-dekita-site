/**
 * 沖縄を別枠に出すための、いちばん大きい島の切り出し。
 *
 * ## なぜ要るか
 *
 * 九州・沖縄に寄ったとき、沖縄をそのまま同じ枠に入れると
 * **枠の 82% が海になり、九州が本来の 42% の大きさでしか描けない**
 * （沖縄こみ 167×237、九州だけ 69×104）。
 *
 * そこで紙の地図と同じように、沖縄を四角い別枠に出す。
 * ところが**沖縄の輪郭ぜんたいを別枠に入れても、こんどは別枠の中が
 * ほとんど海になる。** 沖縄本島は、沖縄の枠の面積の 2% しかない
 * （本島 13.6×17.6 に対し、宮古・八重山まで入れると 125.6×94.3）。
 *
 * **本島だけに寄せると 9.2倍 大きく描ける。** そのぶん、離れた島は
 * 別枠からはみ出して見えなくなる（切り取る）。学校のかけ地図と同じ扱い。
 *
 * ## 島の位置は、地図データから計算する
 *
 * 数を書き写すと、地図のデータが新しくなったときに気づけない。
 * 道すじ（path）をたどって、いちばん点の多いまとまり＝いちばん大きい島を出す。
 * `@svg-maps/japan` の沖縄は `m`（相対の移動）と `z`（閉じる）だけでできている。
 */

export type Box = { x: number; y: number; width: number; height: number };

/**
 * 道すじを島ごとに分けて、それぞれの実際の位置と大きさを出す。
 *
 * 相対座標なので、頭から順にたどらないと実際の位置が分からない
 * （数字だけ拾うと、ぜんぶ「ずれの量」になってしまう）。
 */
export function islandsOf(path: string): (Box & { points: number })[] {
  const out: (Box & { points: number })[] = [];
  const tokens = path.match(/[A-Za-z]|-?\d+(?:\.\d+)?/g) ?? [];

  let cx = 0;
  let cy = 0;
  let xs: number[] = [];
  let ys: number[] = [];

  const close = () => {
    if (xs.length === 0) return;
    out.push({
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
      points: xs.length,
    });
    xs = [];
    ys = [];
  };

  let command = "";
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (/[A-Za-z]/.test(token)) {
      command = token;
      i += 1;
      if (command === "z" || command === "Z") close();
      continue;
    }
    const a = Number(tokens[i]);
    const b = Number(tokens[i + 1]);
    i += 2;

    if (command === "M" || command === "L") {
      if (command === "M") close();
      cx = a;
      cy = b;
      if (command === "M") command = "L";
    } else {
      // 小文字はぜんぶ相対。m のあとは、続きの数が l（線）として扱われる
      if (command === "m") close();
      cx += a;
      cy += b;
      if (command === "m") command = "l";
    }
    xs.push(cx);
    ys.push(cy);
  }
  close();
  return out;
}

/** いちばん点の多いまとまり＝いちばん大きい島。 */
export function largestIsland(path: string): Box {
  const islands = islandsOf(path);
  const biggest = islands.reduce((best, cur) => (cur.points > best.points ? cur : best), islands[0]);
  return { x: biggest.x, y: biggest.y, width: biggest.width, height: biggest.height };
}

/** まわりに余白をとる。島が枠にくっつくと、切れているように見える。 */
export function padBox(box: Box, ratio: number): Box {
  const pad = Math.max(box.width, box.height) * ratio;
  return {
    x: box.x - pad,
    y: box.y - pad,
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  };
}

/**
 * 別枠の置き場所を決める。
 *
 * **左下**に置く。紙の地図と同じで、九州に寄ったときのこの場所は海しかない。
 * 大きさは見えている幅の 34%。これ以上大きくすると九州にかぶり、
 * 小さくすると中の島が見えなくなる。
 */
export function insetPlacement(view: Box, src: Box) {
  const margin = view.width * 0.02;
  const width = view.width * 0.3;
  const s = width / src.width;
  const height = src.height * s;
  const x = view.x + margin;
  const y = view.y + view.height - height - margin;
  return {
    x,
    y,
    width,
    height,
    transform: `translate(${x - src.x * s} ${y - src.y * s}) scale(${s})`,
  };
}

