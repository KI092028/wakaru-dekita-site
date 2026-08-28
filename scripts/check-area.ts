/**
 * 面積と周りの長さの出題と判定を、まとめて検査する。
 *
 * 手で何セットか触っても、たまたま出なかった組み合わせは見つからない。
 * ここで確かめているのは、**どのセットでも必ず成り立っていてほしいこと**だけ。
 *
 *   npx tsx@4 --tsconfig tsconfig.json scripts/check-area.ts
 */

import { generateAreaPlans, comparison } from "../lib/area/generate";
import {
  EDGES,
  areaOf,
  goalShape,
  movingValueOf,
  perimeterOf,
  shapeOptions,
  sumOfEdges,
  type Edge,
} from "../lib/area/plan";
import { diagnoseArea, diagnoseShape, diagnoseTrace, extremes, stepsFor } from "../lib/area/steps";

const SETS = 500;
const problems: string[] = [];
const fail = (message: string) => problems.push(message);

for (let s = 0; s < SETS; s++) {
  const plans = generateAreaPlans();

  if (plans.length !== 4) fail(`問題数が ${plans.length}`);
  const kinds = plans.map((p) => p.kind).join(",");
  if (kinds !== "count,count,keepPerimeter,keepArea") fail(`並びがちがう: ${kinds}`);

  const [first, second] = plans;

  // 1〜2問目：まわりは長いのに面積は小さい、という組になっているか
  if (perimeterOf(second.rows, second.cols) <= perimeterOf(first.rows, first.cols)) {
    fail(`2問目のまわりが長くない: ${first.rows}x${first.cols} → ${second.rows}x${second.cols}`);
  }
  // 1cm² しかちがわないと「ほとんど同じ」に見えて、比べる意味がなくなる
  if (areaOf(first.rows, first.cols) - areaOf(second.rows, second.cols) < 4) {
    fail(`2問目の面積の差が小さい: ${first.rows}x${first.cols} → ${second.rows}x${second.cols}`);
  }
  if (comparison(second) === null) fail("2問目に くらべ がない");
  if (comparison(first) !== null) fail("1問目に くらべ が付いている");

  for (const plan of plans.slice(0, 2)) {
    // まわりの長さと面積が同じ数だと、取りちがえていても気づけない
    if (perimeterOf(plan.rows, plan.cols) === areaOf(plan.rows, plan.cols)) {
      fail(`まわりと面積が同じ数: ${plan.rows}x${plan.cols}`);
    }
    if (stepsFor(plan).join(",") !== "trace,area") fail("count の手がちがう");

    // なぞりの判定。**4本の辺の組み合わせを ぜんぶ 試す**
    for (let mask = 0; mask < 16; mask++) {
      const traced: Edge[] = EDGES.filter((_, i) => (mask >> i) & 1);
      const message = diagnoseTrace(plan, traced);
      if (traced.length === 4) {
        if (message !== null) fail("4本なぞって不正解になった");
        continue;
      }
      if (message === null) {
        fail(`${traced.length}本（${traced.join("+")}）で正解になった`);
        continue;
      }
      // 言葉の中に数を出すなら、それは**実際にたした数**でなければならない
      const said = [...message.matchAll(/(\d+)cm/g)].map((m) => Number(m[1]));
      const sum = sumOfEdges(plan.rows, plan.cols, traced);
      const whole = perimeterOf(plan.rows, plan.cols);
      for (const n of said) {
        if (n !== sum && n !== whole) {
          fail(`なぞり ${traced.join("+")} で、たしていない数 ${n}cm を言った（たした数 ${sum}）`);
        }
      }
    }
    // たてとよこを1本ずつで止まった形は、この単元でいちばん多い誤り。名指しできているか
    const halfWay = diagnoseTrace(plan, ["top", "left"]) ?? "";
    if (!halfWay.includes("4本")) fail("たて＋よこで止まったときに 4本 と言っていない");
    if (!halfWay.includes(`${plan.rows + plan.cols}cm`)) fail("たした数を言っていない");

    // 面積の判定
    const area = areaOf(plan.rows, plan.cols);
    const perimeter = perimeterOf(plan.rows, plan.cols);
    if (diagnoseArea(plan, area) !== null) fail("正しい面積が不正解になった");
    const asPerimeter = diagnoseArea(plan, perimeter);
    if (asPerimeter === null || !asPerimeter.includes("まわりの長さ")) {
      fail("まわりの長さを答えたときに、そう言っていない");
    }
    const asSum = diagnoseArea(plan, plan.rows + plan.cols);
    if (asSum === null || !asSum.includes("たし")) fail("たし算で止まったときに、そう言っていない");
    for (let n = 1; n <= 120; n++) {
      if (n === area) continue;
      if (diagnoseArea(plan, n) === null) fail(`面積 ${n} が正解になった（正解は ${area}）`);
    }
  }

  for (const plan of plans.slice(2)) {
    const options = shapeOptions(plan);
    if (options.length < 3) fail(`形の選択肢が ${options.length} しかない`);
    if (stepsFor(plan).join(",") !== "shape") fail("shape の手がちがう");

    for (const o of options) {
      if (o.rows > o.cols) fail(`たて>よこ の形が入っている: ${o.rows}x${o.cols}`);
      if (o.rows < 1 || o.cols < 1) fail("0以下の辺がある");
      // 止めているほうの数が、ぜんぶの形で同じか
      const held = plan.kind === "keepArea" ? areaOf(o.rows, o.cols) : perimeterOf(o.rows, o.cols);
      if (held !== plan.fixed) fail(`止めた数が動いた: ${o.rows}x${o.cols} → ${held}`);
      // 枠に収まるか
      if (o.rows > plan.frameRows || o.cols > plan.frameCols) {
        fail(`枠からはみ出す形: ${o.rows}x${o.cols} 枠 ${plan.frameRows}x${plan.frameCols}`);
      }
    }

    // 目ざす形は、いちばん正方形に近いもの ただ1つ
    const goal = goalShape(plan);
    const best = options.filter((o) => o.cols - o.rows === goal.cols - goal.rows);
    if (best.length !== 1) fail("目ざす形が1つに決まらない");
    const goalValue = movingValueOf(plan, goal.rows, goal.cols);
    for (const o of options) {
      const v = movingValueOf(plan, o.rows, o.cols);
      if (plan.kind === "keepArea" && v < goalValue) fail("もっと短い形がある");
      if (plan.kind === "keepPerimeter" && v > goalValue) fail("もっと大きい形がある");
    }

    // 動かしはじめの形が、すでに答えになっていないこと
    if (plan.rows === goal.rows && plan.cols === goal.cols) fail("はじめから答えの形になっている");
    if (!options.some((o) => o.rows === plan.rows && o.cols === plan.cols)) {
      fail(`はじめの形が選択肢にない: ${plan.rows}x${plan.cols}`);
    }

    // 判定
    if (diagnoseShape(plan, goal.rows, goal.cols) !== null) fail("正しい形が不正解になった");
    for (const o of options) {
      if (o.rows === goal.rows) continue;
      const message = diagnoseShape(plan, o.rows, o.cols);
      if (message === null) fail(`${o.rows}x${o.cols} が正解になった`);
      else if (!message.includes("正方形")) fail("直し方（正方形に近づける）を言っていない");
    }

    // 幅がないと「変わる」ことが見えない
    const ex = extremes(plan);
    if (ex.max <= ex.min) fail("形を変えても数が動かない");
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
