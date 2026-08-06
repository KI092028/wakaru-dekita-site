/**
 * わり算のひっ算を「手順の列」に展開する。
 *
 * ひっ算は 1問1答ではなく手続きなので、答えだけを持っても意味がない。
 * どの桁で何をするかを段（rung）に分け、1段ずつ たてる→かける→ひく→おろす を踏ませる。
 */

/** わる数が1けたか2けたか。単元が分かれ、記録も別に持つ。 */
export type DivisionLevel = "one-digit" | "two-digit";

export type Rung = {
  /** 商が立つ、被除数の何けた目か（左から0） */
  position: number;
  /** この段で わられる数（例: 128÷4 の1段目なら 12） */
  dividendPart: number;
  /** 立てる商 */
  quotient: number;
  /** 商 × 除数 */
  product: number;
  /** ひいた のこり */
  remainder: number;
  /** つぎに下ろす数字。なければ null（最後の段） */
  bringDownDigit: number | null;
};

export type DivisionPlan = {
  dividend: number;
  divisor: number;
  digits: number[];
  /** 最初の商が立つ位置。128÷4 なら 1（1では割れないので12から） */
  startPosition: number;
  rungs: Rung[];
  quotient: number;
  remainder: number;
};

/** 1桁でわるひっ算の手順を組み立てる。 */
export function buildPlan(dividend: number, divisor: number): DivisionPlan {
  const digits = String(dividend).split("").map(Number);

  // 最初に商が立つ位置。左から桁を足していき、除数以上になったところ
  let startPosition = 0;
  let part = 0;
  while (startPosition < digits.length) {
    part = part * 10 + digits[startPosition];
    if (part >= divisor) break;
    startPosition++;
  }

  // 被除数が除数より小さいと ひっ算にならない。出題側で防ぐが、念のため
  if (startPosition >= digits.length) {
    return {
      dividend,
      divisor,
      digits,
      startPosition: digits.length - 1,
      rungs: [],
      quotient: 0,
      remainder: dividend,
    };
  }

  const rungs: Rung[] = [];
  let carried = part;

  for (let i = startPosition; i < digits.length; i++) {
    if (i > startPosition) carried = rungs[rungs.length - 1].remainder * 10 + digits[i];

    const quotient = Math.floor(carried / divisor);
    const product = quotient * divisor;

    rungs.push({
      position: i,
      dividendPart: carried,
      quotient,
      product,
      remainder: carried - product,
      bringDownDigit: i + 1 < digits.length ? digits[i + 1] : null,
    });
  }

  return {
    dividend,
    divisor,
    digits,
    startPosition,
    rungs,
    quotient: Math.floor(dividend / divisor),
    remainder: dividend % divisor,
  };
}

/** その段で わられる数が、被除数の何けた目から始まるか。ひっ算の桁ぞろえに使う。 */
export function partStartColumn(rung: Rung): number {
  return rung.position - String(rung.dividendPart).length + 1;
}

/**
 * わる数を十の位までのがい数にする（四捨五入）。
 * 2けたでわるときは、この数で仮の商の見当をつける。
 */
export function roundedDivisor(divisor: number): number {
  return Math.round(divisor / 10) * 10;
}

/**
 * がい数で立てた仮の商。商は1けたなので9でとめる。
 *
 * 19 を 20 と見れば仮の商は本当の商より小さめに、
 * 23 を 20 と見れば大きめに出る。ずれたら1つ増減するのがこの単元の山。
 */
export function provisionalQuotient(dividendPart: number, divisor: number): number {
  const rounded = roundedDivisor(divisor);
  if (rounded === 0) return 0;
  return Math.min(9, Math.floor(dividendPart / rounded));
}
