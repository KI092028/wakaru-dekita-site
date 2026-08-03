import { isFraction } from "@/lib/quiz/fraction";
import type { Value } from "@/lib/quiz/types";

/**
 * 整数はそのまま、分数は分子と分母を上下に積んで表示する。
 * 積むと縦に伸びるため、周囲の文字と高さが揃うよう分数だけ少し小さくしている。
 */
export function ValueDisplay({ value }: { value: Value }) {
  if (!isFraction(value)) {
    return <span>{value}</span>;
  }

  return (
    <span className="inline-flex flex-col items-center align-middle text-[0.72em] leading-none">
      <span className="px-[0.15em]">{value.numerator}</span>
      <span className="my-[0.14em] h-[0.09em] w-full rounded-full bg-current" />
      <span className="px-[0.15em]">{value.denominator}</span>
    </span>
  );
}
