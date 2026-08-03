import type { Fraction, Value } from "./types";

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function fraction(numerator: number, denominator: number): Fraction {
  return { numerator, denominator };
}

/** 約分した分数を返す。 */
export function simplify({ numerator, denominator }: Fraction): Fraction {
  const g = gcd(numerator, denominator) || 1;
  return { numerator: numerator / g, denominator: denominator / g };
}

export function addFractions(a: Fraction, b: Fraction): Fraction {
  const d = lcm(a.denominator, b.denominator);
  return simplify({
    numerator: (a.numerator * d) / a.denominator + (b.numerator * d) / b.denominator,
    denominator: d,
  });
}

export function subtractFractions(a: Fraction, b: Fraction): Fraction {
  const d = lcm(a.denominator, b.denominator);
  return simplify({
    numerator: (a.numerator * d) / a.denominator - (b.numerator * d) / b.denominator,
    denominator: d,
  });
}

export function isFraction(value: Value): value is Fraction {
  return typeof value !== "number";
}

/**
 * 値を一意に表す文字列。選択肢の重複判定・正誤判定・Reactのkeyに使う。
 * 分数は約分してから比較するため、2/4 と 1/2 は同じ値とみなされる。
 */
export function valueKey(value: Value): string {
  if (!isFraction(value)) return String(value);
  const { numerator, denominator } = simplify(value);
  return `${numerator}/${denominator}`;
}

export function valuesEqual(a: Value, b: Value): boolean {
  return valueKey(a) === valueKey(b);
}

/** 0 < 分子 < 分母 の真分数か。 */
export function isProperFraction({ numerator, denominator }: Fraction): boolean {
  return numerator > 0 && denominator > 0 && numerator < denominator;
}
