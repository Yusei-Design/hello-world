'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { BusStop } from '../types/bus-stop'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface BusStopMapProps {
  busStops: BusStop[]
  center?: [number, number]
  zoom?: number
}

export default function BusStopMap({ 
  busStops, 
  center = [35.6762, 139.6503], // Default to Tokyo
  zoom = 13 
}: BusStopMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="map-loading">
        <p>マップを読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '500px', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* OpenFreeMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.openfree.map/osm/{z}/{x}/{y}.png"
        />
        
        {/* Bus stop markers */}
        {busStops.map((stop) => (
          <Marker
            key={stop.stop_id}
            position={[stop.stop_lat, stop.stop_lon]}
          >
            <Popup>
              <div className="bus-stop-popup">
                <h3>{stop.stop_desc}</h3>
                <p><strong>ID:</strong> {stop.stop_id}</p>
                <p>
                  <strong>座標:</strong> {stop.stop_lat.toFixed(6)}, {stop.stop_lon.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx>{`
        .map-container {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .map-loading {
          height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 8px;
          color: #6b7280;
        }

        .bus-stop-popup h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 16px;
        }

        .bus-stop-popup p {
          margin: 4px 0;
          color: #4b5563;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}