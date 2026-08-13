import { buildColumnPlan, type ColumnPlan } from "@/lib/column/plan";

/**
 * かけ算のひっ算を「部分積ごとの手順」に展開する。
 *
 * たし算・ひき算（lib/column/）は位ごとに1行で進むが、かけ算は
 * **かける数のけたごとに1行（部分積）**ができ、最後にそれを足す。
 * 行の構造が違うので盤も別にしてある。
 *
 * 最後のたし算は、たし算のひっ算をそのまま使う（buildColumnPlan）。
 */

export type MultiplyCell = {
  /** 被乗数の何けた目か（右から0）。あふれたけたは n になる */
  index: number;
  /** この位のかけ算の答え（くり上がりを足す前） */
  product: number;
  /** 右の位から来たくり上がり */
  carryIn: number;
  /** この位に書く数字 */
  digit: number;
  /** 左へ送るくり上がり */
  carryOut: number;
};

export type Partial = {
  /** かける数の何けた目か（0＝一の位）。そのままずらすけた数になる */
  digitIndex: number;
  multiplierDigit: number;
  /** 部分積の値（ずらす前） */
  value: number;
  cells: MultiplyCell[];
};

export type MultiplyPlan = {
  a: number;
  b: number;
  partials: Partial[];
  total: number;
  /** 部分積が2つのときだけ、最後のたし算 */
  sumPlan: ColumnPlan | null;
  /** 盤のけた数 */
  width: number;
  /** かけられる数のけた数。これ以上の index のセルは「あふれたけた」 */
  aWidth: number;
  bWidth: number;
};

const digitAt = (value: number, index: number) => Math.floor(value / 10 ** index) % 10;
const digitCount = (value: number) => String(value).length;

export function buildMultiplyPlan(a: number, b: number): MultiplyPlan {
  const n = digitCount(a);
  const m = digitCount(b);
  const partials: Partial[] = [];

  for (let j = 0; j < m; j++) {
    const multiplierDigit = digitAt(b, j);
    const cells: MultiplyCell[] = [];
    let carry = 0;

    for (let i = 0; i < n; i++) {
      const product = digitAt(a, i) * multiplierDigit;
      const withCarry = product + carry;
      cells.push({
        index: i,
        product,
        carryIn: carry,
        digit: withCarry % 10,
        carryOut: Math.floor(withCarry / 10),
      });
      carry = Math.floor(withCarry / 10);
    }
    // あふれたぶんは、そのまま左のけたに書く
    if (carry > 0) {
      cells.push({ index: n, product: 0, carryIn: carry, digit: carry, carryOut: 0 });
    }

    partials.push({ digitIndex: j, multiplierDigit, value: a * multiplierDigit, cells });
  }

  const total = a * b;
  const sumPlan =
    partials.length === 2
      ? buildColumnPlan(partials[0].value, partials[1].value * 10, "+")
      : null;

  return { a, b, partials, total, sumPlan, width: digitCount(total), aWidth: n, bWidth: m };
}

/** そのセルが、九九ではなく「あふれたくり上がりをそのまま書く」ものか。 */
export function isOverflowCell(plan: MultiplyPlan, cell: MultiplyCell): boolean {
  return cell.index >= plan.aWidth;
}
