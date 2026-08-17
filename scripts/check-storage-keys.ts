/**
 * 保存キーの入れ忘れを機械的に見つける。
 *
 * ソース全体から "wakaru-dekita:..." の文字列を拾い、
 * lib/storage/keys.ts の一覧と突き合わせる。
 * 片方にしかないものがあれば、記録ページとプライバシーポリシーから
 * その単元が抜け落ちているということ。
 *
 *   npx tsx@4 --tsconfig tsconfig.json scripts/check-storage-keys.ts
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { storedItems } from "../lib/storage/keys";

const ROOTS = ["app", "components", "lib"];
const KEY_PATTERN = /"(wakaru-dekita:[^"]+)"/g;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });
}

const found = new Map<string, string[]>();
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const source = readFileSync(file, "utf-8");
    for (const match of source.matchAll(KEY_PATTERN)) {
      const key = match[1];
      found.set(key, [...(found.get(key) ?? []), file]);
    }
  }
}

const registered = new Set(storedItems.map((item) => item.key));
const problems: string[] = [];

for (const [key, files] of found) {
  if (!registered.has(key)) {
    problems.push(`一覧にない保存キー: ${key}\n  → ${files.join(", ")}\n  → lib/storage/keys.ts に足すこと`);
  }
}

for (const item of storedItems) {
  if (!found.has(item.key)) {
    problems.push(`どこからも使われていない保存キー: ${item.key}（${item.label}）`);
  }
}

// 同じキーを2つの単元で使っていないか
const byKey = new Map<string, string[]>();
for (const item of storedItems) {
  byKey.set(item.key, [...(byKey.get(item.key) ?? []), item.slug]);
}
for (const [key, slugs] of byKey) {
  if (slugs.length > 1) problems.push(`保存キーの重複: ${key} → ${slugs.join(", ")}`);
}

// キーには必ずバージョンを付ける（設計方針 1.5）
for (const item of storedItems) {
  if (!/:v\d+$/.test(item.key)) {
    problems.push(`バージョンのない保存キー: ${item.key}（...:v1 の形にすること）`);
  }
}

console.log(`ソースで見つかった保存キー: ${found.size}`);
console.log(`一覧に登録済み: ${registered.size}`);

if (problems.length > 0) {
  console.error("\n--- 問題 ---");
  for (const problem of problems) console.error(problem);
  process.exit(1);
}
console.log("すべて OK");
