/**
 * 押せるものが、指で押せる大きさかを測る。
 *
 *   npx next build && (cd out && python3 -m http.server 8791 &)
 *   node scripts/check-tap-targets.mjs
 *
 * ## なぜ機械に測らせるか
 *
 * **見た目では分からない。** 太い線を引いたつもりでも当たり判定はつぶれているし、
 * SVG は viewBox で縮むので、書いた数字と画面上の大きさが一致しない。
 * 日本地図で香川が14px四方だったのも、三角形の辺の当たり判定が幅0だったのも、
 * どちらも目で見て気づけず、実際に測って（あるいは操作が失敗して）分かった。
 *
 * ## 44px
 *
 * 指の腹で押せる大きさの目安。Apple・Google のどちらのガイドラインも
 * この前後を出している。ここでは 44px を下限として、
 * **子どもの指はもっと不器用**なので、下回るものは理由を書けるときだけ許す。
 *
 * 画面を開いた時点で見えているものだけを測る。
 * 手を進めないと出てこないボタン（けってい など）は、
 * 各単元の通し確認のほうで見ている。
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { chromium } from "playwright-core";

const ROOT = "out";
const BASE = process.env.BASE ?? "http://localhost:8791";
/** 指で押せる大きさの下限 */
const MIN = 44;

/**
 * 下回ってよいもの。**理由が書けるものだけ。**
 * ここに足すときは、なぜ小さくてよいのかを必ず書く。
 */
const ALLOWED = [
  // ヘッダー・フッターの文字リンク。並んだ文章の一部で、
  // 押しまちがえても行き先が分かる場所に戻れる
  { selector: "header a", why: "ヘッダーの文字リンク" },
  { selector: "footer a", why: "フッターの文字リンク" },
  { selector: "main p a", why: "文章の中の文字リンク" },
  { selector: "main li a", why: "箇条書きの中の文字リンク" },
  // 分数の分子・分母の枠。**文の中に積んだ分数を 44px 角にはできない**
  // （式そのものが画面をはみ出す）。枠を押さなくても、キーパッドの
  // 「ぶんぼへ」（下いっぱいの大きなボタン）で分母へ移れるようにしてある。
  // 枠のタップは、そこに気づいた人のための近道という位置づけ
  { selector: "[aria-label='ぶんし'], [aria-label='ぶんぼ']", why: "分数の枠（キーパッドに移動ボタンがある）" },
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
// スマホ幅で測る。ここがいちばん小さくなる
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const findings = [];

for (const path of pages) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(120);

  const small = await page.evaluate(
    ({ MIN, ALLOWED }) => {
      const allowed = new Set();
      for (const { selector } of ALLOWED) {
        for (const el of document.querySelectorAll(selector)) allowed.add(el);
      }

      const out = [];
      const targets = document.querySelectorAll(
        "button:not([disabled]), a[href], [role='button'], svg rect[class*='cursor-pointer'], svg [onclick], svg path[class*='cursor-pointer']"
      );
      for (const el of targets) {
        if (allowed.has(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) {
          out.push({ label: (el.textContent || el.tagName).trim().slice(0, 24), w: 0, h: 0 });
          continue;
        }
        if (r.width < MIN || r.height < MIN) {
          out.push({
            label: (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 24),
            w: Math.round(r.width),
            h: Math.round(r.height),
          });
        }
      }
      return out;
    },
    { MIN, ALLOWED }
  );

  // 同じ形のものが並んでいるときは、いちばん小さいものだけを出す
  const worst = new Map();
  for (const s of small) {
    const key = `${s.w}x${s.h}`;
    if (!worst.has(key)) worst.set(key, { ...s, count: 0 });
    worst.get(key).count += 1;
  }
  for (const s of worst.values()) findings.push({ path, ...s });
}

await browser.close();

console.log(`ページ数: ${pages.length}（スマホ幅 390px で測定・下限 ${MIN}px）`);
if (findings.length === 0) {
  console.log("すべて OK");
} else {
  findings.sort((a, b) => a.w * a.h - b.w * b.h);
  for (const f of findings) {
    console.log(`  ${f.w}×${f.h}px ×${f.count}  ${f.path}  「${f.label}」`);
  }
  console.log(`\n${findings.length} 件。理由を書けないものは 44px 以上にする`);
  process.exit(1);
}
