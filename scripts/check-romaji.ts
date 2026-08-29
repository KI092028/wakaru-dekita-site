/**
 * ローマ字の表・出題・判定を検査する。
 *
 *   npx tsx@4 --tsconfig tsconfig.json scripts/check-romaji.ts
 */

import { generateRomajiSet, ROMAJI_QUESTION_COUNT } from "../lib/romaji/generate";
import {
  isMastered,
  record,
  statusOf,
  TOTAL_KANA,
  type RomajiProgress,
} from "../lib/romaji/progress";
import { judge } from "../lib/romaji/steps";
import {
  CONSONANT_KEYS,
  ROMAJI_ROWS,
  ROMAJI_VOWELS,
  VOWEL_KEYS,
  cellAt,
  hasAlternate,
  isCorrect,
  romajiTable,
} from "../lib/romaji/table";

const problems: string[] = [];
const fail = (message: string) => problems.push(message);

// --- 表そのもの
if (romajiTable.length !== 46) fail(`字の数が ${romajiTable.length}（46のはず）`);
if (TOTAL_KANA !== 46) fail("TOTAL_KANA がちがう");

const kanaSeen = new Set<string>();
for (const entry of romajiTable) {
  if (kanaSeen.has(entry.kana)) fail(`かなが重なっている: ${entry.kana}`);
  kanaSeen.add(entry.kana);
  if (!/^[a-z]+$/.test(entry.main)) fail(`ローマ字に使えない字: ${entry.main}`);
  for (const alt of entry.alternates) {
    if (!/^[a-z]+$/.test(alt)) fail(`別の書き方がおかしい: ${alt}`);
    if (alt === entry.main) fail(`別の書き方が同じ: ${entry.kana}`);
  }
  // **画面のキーボードで打てること。** 打てない字が答えだと、詰む
  for (const letter of entry.main) {
    if (![...VOWEL_KEYS, ...CONSONANT_KEYS].includes(letter)) {
      fail(`キーに無い字が答えに入っている: ${entry.main} の ${letter}`);
    }
  }
  for (const alt of entry.alternates) {
    for (const letter of alt) {
      if (![...VOWEL_KEYS, ...CONSONANT_KEYS].includes(letter)) {
        fail(`キーに無い字が別の書き方に入っている: ${alt} の ${letter}`);
      }
    }
  }
  if (!ROMAJI_ROWS.includes(entry.row)) fail(`表に無い行: ${entry.row}`);
}

// 同じローマ字が2つのかなに割り当たっていないか（判定が割れる）
const byRomaji = new Map<string, string[]>();
for (const entry of romajiTable) {
  for (const spelling of [entry.main, ...entry.alternates]) {
    byRomaji.set(spelling, [...(byRomaji.get(spelling) ?? []), entry.kana]);
  }
}
// 学校でならう書き方（main）どうしが重なると、判定が割れる
const mains = new Set<string>();
for (const entry of romajiTable) {
  if (mains.has(entry.main)) fail(`${entry.main} が2つの字にある`);
  mains.add(entry.main);
}
// 別の書き方が、ほかの字の main と重なるのは許す（「を」の o は「お」の o）。
// そのときに どちらを 名前で 呼ぶかは、下の判定の検査で見る
for (const [spelling, kanas] of byRomaji) {
  if (kanas.length > 2) fail(`${spelling} が ${kanas.join("と")} にある`);
}

// 表の升目に、ぜんぶの字が出ること（画面から抜け落ちる字が無いか）
const shown = new Set<string>();
for (const row of ROMAJI_ROWS) {
  for (const vowel of ROMAJI_VOWELS) {
    const cell = row === "ん" ? (vowel === "a" ? cellAt("ん", "n") : null) : cellAt(row, vowel);
    if (cell) shown.add(cell.kana);
  }
}
for (const entry of romajiTable) {
  if (!shown.has(entry.kana)) fail(`表に出てこない字: ${entry.kana}`);
}

// --- 判定
for (const entry of romajiTable) {
  if (judge(entry, entry.main).kind !== "correct") fail(`${entry.kana} の正解がはじかれた`);
  for (const alt of entry.alternates) {
    const result = judge(entry, alt);
    if (result.kind !== "alternate") fail(`${entry.kana} の ${alt} が別の書き方として通らない`);
    else if (!result.note.includes(entry.main)) fail("学校でならうほうを言っていない");
  }
  if (judge(entry, entry.main.toUpperCase()).kind !== "correct") fail("大文字が通らない");
  if (!isCorrect(entry, entry.main)) fail("isCorrect がちがう");

  // ほかの字のつづりは、必ず まちがいになる
  for (const other of romajiTable) {
    if (other.kana === entry.kana) continue;
    // 「を」に o は正しい（「お」の書き方と重なっているだけ）。重なりは許す
    if (entry.alternates.includes(other.main)) continue;
    const result = judge(entry, other.main);
    if (result.kind !== "wrong") fail(`${entry.kana} に ${other.main} が通った`);
    // どこがちがうかの言い方は「子音は合っている」など複数あってよい。
    // ただし**正しい書き方を必ず出す**こと
    else if (!result.message.includes(entry.main)) {
      fail(`正しい書き方 ${entry.main} を言っていない: ${result.message}`);
    }
  }
  // でたらめなつづり
  for (const junk of ["zzz", "q", "aaaa"]) {
    if (junk === entry.main) continue;
    if (judge(entry, junk).kind !== "wrong") fail(`${junk} が通った`);
  }
}

// ほかの字の main を打ったとき、その字の名前で呼べること
// （「o」は「お」。「を」の別の書き方でもあるが、main を先に立てている）
{
  const a = romajiTable.find((x) => x.kana === "あ")!;
  const said = judge(a, "o");
  if (said.kind !== "wrong" || !said.message.includes("「お」")) {
    fail(`o を「お」と呼べていない: ${said.kind === "wrong" ? said.message : said.kind}`);
  }
  const wo = romajiTable.find((x) => x.kana === "を")!;
  if (judge(wo, "o").kind !== "alternate") fail("を に o が通らない");
}

// --- 出題
for (let s = 0; s < 300; s++) {
  // まっさらな状態
  const set = generateRomajiSet({});
  if (set.length !== ROMAJI_QUESTION_COUNT) fail(`問題数が ${set.length}`);
  if (new Set(set.map((x) => x.kana)).size !== set.length) fail("同じ字が2回出た");
  // 2通りある字が必ず1つ入る
  if (!set.some(hasAlternate)) fail("2通りある字が入っていない");

  // ほとんど覚えている状態（残り3字）でも、その3字が優先されること
  const almost: RomajiProgress = {};
  const left = romajiTable.slice(0, 3).map((x) => x.kana);
  for (const entry of romajiTable) {
    if (!left.includes(entry.kana)) almost[entry.kana] = { streak: 2, mastered: true };
  }
  const set2 = generateRomajiSet(almost);
  for (const kana of left) {
    if (!set2.some((x) => x.kana === kana)) fail(`まだの字 ${kana} が出ていない`);
  }
}

// --- 記録
{
  let progress: RomajiProgress = {};
  const kana = "き";
  if (statusOf(progress, kana) !== "untouched") fail("はじめが untouched でない");
  progress = record(progress, kana, true);
  if (isMastered(progress, kana)) fail("1回でおぼえた判定になった");
  // **1回書けた字は「やりかけ」として色が変わること。**
  // ここが untouched のままだと、10問正解しても表が変わらない
  if (statusOf(progress, kana) !== "learning") fail("1回書けても やりかけ にならない");
  progress = record(progress, kana, true);
  if (!isMastered(progress, kana)) fail("2回でおぼえた判定にならない");
  // おぼえたら下がらない（九九と同じ）
  progress = record(progress, kana, false);
  if (!isMastered(progress, kana)) fail("まちがえたら おぼえた印が消えた");
  // まちがえたら、続けた回数は0に戻る
  let fresh = record({}, kana, true);
  fresh = record(fresh, kana, false);
  if (statusOf(fresh, kana) !== "untouched") fail("まちがえても やりかけ のままになっている");
  // 上限を超えて増えないこと
  let up: RomajiProgress = {};
  for (let i = 0; i < 10; i++) up = record(up, kana, true);
  if (up[kana].streak !== 2) fail(`回数が ${up[kana].streak} まで増えた`);
}

if (problems.length === 0) {
  console.log(`OK: 46字の表・判定・出題・記録をすべて確認`);
} else {
  const seen = new Map<string, number>();
  for (const p of problems) seen.set(p, (seen.get(p) ?? 0) + 1);
  console.log(`NG: ${problems.length} 件`);
  for (const [message, n] of [...seen].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.log(`  ${n} 回  ${message}`);
  }
  process.exit(1);
}
