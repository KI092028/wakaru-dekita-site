# わかる・できる

登録不要ですぐ使える、小学生向けの無料学習サイトです。算数・社会・国語を、すきま時間や家庭学習で学年・単元ごとに練習できます。

練習は3しゅるい。

- **ドリル**：1セット10問。答えは選ばせず、画面内のキーパッドで打たせる
- **1手ずつ**：ひっ算を手順どおりに進める。どの手で止まったかを分けて記録する
- **図で考える**：分度器を当てる、数直線をそろえる。答えを打たせない単元もある

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## ページ構成

| パス | 内容 | 種類 |
|------|------|------|
| `/` | トップページ（その場で1問解ける） | — |
| `/learn` | 単元一覧（教科の「たなの地図」＋学年・種類で絞り込み） | — |
| `/learn/add-sub` | たし算・ひき算 | ドリル |
| `/learn/times-table` | 九九（81マスの九九マップ付き） | ドリル |
| `/learn/fractions` | 分数（通分・約分） | ドリル |
| `/learn/column-add-sub` | たし算・ひき算のひっ算 | 1手ずつ |
| `/learn/column-multiply` | かけ算のひっ算 | 1手ずつ |
| `/learn/column-decimal` | 小数のたし算・ひき算 | 1手ずつ |
| `/learn/long-division` | わり算のひっ算 | 1手ずつ |
| `/learn/long-division-2` | わり算のひっ算（2けたでわる） | 1手ずつ |
| `/learn/angle` | 角の大きさ（分度器） | 図で考える |
| `/learn/per-unit` | 単位量あたりの大きさ | 図で考える |
| `/learn/rounding` | がい数（四捨五入） | 1手ずつ |
| `/learn/mixed` | 仮分数・帯分数 | 1手ずつ |
| `/learn/percent` | 割合・百分率 | 図で考える |
| `/learn/time` | 時こく・時間 | 図で考える |
| `/learn/prefectures` | 都道府県（社会） | ゲーム |
| `/learn/capitals` | 県庁所在地（社会） | ゲーム |
| `/learn/manuscript` | 原稿用紙（国語） | 道具 |
| `/record` | じぶんの記録（端末に残っているもの・削除できる） | — |
| `/teachers` | 先生の方へ（学級レク・授業での利用） | — |
| `/about` `/privacy` `/terms` `/contact` | 固定ページ | — |

## ローカル開発

```bash
npm install
npm run dev
```

## ドキュメント

| ファイル | 内容 |
|----------|------|
| [docs/requirements.md](docs/requirements.md) | 要件定義（目的・ターゲット・機能要件・既知の課題） |
| [docs/game-elements.md](docs/game-elements.md) | ゲーム性の要素（ota tools の分析と、取り込み方の基準） |
| [docs/design-guidelines.md](docs/design-guidelines.md) | 設計・実装方針（構成・単元の追加手順・デザイントークン・公開フロー） |
| [docs/x-operations.md](docs/x-operations.md) | X運用・自動化ロードマップ（方針・コスト・計測設計） |
| [docs/game-design-research.md](docs/game-design-research.md) | 「面白さ」と再訪に関する調査（**一部訂正あり**。下の文書を併読のこと） |
| [docs/cognitive-science-research.md](docs/cognitive-science-research.md) | 認知科学から見た九九の練習設計（記号接地・乗法概念の構造・記憶と練習。上の文書の結論を訂正） |

## 設計方針

- 登録不要・保存なし
- スマホ・タブレット対応
- 出題ロジックとUIを分離（`lib/quiz/` / `components/quiz/`）
- 単元を追加しやすい構成（`lib/quiz/units.ts` に登録するだけで一覧に反映）
- 保存キーは `lib/storage/keys.ts` の一覧が正。入れ忘れは `scripts/check-storage-keys.ts` で検出できる

## ライセンス

MIT
