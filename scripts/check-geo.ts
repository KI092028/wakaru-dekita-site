/**
 * 日本地図の別枠（沖縄）まわりを検査する。
 *
 *   npx tsx@4 --tsconfig tsconfig.json scripts/check-geo.ts
 *
 * design-guidelines「ステップ0：画面の5つの数」を、この変更に当てたもの。
 * 画面の成立条件を、絵を見るのではなく数で確かめる。
 */

import japanMap from "@svg-maps/japan";
import { insetPlacement, islandsOf, largestIsland, padBox, type Box } from "../lib/geo/inset";
import { PREFECTURES, bounds, prefecturesOf } from "../lib/geo/prefectures";

const problems: string[] = [];
const fail = (message: string) => problems.push(message);

type Loc = { id: string; path: string };
const okinawaPath = (japanMap.locations as Loc[]).find((l) => l.id === "okinawa")!.path;

const kyushu = prefecturesOf("kyushu");
const okinawa = kyushu.find((p) => p.code === 47)!;
const mainland = kyushu.filter((p) => p.code !== 47);

/** 地方に寄るときの余白（japan-map.tsx の padded と同じ） */
const padded = (box: Box): Box => padBox(box, 0.08);

// --- 沖縄は出題から外れていないこと。**別枠に出すのは見せ方の話**
if (!PREFECTURES.some((p) => p.code === 47)) fail("沖縄が県の一覧から消えている");
if (!kyushu.some((p) => p.code === 47)) fail("沖縄が九州・沖縄から外れている");
if (kyushu.length !== 8) fail(`九州・沖縄が ${kyushu.length} 県`);

// --- 1) 別枠にして、九州がどれだけ大きくなるか
{
  const withOkinawa = padded(bounds(kyushu));
  const without = padded(bounds(mainland));
  const times = withOkinawa.width / without.width;
  if (times < 2) fail(`九州が ${times.toFixed(1)} 倍にしかならない（別枠にする意味がない）`);
  console.log(`  九州の大きさ: 沖縄こみ ${withOkinawa.width.toFixed(0)} → ぬき ${without.width.toFixed(0)}（${times.toFixed(1)} 倍）`);
}

// --- 2) 別枠に映す範囲（沖縄本島）
const window_ = padBox(largestIsland(okinawaPath), 0.22);
{
  const whole = bounds([okinawa]);
  const inside = (b: Box, outer: Box) =>
    b.x >= outer.x - 1 && b.y >= outer.y - 1 &&
    b.x + b.width <= outer.x + outer.width + 1 &&
    b.y + b.height <= outer.y + outer.height + 1;
  if (!inside(window_, whole)) fail("映す範囲が、沖縄の外に出ている");

  // **名前と当たり判定は (cx, cy) に置く。ここが映す範囲の外だと、切り取られて消える**
  const inWindow =
    okinawa.cx >= window_.x && okinawa.cx <= window_.x + window_.width &&
    okinawa.cy >= window_.y && okinawa.cy <= window_.y + window_.height;
  if (!inWindow) fail(`沖縄の名前の位置 (${okinawa.cx}, ${okinawa.cy}) が別枠から外れる`);

  const times = whole.width / window_.width;
  if (times < 3) fail(`本島に寄せても ${times.toFixed(1)} 倍にしかならない`);
  console.log(`  別枠の中身: 沖縄ぜんたい ${whole.width.toFixed(0)}×${whole.height.toFixed(0)} → 本島 ${window_.width.toFixed(0)}×${window_.height.toFixed(0)}（${times.toFixed(1)} 倍）`);

  // 島の切り分けが効いているか（ぜんぶ1つに見えていたら計算がおかしい）
  const islands = islandsOf(okinawaPath);
  if (islands.length < 5) fail(`島が ${islands.length} つしか見つからない`);
}

// --- 3) 別枠が、九州の県にかぶらないこと
{
  const view = padded(bounds(mainland));
  const inset = insetPlacement(view, window_);
  const overlaps = (a: Box, b: Box) =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

  for (const p of mainland) {
    const box = { x: p.box[0], y: p.box[1], width: p.box[2], height: p.box[3] };
    if (overlaps(inset, box)) fail(`別枠が ${p.name} にかぶる`);
  }
  // 見えている範囲に収まっていること
  if (inset.x < view.x || inset.y < view.y ||
      inset.x + inset.width > view.x + view.width ||
      inset.y + inset.height > view.y + view.height) {
    fail("別枠が地図の外にはみ出している");
  }
  // 押せる大きさ。地図は幅 330px ほどで描かれるので、そこから逆算する
  const shownPx = (inset.width / view.width) * 330;
  if (shownPx < 44) fail(`別枠が ${shownPx.toFixed(0)}px。指で押せない`);
  console.log(`  別枠: ${inset.width.toFixed(1)}×${inset.height.toFixed(1)}（画面上 およそ ${shownPx.toFixed(0)}px）`);
}

// --- 4) ほかの地方は、別枠を使わないこと（沖縄だけの話）
for (const r of ["hokkaido", "tohoku", "kanto", "chubu", "kinki", "chugoku", "shikoku"] as const) {
  if (prefecturesOf(r).some((p) => p.code === 47)) fail(`${r} に沖縄が入っている`);
}

if (problems.length === 0) {
  console.log("OK: 沖縄の別枠を確認");
} else {
  console.log(`NG: ${problems.length} 件`);
  for (const m of problems) console.log("  " + m);
  process.exit(1);
}
