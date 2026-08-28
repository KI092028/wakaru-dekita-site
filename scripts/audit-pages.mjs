/**
 * 書き出した全ページを、スマホ幅とPC幅で開いて見る。
 *
 * 見ているのは3つ。
 * - JS のエラーが出ていないか
 * - **横に はみ出していないか**（スマホで横スクロールが出ると、一気に使えなくなる）
 * - <title> と <h1> があるか
 *
 * 単元を1つ足すたびに全ページを手で開くのは無理なので、ここで機械にやらせる。
 *
 *   npx next build && (cd out && python3 -m http.server 8791 &)
 *   node scripts/audit-pages.mjs
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { chromium } from "playwright-core";

const ROOT = "out";
const BASE = process.env.BASE ?? "http://localhost:8791";
const WIDTHS = [
  { name: "スマホ", width: 390, height: 844 },
  { name: "PC", width: 1280, height: 900 },
];

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith(".html")) pages.push("/" + relative(ROOT, path));
  }
})(ROOT);
pages.sort();

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const problems = [];

for (const size of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  for (const path of pages) {
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    const onConsole = (m) => m.type() === "error" && errors.push(m.text());
    page.on("console", onConsole);

    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(120);

    const info = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() ?? "",
    }));

    if (errors.length) problems.push(`[${size.name}] ${path} JSエラー: ${errors[0]}`);
    // 1px の丸め誤差は見のがす
    if (info.scrollWidth > info.clientWidth + 1) {
      problems.push(
        `[${size.name}] ${path} 横にはみ出している (${info.scrollWidth} > ${info.clientWidth})`
      );
    }
    if (size.width === 390) {
      if (!info.title) problems.push(`${path} <title> がない`);
      if (!info.h1) problems.push(`${path} <h1> がない`);
    }
    page.off("console", onConsole);
    page.removeAllListeners("pageerror");
  }
  await page.close();
}
await browser.close();

console.log(`ページ数: ${pages.length}（× ${WIDTHS.length} 幅 = ${pages.length * WIDTHS.length} 回)`);
if (problems.length === 0) console.log("すべて OK");
else {
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
