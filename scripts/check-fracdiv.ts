/**
 * 分数のわり算の、出題と判定を検査する。
 *
 *   npx tsx@4 --tsconfig tsconfig.json scripts/check-fracdiv.ts
 */

import { generateFracDivPlans } from "../lib/fracdiv/generate";
import { equalValue, flipped, show } from "../lib/fracdiv/plan";
import {
  byFlipping,
  diagnoseGather,
  diagnoseRule,
  diagnoseSplit,
  ruleChoices,
} from "../lib/fracdiv/steps";
import { gcd } from "../lib/quiz/fraction";

const SETS = 500;
const problems: string[] = [];
const fail = (message: string) => problems.push(message);

const reduced = (f: { numerator: number; denominator: number }) =>
  gcd(f.numerator, f.denominator) === 1;

for (let s = 0; s < SETS; s++) {
  const plans = generateFracDivPlans();

  if (plans.length !== 4) fail(`問題数が ${plans.length}`);
  // 3問目は わる数が1より大きい（「分数でわると必ず大きくなる」を作らない）
  const third = plans[2].length;
  if (third.numerator / third.denominator <= 1) fail("3問目のわる数が1以下");
  // 4問目は わる数の分子が1（÷(1/3) が ×3 になる形）
  if (plans[3].length.numerator !== 1) fail("4問目のわる数の分子が1でない");
  for (const i of [0, 1]) {
    const l = plans[i].length;
    if (l.numerator / l.denominator >= 1) fail(`${i + 1}問目のわる数が1以上`);
  }
  if (
    plans[0].total.numerator === plans[1].total.numerator &&
    plans[0].length.numerator === plans[1].length.numerator &&
    plans[0].total.denominator === plans[1].total.denominator
  ) {
    fail("1問目と2問目が同じ数");
  }

  for (const plan of plans) {
    const { total, length, unitPart, answer } = plan;

    // 1手目が「分子をわる」で済むこと（約分の話が割り込まないように）
    if (total.numerator % length.numerator !== 0) {
      fail(`分子がわりきれない: ${total.numerator} ÷ ${length.numerator}`);
    }
    // 約分し終えた形で持っているか
    if (!reduced(total)) fail(`わられる数が既約でない: ${total.numerator}/${total.denominator}`);
    if (!reduced(length)) fail("わる数が既約でない");
    if (!reduced(unitPart)) fail(`1つ分が既約でない: ${unitPart.numerator}/${unitPart.denominator}`);
    if (!reduced(answer)) fail(`答えが既約でない: ${answer.numerator}/${answer.denominator}`);
    if (length.denominator > 9 || total.denominator > 9) fail("分母が大きすぎる（数直線が読めない）");
    // 答えを分数の2枠に打ってもらうので、2 を「2/1」と打たせることにならないように
    if (answer.denominator === 1) fail(`答えが整数になる: ${answer.numerator}`);
    if (unitPart.denominator === 1) fail(`1つ分が整数になる: ${unitPart.numerator}`);

    // **2手（÷c → ×d）の答えが、ひっくり返してかけた答えと一致すること。**
    // ここがこの単元の主張そのものなので、別々に計算して突き合わせる
    const flipAnswer = byFlipping(plan);
    if (!equalValue(answer, flipAnswer)) {
      fail(`2手の答えと ひっくり返した答えが ちがう: ${answer.numerator}/${answer.denominator}`);
    }
    // 実数でも合っているか
    const real = total.numerator / total.denominator / (length.numerator / length.denominator);
    if (Math.abs(answer.numerator / answer.denominator - real) > 1e-9) fail("答えが実際とちがう");
    // 1つ分 × 分母 = 答え
    if (!equalValue({ numerator: unitPart.numerator * length.denominator, denominator: unitPart.denominator }, answer)) {
      fail("1つ分から答えにならない");
    }

    // 1手目の判定
    if (diagnoseSplit(plan, unitPart) !== null) fail("正しい1つ分がはじかれた");
    if (diagnoseSplit(plan, { numerator: 1, denominator: 0 }) === null) fail("分母0が通った");
    // 約分前の形は「大きさは合っている」と返す。
    // 分母に c をかけた形（a/(b*c)）もここに入る。分子を c でわったのと同じ値なので
    const notReduced = { numerator: unitPart.numerator * 2, denominator: unitPart.denominator * 2 };
    const said = diagnoseSplit(plan, notReduced);
    if (said === null) fail("約分前の形が通った");
    else if (!said.includes("約分")) fail("約分と言っていない");

    // 2手目の判定
    if (diagnoseGather(plan, answer) !== null) fail("正しい答えがはじかれた");
    if (length.denominator > 1 && !equalValue(unitPart, answer)) {
      const forgot = diagnoseGather(plan, unitPart);
      if (forgot === null || !forgot.includes("集める")) fail("集め忘れを名指ししていない");
    }

    // 総当たり（分子・分母 1〜24）
    for (let n = 1; n <= 24; n++) {
      for (let d = 1; d <= 24; d++) {
        const typed = { numerator: n, denominator: d };
        if (!(n === unitPart.numerator && d === unitPart.denominator)) {
          if (diagnoseSplit(plan, typed) === null) fail(`split ${n}/${d} が正解になった`);
        }
        if (!(n === answer.numerator && d === answer.denominator)) {
          if (diagnoseGather(plan, typed) === null) fail(`gather ${n}/${d} が正解になった`);
        }
      }
    }

    // 3手目：まとめの式
    const choices = ruleChoices(plan);
    if (choices.length !== 3) fail("選択肢が3つでない");
    if (choices.filter((c) => c.correct).length !== 1) fail("正解が1つでない");
    const right = flipped(length);
    // 分母が1のときは「× 2/1」ではなく「× 2」と出ること
    if (right.denominator === 1 && show(right).includes("/")) fail("分母1が 2/1 と出ている");
    const correct = choices.find((c) => c.correct)!;
    if (correct.label !== `× ${show(right)}`) fail("正解の式がちがう");
    // 選択肢の見た目が重ならないこと（同じ表示が2つあると選べない）
    if (new Set(choices.map((c) => c.label)).size !== 3) {
      fail(`選択肢が重なっている: ${choices.map((c) => c.label).join(" / ")}`);
    }
    if (diagnoseRule(plan, "flip-divisor") !== null) fail("正しい式がはじかれた");
    for (const id of ["same", "flip-dividend"]) {
      if (diagnoseRule(plan, id) === null) fail(`${id} が正解になった`);
    }
  }
}

if (problems.length === 0) {
  console.log(`OK: ${SETS} セット / ${SETS * 4} 問 をすべて確認`);
} else {
  const seen = new Map<string, number>();
  for (const p of problems) seen.set(p, (seen.get(p) ?? 0) + 1);
  console.log(`NG: ${problems.length} 件`);
  for (const [message, n] of [...seen].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.log(`  ${n} 回  ${message}`);
  }
  process.exit(1);
}
