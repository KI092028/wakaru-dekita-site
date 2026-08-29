import { expressionOf, meaningOf, round1, type DecimalPlan } from "./plan";

/**
 * 小数のかけ算・わり算の、1手ごとの問いと、間違えたときに返す言葉。
 *
 * 手は2つ。**向きを先、計算をあと。**
 *
 * 1. `direction` 答えは もとの数より 大きい？ 小さい？
 * 2. `compute`   計算して 打つ
 *
 * 逆にすると、思い込みが表に出てこないまま素通りする。
 */

export type DecimalStepKind = "direction" | "compute";

export const DECIMAL_STEP_KINDS: DecimalStepKind[] = ["direction", "compute"];

export const DECIMAL_STEP_LABEL: Record<DecimalStepKind, string> = {
  direction: "大きくなるか、小さくなるか",
  compute: "計算する",
};

export const DECIMAL_STEP_SHORT: Record<DecimalStepKind, string> = {
  direction: "どっち",
  compute: "計算",
};

/** 向きを外していたら、計算が合っていても意味が分かっていない。 */
export const DECIMAL_ADVICE_PRIORITY: DecimalStepKind[] = ["direction", "compute"];

export function decimalPrompt(plan: DecimalPlan, kind: DecimalStepKind): string {
  return kind === "direction"
    ? `答えは ${plan.base} より 大きい？ 小さい？`
    : `${expressionOf(plan)} は いくつ？`;
}

/**
 * 向きを外したとき。
 *
 * **「かけたら大きくなる」という思い込みを、そのまま名前で呼ぶ。**
 * 「ちがいます」だけでは、次も同じところで止まる。
 */
export function diagnoseDirection(plan: DecimalPlan, saidBigger: boolean): string | null {
  if (saidBigger === plan.bigger) return null;

  const belief =
    plan.op === "×"
      ? "かけたら 大きくなる、と おもったかな。"
      : "わったら 小さくなる、と おもったかな。";

  const key =
    plan.op === "×"
      ? `かける数の ${plan.factor} は 1より ${plan.factor < 1 ? "小さい" : "大きい"}`
      : `わる数の ${plan.factor} は 1より ${plan.factor < 1 ? "小さい" : "大きい"}`;

  return `${belief}それは かける数・わる数が 1より 大きいときの 話。${key}よ。${meaningOf(plan)}`;
}

/**
 * 計算がちがうとき。
 *
 * 小数点の位置ちがいを、いちばん先に拾う。ここが小数の計算でいちばん多い。
 */
export function diagnoseCompute(plan: DecimalPlan, typed: number): string | null {
  const want = plan.answer;
  if (Math.abs(typed - want) < 1e-9) return null;

  for (const scale of [10, 100]) {
    if (Math.abs(typed - round1(want * scale)) < 1e-9) {
      return `小数点の いちが ちがうよ。${scale} 倍に なっている。答えは ${want}`;
    }
    if (Math.abs(typed - round1(want / scale)) < 1e-9) {
      return `小数点の いちが ちがうよ。${scale} 分の1に なっている。答えは ${want}`;
    }
  }

  // かけ算とわり算を取りちがえた形
  const swapped = round1(plan.op === "×" ? plan.base / plan.factor : plan.base * plan.factor);
  if (Math.abs(typed - swapped) < 1e-9) {
    return plan.op === "×"
      ? `わってしまっているね。${expressionOf(plan)} = ${want}`
      : `かけてしまっているね。${expressionOf(plan)} = ${want}`;
  }

  // 向きだけは合っているか
  const rightSide = plan.bigger ? typed > plan.base : typed < plan.base;
  if (!rightSide) {
    return `さっき えらんだ とおり、答えは ${plan.base} より ${plan.bigger ? "大きい" : "小さい"} はず。${expressionOf(plan)} = ${want}`;
  }

  return `${expressionOf(plan)} = ${want} だよ`;
}

export function decimalAdviceFor(kind: DecimalStepKind): { text: string } | null {
  switch (kind) {
    case "direction":
      return {
        text: "分かれ目は 1。かける数が 1より 小さければ 答えは 小さくなり、わる数が 1より 小さければ 答えは 大きくなる。計算する前に、かける数・わる数と 1 を くらべよう。",
      };
    case "compute":
      return {
        text: "小数のかけ算は、小数点が ないものとして 計算してから、小数点を もどす。わり算は、わる数を 整数に なおしてから。答えが 出たら、大きくなる はずだったか 小さくなる はずだったかで たしかめよう。",
      };
  }
}
