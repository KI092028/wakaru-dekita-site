import { simplify } from "@/lib/quiz/fraction";
import type { Fraction } from "@/lib/quiz/types";
import {
  equalValue,
  expressionOf,
  flipped,
  show,
  unitLength,
  type FracDivPlan,
} from "./plan";

/**
 * 分数のわり算の、1手ごとの問いと、間違えたときに返す言葉。
 *
 * 手は3つ。
 *
 * 1. `split`  4つに分ける（÷4）→ 1/5m ぶんの量
 * 2. `gather` 5つ集める（×5）→ 1m ぶんの量＝答え
 * 3. `rule`   いまやった2手を、1つの式にまとめると？
 *
 * 3手目が単元の答え。**ひっくり返すのは、この2手をまとめた形でしかない。**
 */

export type FracDivStepKind = "split" | "gather" | "rule";

export const FRACDIV_STEP_KINDS: FracDivStepKind[] = ["split", "gather", "rule"];

export const FRACDIV_STEP_LABEL: Record<FracDivStepKind, string> = {
  split: "分ける（÷）",
  gather: "集める（×）",
  rule: "1つの式に まとめる",
};

export const FRACDIV_STEP_SHORT: Record<FracDivStepKind, string> = {
  split: "分ける",
  gather: "集める",
  rule: "まとめる",
};

export const FRACDIV_ADVICE_PRIORITY: FracDivStepKind[] = ["rule", "split", "gather"];

export function fracDivPrompt(plan: FracDivPlan, kind: FracDivStepKind): string {
  const c = plan.length.numerator;
  const d = plan.length.denominator;
  switch (kind) {
    case "split":
      return c === 1
        ? `${show(plan.length)}${plan.lengthUnit} は もう 1つ分。${plan.quantity}は そのまま？`
        : `${c}つに 分けると ${show(unitLength(plan))}${plan.lengthUnit}。その ${plan.quantity}は？`;
    case "gather":
      return `${show(unitLength(plan))}${plan.lengthUnit} が ${d}つで 1${plan.lengthUnit}。その ${plan.quantity}は？`;
    case "rule":
      return "いま やった 2つを、1つの 式に まとめると？";
  }
}

/**
 * 1手目。分子を、わる数の分子でわる。
 *
 * **「分母に c をかけた形」は誤答ではない。** a/(b×c) と (a÷c)/b は
 * 同じ値なので、上の「大きさは合っている」で拾われる（約分を求める）。
 * 最初これを別の誤答として書いていたが、通らない枝だった。
 */
export function diagnoseSplit(plan: FracDivPlan, typed: Fraction): string | null {
  const want = plan.unitPart;
  if (typed.denominator === 0) return "分母は 0 に できないよ";
  if (typed.numerator === want.numerator && typed.denominator === want.denominator) return null;

  const c = plan.length.numerator;

  if (equalValue(typed, want)) {
    return `大きさは 合っているよ。約分すると ${show(want)}`;
  }
  // 分母のほうを わってしまった
  if (equalValue(typed, { numerator: plan.total.numerator * c, denominator: plan.total.denominator })) {
    return `かけてしまっているね。${c}つに 分けるのだから、${plan.quantity}も ${c}で わるよ`;
  }
  if (equalValue(typed, plan.answer)) {
    return `それは 1${plan.lengthUnit} ぶんの ${plan.quantity}だね。いま 聞いているのは ${show(unitLength(plan))}${plan.lengthUnit} ぶん。あと1手 前だよ`;
  }
  return `${show(plan.total)} を ${c}つに 分けるので、分子を ${c} で わって ${show(want)}`;
}

/** 2手目。分母ぶん集める。 */
export function diagnoseGather(plan: FracDivPlan, typed: Fraction): string | null {
  const want = plan.answer;
  if (typed.denominator === 0) return "分母は 0 に できないよ";
  if (typed.numerator === want.numerator && typed.denominator === want.denominator) return null;

  const d = plan.length.denominator;

  if (equalValue(typed, want)) return `大きさは 合っているよ。約分すると ${show(want)}`;
  if (equalValue(typed, plan.unitPart)) {
    return `${d}つ 集めるのを わすれているよ。${show(plan.unitPart)} を ${d}倍 する`;
  }
  if (
    equalValue(typed, {
      numerator: plan.unitPart.numerator,
      denominator: plan.unitPart.denominator * d,
    })
  ) {
    return `わってしまっているね。${d}つ 集めるのだから ${d}倍。${show(plan.unitPart)} × ${d} = ${show(want)}`;
  }
  return `${show(plan.unitPart)} を ${d}倍 して ${show(want)}`;
}

/**
 * 3手目の選択肢。**ここが単元の答え。**
 *
 * 「わる数をひっくり返す」と「わられる数をひっくり返す」を並べて出す。
 * どちらをひっくり返すのかは、覚え方だけで済ませていると必ず混ざる。
 */
export type RuleChoice = { id: string; label: string; correct: boolean };

export function ruleChoices(plan: FracDivPlan): RuleChoice[] {
  const right = flipped(plan.length);
  const choices: RuleChoice[] = [
    { id: "flip-divisor", label: `× ${show(right)}`, correct: true },
    { id: "same", label: `× ${show(plan.length)}`, correct: false },
    { id: "flip-dividend", label: `÷ ${show(right)}`, correct: false },
  ];
  return choices.sort(() => Math.random() - 0.5);
}

export function diagnoseRule(plan: FracDivPlan, id: string): string | null {
  if (id === "flip-divisor") return null;

  const c = plan.length.numerator;
  const d = plan.length.denominator;
  const right = show(flipped(plan.length));

  const what = c === 1 ? `そのまま ${d}を かける` : `${c}で わって、${d}を かける`;
  if (id === "same") {
    return `${show(plan.length)} を そのまま かけてしまうと、${d}で わることに なってしまうよ。いま やったのは 「${what}」。式に すると × ${right}`;
  }
  return `わり算の ままだと、また 同じ ところで 止まってしまうね。「${what}」は、まとめて × ${right} と 書ける`;
}

/** できたときの一言。 */
export function conclusionOf(plan: FracDivPlan): string {
  const c = plan.length.numerator;
  const d = plan.length.denominator;
  // 分子が1のときは「1でわる」＝何もしないので、そう言わない
  const what = c === 1 ? `そのまま ${d}を かける` : `${c}で わって ${d}を かける`;
  return (
    `${expressionOf(plan)} は、「${what}」。` +
    `まとめると × ${show(flipped(plan.length))}。` +
    `ひっくり返して かけるのは、この 2手を 1つに した 形なんだね`
  );
}

/** 掛け算に直した式を、実際に計算して確かめられるように。 */
export const byFlipping = (plan: FracDivPlan): Fraction =>
  simplify({
    numerator: plan.total.numerator * plan.length.denominator,
    denominator: plan.total.denominator * plan.length.numerator,
  });

export function fracDivAdviceFor(kind: FracDivStepKind): { text: string } | null {
  switch (kind) {
    case "split":
      return {
        text: "「4つに 分ける」は、分子を 4で わる。分母は そのまま。分母を わると、大きさが 変わってしまうよ。",
      };
    case "gather":
      return {
        text: "「5つ 集める」は 5倍。分子を 5倍 する。分ける（÷）と 集める（×）を 取りちがえないように。",
      };
    case "rule":
      return {
        text: "ひっくり返すのは わる数のほう。÷(4/5) は「4で わって 5を かける」＝ ×(5/4)。理由ごと おぼえると、どちらを ひっくり返すのか 迷わなくなるよ。",
      };
  }
}
