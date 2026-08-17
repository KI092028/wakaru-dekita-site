import { expression, type SakuraPlan } from "./plan";

/**
 * さくらんぼ計算の1手ごとの問いと、間違えたときに返す言葉。
 *
 * たし算とひき算で通る手がちがう。どちらも3つ。
 *
 * - たし算：`need`（あといくつで10）→ `rest`（のこりはいくつ）→ `sumUp`（答え）
 * - ひき算：`ones`（10といくつ）→ `fromTen`（10からひく）→ `sumDown`（答え）
 *
 * 手を6つに分けているのは、**たし算とひき算のどちらでつまずいたのかを
 * 分けたい**から。くり上がりはできるがくり下がりはできない、が普通に起きる。
 */

export type SakuraStepKind = "need" | "rest" | "sumUp" | "ones" | "fromTen" | "sumDown";

export const SAKURA_STEP_KINDS: SakuraStepKind[] = [
  "need",
  "rest",
  "sumUp",
  "ones",
  "fromTen",
  "sumDown",
];

export const SAKURA_STEP_LABEL: Record<SakuraStepKind, string> = {
  need: "あといくつで10（たし算）",
  rest: "のこりを分ける（たし算）",
  sumUp: "10とあわせる（たし算）",
  ones: "10といくつに分ける（ひき算）",
  fromTen: "10からひく（ひき算）",
  sumDown: "あわせる（ひき算）",
};

export const SAKURA_STEP_SHORT: Record<SakuraStepKind, string> = {
  need: "あといくつ",
  rest: "のこり",
  sumUp: "こたえ",
  ones: "10といくつ",
  fromTen: "10からひく",
  sumDown: "こたえ",
};

/** 10 を作る手を先に見る。そこが出ないと、その先はどうにもならない。 */
export const SAKURA_ADVICE_PRIORITY: SakuraStepKind[] = [
  "need",
  "fromTen",
  "ones",
  "rest",
  "sumUp",
  "sumDown",
];

export const stepsFor = (plan: SakuraPlan): SakuraStepKind[] =>
  plan.kind === "add" ? ["need", "rest", "sumUp"] : ["ones", "fromTen", "sumDown"];

export function sakuraPrompt(plan: SakuraPlan, kind: SakuraStepKind): string {
  switch (kind) {
    case "need":
      return `${plan.a} は、あと いくつで 10 に なる？`;
    case "rest":
      return `${plan.b} を ${plan.left} と いくつに 分ける？`;
    case "sumUp":
      return `10 と ${plan.right} で いくつ？`;
    case "ones":
      return `${plan.a} は、10 と いくつ？`;
    case "fromTen":
      return `10 から ${plan.b} を ひくと いくつ？`;
    case "sumDown":
      return `${plan.fromTen} と ${plan.right} で いくつ？`;
  }
}

export function answerOf(plan: SakuraPlan, kind: SakuraStepKind): number {
  switch (kind) {
    case "need":
      return plan.left;
    case "rest":
      return plan.right;
    case "sumUp":
    case "sumDown":
      return plan.answer;
    case "ones":
      return plan.right;
    case "fromTen":
      return plan.fromTen;
  }
}

export function diagnose(plan: SakuraPlan, kind: SakuraStepKind, typed: number): string | null {
  const want = answerOf(plan, kind);
  if (typed === want) return null;

  switch (kind) {
    case "need":
      if (typed === 10 - plan.left) {
        return `それは ${plan.a} と 同じ 数だね。聞いているのは、${plan.a} に あと いくつ たすと 10 に なるか。${plan.a} + ${want} = 10`;
      }
      if (typed + plan.a > 10) {
        return `${plan.a} と ${typed} で ${plan.a + typed}。10 より 大きく なってしまうよ。${want} だね`;
      }
      return `${plan.a} と ${typed} で ${plan.a + typed}。まだ 10 に とどかないよ。${plan.a} + ${want} = 10`;

    case "rest":
      if (typed === plan.b) {
        return `${plan.b} ぜんぶ では ないよ。${plan.left} を つかったので、のこりは ${plan.b} − ${plan.left} = ${want}`;
      }
      return `${plan.left} と ${typed} で ${plan.left + typed}。${plan.b} に なるように 分けるので、のこりは ${want}`;

    case "ones":
      if (typed === 10) {
        return `10 の ほうでは なくて、のこりの ほうだよ。${plan.a} は 10 と ${want}`;
      }
      return `${plan.a} は 10 と ${want}。一の位の 数を 見よう`;

    case "fromTen":
      if (typed === plan.b - (10 - plan.b)) {
        return `ひく 向きが 逆かも。10 から ${plan.b} を ひくよ。10 − ${plan.b} = ${want}`;
      }
      return `10 − ${plan.b} = ${want} だね。10 の まとまりから ひくよ`;

    case "sumUp":
      if (typed === plan.right) {
        return `10 を たし忘れているよ。10 と ${plan.right} で ${want}`;
      }
      if (typed === plan.a + plan.b - 10 || typed === plan.answer - 10) {
        return `十の位の 1 が ぬけているよ。10 と ${plan.right} で ${want}`;
      }
      return `10 と ${plan.right} で ${want}。${expression(plan)} = ${want}`;

    case "sumDown":
      if (typed === plan.fromTen || typed === plan.right) {
        return `かたほうだけ だね。${plan.fromTen} と ${plan.right} を あわせるよ。${want}`;
      }
      return `${plan.fromTen} + ${plan.right} = ${want}。${expression(plan)} = ${want}`;
  }
}

export function sakuraAdviceFor(kind: SakuraStepKind): { text: string } | null {
  switch (kind) {
    case "need":
      return {
        text: "10 の なかまを 覚えておくと 速いよ。1と9、2と8、3と7、4と6、5と5。ここが 出れば くり上がりは できる。",
      };
    case "rest":
      return { text: "分けるのは 後ろの 数。使ったぶんを ひいた のこりが、10 に たす 数だよ。" };
    case "ones":
      return { text: "ひき算では 前の 数を 10 と いくつに 分ける。一の位の 数が そのまま のこりだよ。" };
    case "fromTen":
      return {
        text: "10 から ひくのが かなめ。10 の なかま（1と9、2と8…）を 覚えておくと、ここも 速くなるよ。",
      };
    case "sumUp":
      return { text: "さいごに 10 を たすのを 忘れずに。十の位の 1 が そこから 出てくるよ。" };
    case "sumDown":
      return { text: "10 から ひいた 数と、のこしておいた 数。ふたつを あわせて 答えだよ。" };
  }
}
