# 設計・実装方針

わかる・できる の開発方針をまとめたもの。新しく手を入れるときは、この方針に沿うか、
沿わない場合はこのドキュメントを更新してから進める。

要件そのものは [requirements.md](./requirements.md) を参照。

---

## 1. 基本方針

### 1.1 サーバーを持たない

**静的サイトとして完結させる。** データベース、API、ユーザー認証は持たない。
これはプライバシー要件（解答結果をサーバーに送らない）を「実装で頑張る」のではなく
**構造的に保証する**ためでもある。

新機能を検討するときは、まず「サーバーなしで実現できるか」を判断基準にする。

### 1.2 出題ロジックとUIを分離する

| レイヤー | 場所 | 責務 |
|----------|------|------|
| 出題ロジック | `lib/quiz/` | 問題の生成、選択肢の組み立て。UIを一切知らない |
| UI | `components/quiz/` | 出題・判定・進行の画面表示。問題の作り方を知らない |

この分離により、**出題ロジックは Node.js から直接呼んでテストできる**。
実際、公開前に4000問を生成して「選択肢が4つ・正解を含む・重複なし・計算が正しい」を検証している。

### 1.3 単元を増やしやすくする

単元の追加コストを下げることを優先する。1単元の追加は以下の3ステップで完結する（→ 第4章）。
共通の出題UIは `QuizApp` 1つに集約し、単元ごとにUIを作らない。

---

## 2. ディレクトリ構成

```
app/                      ルーティングとページ（App Router）
  layout.tsx              全ページ共通のレイアウト、サイト全体のmetadata
  page.tsx                トップページ（LP）
  learn/
    page.tsx              単元一覧
    add-sub/page.tsx      各単元のページ。QuizApp を置くだけの薄い層
    times-table/page.tsx
  about|privacy|terms|contact/page.tsx
  globals.css

components/
  home/                   トップページのセクション単位のコンポーネント
  layout/                 SiteHeader / SiteFooter
  quiz/quiz-app.tsx       ドリルUI（全単元共通・クライアントコンポーネント）
  ui/                     汎用UIプリミティブ（button, card ほか）

lib/
  quiz/
    types.ts              Question / QuizUnit の型
    units.ts              単元の一覧（ここが単元マスタ）
    choices.ts            選択肢の組み立て（共通）
    generate-*.ts         単元ごとの問題生成
  utils.ts                cn() などの小物

public/                   静的ファイル（ここに置いたものが配信される）
docs/                     本ドキュメント群
```

---

## 3. Next.js App Router の使い分け

### 3.1 原則：サーバーコンポーネントを既定にする

ページ（`app/**/page.tsx`）はサーバーコンポーネントのままにし、
`metadata` によるタイトル・説明の指定はページ側で行う。
状態を持つのはドリルUIだけなので、`"use client"` は `components/quiz/quiz-app.tsx` に限定する。

### 3.2 注意：サーバーからクライアントへ関数を渡せない

**過去にこれでビルドが落ちている。** サーバーコンポーネントからクライアントコンポーネントへ
props として**関数を渡すことはできない**（`Functions cannot be passed directly to Client Components`）。

そのため `QuizApp` には出題関数そのものではなく、**単元スラッグ（文字列）を渡し**、
クライアント側で対応する生成関数を解決している。

```tsx
// NG: ページ（サーバー）から関数を渡す
<QuizApp title="九九" generateQuestions={generateTimesTableQuestions} />

// OK: 文字列を渡し、QuizApp 内部で解決する
<QuizApp title="九九" unit="times-table" />
```

新しい単元を追加するときも、この形を崩さないこと。

---

## 4. 単元を追加する手順

例として `fractions`（分数）を追加する場合。

### ステップ1: 出題ロジックを作る

`lib/quiz/generate-fractions.ts` を新規作成し、`(count: number) => Question[]` を実装する。
選択肢の組み立ては `buildChoices()` を再利用する。

```ts
import { buildChoices } from "./choices";
import type { Question } from "./types";

export function generateFractionsQuestions(count: number): Question[] {
  // ...
}
```

### ステップ2: QuizApp に登録する

`components/quiz/quiz-app.tsx` の `generators` に1行足す。

```ts
const generators = {
  "add-sub": generateAddSubQuestions,
  "times-table": generateTimesTableQuestions,
  "fractions": generateFractionsQuestions,   // 追加
} satisfies Record<string, (count: number) => Question[]>;
```

### ステップ3: 単元マスタとページを用意する

`lib/quiz/units.ts` の該当単元を `available: true` に変更し、
`app/learn/fractions/page.tsx` を既存単元のページをまねて作る（metadataの文言だけ差し替える）。

これだけでトップページと単元一覧のカードが「準備中」から解禁され、リンクが張られる。

---

## 5. デザイン方針

### 5.1 カラートークン

色は Tailwind のトークンとして `tailwind.config.ts` に定義し、**生の色コードを直書きしない**。

| トークン | 値 | 用途 |
|----------|-----|------|
| `primary` | `hsl(24 95% 58%)` | オレンジ。主要ボタン、強調 |
| `secondary` | `hsl(172 60% 40%)` | ティール。補助 |
| `success` | `hsl(142 65% 42%)` | 正解の表示 |
| `danger` | `hsl(0 72% 55%)` | 誤答の表示 |
| `foreground` | `hsl(20 30% 15%)` | 本文。やや暖色寄りの黒 |
| `muted` | `hsl(30 40% 96%)` | セクション背景 |
| `border` / `input` | `hsl(30 25% 88%)` | 罫線 |

**暖色系でまとめる**のがこのサイトのトーン。子ども向けの親しみやすさを、
彩度の高い原色ではなく、やや落ち着いたオレンジと生成りの背景で表現している。

### 5.2 レイアウト・タイポグラフィ

- 本文コンテンツの最大幅は `max-w-3xl`、ドリルのカードは `max-w-lg`
- 問題文は `text-4xl font-bold`。画面の主役として最も大きく
- 選択肢ボタンは `h-16`（64px）。子どもの指でも押しやすい大きさを確保する
- 角丸は大きめ（`rounded-2xl` など）にして硬い印象を避ける

### 5.3 文言

- ドリル画面まわりは**ひらがな主体**（対象が1年生から）
- 保護者向けセクション・規約類は通常の漢字表記
- 不正解時は否定的になりすぎないよう「ざんねん…」にとどめ、正解を併記する

---

## 6. 動作確認

### 6.1 ローカルで動かす

```bash
npm install
npm run dev          # 開発サーバー
npm run typecheck    # 型チェック
npm run build        # 本番ビルド（out/ に静的ファイルを出力）
```

### 6.2 ビルド成果物を確認する

`npm run build` 後、`out/` を静的配信して実際の公開状態に近い形で確認できる。

```bash
cd out && python3 -m http.server 8788
```

### 6.3 確認すべき観点

ドリルに手を入れたときは、最低限これらを確認する。

- 10問通しで完走できるか。問題番号（n/10）が飛んだり戻ったりしないか
- 得点が正しく集計され、結果画面の点数と一致するか
  （**得点は選択と同時に加算される**。1問ずれた期待値でテストしないこと）
- 正解を選んだときに「せいかい！」、誤答時に正しい答えが表示されるか
- 判定後に選択肢を押し直せないこと
- 「もういちど挑戦する」で1問目・とくてん0に戻り、問題が入れ替わること
- ブラウザのコンソールにエラーが出ていないこと

出題ロジックだけを検証したい場合は、`lib/quiz/*.ts` を tsc でコンパイルして
Node.js から直接呼べる（UIに依存していないため）。多数の問題を生成して
「選択肢4つ・正解を含む・重複なし・計算が正しい」を機械的に確認できる。

---

## 7. 公開フロー

1. 作業ブランチで開発し、`npm run typecheck && npm run build` が通ることを確認する
2. `main` にマージ（または直接push）する
3. GitHub Actions が自動でビルドし、GitHub Pages へ公開する
4. https://wakaru-dekita-site.com/ で確認する

### 注意点

- **`public/` に置いたファイルだけが配信される。** リポジトリ直下に置いたファイルは
  静的エクスポートに含まれない（現在 `robots.txt` がこの問題を抱えている）
- カスタムドメインは**Pages設定画面の Custom domain が正**。
  リポジトリ内の `CNAME` ファイルではない。設定が外れるとサイト全体が404になる
- Pages の有効化やドメイン検証は、ワークフローの権限では実行できない。
  リポジトリ／アカウントの設定画面から行う必要がある
