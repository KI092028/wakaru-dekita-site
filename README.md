# 先生の道具箱

登録不要ですぐ使える、教員向けのシンプルなお助けツールサイトです。

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## ページ構成

| パス | 内容 |
|------|------|
| `/` | トップページ |
| `/apps/seat-shuffle` | 席替え自動作成アプリ |
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
- PC優先、タブレット対応
- UIとロジックを分離（`lib/seat-shuffle/`）
- 将来的なアプリ追加を前提とした構成

## ライセンス

MIT
