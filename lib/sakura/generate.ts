import type { SakuraKind, SakuraPlan } from "./plan";

/**
 * さくらんぼ計算の出題。
 *
 * ## 4問の並び
 *
 * たし算2問 → ひき算2問。**混ぜない。**
 * くり下がりはくり上がりより後で習うし、途中で向きが変わると
 * 「どちらの数を分けるのか」が余計に混乱する。
 *
 * ## くり上がり・くり下がりが必ず起きる数だけを使う
 *
 * 8+1 のような、分ける必要のない問題を混ぜない。
 * ここで練習するのは10のまとまりを作る手なので、
 * 作らなくても解ける問題は練習にならない。
 */

export const SAKURA_PROBLEM_COUNT = 4;

export const SAKURA_STORAGE_KEY = "wakaru-dekita:carry:v1";

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

function buildAdd(index: number): SakuraPlan {
  // 前の数は 5〜9。あと少しで10になる数にする
  const a = randInt(5, 9);
  const left = 10 - a;
  // 後ろの数は left より大きく（そうしないと くり上がらない）、9まで
  const b = randInt(left + 1, 9);
  const right = b - left;

  return {
    id: `sakura-${index}`,
    kind: "add",
    a,
    b,
    answer: a + b,
    left,
    right,
    fromTen: 0,
    stage: "くり上がりのある たし算",
  };
}

function buildSub(index: number): SakuraPlan {
  // 前の数は 11〜18
  const a = randInt(11, 18);
  const right = a - 10;
  // ひく数は 一の位より大きく（そうしないと くり下がらない）、9まで
  const b = randInt(right + 1, 9);

  return {
    id: `sakura-${index}`,
    kind: "sub",
    a,
    b,
    answer: a - b,
    left: 10,
    right,
    fromTen: 10 - b,
    stage: "くり下がりのある ひき算",
  };
}

const build = (kind: SakuraKind, index: number) =>
  kind === "add" ? buildAdd(index) : buildSub(index);

export function generateSakuraPlans(): SakuraPlan[] {
  return [build("add", 0), build("add", 1), build("sub", 2), build("sub", 3)];
}
