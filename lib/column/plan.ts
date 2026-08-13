/**
 * 列のひっ算（たし算・ひき算）を「位ごとの手順」に展開する。
 *
 * わり算のひっ算（lib/division/）は「段」で進むが、こちらは
 * **位ごとに右から左へ**進む。構造が違うので型を共有していない。
 * 共有しているのは、キーパッド・誤答時の流れ・つまずきの記録の仕組み。
 */

export type ColumnOp = "+" | "−";

export type Column = {
  /** 位。右から0 */
  index: number;
  /** 上の数のこの位（書かれている数字。借りる前の値） */
  top: number;
  /** 下の数のこの位 */
  bottom: number;
  /** この位に書く答えの数字 */
  answer: number;
  /** たし算: 右から来たくり上がり */
  carryIn: 0 | 1;
  /** たし算: 左へ送るくり上がり */
  carryOut: 0 | 1;
  /** ひき算: この位を計算するために 左から借りるか */
  borrows: boolean;
  /** ひき算: 右の位に貸したので、自分が1減っているか */
  lent: boolean;
};

export type ColumnPlan = {
  a: number;
  b: number;
  op: ColumnOp;
  answer: number;
  /** 右から0 の順に並ぶ */
  columns: Column[];
  /** 盤面のけた数 */
  width: number;
  /** 上下の数のけた数。ここを超える位は「くり上がりで増えたけた」 */
  operandWidth: number;
};

/** 右から index けた目の数字。無ければ 0。 */
function digitAt(value: number, index: number): number {
  return Math.floor(value / 10 ** index) % 10;
}

function digitCount(value: number): number {
  return String(Math.abs(value)).length;
}

export function buildColumnPlan(a: number, b: number, op: ColumnOp): ColumnPlan {
  const answer = op === "+" ? a + b : a - b;
  const operandWidth = Math.max(digitCount(a), digitCount(b));
  const width = Math.max(operandWidth, digitCount(answer));
  const columns: Column[] = [];

  if (op === "+") {
    let carry: 0 | 1 = 0;
    for (let i = 0; i < width; i++) {
      const top = digitAt(a, i);
      const bottom = digitAt(b, i);
      // 型注釈がないと carry との相互参照で推論が回らない
      const sum: number = top + bottom + carry;
      const carryOut: 0 | 1 = sum >= 10 ? 1 : 0;
      columns.push({
        index: i,
        top,
        bottom,
        answer: sum % 10,
        carryIn: carry,
        carryOut,
        borrows: false,
        lent: false,
      });
      carry = carryOut;
    }
  } else {
    // 右の位に貸したかどうか。i 番目の位が貸したら lent[i] が true になる
    const lent: boolean[] = [];
    for (let i = 0; i < width; i++) {
      const top = digitAt(a, i);
      const bottom = digitAt(b, i);
      let effective = top - (lent[i] ? 1 : 0);
      let borrows = false;
      if (effective < bottom) {
        borrows = true;
        effective += 10;
        lent[i + 1] = true;
      }
      columns.push({
        index: i,
        top,
        bottom,
        answer: effective - bottom,
        carryIn: 0,
        carryOut: 0,
        borrows,
        lent: lent[i] === true,
      });
    }
  }

  return { a, b, op, answer, columns, width, operandWidth };
}

/** 借りたあとに、左どなりの位へ書き直す数。 */
export function borrowedValue(plan: ColumnPlan, index: number): number {
  return plan.columns[index + 1].top - 1;
}
