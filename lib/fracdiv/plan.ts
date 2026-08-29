import { simplify } from "@/lib/quiz/fraction";
import type { Fraction } from "@/lib/quiz/types";

/**
 * 分数のわり算（6年）。**なぜ ひっくり返して かけるのか。**
 *
 * ## つまずき
 *
 * 手順は覚えられる。「わる数の 分子と 分母を 入れかえて かける」。
 * だから計算はできる。**なぜそうなるのかを聞かれると、誰も答えられない。**
 *
 * 理由が分からないまま覚えた手順は、
 *
 * - かけ算のときにも ひっくり返してしまう
 * - わられる数のほうを ひっくり返してしまう
 * - 文章題で、わり算だと気づけない
 *
 * という形でこわれる。中学で文字式になると、まとめて分からなくなる。
 *
 * ## 2手に分けると、理由がそのまま見える
 *
 * 「4/5 m の 重さが 6/5 kg。1m では 何kg？」を、こう解く。
 *
 * 1. **4つに分ける** … 4/5m を 4等分すると 1/5m。重さも 4等分（÷4）
 * 2. **5つ 集める** … 1/5m が 5つで 1m。重さも 5倍（×5）
 *
 * つまり **÷(4/5) は、÷4 して ×5**。1つの式にまとめると **×(5/4)**。
 * ひっくり返すのは、この2手をまとめた形でしかない。
 *
 * 子どもがやるのは「4等分する」「5つ集める」だけで、
 * どちらも3年生から知っている操作。**新しいことは何もしていない。**
 *
 * ## 二重数直線に乗せる
 *
 * 上に重さ、下に長さ。0・1/5m・4/5m・1m の4か所に目もりを打つ。
 * 単位量あたりの大きさ（`/learn/per-unit`）と同じ見た目にそろえてあるので、
 * 5年でやったことの続きとして入れる。
 */

export type FracDivPlan = {
  id: string;
  /** 場面の文 */
  story: string;
  stage: string;
  /** 何の量か。「重さ」「ねだん」 */
  quantity: string;
  /** その単位。「kg」「円」 */
  unit: string;
  /** 長さの単位。「m」「L」 */
  lengthUnit: string;
  /** わられる数（その長さぶんの量） */
  total: Fraction;
  /** わる数（長さ）。c/d */
  length: Fraction;
  /** 1つ分（1/d ぶん）の量。＝ total ÷ c */
  unitPart: Fraction;
  /** 1 ぶんの量。＝ unitPart × d。これが答え */
  answer: Fraction;
};

/** 「6/5 ÷ 4/5」 */
export const expressionOf = (plan: FracDivPlan): string =>
  `${show(plan.total)} ÷ ${show(plan.length)}`;

/**
 * 分数の見た目。**分母が 1 のときは 分子だけ**にする。
 * 「× 2/1」は式として読みにくく、子どもには別のものに見える。
 */
export const show = (f: Fraction): string =>
  f.denominator === 1 ? String(f.numerator) : `${f.numerator}/${f.denominator}`;

/** わる数をひっくり返した分数。 */
export const flipped = (f: Fraction): Fraction => ({
  numerator: f.denominator,
  denominator: f.numerator,
});

export const timesInt = (f: Fraction, n: number): Fraction =>
  simplify({ numerator: f.numerator * n, denominator: f.denominator });

export const divideInt = (f: Fraction, n: number): Fraction =>
  simplify({ numerator: f.numerator, denominator: f.denominator * n });

export const equalValue = (a: Fraction, b: Fraction): boolean =>
  a.numerator * b.denominator === b.numerator * a.denominator;

/** 「1/5」。1つ分の長さ */
export const unitLength = (plan: FracDivPlan): Fraction => ({
  numerator: 1,
  denominator: plan.length.denominator,
});

/** まとめの式。「× 5/4」 */
export const ruleOf = (plan: FracDivPlan): string => `× ${show(flipped(plan.length))}`;

/**
 * 2手の説明。
 *
 * わる数の分子が 1 のときは、1手目が「1つに分ける」＝何もしないことになる。
 * そのまま書くと意味の分からない文になるので、言い方を変える。
 */
export const stepWords = (plan: FracDivPlan): { split: string; gather: string } => ({
  split:
    plan.length.numerator === 1
      ? `${show(plan.length)}${plan.lengthUnit} は もう 1つ分。${plan.quantity}は そのまま`
      : `${show(plan.length)}${plan.lengthUnit} を ${plan.length.numerator}つに 分けると ${show(
          unitLength(plan)
        )}${plan.lengthUnit}`,
  gather: `${show(unitLength(plan))}${plan.lengthUnit} が ${plan.length.denominator}つで 1${plan.lengthUnit}`,
});
