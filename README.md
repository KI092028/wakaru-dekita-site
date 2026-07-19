# わかる・できる

登録不要ですぐ使える、小学生向けの無料算数ドリルサイトです。すきま時間や家庭学習にぴったりの4択クイズで、計算力を身につけられます。

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## ページ構成

| パス | 内容 |
|------|------|
| `/` | トップページ（LP） |
| `/learn` | 単元一覧 |
| `/learn/add-sub` | たし算・ひき算ドリル |
| `/learn/times-table` | 九九ドリル |
| `/about` | このサイトについて |
| `/privacy` | プライバシーポリシー |
| `/terms` | 利用規約 |
| `/contact` | お問い合わせ |

## ローカル開発

```bash
npm install
npm run dev
```

## 設計方針

- 登録不要・保存なし
- スマホ・タブレット対応
- 出題ロジックとUIを分離（`lib/quiz/` / `components/quiz/`）
- 単元を追加しやすい構成（`lib/quiz/units.ts` に登録するだけで一覧に反映）

## ライセンス

MIT
