/**
 * 公倍数・公約数の、出題と判定を検査する。
 *
 *   npx tsx@4 --tsconfig tsconfig.json scripts/check-factors.ts
 */

import { generateFactorPlans } from "../lib/factors/generate";
import { BOARD_MAX, commonOf, gcd, lcm, setOf } from "../lib/factors/plan";
import {
  diagnoseDenominator,
  diagnoseMark,
  diagnoseMarkDone,
  diagnosePick,
  diagnoseReduce,
} from "../lib/factors/steps";

const SETS = 500;
const problems: string[] = [];
const fail = (message: string) => problems.push(message);

for (let s = 0; s < SETS; s++) {
  const plans = generateFactorPlans();

  if (plans.length !== 4) fail(`問題数が ${plans.length}`);
  const kinds = plans.map((p) => p.kind).join(",");
  if (kinds !== "multiple,divisor,multiple,divisor") fail(`並びがちがう: ${kinds}`);
  if (plans[0].use !== undefined || plans[1].use !== undefined) fail("前半に つかう手 が付いている");
  if (plans[2].use?.mode !== "denominator") fail("3問目が通分でない");
  // 1問目は、どちらも相手を割り切らない組。
  // 割り切れる組ばかりだと「最小公倍数＝大きいほう」とおぼえてしまう
  if (plans[0].a % plans[0].b === 0 || plans[0].b % plans[0].a === 0) {
    fail(`1問目が割り切れる組: ${plans[0].a},${plans[0].b}`);
  }
  if (plans[3].use?.mode !== "reduce") fail("4問目が約分でない");
  // 1問目と3問目、2問目と4問目で数が変わること（同じ盤を2回やらせない）
  if (plans[0].a === plans[2].a && plans[0].b === plans[2].b) fail("倍数の組が同じ");
  if (plans[1].a === plans[3].a && plans[1].b === plans[3].b) fail("約数の組が同じ");

  for (const plan of plans) {
    const { kind, a, b, max, target } = plan;
    const common = commonOf(kind, a, b, max);

    if (common.length === 0) fail(`重なりが無い: ${kind} ${a},${b}`);
    // 重なりが1つでは「いちばん小さい／大きい」がえらべない
    if (common.length < 2) fail(`重なりが1つしかない: ${kind} ${a},${b}`);
    if (kind === "divisor" && common.length < 2) {
      fail(`公約数が 1 しかない: ${a},${b}`); // 1しか重ならないと約分に使えない
    }
    if (target !== (kind === "multiple" ? common[0] : common[common.length - 1])) {
      fail("さがす数がちがう");
    }
    if (kind === "multiple" && target !== lcm(a, b)) fail("最小公倍数がちがう");
    if (kind === "divisor" && target !== gcd(a, b)) fail("最大公約数がちがう");
    if (a < 4 || b < 4) fail(`数が小さすぎる（しるしが多くなる）: ${a},${b}`);
    if (max !== BOARD_MAX[kind]) fail("盤の大きさがちがう");

    // 並べる手：盤の上のどの数を押しても、正しく判定されるか
    for (const n of [a, b]) {
      const want = setOf(kind, n, max);
      if (want.length === 0) fail(`${n}の${kind}が盤に無い`);
      // 押す数が多すぎると、考える練習ではなく作業になる
      if (want.length > 9) fail(`${n}の${kind}が ${want.length}こ。押す数が多すぎる`);
      for (let x = 1; x <= max; x++) {
        const said = diagnoseMark(plan, n, x);
        if (want.includes(x) !== (said === null)) fail(`${n} の ${x} の判定がちがう`);
      }
      if (diagnoseMarkDone(plan, n, want) !== null) fail("ぜんぶ並べたのに不正解");
      if (want.length > 1 && diagnoseMarkDone(plan, n, want.slice(1)) === null) {
        fail("足りないのに正解になった");
      }
    }

    // えらぶ手
    if (diagnosePick(plan, target) !== null) fail("正解がはじかれた");
    for (let x = 1; x <= max; x++) {
      if (x === target) continue;
      const said = diagnosePick(plan, x);
      if (said === null) fail(`${x} が正解になった（正解は ${target}）`);
      // 重なりの中の数なら「もっと小さい／大きい」、外なら「両方に」と言い分ける
      else if (common.includes(x)) {
        const wants = kind === "multiple" ? "小さい" : "大きい";
        if (!said.includes(wants)) fail(`${x} への言葉がちがう: ${said}`);
      } else if (!said.includes("両方")) fail(`重なりの外なのに 両方 と言っていない: ${said}`);
    }
  }

  // 通分
  const den = plans[2];
  if (den.use?.mode === "denominator") {
    const want = den.use.answer;
    if (want !== lcm(den.a, den.b)) fail("そろえる分母が最小公倍数でない");
    if (diagnoseDenominator(den, want) !== null) fail("正しい分母がはじかれた");
    const product = den.a * den.b;
    if (product !== want) {
      const said = diagnoseDenominator(den, product);
      if (said === null || !said.includes("いちばん 小さい")) {
        fail("分母どうしをかけた誤答を名指ししていない");
      }
    }
    for (let x = 1; x <= 200; x++) {
      if (x === want) continue;
      if (diagnoseDenominator(den, x) === null) fail(`分母 ${x} が正解になった`);
    }
  }

  // 約分
  const red = plans[3];
  if (red.use?.mode === "reduce") {
    const { from, answer } = red.use;
    if (gcd(answer.numerator, answer.denominator) !== 1) fail("約分し切れていない");
    if (answer.numerator * from.denominator !== from.numerator * answer.denominator) {
      fail("約分で大きさが変わっている");
    }
    if (diagnoseReduce(red, answer) !== null) fail("正しい分数がはじかれた");
    // 約分し切れていない形は「まだ わりきれる」と返す
    if (from.numerator !== answer.numerator) {
      const said = diagnoseReduce(red, from);
      if (said === null || !said.includes("まだ")) fail("約分前の形を通してしまった");
    }
    // 分子だけ／分母だけ わった形
    if (red.target > 1) {
      const onlyTop = diagnoseReduce(red, {
        numerator: from.numerator / red.target,
        denominator: from.denominator,
      });
      if (onlyTop === null || !onlyTop.includes("分子だけ")) fail("分子だけ割った誤答を拾えていない");
      const onlyBottom = diagnoseReduce(red, {
        numerator: from.numerator,
        denominator: from.denominator / red.target,
      });
      if (onlyBottom === null || !onlyBottom.includes("分母だけ")) {
        fail("分母だけ割った誤答を拾えていない");
      }
    }
    for (let n = 1; n <= 24; n++) {
      for (let d = 1; d <= 24; d++) {
        if (n === answer.numerator && d === answer.denominator) continue;
        if (diagnoseReduce(red, { numerator: n, denominator: d }) === null) {
          fail(`${n}/${d} が正解になった（正解は ${answer.numerator}/${answer.denominator}）`);
        }
      }
    }
  }
}

if (problems.length === 0) {
  console.log(
    `OK: ${SETS} セット / ${SETS * 4} 問 をすべて確認` +
      `（盤は 倍数 1〜${BOARD_MAX.multiple}、約数 1〜${BOARD_MAX.divisor}）`
  );
} else {
  const seen = new Map<string, number>();
  for (const p of problems) seen.set(p, (seen.get(p) ?? 0) + 1);
  console.log(`NG: ${problems.length} 件`);
  for (const [message, n] of [...seen].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.log(`  ${n} 回  ${message}`);
  }
  process.exit(1);
}
