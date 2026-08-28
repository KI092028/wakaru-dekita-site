/**
 * 三角形・平行四辺形の面積の、出題と判定を検査する。
 *
 *   npx tsx@4 --tsconfig tsconfig.json scripts/check-tri.ts
 *
 * 見ているのは「どのセットでも必ず成り立っていてほしいこと」だけ。
 */

import { generateTriPlans } from "../lib/tri/generate";
import {
  areaOf,
  footOf,
  heightIsOutside,
  segmentsOf,
  verticesOf,
  type Figure,
} from "../lib/tri/plan";
import { diagnoseArea, diagnoseHeight, formula } from "../lib/tri/steps";

const SETS = 500;
const problems: string[] = [];
const fail = (message: string) => problems.push(message);

/** 多角形の面積（靴ひもの公式）。**モデルとは別の道すじで面積を出して突き合わせる。** */
function shoelace(figure: Figure): number {
  const v = verticesOf(figure);
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    const a = v[i];
    const b = v[(i + 1) % v.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

for (let s = 0; s < SETS; s++) {
  const plans = generateTriPlans();

  if (plans.length !== 4) fail(`問題数が ${plans.length}`);
  const order = plans.map((p) => `${p.figure.kind}:${p.motion}`).join(" / ");
  if (order !== "parallelogram:slide / triangle:rotate / triangle:rotate / triangle:apex") {
    fail(`並びがちがう: ${order}`);
  }

  // 平行四辺形が先。三角形の ÷2 は、平行四辺形が分かってはじめて意味を持つ
  if (plans[0].figure.kind !== "parallelogram") fail("1問目が平行四辺形でない");
  // 3問目は必ず「高さが外」
  if (!heightIsOutside(plans[2].figure)) fail("3問目の高さが外に出ていない");
  if (heightIsOutside(plans[1].figure)) fail("2問目の高さが外に出てしまっている");

  for (const plan of plans) {
    const f = plan.figure;

    // 面積が、別の道すじの計算と一致するか
    if (Math.abs(areaOf(f) - shoelace(f)) > 1e-9) {
      fail(`面積が合わない: ${JSON.stringify(f)} ${areaOf(f)} vs ${shoelace(f)}`);
    }
    if (!Number.isInteger(areaOf(f))) fail(`面積が整数でない: ${areaOf(f)}`);
    if (plan.answer !== areaOf(f)) fail("answer と面積がずれている");

    // ななめの辺は 5cm（誤答を名指しできるようにするため）
    const segments = segmentsOf(f);
    const slant = segments.find((x) => x.name === "slant")!;
    if (slant.length !== 5) fail(`ななめの辺が 5cm でない: ${slant.length}`);
    const base = segments.find((x) => x.name === "base")!;
    const height = segments.find((x) => x.name === "height")!;
    if (base.length !== f.base) fail("底辺の長さがちがう");
    if (height.length !== f.height) fail("高さの長さがちがう");
    // 高さの線は、底辺と直角に交わっていること
    if (height.from.x !== height.to.x) fail("高さの線がまっすぐ上でない");
    if (height.from.x !== footOf(f)) fail("高さの足の位置がちがう");

    // 平行四辺形は切ったぶんが右の欠けにはまる必要がある（offset ≦ base）
    if (f.kind === "parallelogram" && f.offset > f.base) {
      fail(`切った三角形が右にはまらない: offset ${f.offset} > base ${f.base}`);
    }

    // 枠に、動かした先まで入るか
    const xs = verticesOf(f).map((p) => p.x);
    let neededCols = Math.max(...xs, f.base);
    if (plan.motion === "rotate" && f.kind === "triangle") {
      neededCols = Math.max(neededCols, f.apex + f.base); // 回してつけた平行四辺形
    }
    if (plan.motion === "slide" && f.kind === "parallelogram") {
      neededCols = Math.max(neededCols, f.offset + f.base); // うつした先
    }
    if (plan.apexRange) neededCols = Math.max(neededCols, plan.apexRange.max);
    if (plan.frameCols < neededCols) {
      fail(`枠が足りない: ${plan.frameCols} < ${neededCols}（${plan.motion}）`);
    }
    if (plan.frameRows < f.height) fail("枠のたてが足りない");

    // 高さの判定
    if (diagnoseHeight(f, "height") !== null) fail("正しい高さが不正解になった");
    const slantSaid = diagnoseHeight(f, "slant");
    if (slantSaid === null) fail("ななめの辺が正解になった");
    else if (!slantSaid.includes("ななめ")) fail("ななめの辺だと言っていない");
    if (diagnoseHeight(f, "base") === null) fail("底辺が正解になった");

    // 面積の判定。**よくある誤答が、それぞれ別の言葉で返るか**
    const want = areaOf(f);
    if (diagnoseArea(f, want) !== null) fail("正しい面積が不正解になった");
    const product = f.base * f.height;
    if (f.kind === "triangle") {
      const forgot = diagnoseArea(f, product);
      if (forgot === null || !forgot.includes("÷2")) fail("÷2 忘れを名指ししていない");
      const bySlant = diagnoseArea(f, (f.base * 5) / 2);
      if (product !== (f.base * 5) / 2) {
        if (bySlant === null || !bySlant.includes("ななめ")) {
          fail("ななめの辺で計算した誤答を名指ししていない");
        }
      }
    } else {
      const halved = diagnoseArea(f, product / 2);
      if (halved === null || !halved.includes("いらない")) {
        fail("平行四辺形で ÷2 を付けた誤答を名指ししていない");
      }
    }
    for (let n = 1; n <= 200; n++) {
      if (n === want) continue;
      if (diagnoseArea(f, n) === null) fail(`面積 ${n} が正解になった（正解は ${want}）`);
    }

    // 式の表示。÷2 が付くのは三角形だけ
    const shown = formula(f);
    if (f.kind === "triangle" && !shown.includes("÷ 2")) fail("三角形の式に ÷2 がない");
    if (f.kind === "parallelogram" && shown.includes("÷")) fail("平行四辺形の式に ÷ がある");
  }

  // 4問目：頂点をどこへ動かしても面積が変わらないこと
  const last = plans[3];
  if (last.figure.kind !== "triangle" || !last.apexRange) fail("4問目の形がちがう");
  else {
    const want = areaOf(last.figure);
    for (let a = last.apexRange.min; a <= last.apexRange.max; a++) {
      const moved: Figure = { ...last.figure, apex: a };
      if (areaOf(moved) !== want) fail(`頂点 ${a} で面積が変わった`);
      if (Math.abs(shoelace(moved) - want) > 1e-9) fail(`頂点 ${a} で実際の面積が変わった`);
      if (a > last.figure.base && !heightIsOutside(moved)) fail("外に出たのに外と判定されない");
    }
    // 動かせる幅があること（動かしても何も起きないと、見せたいことが見えない）
    if (last.apexRange.max - last.apexRange.min < 4) fail("頂点を動かせる幅がせまい");
    // 底辺の外まで動かせること（ここまで動かして面積が同じなのが、いちばん効く）
    if (last.apexRange.max <= last.figure.base) fail("頂点が底辺の外まで動かせない");
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
