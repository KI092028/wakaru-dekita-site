/**
 * 小数のかけ算・わり算の、出題と判定を検査する。
 *
 *   npx tsx@4 --tsconfig tsconfig.json scripts/check-decimal.ts
 *
 * 小数は、そのまま書くと 6 * 0.8 が 4.800000000000001 になる。
 * **丸めの取りこぼしを機械で見つけるのが、この検査のいちばんの用**。
 */

import { generateDecimalPlans } from "../lib/decimal/generate";
import { computeOf, round1, shouldBeBigger } from "../lib/decimal/plan";
import { diagnoseCompute, diagnoseDirection } from "../lib/decimal/steps";
import { appendDigit, isComplete } from "../lib/quiz/answer-input";

const SETS = 500;
const problems: string[] = [];
const fail = (message: string) => problems.push(message);

for (let s = 0; s < SETS; s++) {
  const plans = generateDecimalPlans();

  if (plans.length !== 4) fail(`問題数が ${plans.length}`);
  const shape = plans.map((p) => `${p.op}${p.bigger ? "大" : "小"}`).join(",");
  // 思い込みどおりにならない形を先に。どおりになる形も必ず入れる
  if (shape !== "×小,×大,÷大,÷小") fail(`並びがちがう: ${shape}`);

  for (const plan of plans) {
    const { op, base, factor, answer } = plan;

    // 丸めの取りこぼし。小数点以下1桁までで表せること
    if (Math.abs(answer - round1(answer)) > 1e-12) fail(`答えが1桁で表せない: ${answer}`);
    if (String(answer).replace("-", "").split(".")[1]?.length > 1) {
      fail(`答えの桁が多い: ${answer}`);
    }
    if (Math.abs(answer - computeOf(op, base, factor)) > 1e-12) fail("答えがずれている");
    // 実際の計算と合っているか（丸める前の値と 1e-9 以内）
    const raw = op === "×" ? base * factor : base / factor;
    if (Math.abs(raw - answer) > 1e-9) fail(`丸めで値が変わった: ${raw} → ${answer}`);

    if (answer === base) fail(`もとの数と答えが同じ: ${base} ${op} ${factor}`);
    if (factor === 1) fail("1をかける・1でわる形が出ている");
    if (plan.bigger !== shouldBeBigger(op, factor)) fail("向きの判定がちがう");
    if (plan.bigger !== answer > base) fail(`向きと答えが合わない: ${base} ${op} ${factor}`);

    // 数直線に、もとの数と答えの両方が入ること
    if (plan.axisMax < base || plan.axisMax < answer) fail("数直線から はみ出す");
    if (plan.axisMax <= 0 || plan.tickStep <= 0) fail("数直線の目もりがおかしい");
    // 目もりが多すぎると線がつぶれる
    if (plan.axisMax / plan.tickStep > 16) fail(`目もりが多すぎる: ${plan.axisMax / plan.tickStep}`);
    // **もとの数の左右が、どちらも押せる広さであること。**
    // 片方が細いと、えらぶ前から答えが見えてしまう
    const share = base / plan.axisMax;
    if (share < 0.3 || share > 0.7) {
      fail(`帯のかたよりが大きい: もとの数 ${base} / 右はし ${plan.axisMax} = ${share.toFixed(2)}`);
    }

    // 向きの判定
    if (diagnoseDirection(plan, plan.bigger) !== null) fail("正しい向きがはじかれた");
    const wrongSaid = diagnoseDirection(plan, !plan.bigger);
    if (wrongSaid === null) fail("ちがう向きが通った");
    else if (!wrongSaid.includes("1より")) fail("1とのくらべに触れていない");

    // 計算の判定
    if (diagnoseCompute(plan, answer) !== null) fail("正しい答えがはじかれた");
    // 小数点の位置ちがい
    for (const scale of [10, 100]) {
      for (const wrong of [round1(answer * scale), round1(answer / scale)]) {
        if (Math.abs(wrong - answer) < 1e-9) continue;
        const said = diagnoseCompute(plan, wrong);
        if (said === null) fail(`${wrong} が正解になった`);
        else if (!said.includes("小数点")) fail(`小数点ちがいを名指ししていない: ${wrong}`);
      }
    }
    // かけ算とわり算の取りちがえ
    const swapped = round1(op === "×" ? base / factor : base * factor);
    if (Math.abs(swapped - answer) > 1e-9) {
      const said = diagnoseCompute(plan, swapped);
      if (said === null) fail(`取りちがえた答え ${swapped} が正解になった`);
    }
    // 0.1 きざみで総当たり
    for (let x = 0; x <= 400; x++) {
      const typed = round1(x / 10);
      if (Math.abs(typed - answer) < 1e-9) continue;
      if (diagnoseCompute(plan, typed) === null) fail(`${typed} が正解になった（正解は ${answer}）`);
    }
  }
}

// キーパッドの小数点。既存の単元に影響が出ていないかも見る
{
  const empty = { kind: "number" as const, digits: "" };
  const push = (start: string, keys: string) =>
    keys.split("").reduce<{ kind: "number"; digits: string }>(
      (acc, k) => appendDigit(acc, k, 3) as { kind: "number"; digits: string },
      { kind: "number", digits: start }
    );
  if (push("", ".").digits !== "") fail("小数点が先頭に置けてしまう");
  if (push("", "4.8").digits !== "4.8") fail("4.8 が打てない");
  if (push("", "4..8").digits !== "4.8") fail("小数点が2つ入る");
  if (push("", "0.5").digits !== "0.5") fail("0.5 が打てない");
  if (push("", "1234").digits !== "123") fail("桁数の上限が効いていない");
  if (push("", "12.34").digits !== "12.3") fail("小数点が桁数に数えられている");
  if (isComplete({ kind: "number", digits: "4." })) fail("小数点で終わったまま決定できてしまう");
  if (!isComplete({ kind: "number", digits: "4.8" })) fail("4.8 が決定できない");
  if (isComplete(empty)) fail("空で決定できてしまう");
}

if (problems.length === 0) {
  console.log(`OK: ${SETS} セット / ${SETS * 4} 問 と、小数点キーの入力を確認`);
} else {
  const seen = new Map<string, number>();
  for (const p of problems) seen.set(p, (seen.get(p) ?? 0) + 1);
  console.log(`NG: ${problems.length} 件`);
  for (const [message, n] of [...seen].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.log(`  ${n} 回  ${message}`);
  }
  process.exit(1);
}
