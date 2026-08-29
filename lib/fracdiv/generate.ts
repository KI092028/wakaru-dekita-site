import { simplify } from "@/lib/quiz/fraction";
import type { Fraction } from "@/lib/quiz/types";
import type { FracDivPlan } from "./plan";

/**
 * 分数のわり算の出題。
 *
 * ## 4問の並び
 *
 * 1. わる数が 真分数（1より小さい）→ 答えは わられる数より **大きくなる**
 * 2. もう1問、別の場面で
 * 3. わる数が **仮分数**（1より大きい）→ 答えは 小さくなる
 * 4. わる数の 分子が 1（1/3 など）→ **÷(1/3) は ×3**。いちばん はっきりする形
 *
 * 3を入れるのは、「分数でわると 必ず 大きくなる」という
 * 新しい思い込みを作らないため（小数のかけ算・わり算と同じ考え方）。
 * 4を最後に置くのは、ひっくり返す意味が **×3** という形でいちばん見えるから。
 *
 * ## 数の決め方
 *
 * - **わられる数の分子が、わる数の分子で わりきれること。**
 *   1手目（4等分する）が「分子を4でわる」で済み、分母をいじらずに進める。
 *   ここがそろっていないと、理由を見せる前に約分の話が割り込む
 * - 分母は 9 まで。二重数直線の目もりが読める大きさに収まる
 * - 1手目・答えとも、約分し終えた形で持つ
 * - **答えが整数になる組は使わない。** 答えは分数の2枠に打ってもらうので、
 *   2 を「2/1」と打たせることになってしまう
 */

export const FRACDIV_PROBLEM_COUNT = 4;

export const FRACDIV_STORAGE_KEY = "wakaru-dekita:fraction-divide:v1";

type Scene = {
  quantity: string;
  unit: string;
  lengthUnit: string;
  story: (total: string, length: string) => string;
};

const SCENES: Scene[] = [
  {
    quantity: "おもさ",
    unit: "kg",
    lengthUnit: "m",
    story: (t, l) => `はり金 ${l}m の おもさが ${t}kg でした。1m では 何kg？`,
  },
  {
    // ねだんは使わない。**1円より細かいお金は無いので、9/8円 が
    // いきなり作り話になる。** 分数がそのまま出てくる量だけにする
    quantity: "おもさ",
    unit: "kg",
    lengthUnit: "m²",
    story: (t, l) => `板 ${l}m² の おもさが ${t}kg でした。1m² では 何kg？`,
  },
  {
    quantity: "ぬれる ひろさ",
    unit: "m²",
    lengthUnit: "L",
    story: (t, l) => `ペンキ ${l}L で ${t}m² ぬれました。1L では 何m²？`,
  },
];

/**
 * [わられる数, わる数] の組。
 * わられる数の分子が、わる数の分子で わりきれること。
 */
const PROPER: [Fraction, Fraction][] = [
  // わる数が 1より小さい → 答えは大きくなる
  [{ numerator: 6, denominator: 5 }, { numerator: 3, denominator: 4 }], // → 8/5
  [{ numerator: 6, denominator: 7 }, { numerator: 2, denominator: 3 }], // → 9/7
  [{ numerator: 4, denominator: 9 }, { numerator: 2, denominator: 3 }], // → 2/3
  [{ numerator: 9, denominator: 8 }, { numerator: 3, denominator: 4 }], // → 3/2
  [{ numerator: 4, denominator: 7 }, { numerator: 2, denominator: 5 }], // → 10/7
];

/** わる数が 1より大きい（仮分数）→ 答えは小さくなる */
const IMPROPER: [Fraction, Fraction][] = [
  [{ numerator: 9, denominator: 4 }, { numerator: 3, denominator: 2 }], // → 3/2
  [{ numerator: 10, denominator: 7 }, { numerator: 5, denominator: 3 }], // → 6/7
  [{ numerator: 6, denominator: 5 }, { numerator: 3, denominator: 2 }], // → 4/5
];

/** わる数の分子が 1。÷(1/3) が ×3 になる、いちばんはっきりする形 */
const UNIT_FRACTION: [Fraction, Fraction][] = [
  [{ numerator: 2, denominator: 5 }, { numerator: 1, denominator: 3 }], // → 6/5
  [{ numerator: 3, denominator: 4 }, { numerator: 1, denominator: 2 }], // → 3/2
  [{ numerator: 5, denominator: 6 }, { numerator: 1, denominator: 4 }], // → 10/3
  [{ numerator: 3, denominator: 8 }, { numerator: 1, denominator: 5 }], // → 15/8
];

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

function pickTwo<T>(items: T[]): [T, T] {
  const first = Math.floor(Math.random() * items.length);
  let second = Math.floor(Math.random() * (items.length - 1));
  if (second >= first) second += 1;
  return [items[first], items[second]];
}

function build(index: number, pair: [Fraction, Fraction], scene: Scene, stage: string): FracDivPlan {
  const [total, length] = pair;
  // 1手目：長さの分子ぶんに分ける＝量を その数で わる
  const unitPart = simplify({
    numerator: total.numerator / length.numerator,
    denominator: total.denominator,
  });
  // 2手目：分母ぶん 集める
  const answer = simplify({
    numerator: unitPart.numerator * length.denominator,
    denominator: unitPart.denominator,
  });

  return {
    id: `fracdiv-${index}`,
    story: scene.story(`${total.numerator}/${total.denominator}`, `${length.numerator}/${length.denominator}`),
    stage,
    quantity: scene.quantity,
    unit: scene.unit,
    lengthUnit: scene.lengthUnit,
    total,
    length,
    unitPart,
    answer,
  };
}

export function generateFracDivPlans(): FracDivPlan[] {
  const [p1, p2] = pickTwo(PROPER);
  const scenes = [...SCENES].sort(() => Math.random() - 0.5);
  return [
    build(0, p1, scenes[0], "4つに分けて、5つ集める"),
    build(1, p2, scenes[1], "別の場面で もう1回"),
    build(2, pick(IMPROPER), scenes[2], "1より大きい数で わると"),
    build(3, pick(UNIT_FRACTION), scenes[0], "÷(1/3) は ×3"),
  ];
}
