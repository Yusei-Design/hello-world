import { useState, useEffect } from 'react'
import Head from 'next/head'
import BusStopMap from '../components/BusStopMap'
import { BusStop } from '../api/bus-stops'

export default function Home() {
  const [busStops, setBusStops] = useState<BusStop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    loaded: 0,
  })

  useEffect(() => {
    fetchBusStops()
  }, [])

  const fetchBusStops = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/bus-stops')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch bus stops')
      }

      setBusStops(data.data)
      setStats({
        total: data.count,
        loaded: data.data.length,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error fetching bus stops:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchBusStops()
  }

  return (
    <div className="container">
      <Head>
        <title>バス停マップ | Notion連携アプリ</title>
        <meta name="description" content="Notionデータベースと連携したバス停マップアプリ" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </Head>

      <main className="main">
        <div className="header">
          <h1 className="title">バス停マップ</h1>
          <p className="description">
            Notionデータベースと連携したリアルタイムバス停情報
          </p>
        </div>

        <div className="controls">
          <button 
            onClick={refreshData}
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? '読み込み中...' : '🔄 データ更新'}
          </button>
          
          <div className="stats">
            <span className="stat-item">
              📍 総バス停数: {stats.total}
            </span>
            <span className="stat-item">
              ✅ 表示中: {stats.loaded}
            </span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <h3>⚠️ エラーが発生しました</h3>
            <p>{error}</p>
            <button onClick={refreshData} className="retry-btn">
              再試行
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>Notionからバス停データを読み込み中...</p>
          </div>
        )}

        {!loading && !error && busStops.length > 0 && (
          <div className="map-section">
            <BusStopMap busStops={busStops} />
          </div>
        )}

        {!loading && !error && busStops.length === 0 && (
          <div className="no-data-message">
            <h3>📍 バス停データが見つかりません</h3>
            <p>Notionデータベースにバス停情報を追加してください。</p>
            <ul>
              <li>stop_id: バス停ID</li>
              <li>stop_desc: バス停名</li>
              <li>stop_lat: 緯度</li>
              <li>stop_lon: 経度</li>
            </ul>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 0;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          color: white;
        }

        .title {
          font-size: 3rem;
          margin: 0 0 20px 0;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .description {
          font-size: 1.2rem;
          margin: 0;
          opacity: 0.9;
        }

        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: rgba(255, 255, 255, 0.95);
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .refresh-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #3730a3;
          transform: translateY(-1px);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .stats {
          display: flex;
          gap: 20px;
        }

        .stat-item {
          background: #f3f4f6;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          color: #374151;
        }

        .map-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .error-message, .no-data-message {
          background: rgba(255, 255, 255, 0.95);
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          color: #374151;
        }

        .error-message {
          border-left: 4px solid #ef4444;
        }

        .no-data-message {
          border-left: 4px solid #f59e0b;
        }

        .retry-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 16px;
        }

        .loading-message {
          background: rgba(255, 255, 255, 0.95);
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          color: #374151;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-left: 4px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        ul {
          text-align: left;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .title {
            font-size: 2rem;
          }
          
          .controls {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }
          
          .stats {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}