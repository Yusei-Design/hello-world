# バス停マップアプリ

NotionデータベースとOpenFreeMapを利用したリアルタイムバス停表示アプリケーション

## 🚀 機能

- **Notion API連携**: バス停データをNotionデータベースから取得
- **インタラクティブマップ**: OpenFreeMapを使用した地図表示
- **リアルタイム更新**: データ更新ボタンで最新情報を取得
- **レスポンシブデザイン**: スマートフォン・タブレット対応
- **セキュア**: APIキーを直接クライアントに露出しない

## 📋 必要なデータベース構造

Notionで以下のプロパティを持つデータベースを作成してください：

| プロパティ名 | タイプ | 説明 |
|-------------|--------|------|
| `stop_desc` | Title | バス停名・のりば名（メインタイトル） |
| `stop_id` | Text | バス停ID（一意識別子） |
| `stop_lat` | Number | 緯度 |
| `stop_lon` | Number | 経度 |

## 🛠️ セットアップ

### 1. Notion Integration作成

1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. "New integration" をクリック
3. 名前を入力（例：Bus Stop Map）
4. ワークスペースを選択
5. "Submit" をクリック
6. **Internal Integration Token** をコピー

### 2. データベース設定

1. Notionでバス停データベースを開く
2. 右上の「⋯」メニューをクリック
3. "Connections" → "Connect to" → 作成したIntegrationを選択
4. データベースURLからDatabase IDを取得
   - URL例: `https://notion.so/workspace/xxxxxxxxxxxxxx?v=yyyy`
   - Database ID: `xxxxxxxxxxxxxx`部分

### 3. 環境変数設定

\`.env.local\` ファイルを作成：

\`\`\`bash
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

### 4. 依存関係インストール

\`\`\`bash
npm install
\`\`\`

### 5. 開発サーバー起動

\`\`\`bash
npm run dev
\`\`\`

## 🚀 Vercelデプロイ

### 1. リポジトリプッシュ

\`\`\`bash
git add .
git commit -m "Add bus stop map application"
git push
\`\`\`

### 2. Vercelデプロイ

1. [Vercel](https://vercel.com) でGitHubリポジトリをインポート
2. 環境変数を設定：
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`
3. "Deploy" をクリック

## 📁 プロジェクト構造

\`\`\`
├── api/
│   └── bus-stops.ts      # Notion API接続
├── components/
│   └── BusStopMap.tsx    # マップコンポーネント
├── pages/
│   └── index.tsx         # メインページ
├── styles/
├── public/
├── package.json
├── next.config.js
└── vercel.json
\`\`\`

## 🔧 技術スタック

- **フレームワーク**: Next.js 14 (TypeScript)
- **マップ**: React-Leaflet + OpenFreeMap
- **データベース**: Notion API
- **デプロイ**: Vercel
- **スタイリング**: CSS-in-JS (styled-jsx)

## 🔐 セキュリティ

- APIキーはサーバーサイドでのみ使用
- CORS設定済み
- 環境変数による機密情報保護

## 🛠️ 拡張可能性

このアプリケーションは将来の拡張を考慮して設計されています：

- **バス停ID管理**: 一意のIDによるバス停管理
- **追加データフィールド**: 運行情報、時刻表など
- **リアルタイム情報**: バス位置情報API連携
- **ルート検索**: 経路案内機能
- **多言語対応**: 国際化対応

## 📝 トラブルシューティング

### よくある問題

1. **マップが表示されない**
   - ブラウザのコンソールでエラーを確認
   - Leaflet CSSが正しく読み込まれているか確認

2. **データが取得できない**
   - Notion Integrationの権限を確認
   - Database IDが正しいか確認
   - 環境変数が正しく設定されているか確認

3. **デプロイエラー**
   - Vercelの環境変数設定を確認
   - ビルドログでエラー内容を確認

## 📞 サポート

問題が発生した場合は、以下を確認してください：

- Notion APIの制限やステータス
- OpenFreeMapのサービス状況
- Vercelのサービス状況

---

**注意**: このアプリケーションはNotion APIの利用制限に従って使用してください。