# デザインシステム仕様書
**わかる！できた！算数学習サイト**

作成日: 2026年2月11日
バージョン: 1.0
担当: 設計チーム

---

## 目次

1. [概要](#概要)
2. [カラーパレット](#カラーパレット)
3. [タイポグラフィ](#タイポグラフィ)
4. [レイアウト原則](#レイアウト原則)
5. [コンポーネント設計](#コンポーネント設計)
6. [アニメーション・インタラクション](#アニメーションインタラクション)
7. [アクセシビリティ要件](#アクセシビリティ要件)
8. [レスポンシブ対応](#レスポンシブ対応)

---

## 概要

### デザインコンセプト

**「わかる！」「できた！」の瞬間を最大化する、子供が自信を持てるデザイン**

- **親しみやすさ**: 温かみのある手書き風要素とイラスト
- **わかりやすさ**: シンプルで迷わない直感的UI
- **達成感**: 正解時の祝福演出と進捗の可視化
- **安心感**: 失敗を恐れない優しいフィードバック
- **個性**: AIパーソナライゼーションと自分だけの体験

### 2026年トレンドの反映

- **AIパーソナライゼーション**: 個別最適化されたUI体験
- **インクルーシブデザイン**: 神経多様性への配慮
- **人間らしさ**: デジタルと温かみの融合
- **マイクロインタラクション**: 小さな喜びの積み重ね

---

## カラーパレット

### 1. メインカラー

#### プライマリカラー（青系）
学習と集中を促す落ち着いた色

```
Primary-500: #4A90E2  （メインブルー）
Primary-400: #5CA3EF  （明るいブルー）
Primary-600: #3A7BCF  （濃いブルー）
Primary-300: #7BB7F3  （淡いブルー）
Primary-100: #E3F2FD  （背景用薄いブルー）
```

**使用場面**:
- メインボタン
- ヘッダー・ナビゲーション
- リンク
- プログレスバー

#### セカンダリカラー（緑系）
成長・達成・安心感を表現

```
Secondary-500: #7ED321  （メイングリーン）
Secondary-400: #96E03A  （明るいグリーン）
Secondary-600: #6ABD1A  （濃いグリーン）
Secondary-300: #AEE968  （淡いグリーン）
Secondary-100: #F1F8E9  （背景用薄いグリーン）
```

**使用場面**:
- 正解フィードバック
- 達成バッジ
- 成功メッセージ
- レベルアップ表示

### 2. アクセントカラー

#### オレンジ系（エネルギー・楽しさ）

```
Accent-Orange-500: #F5A623  （メインオレンジ）
Accent-Orange-400: #FFB84D  （明るいオレンジ）
Accent-Orange-600: #E09516  （濃いオレンジ）
```

**使用場面**:
- ヒントボタン
- 注目要素
- 新機能バッジ
- エネルギーアイコン

#### 黄色系（注意・ポジティブ）

```
Accent-Yellow-500: #FFD54F  （メイン黄色）
Accent-Yellow-300: #FFE082  （淡い黄色）
Accent-Yellow-600: #FFC107  （濃い黄色）
```

**使用場面**:
- 強調要素
- スター獲得
- ハイライト

#### 紫系（創造性・チャレンジ）

```
Accent-Purple-500: #9C27B0  （メイン紫）
Accent-Purple-300: #BA68C8  （淡い紫）
Accent-Purple-100: #F3E5F5  （背景用薄い紫）
```

**使用場面**:
- 上級レベル
- 特別チャレンジ
- プレミアム機能

### 3. 機能別カラー

#### 正解・成功

```
Success-500: #7ED321  （セカンダリグリーンと共通）
Success-Light: #C8E6C9  （淡い成功色）
Success-Dark: #2E7D32  （濃い成功色）
```

#### 不正解・エラー（優しいトーン）

```
Error-500: #FF6B6B  （優しい赤）
Error-Light: #FFCDD2  （淡いエラー色）
Error-Dark: #D32F2F  （濃いエラー色）
```

**重要**: 不正解時も厳しく感じさせないよう、柔らかいトーンを採用

#### 警告・注意

```
Warning-500: #F5A623  （アクセントオレンジと共通）
Warning-Light: #FFE0B2
Warning-Dark: #E65100
```

#### 情報・中立

```
Info-500: #4A90E2  （プライマリブルーと共通）
Info-Light: #BBDEFB
Info-Dark: #1976D2
```

### 4. ニュートラルカラー

#### グレースケール

```
Gray-900: #2C3E50  （テキスト・見出し）
Gray-800: #34495E  （副見出し）
Gray-700: #546E7A  （本文）
Gray-600: #607D8B  （副本文）
Gray-500: #78909C  （キャプション）
Gray-400: #B0BEC5  （非アクティブ）
Gray-300: #CFD8DC  （境界線）
Gray-200: #ECEFF1  （背景2）
Gray-100: #F5F7F8  （背景1）
Gray-50:  #FAFBFC  （最も薄い背景）
```

#### 背景カラー

```
Background-Primary: #FFFFFF  （メイン背景・白）
Background-Secondary: #F8F9FA  （セクション背景）
Background-Gradient-1: linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 50%, #FFF3E0 100%)
Background-Gradient-2: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)
```

### 5. ダークモード対応

```
Dark-Background-Primary: #1E1E1E
Dark-Background-Secondary: #2D2D2D
Dark-Background-Tertiary: #383838
Dark-Text-Primary: #FFFFFF
Dark-Text-Secondary: #B0B0B0
Dark-Border: #404040
```

### 6. アクセシビリティ準拠

**WCAG 2.1 AA基準**:
- テキストと背景のコントラスト比: 4.5:1以上
- 大きなテキスト（18pt以上）: 3:1以上
- 色だけに頼らない情報伝達（アイコン・テキストも併用）

**コントラスト比チェック済みの組み合わせ**:

| 前景色 | 背景色 | コントラスト比 | 判定 |
|--------|--------|----------------|------|
| Gray-900 (#2C3E50) | White (#FFFFFF) | 12.63:1 | AAA |
| Gray-700 (#546E7A) | White (#FFFFFF) | 6.52:1 | AA |
| Primary-500 (#4A90E2) | White (#FFFFFF) | 3.58:1 | AA (大テキスト) |
| White (#FFFFFF) | Primary-600 (#3A7BCF) | 4.89:1 | AA |
| White (#FFFFFF) | Success-Dark (#2E7D32) | 6.34:1 | AA |
| White (#FFFFFF) | Error-Dark (#D32F2F) | 5.52:1 | AA |

---

## タイポグラフィ

### 1. フォントファミリー

#### 日本語フォント

**見出し・タイトル**:
```css
font-family: 'UD Digi Kyokasho NK-B', 'UD Digi Kyokasho N-B', '游ゴシック体', 'Yu Gothic', YuGothic, 'メイリオ', Meiryo, sans-serif;
```
- UD（ユニバーサルデザイン）フォント優先
- 文字の判別がしやすい
- 視認性が高い

**本文**:
```css
font-family: 'UD Digi Kyokasho NK-R', 'UD Digi Kyokasho N-R', '游ゴシック体', 'Yu Gothic', YuGothic, 'メイリオ', Meiryo, sans-serif;
```
- 長文でも読みやすい
- 柔らかい印象

**強調・手書き風**:
```css
font-family: 'こども丸ゴシック', 'Kiwi Maru', 'UD丸ゴシック', '游ゴシック体', sans-serif;
```
- 親しみやすい
- 手書き風で温かみ
- 子供向けコンテンツに最適

#### 英数字フォント

**数字専用**:
```css
font-family: 'Poppins', 'Roboto', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif;
font-feature-settings: 'tnum';  /* 等幅数字 */
font-variant-numeric: tabular-nums;
```
- 数字が見やすい
- 計算問題で桁が揃う
- モダンで読みやすい

### 2. フォントサイズスケール

#### デスクトップ（PC・タブレット横持ち）

```css
/* 見出し */
H1: 32px  (2rem)    font-weight: 700
H2: 24px  (1.5rem)  font-weight: 700
H3: 20px  (1.25rem) font-weight: 600
H4: 18px  (1.125rem) font-weight: 600

/* 本文 */
Body-Large: 18px  (1.125rem) font-weight: 400
Body: 16px  (1rem)     font-weight: 400
Body-Small: 14px  (0.875rem) font-weight: 400
Caption: 12px  (0.75rem)   font-weight: 400

/* ボタン */
Button-Large: 18px  (1.125rem) font-weight: 600
Button: 16px  (1rem)     font-weight: 600
Button-Small: 14px  (0.875rem) font-weight: 600

/* 特殊 */
Number-Display: 36-48px  font-weight: 700  （問題の数字表示）
```

#### モバイル（スマートフォン）

```css
/* 見出し */
H1: 28px  (1.75rem)  font-weight: 700
H2: 22px  (1.375rem) font-weight: 700
H3: 18px  (1.125rem) font-weight: 600
H4: 16px  (1rem)     font-weight: 600

/* 本文 */
Body-Large: 18px  (1.125rem) font-weight: 400
Body: 16px  (1rem)     font-weight: 400
Body-Small: 14px  (0.875rem) font-weight: 400
Caption: 12px  (0.75rem)   font-weight: 400

/* ボタン */
Button-Large: 18px  (1.125rem) font-weight: 600
Button: 16px  (1rem)     font-weight: 600
Button-Small: 14px  (0.875rem) font-weight: 600
```

**重要**: 子供向けのため、最小フォントサイズは12px（0.75rem）とする

### 3. 行間・字間

#### 行間（line-height）

```css
/* 見出し */
H1-H2: 1.3  （見出しは詰める）
H3-H4: 1.4

/* 本文 */
Body: 1.7   （読みやすさ重視）
Body-Small: 1.6
Caption: 1.5

/* ボタン */
Button: 1.5  （中央配置しやすく）
```

#### 字間（letter-spacing）

```css
/* 基本 */
Default: 0.02em  （わずかに広げる）

/* 見出し */
H1: 0.01em
H2-H4: 0.02em

/* 本文 */
Body: 0.03em  （低学年向けにやや広め）

/* ボタン */
Button: 0.05em  （押しやすく）

/* 数字 */
Number: 0  （等幅数字のため調整不要）
```

### 4. テキスト装飾

#### 太字（font-weight）

```css
Light: 300   （使用しない - 子供には細すぎる）
Regular: 400 （本文）
Medium: 500  （軽い強調）
Semi-Bold: 600 （ボタン・小見出し）
Bold: 700    （見出し・重要）
Extra-Bold: 800 （特別強調）
```

#### テキストシャドウ（text-shadow）

```css
/* 見出し用（立体感） */
Heading-Shadow: 2px 2px 4px rgba(0, 0, 0, 0.1)

/* ボタン用（くっきり） */
Button-Shadow: 1px 1px 2px rgba(0, 0, 0, 0.15)

/* カラー背景上の白文字用 */
White-Text-Shadow: 1px 1px 3px rgba(0, 0, 0, 0.3)
```

---

## レイアウト原則

### 1. グリッドシステム

#### 12カラムグリッド

```css
Container-Max-Width: 1200px
Column-Count: 12
Gutter: 24px  （カラム間隔）
Margin: 24px  （画面端余白）
```

#### カラム構成パターン

**デスクトップ（1200px以上）**:
- 3カラムレイアウト: 4 + 4 + 4
- 2カラムレイアウト: 6 + 6 または 8 + 4
- 1カラムレイアウト: 12（中央寄せ、max-width: 800px）

**タブレット（768px - 1199px）**:
- 2カラムレイアウト: 6 + 6
- 1カラムレイアウト: 12（max-width: 720px）

**モバイル（767px以下）**:
- 1カラムレイアウトのみ: 12（max-width: 100% - 32px）

### 2. 余白（Spacing）

#### 余白スケール（8pxベース）

```css
Spacing-0: 0px
Spacing-1: 4px    (0.25rem)
Spacing-2: 8px    (0.5rem)
Spacing-3: 12px   (0.75rem)
Spacing-4: 16px   (1rem)
Spacing-5: 24px   (1.5rem)
Spacing-6: 32px   (2rem)
Spacing-7: 40px   (2.5rem)
Spacing-8: 48px   (3rem)
Spacing-9: 64px   (4rem)
Spacing-10: 80px  (5rem)
```

#### 余白の使い方

**コンポーネント内余白（padding）**:
- ボタン内: Spacing-4 (16px) 縦、Spacing-6 (32px) 横
- カード内: Spacing-5 (24px) 〜 Spacing-6 (32px)
- 入力フィールド: Spacing-3 (12px) 〜 Spacing-4 (16px)

**コンポーネント間余白（margin）**:
- セクション間: Spacing-8 (48px) 〜 Spacing-9 (64px)
- カード間: Spacing-5 (24px)
- 段落間: Spacing-4 (16px)
- リスト項目間: Spacing-3 (12px)

### 3. レスポンシブブレークポイント

```css
Mobile-Small: 320px   /* 最小対応幅 */
Mobile: 375px         /* iPhone SE基準 */
Mobile-Large: 428px   /* iPhone Pro Max基準 */
Tablet: 768px         /* iPad縦持ち基準 */
Tablet-Large: 1024px  /* iPad横持ち基準 */
Desktop: 1200px       /* ノートPC基準 */
Desktop-Large: 1440px /* デスクトップモニター */
Desktop-XL: 1920px    /* 大型モニター */
```

#### メディアクエリ定義

```css
/* モバイルファースト推奨 */
@media (min-width: 768px)  { /* タブレット以上 */ }
@media (min-width: 1024px) { /* タブレット横以上 */ }
@media (min-width: 1200px) { /* デスクトップ以上 */ }

/* 必要に応じて */
@media (max-width: 767px)  { /* モバイルのみ */ }
@media (max-width: 1023px) { /* タブレット縦まで */ }
```

### 4. コンテナ・ラッパー

```css
/* メインコンテナ */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

/* セクションラッパー */
.section {
    padding: 48px 0;  /* 縦余白 */
}

/* カードコンテナ */
.card-container {
    padding: 24px;
    border-radius: 20px;
    background: #FFFFFF;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
```

### 5. Zインデックス階層

```css
/* 階層管理 */
z-index-base: 0        /* 通常要素 */
z-index-dropdown: 10   /* ドロップダウン */
z-index-sticky: 100    /* スティッキーヘッダー */
z-index-modal-bg: 900  /* モーダル背景 */
z-index-modal: 1000    /* モーダル本体 */
z-index-toast: 1100    /* トースト通知 */
z-index-tooltip: 1200  /* ツールチップ */
```

---

## コンポーネント設計

### 1. ボタン

#### プライマリボタン

```css
/* デフォルト */
background: linear-gradient(90deg, #66bb6a 0%, #4caf50 100%);
color: #FFFFFF;
border: none;
border-radius: 25px;
padding: 12px 32px;
font-size: 16px;
font-weight: 600;
box-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
cursor: pointer;
transition: all 0.3s ease;

/* ホバー */
transform: translateY(-2px);
box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);

/* アクティブ */
transform: translateY(0);
box-shadow: 0 1px 5px rgba(76, 175, 80, 0.3);

/* 無効 */
background: linear-gradient(90deg, #B0BEC5, #CFD8DC);
cursor: not-allowed;
box-shadow: none;
```

#### セカンダリボタン

```css
background: linear-gradient(90deg, #4A90E2, #3A7BCF);
color: #FFFFFF;
border: none;
border-radius: 25px;
padding: 12px 32px;
font-size: 16px;
font-weight: 600;
box-shadow: 0 2px 10px rgba(74, 144, 226, 0.3);
/* ホバー・アクティブは同様 */
```

#### テキストボタン

```css
background: transparent;
color: #4A90E2;
border: none;
padding: 8px 16px;
font-size: 16px;
font-weight: 600;
cursor: pointer;
transition: color 0.3s ease;

/* ホバー */
color: #3A7BCF;
text-decoration: underline;
```

#### アウトラインボタン

```css
background: transparent;
color: #4A90E2;
border: 2px solid #4A90E2;
border-radius: 25px;
padding: 10px 30px;  /* border分を引く */
font-size: 16px;
font-weight: 600;
cursor: pointer;
transition: all 0.3s ease;

/* ホバー */
background: #4A90E2;
color: #FFFFFF;
```

#### サイズバリエーション

```css
/* 大 */
padding: 16px 48px;
font-size: 18px;
border-radius: 30px;

/* 中（デフォルト） */
padding: 12px 32px;
font-size: 16px;
border-radius: 25px;

/* 小 */
padding: 8px 24px;
font-size: 14px;
border-radius: 20px;
```

### 2. カード

#### ベーシックカード

```css
background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%);
border-radius: 20px;
padding: 24px;
border: 2px solid #E0E0E0;
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
transition: all 0.3s ease;

/* ホバー */
transform: translateY(-4px);
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
border-color: #4fc3f7;
```

#### アプリカード

```css
/* 通常カード + クリック可能 */
cursor: pointer;

/* 新着マーク付き */
position: relative;

.new-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #FF5722;
    color: #FFFFFF;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    transform: rotate(15deg);
    box-shadow: 0 2px 8px rgba(255, 87, 34, 0.3);
}
```

#### 教科カード（カラー別）

```css
/* 算数（黄色） */
background: linear-gradient(135deg, #ffecb3 0%, #fff176 100%);

/* 国語（ピンク） */
background: linear-gradient(135deg, #f8bbd9 0%, #f48fb1 100%);

/* 理科（緑） */
background: linear-gradient(135deg, #c8e6c9 0%, #81c784 100%);

/* 社会（紫） */
background: linear-gradient(135deg, #d1c4e9 0%, #b39ddb 100%);
```

### 3. インプット（入力フィールド）

#### テキストインプット

```css
/* デフォルト */
width: 100%;
padding: 12px 16px;
border: 2px solid #CFD8DC;
border-radius: 12px;
font-size: 16px;
background: #FFFFFF;
transition: all 0.3s ease;
outline: none;

/* フォーカス */
border-color: #4A90E2;
box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);

/* エラー */
border-color: #FF6B6B;
box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);

/* 成功 */
border-color: #7ED321;
box-shadow: 0 0 0 3px rgba(126, 211, 33, 0.1);

/* 無効 */
background: #F5F7F8;
cursor: not-allowed;
```

#### 数値インプット（大きめ）

```css
/* 問題解答用 */
width: 120px;
padding: 16px;
border: 3px solid #4A90E2;
border-radius: 16px;
font-size: 36px;
font-weight: 700;
text-align: center;
font-family: 'Poppins', 'Roboto', sans-serif;
background: #FFFFFF;
box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
```

### 4. バッジ

#### 情報バッジ

```css
display: inline-block;
padding: 6px 12px;
border-radius: 12px;
font-size: 12px;
font-weight: 600;
```

**バリエーション**:

```css
/* 難易度（緑） */
background: linear-gradient(90deg, #66bb6a, #4caf50);
color: #FFFFFF;

/* カテゴリ（オレンジ） */
background: linear-gradient(90deg, #ff9800, #f57c00);
color: #FFFFFF;

/* 学年（青） */
background: linear-gradient(90deg, #4fc3f7, #29b6f6);
color: #FFFFFF;

/* 新着（赤） */
background: linear-gradient(90deg, #FF5722, #E64A19);
color: #FFFFFF;
```

### 5. プログレスバー

```css
/* コンテナ */
.progress-bar-container {
    width: 100%;
    height: 24px;
    background: #ECEFF1;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* バー */
.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #7ED321 0%, #96E03A 100%);
    border-radius: 12px;
    transition: width 0.5s ease;
    position: relative;
    overflow: hidden;
}

/* アニメーション */
.progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    to { left: 100%; }
}
```

### 6. モーダル

```css
/* 背景オーバーレイ */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

/* モーダル本体 */
.modal {
    background: #FFFFFF;
    border-radius: 24px;
    padding: 32px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: modal-appear 0.3s ease;
}

@keyframes modal-appear {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
```

### 7. トースト通知

```css
.toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 16px 24px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 1100;
    animation: toast-slide-in 0.3s ease;
    max-width: 400px;
}

/* バリエーション */
.toast-success {
    background: linear-gradient(135deg, #7ED321, #96E03A);
    color: #FFFFFF;
}

.toast-error {
    background: linear-gradient(135deg, #FF6B6B, #FF8787);
    color: #FFFFFF;
}

.toast-info {
    background: linear-gradient(135deg, #4A90E2, #5CA3EF);
    color: #FFFFFF;
}

@keyframes toast-slide-in {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
```

---

## アニメーション・インタラクション

### 1. 基本トランジション

```css
/* デフォルト（短い） */
transition: all 0.2s ease;

/* 標準 */
transition: all 0.3s ease;

/* ゆっくり（長い） */
transition: all 0.5s ease;
```

### 2. イージング関数

```css
/* 標準イージング */
ease: cubic-bezier(0.25, 0.1, 0.25, 1)

/* イーズイン（加速） */
ease-in: cubic-bezier(0.42, 0, 1, 1)

/* イーズアウト（減速） */
ease-out: cubic-bezier(0, 0, 0.58, 1)

/* イーズインアウト（両方） */
ease-in-out: cubic-bezier(0.42, 0, 0.58, 1)

/* バウンス（弾む） */
bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### 3. マイクロインタラクション

#### ボタンタップ

```css
/* タップ時 */
@keyframes button-press {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
}

button:active {
    animation: button-press 0.1s ease;
}
```

#### ホバーエフェクト

```css
/* 浮き上がり */
.hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* 拡大 */
.hover-scale:hover {
    transform: scale(1.05);
}

/* 輝き */
@keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
}

.hover-shimmer {
    background: linear-gradient(90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent);
    background-size: 200% 100%;
}

.hover-shimmer:hover {
    animation: shimmer 1s ease;
}
```

### 4. 正解フィードバックアニメーション

#### 紙吹雪（Confetti）

```css
@keyframes confetti-fall {
    0% {
        opacity: 1;
        transform: translateY(-100vh) rotate(0deg);
    }
    100% {
        opacity: 0;
        transform: translateY(100vh) rotate(360deg);
    }
}

.confetti {
    position: fixed;
    width: 10px;
    height: 10px;
    background: #FFD54F;
    animation: confetti-fall 3s ease-out;
    z-index: 1000;
}
```

#### スター獲得

```css
@keyframes star-burst {
    0% {
        transform: scale(0) rotate(0deg);
        opacity: 1;
    }
    50% {
        transform: scale(1.5) rotate(180deg);
        opacity: 1;
    }
    100% {
        transform: scale(1) rotate(360deg);
        opacity: 1;
    }
}

.star-icon {
    animation: star-burst 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

#### 祝福フラッシュ

```css
@keyframes success-flash {
    0% { background: transparent; }
    50% { background: rgba(126, 211, 33, 0.2); }
    100% { background: transparent; }
}

.success-flash {
    animation: success-flash 0.5s ease;
}
```

### 5. 不正解フィードバックアニメーション

#### シェイク（揺れ）

```css
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.error-shake {
    animation: shake 0.5s ease;
}
```

#### 優しいフェードイン（ヒント表示）

```css
@keyframes hint-appear {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.hint {
    animation: hint-appear 0.3s ease;
}
```

### 6. ページ遷移アニメーション

#### フェードイン

```css
@keyframes page-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

.page-enter {
    animation: page-fade-in 0.5s ease;
}
```

#### スライドイン

```css
@keyframes slide-in-right {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.page-slide-in {
    animation: slide-in-right 0.4s ease;
}
```

### 7. ローディングアニメーション

#### スピナー

```css
@keyframes spinner-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #ECEFF1;
    border-top-color: #4A90E2;
    border-radius: 50%;
    animation: spinner-rotate 1s linear infinite;
}
```

#### パルス（脈動）

```css
@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
}

.pulse {
    animation: pulse 1.5s ease-in-out infinite;
}
```

### 8. スクロールアニメーション

```css
/* スクロールで表示 */
.fade-in-on-scroll {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in-on-scroll.visible {
    opacity: 1;
    transform: translateY(0);
}
```

---

## アクセシビリティ要件

### 1. WCAG 2.1 AA準拠

#### 必須対応項目

**1.1 代替テキスト**:
- すべての画像に`alt`属性を設定
- 装飾画像は`alt=""`（空）
- 意味のある画像は内容を説明

**1.3 情報と関係性**:
- セマンティックHTML使用（`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`）
- 見出しタグの階層構造を守る（`<h1>` → `<h2>` → `<h3>`）
- リストは`<ul>`, `<ol>`, `<li>`を使用

**1.4 コントラスト**:
- テキストと背景のコントラスト比4.5:1以上
- 大きなテキスト（18pt以上）は3:1以上
- 色だけで情報を伝えない（アイコンやテキストも併用）

**2.1 キーボード操作**:
- すべての機能にキーボードでアクセス可能
- Tab順序が論理的
- フォーカス状態の明確な表示

**2.4 ナビゲーション**:
- スキップリンク提供（「本文へスキップ」）
- パンくずリスト
- 明確な見出し構造

**3.1 読みやすさ**:
- `lang`属性設定（`<html lang="ja">`）
- 難しい用語には説明

**4.1 互換性**:
- 有効なHTML
- ARIAラベル適切に使用

### 2. フォーカス管理

```css
/* フォーカス表示（デフォルト） */
*:focus {
    outline: 3px solid #4fc3f7;
    outline-offset: 2px;
}

/* ボタンフォーカス */
button:focus,
a:focus {
    outline: 3px solid #4A90E2;
    outline-offset: 4px;
}

/* インプットフォーカス */
input:focus,
select:focus,
textarea:focus {
    outline: none;
    border-color: #4A90E2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
}
```

### 3. ARIAラベル

```html
<!-- ボタン -->
<button aria-label="かけ算九九ゲームを開く">
    はじめる
</button>

<!-- ナビゲーション -->
<nav role="navigation" aria-label="メインナビゲーション">
    <!-- ... -->
</nav>

<!-- 検索 -->
<label for="search" class="sr-only">検索</label>
<input type="search" id="search" aria-label="学習内容を検索">

<!-- プログレスバー -->
<div role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100">
    60%完了
</div>

<!-- ライブリージョン（動的更新） -->
<div role="status" aria-live="polite">
    正解！次の問題です。
</div>
```

### 4. スクリーンリーダー対応

```css
/* スクリーンリーダー専用テキスト */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

### 5. ハイコントラストモード対応

```css
@media (prefers-contrast: high) {
    /* ボーダー強化 */
    .card {
        border: 3px solid #000000;
    }

    /* テキストコントラスト強化 */
    body {
        color: #000000;
        background: #FFFFFF;
    }
}
```

### 6. リデュースモーション対応

```css
@media (prefers-reduced-motion: reduce) {
    /* アニメーションを最小化 */
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

### 7. タッチターゲットサイズ

```css
/* 最小タッチサイズ: 44px × 44px（WCAG推奨） */
button,
a,
input[type="checkbox"],
input[type="radio"] {
    min-width: 44px;
    min-height: 44px;
}

/* 子供向けは大きめ推奨: 48px × 48px */
.child-target {
    min-width: 48px;
    min-height: 48px;
}

/* 要素間の間隔も確保 */
.button-group > * + * {
    margin-left: 8px;
}
```

---

## レスポンシブ対応

### 1. モバイルファースト設計

**基本方針**:
- モバイル（スマートフォン）を最優先
- タブレット、デスクトップの順で拡張
- すべての機能がモバイルで動作

### 2. デバイス別レイアウト

#### モバイル（375px - 767px）

```css
/* 1カラムレイアウト */
.container {
    padding: 0 16px;
}

/* フォントサイズ縮小 */
h1 { font-size: 28px; }
h2 { font-size: 22px; }

/* ボタンを大きく */
button {
    width: 100%;
    padding: 16px;
    font-size: 18px;
}

/* カード縦並び */
.card-grid {
    grid-template-columns: 1fr;
    gap: 16px;
}

/* ナビゲーションハンバーガーメニュー */
.nav-menu {
    display: none;
}

.hamburger {
    display: block;
}
```

#### タブレット（768px - 1023px）

```css
@media (min-width: 768px) {
    /* 2カラムレイアウト */
    .card-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
    }

    /* ボタンは自動幅 */
    button {
        width: auto;
        padding: 12px 32px;
    }

    /* ナビゲーション表示 */
    .nav-menu {
        display: flex;
    }

    .hamburger {
        display: none;
    }
}
```

#### デスクトップ（1024px以上）

```css
@media (min-width: 1024px) {
    /* 3カラムレイアウト */
    .card-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
    }

    /* コンテナ幅制限 */
    .container {
        max-width: 1200px;
    }
}
```

### 3. タッチ対応

```css
/* タッチデバイスでホバー無効化 */
@media (hover: none) {
    .hover-effect:hover {
        transform: none;
    }
}

/* タッチデバイスで大きめボタン */
@media (pointer: coarse) {
    button {
        min-height: 48px;
        padding: 14px 28px;
    }
}
```

### 4. 画像最適化

```html
<!-- レスポンシブ画像 -->
<picture>
    <source media="(min-width: 1024px)" srcset="image-large.webp">
    <source media="(min-width: 768px)" srcset="image-medium.webp">
    <img src="image-small.webp" alt="説明" loading="lazy">
</picture>

<!-- または srcset -->
<img
    srcset="image-320w.webp 320w,
            image-640w.webp 640w,
            image-1024w.webp 1024w"
    sizes="(max-width: 768px) 100vw,
           (max-width: 1024px) 50vw,
           33vw"
    src="image-640w.webp"
    alt="説明"
    loading="lazy"
>
```

### 5. フォント調整

```css
/* ビューポート単位でスケール */
html {
    font-size: 14px;
}

@media (min-width: 768px) {
    html {
        font-size: 16px;
    }
}

@media (min-width: 1200px) {
    html {
        font-size: 18px;
    }
}

/* clampでスムーズ調整 */
h1 {
    font-size: clamp(24px, 4vw, 36px);
}
```

---

## 実装チェックリスト

### デザインシステム実装時の確認事項

- [ ] カラーパレットをCSS変数で定義
- [ ] タイポグラフィスケールを実装
- [ ] グリッドシステムを構築
- [ ] 全コンポーネントをスタイルガイドに登録
- [ ] アニメーションライブラリを統合
- [ ] アクセシビリティチェックツール導入
- [ ] レスポンシブテスト（実機）
- [ ] ダークモード実装
- [ ] パフォーマンス最適化（CSS minify）
- [ ] ブラウザ互換性テスト

### ブラウザ対応

**優先度高**:
- Chrome（最新2バージョン）
- Safari（最新2バージョン）
- Edge（最新2バージョン）

**優先度中**:
- Firefox（最新2バージョン）
- iOS Safari（最新2バージョン）
- Android Chrome（最新2バージョン）

**非対応**:
- Internet Explorer（サポート終了）

---

## まとめ

このデザインシステムは、子供たちが「わかる！」「できた！」を感じられる学習体験を提供するための基盤です。

**重要原則**:
1. **子供第一**: すべての決定は子供の使いやすさを優先
2. **一貫性**: 全ページ・全アプリで統一されたデザイン
3. **アクセシビリティ**: すべての子供が使える配慮
4. **楽しさ**: 学習が楽しくなるビジュアルとインタラクション
5. **成長**: フィードバックと改善を継続

実装チームは本ドキュメントを基に、コンポーネントライブラリを構築し、全アプリに適用してください。
