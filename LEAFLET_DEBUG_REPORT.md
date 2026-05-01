# Leaflet青一色表示問題 - 調査レポート

## 🔍 問題の概要

### 現象
- OpenFreeMap (`https://tiles.openfree.map/osm/{z}/{x}/{y}.png`) を使用
- タイル読み込みが「成功」と表示される
- 実際には青い背景（海のような色）のみが表示される
- マーカーは正常に表示される

### 環境
- ライブラリ: Leaflet 1.9.4
- ブラウザ: 最新のモダンブラウザ
- 座標: 東京駅周辺 (35.6762, 139.6503)

## 🧪 調査結果

### 1. OpenFreeMapサービス状態の確認

```bash
$ curl -I https://tiles.openfree.map/osm/7/63/42.png
curl: (6) Could not resolve host: tiles.openfree.map
```

**結果**: DNSエラー、サービス利用不可

### 2. 根本原因の特定

#### 主要原因
1. **OpenFreeMapサービスの停止**
   - DNSが解決できない状態
   - サーバーダウンまたはサービス終了の可能性

#### 二次的原因（一般的なケース）
1. **タイルURL形式の問題**
   - 正しい形式: `{z}/{x}/{y}.png`
   - 間違った形式: `{x}/{y}/{z}.png` など

2. **CORSエラー**
   - ブラウザのセキュリティポリシーによる制限
   - `crossOrigin` 設定が必要な場合

3. **タイル座標系の問題**
   - Web Mercator (EPSG:3857) 以外の座標系
   - ズームレベルの範囲外アクセス

## 📋 推奨解決策

### 即座の解決策：代替タイルサービスの使用

#### 1. OpenStreetMap標準タイル（最推奨）
```javascript
const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
```

**利点:**
- ✅ 最高の信頼性
- ✅ 公式サポート
- ✅ 無料利用可能
- ✅ IPv6対応

#### 2. CartoDB Positron（代替案1）
```javascript
const tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd'
});
```

**利点:**
- ✅ 軽量デザイン
- ✅ 高速読み込み
- ✅ データ重ね表示に最適
- ⚠️ 商用利用時は利用条件要確認

#### 3. Stamen Toner（代替案2）
```javascript
const tileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://stamen.com/">Stamen Design</a>'
});
```

**利点:**
- ✅ モノクロでスタイリッシュ
- ✅ 文字が読みやすい
- ✅ 無料利用可能（一定制限内）

## 🛠️ デバッグ方法

### 1. タイル読み込み状態の監視

```javascript
tileLayer.on('loading', function() {
    console.log('タイル読み込み開始');
});

tileLayer.on('load', function() {
    console.log('タイル読み込み完了');
});

tileLayer.on('tileerror', function(e) {
    console.error('タイルエラー:', e.tile.src);
});
```

### 2. ネットワークタブでの確認

1. ブラウザの開発者ツールを開く (F12)
2. Networkタブを選択
3. ページをリロード
4. タイル画像リクエストの状態を確認

**確認項目:**
- HTTPステータスコード（200が正常）
- レスポンスサイズ（0バイトは問題）
- エラーメッセージの内容

### 3. 手動タイル確認

ブラウザで直接タイルURLにアクセス:
```
https://tile.openstreetmap.org/13/7281/3209.png
```

## 📊 サービス比較表

| サービス | 信頼性 | 更新頻度 | 商用利用 | IPv6 | 特徴 |
|---------|-------|---------|---------|------|------|
| OpenStreetMap標準 | ⭐⭐⭐⭐⭐ | 1分-1日 | 制限付き無料 | ✅ | 公式、最高信頼性 |
| CartoDB Positron | ⭐⭐⭐⭐ | 週次 | 登録必要 | ❌ | 軽量、データ重ね向き |
| Stamen Toner | ⭐⭐⭐⭐ | 週次 | 制限付き無料 | ✅ | モノクロ、スタイリッシュ |
| OpenFreeMap | ❌ | - | - | - | 現在利用不可 |

## 🔧 実装手順

### Step 1: メインファイルの修正

`index.html` の132行目付近を以下に変更:

```javascript
// 修正前
const tileLayer = L.tileLayer('https://tiles.openfree.map/osm/{z}/{x}/{y}.png', {
    // ...
});

// 修正後（推奨）
const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
```

### Step 2: エラーハンドリングの改善

```javascript
tileLayer.on('tileerror', function(e) {
    console.error('Tile loading error:', e.tile.src);
    // フォールバック処理
    if (!e.tile.fallbackAttempted) {
        e.tile.fallbackAttempted = true;
        e.tile.src = 'https://tile.openstreetmap.org/' + e.tile.src.split('/').slice(-3).join('/');
    }
});
```

### Step 3: テスト用ページの活用

`leaflet-debug.html` を使用して複数のタイルサービスをテスト。

## 🚨 注意事項

### 利用規約の遵守

1. **OpenStreetMap**: 
   - 大量アクセス時は独自サーバー推奨
   - 適切なattribution必須

2. **商用タイルサービス**:
   - 利用制限・料金体系の確認
   - APIキーの取得が必要な場合

3. **CORS設定**:
   - HTTPSサイトからHTTPタイルアクセス不可
   - 必要に応じて`crossOrigin: true`設定

### パフォーマンス最適化

```javascript
const tileLayer = L.tileLayer(tileUrl, {
    maxZoom: 18,
    keepBuffer: 2,           // タイル保持枚数
    updateWhenZooming: false, // ズーム中の更新停止
    updateWhenIdle: true     // アイドル時に更新
});
```

## 📈 今後の対策

### 1. フォールバック機能の実装

```javascript
const tileServices = [
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
];

let currentServiceIndex = 0;

function createTileLayer() {
    const layer = L.tileLayer(tileServices[currentServiceIndex], {
        maxZoom: 18,
        attribution: getAttribution(currentServiceIndex)
    });
    
    layer.on('tileerror', function() {
        if (currentServiceIndex < tileServices.length - 1) {
            currentServiceIndex++;
            map.removeLayer(layer);
            map.addLayer(createTileLayer());
        }
    });
    
    return layer;
}
```

### 2. サービス監視の実装

定期的にタイルサービスの健康状態をチェックし、問題があれば自動的に代替サービスに切り替える機能の実装を検討。

### 3. キャッシュ戦略

```javascript
const tileLayer = L.tileLayer(tileUrl, {
    // ブラウザキャッシュの活用
    useCache: true,
    // タイルの有効期限設定
    cacheMaxAge: 86400000 // 24時間
});
```

## 📝 まとめ

**問題の根本原因**: OpenFreeMapサービスの利用不可

**即座の解決策**: OpenStreetMap標準タイルへの変更

**長期的対策**: フォールバック機能とサービス監視の実装

この調査により、Leafletの青一色表示問題は主にタイルサービス自体の問題であることが判明しました。推奨される代替サービスに変更することで、問題は解決されます。