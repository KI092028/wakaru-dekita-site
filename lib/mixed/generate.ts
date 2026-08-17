import { gcd } from "@/lib/quiz/fraction";
import { improperText, mixedText, type MixedKind, type MixedPlan } from "./plan";

/**
 * 仮分数・帯分数の出題。
 *
 * ## 4問の並び
 *
 * 仮→帯、帯→仮 を交互に2回ずつ。**片方だけを続けない。**
 * 仮分数から帯分数にはできるが逆はできない、ということが普通に起きるので、
 * 両方を毎回通す。
 *
 * ## 帯の本数は3本まで
 *
 * 画面に並べる帯が増えると、1本あたりが細くなって
 * 分けめが読めなくなる。整数部分は 1〜2 に限る。
 */

export const MIXED_PROBLEM_COUNT = 4;

export const MIXED_STORAGE_KEY = "wakaru-dekita:mixed:v1";

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/** 分母。2は帯が粗すぎ、7以上は分けめが細かすぎる */
const DENOMINATORS = [3, 4, 5, 6];

function build(kind: MixedKind, index: number): MixedPlan {
  const denominator = DENOMINATORS[randInt(0, DENOMINATORS.length - 1)];
  const whole = randInt(1, 2);

  // 分子は 1 以上・分母未満。0 にすると帯分数にならない。
  // **約分できる組は使わない。** 1と2/4 のような形は教科書に出てこないし、
  // 仮分数にしたときの 6/4 も約分し残しになる（→ design-guidelines.md 1.4）
  const candidates = Array.from({ length: denominator - 1 }, (_, i) => i + 1).filter(
    (numerator) => gcd(numerator, denominator) === 1
  );
  const fractionNumerator = candidates[randInt(0, candidates.length - 1)];
  const improperNumerator = whole * denominator + fractionNumerator;

  const plan: MixedPlan = {
    id: `mixed-${index}`,
    kind,
    denominator,
    improperNumerator,
    whole,
    fractionNumerator,
    question: "",
    stage: kind === "toMixed" ? "仮分数 → 帯分数" : "帯分数 → 仮分数",
  };

  plan.question =
    kind === "toMixed"
      ? `${improperText(plan)} を 帯分数に しよう`
      : `${mixedText(plan)} を 仮分数に しよう`;

  return plan;
}

export function generateMixedPlans(): MixedPlan[] {
  return [
    build("toMixed", 0),
    build("toImproper", 1),
    build("toMixed", 2),
    build("toImproper", 3),
  ];
}
