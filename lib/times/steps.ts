import { asAddition, expressionOf, verbAttributive, type TimesPlan } from "./plan";

/**
 * かけ算の意味の1手ごとの問いと、間違えたときに返す言葉。
 *
 * 手は3つ。**答えを最後に置く。**
 * 先に「ぜんぶでいくつ」を聞くと、数えて出せてしまい、
 * かけ算を使わずに終わってしまう。
 */

export type TimesStepKind = "per" | "groups" | "total";

export const TIMES_STEP_KINDS: TimesStepKind[] = ["per", "groups", "total"];

export const TIMES_STEP_LABEL: Record<TimesStepKind, string> = {
  per: "1つ分をさがす",
  groups: "いくつ分をさがす",
  total: "ぜんぶでいくつ",
};

export const TIMES_STEP_SHORT: Record<TimesStepKind, string> = {
  per: "1つ分",
  groups: "いくつ分",
  total: "ぜんぶで",
};

/** 1つ分をとりちがえていれば、その先は全部ずれる。 */
export const TIMES_ADVICE_PRIORITY: TimesStepKind[] = ["per", "groups", "total"];

export function timesPrompt(plan: TimesPlan, kind: TimesStepKind): string {
  const { container, item, containerUnit } = plan.scene;
  switch (kind) {
    case "per":
      return `${container} 1${containerUnit}に、${item}は いくつ？`;
    case "groups":
      return `${container}は いくつ ある？`;
    case "total":
      return `${item}は ぜんぶで いくつ？`;
  }
}

export function answerOf(plan: TimesPlan, kind: TimesStepKind): number {
  switch (kind) {
    case "per":
      return plan.per;
    case "groups":
      return plan.groups;
    case "total":
      return plan.answer;
  }
}

export function diagnose(plan: TimesPlan, kind: TimesStepKind, typed: number): string | null {
  const want = answerOf(plan, kind);
  if (typed === want) return null;

  const { container, item, containerUnit, itemUnit } = plan.scene;

  switch (kind) {
    case "per":
      if (typed === plan.groups) {
        return `それは ${container}の 数だね。聞いているのは、${container} 1${containerUnit}に ${verbAttributive(plan)} ${item}の 数。${want}${itemUnit} だよ`;
      }
      if (typed === plan.answer) {
        return `それは ぜんぶの 数だね。1${containerUnit}分 だけ 見よう。${want}${itemUnit}`;
      }
      return `${container} 1${containerUnit}を 見ると ${want}${itemUnit} だよ`;

    case "groups":
      if (typed === plan.per) {
        return `それは 1${containerUnit}分の ${item}の 数だね。聞いているのは ${container}の 数。${want}${containerUnit} だよ`;
      }
      return `${container}を 数えると ${want}${containerUnit} だね`;

    case "total":
      // ぜんぶ たしてしまった／数えまちがい
      if (typed === plan.per + plan.groups) {
        return `たし算では ないよ。${plan.per}${itemUnit}が ${plan.groups}${containerUnit}分 あるので、${expressionOf(plan)} = ${want}`;
      }
      if (typed === plan.answer - plan.per || typed === plan.answer + plan.per) {
        return `${containerUnit}の 数が 1つ ずれているかも。${expressionOf(plan)} = ${want}`;
      }
      return `${plan.per}${itemUnit}の ${plan.groups}${containerUnit}分 なので、${expressionOf(plan)} = ${want}。たし算で 書くと ${asAddition(plan)} だね`;
  }
}

export function timesAdviceFor(kind: TimesStepKind): { text: string } | null {
  switch (kind) {
    case "per":
      return {
        text: "「1つ分」は、ひとかたまりの 中の 数。まず 1つだけ 見て 数えると 見つかるよ。",
      };
    case "groups":
      return { text: "「いくつ分」は、かたまりが いくつ あるか。入れものの 数を 数えよう。" };
    case "total":
      return {
        text: "かけ算は「1つ分の数 × いくつ分」。2つの 数が それぞれ 何を 表しているかを 言えると、文しょうだいでも 式が 作れるよ。",
      };
  }
}
