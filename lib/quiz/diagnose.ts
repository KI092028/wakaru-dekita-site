import { isFraction, lcm, valuesEqual } from "./fraction";
import type { Fraction, Question, Value } from "./types";

/**
 * 誤答の「型」を見て、何を間違えたかを言葉にする。
 *
 * 単に正答を見せるだけの答え合わせ（回答ベースCAI）と、誤りの手続きを特定して返す
 * 指導システムとでは効果量が倍以上ちがう、という調査結果（docs/concept-review.md）を
 * 受けたもの。判定できないときは null を返し、正答の提示だけにとどめる。
 *
 * ここに並ぶ誤答は、入力式にする前の「4択の誤選択肢」として持っていた知識を
 * そのまま移したもの。選択肢は消えたが、つまずきの型は残している。
 */

function eq(a: Fraction, b: Fraction): boolean {
  return valuesEqual(a, b);
}

function diagnoseTimesTable(a: number, b: number, typed: number): string | null {
  if (typed === a + b) return "たし算に なっているよ。ここは かけ算だね";

  // 「しちろく」「しちしち」のように、ひとつ となりの段を答えてしまう誤り。
  // 九九は互いに無関係な81個ではなく、となり同士が a だけ離れた並びになっている。
  if (typed === a * (b + 1) || typed === a * (b - 1)) {
    return `おしい！ ${a} のだんの ひとつ となりの こたえだよ`;
  }
  if (typed === (a + 1) * b || typed === (a - 1) * b) {
    return `おしい！ ${b} のだんの ひとつ となりの こたえだよ`;
  }
  return null;
}

function diagnoseAddSub(a: number, op: "+" | "−", b: number, typed: number): string | null {
  const answer = op === "+" ? a + b : a - b;

  if (op === "+" && typed === a - b) return "しるしを 見てみよう。ここは たし算だよ";
  if (op === "−" && typed === a + b) return "しるしを 見てみよう。ここは ひき算だよ";

  const gap = Math.abs(typed - answer);
  if (gap === 10) {
    return op === "+" ? "くり上がりを わすれていないかな" : "くり下がりを わすれていないかな";
  }
  if (gap === 1) return "あと 1 だけ ちがうよ。かぞえまちがいかも";

  return null;
}

function diagnoseFractions(
  a: Fraction,
  op: "+" | "−",
  b: Fraction,
  answer: Fraction,
  typed: Fraction
): string | null {
  // 値としては合っているのに約分が終わっていない（2/4 と 1/2 など）。
  // つまずきの本丸なので、まっさきに見る。
  if (eq(typed, answer)) return "あと ひといき！ その分数は もっと かんたんに できるよ";

  // 分子どうし・分母どうしを そのまま 計算してしまう誤り。
  const naive =
    op === "+"
      ? { numerator: a.numerator + b.numerator, denominator: a.denominator + b.denominator }
      : { numerator: a.numerator - b.numerator, denominator: a.denominator - b.denominator };
  if (naive.denominator !== 0 && eq(typed, naive)) {
    return "ぶんしどうし・ぶんぼどうしを 計算していないかな。さきに つうぶんだよ";
  }

  // 通分はできたのに、分子を同じ数だけ増やし忘れる誤り。
  const common = lcm(a.denominator, b.denominator);
  const halfDone = {
    numerator: op === "+" ? a.numerator + b.numerator : a.numerator - b.numerator,
    denominator: common,
  };
  if (eq(typed, halfDone)) {
    return "つうぶんは できているね。ぶんしにも 同じ数を かけよう";
  }

  // 打たれたままの分母で見る。約分してしまうと 4/6（答え 5/6）のような
  // 「分母は合っているが分子だけ違う」を拾えなくなる。
  if (typed.denominator === answer.denominator) {
    return "ぶんぼは あっているよ。ぶんしを もういちど";
  }
  return null;
}

export function diagnose(question: Question, typed: Value): string | null {
  const { a, op, b, answer } = question;

  if (isFraction(answer)) {
    if (!isFraction(typed) || !isFraction(a) || !isFraction(b) || op === "×") return null;
    if (typed.denominator === 0) return "ぶんぼが 0 の 分数は ないよ";
    return diagnoseFractions(a, op, b, answer, typed);
  }

  if (isFraction(a) || isFraction(b) || isFraction(typed)) return null;

  return op === "×" ? diagnoseTimesTable(a, b, typed) : diagnoseAddSub(a, op, b, typed);
}
