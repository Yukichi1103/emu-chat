# えむチャット

えむとLINE風にチャットできるWebアプリです。

## セットアップ手順

### 1. プロジェクトに移動

```bash
cd emu-chat
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. APIキーを設定

`.env.local` ファイルを開いて、`ANTHROPIC_API_KEY` を設定してください。

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxx
```

APIキーは https://console.anthropic.com/ から取得できます。

### 4. 開発サーバーを起動

```bash
npm run dev
```

### 5. ブラウザで開く

```
http://localhost:3000
```

## 機能

- LINE風チャット UI（スマホ・PC両対応）
- えむ人格プロンプトによるClaude API返信
- 会話履歴をlocalStorageに保存
- 背景画像・アイコン画像の変更
- 会話履歴の削除

## 設定変更

ヘッダーのアイコンまたは ⚙️ ボタンから設定画面を開けます。

- **背景画像**: 好きな画像に変更可能
- **えむのアイコン**: 好きな画像に変更可能
- **会話履歴の削除**: チャット履歴をリセット

## ビルド（本番用）

```bash
npm run build
npm start
```
