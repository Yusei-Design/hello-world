// バス停マップアプリケーション
class BusStopMap {
  constructor() {
    this.map = null;
    this.busStops = [];
    this.markers = [];
    this.initializeApp();
  }

  initializeApp() {
    // DOMが読み込まれたら実行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.initializeMap();
    this.bindEvents();
    this.loadBusStops();
  }

  // マップ初期化
  initializeMap() {
    // デフォルト位置（東京）
    this.map = L.map('map').setView([35.6762, 139.6503], 13);

    // OpenFreeMap タイル追加
    L.tileLayer('https://tiles.openfree.map/osm/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.map);
  }

  // イベントバインド
  bindEvents() {
    const refreshBtn = document.getElementById('refreshBtn');
    const retryBtn = document.getElementById('retryBtn');

    refreshBtn.addEventListener('click', () => this.loadBusStops());
    retryBtn.addEventListener('click', () => this.loadBusStops());
  }

  // バス停データ読み込み
  async loadBusStops() {
    try {
      this.showLoading();
      
      const response = await fetch('/api/bus-stops');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || data.details || 'データの取得に失敗しました');
      }

      if (!data.data || data.data.length === 0) {
        this.showNoData();
        return;
      }

      this.busStops = data.data;
      this.updateStats(data.count, data.data.length);
      this.displayBusStops();
      this.showMap();

    } catch (error) {
      console.error('Error loading bus stops:', error);
      this.showError(`エラー: ${error.message}`);
    }
  }

  // バス停をマップに表示
  displayBusStops() {
    // 既存のマーカーをクリア
    this.clearMarkers();

    if (this.busStops.length === 0) {
      this.showNoData();
      return;
    }

    // マーカー追加
    this.busStops.forEach(stop => {
      const marker = L.marker([stop.stop_lat, stop.stop_lon])
        .bindPopup(this.createPopupContent(stop))
        .addTo(this.map);
      
      this.markers.push(marker);
    });

    // マップを全バス停に合わせて調整
    if (this.busStops.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  // ポップアップコンテンツ作成
  createPopupContent(stop) {
    return `
      <div class="bus-stop-popup">
        <h3>${stop.stop_desc}</h3>
        <p><strong>ID:</strong> ${stop.stop_id}</p>
        <p><strong>座標:</strong> ${stop.stop_lat.toFixed(6)}, ${stop.stop_lon.toFixed(6)}</p>
      </div>
    `;
  }

  // マーカークリア
  clearMarkers() {
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
  }

  // 統計情報更新
  updateStats(total, loaded) {
    document.getElementById('totalCount').textContent = total;
    document.getElementById('loadedCount').textContent = loaded;
  }

  // 状態表示管理
  showLoading() {
    this.hideAllMessages();
    document.getElementById('loadingMessage').style.display = 'block';
    this.updateRefreshButton(true);
  }

  showMap() {
    this.hideAllMessages();
    document.getElementById('mapSection').style.display = 'block';
    this.updateRefreshButton(false);
  }

  showError(message) {
    this.hideAllMessages();
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorMessage').style.display = 'block';
    this.updateRefreshButton(false);
  }

  showNoData() {
    this.hideAllMessages();
    document.getElementById('noDataMessage').style.display = 'block';
    this.updateRefreshButton(false);
  }

  hideAllMessages() {
    const messages = ['loadingMessage', 'errorMessage', 'mapSection', 'noDataMessage'];
    messages.forEach(id => {
      document.getElementById(id).style.display = 'none';
    });
  }

  updateRefreshButton(loading) {
    const btn = document.getElementById('refreshBtn');
    const icon = btn.querySelector('.btn-icon');
    const text = btn.querySelector('.btn-text');
    
    if (loading) {
      btn.disabled = true;
      icon.textContent = '⏳';
      text.textContent = '読み込み中...';
    } else {
      btn.disabled = false;
      icon.textContent = '🔄';
      text.textContent = 'データ更新';
    }
  }
}

// アプリケーション起動
new BusStopMap();