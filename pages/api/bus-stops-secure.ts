import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@notionhq/client'

// より安全なバージョン（必要に応じて使用）
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// レート制限のための簡単な実装
const requestCounts = new Map()
const RATE_LIMIT = 10 // 1分間に10回まで
const RATE_WINDOW = 60000 // 1分

function getRateLimitKey(req: NextApiRequest): string {
  // IPアドレスまたはUser-Agentベースでキーを生成
  const forwarded = req.headers['x-forwarded-for']
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.connection?.remoteAddress
  return ip || 'unknown'
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const requests = requestCounts.get(key) || []
  
  // 古いリクエストを削除
  const recentRequests = requests.filter((timestamp: number) => 
    now - timestamp < RATE_WINDOW
  )
  
  if (recentRequests.length >= RATE_LIMIT) {
    return true
  }
  
  recentRequests.push(now)
  requestCounts.set(key, recentRequests)
  return false
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // レート制限チェック
  const clientKey = getRateLimitKey(req)
  if (isRateLimited(clientKey)) {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
    })
    return
  }

  // API キーの検証（オプション）
  const apiKey = req.headers['x-api-key']
  const validApiKey = process.env.CLIENT_API_KEY
  
  if (validApiKey && apiKey !== validApiKey) {
    res.status(401).json({
      success: false,
      error: 'Invalid API key',
    })
    return
  }

  try {
    const databaseId = process.env.NOTION_DATABASE_ID

    if (!databaseId) {
      res.status(500).json({ error: 'Database ID not configured' })
      return
    }

    // Notion APIコール（既存のコードと同じ）
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'stop_lat',
            number: { is_not_empty: true },
          },
          {
            property: 'stop_lon',
            number: { is_not_empty: true },
          },
        ],
      },
    })

    const busStops = response.results.map((page: any) => {
      const properties = page.properties
      
      return {
        stop_id: properties.stop_id?.rich_text?.[0]?.plain_text || 
                 properties.stop_id?.title?.[0]?.plain_text || 
                 page.id,
        stop_desc: properties.stop_desc?.title?.[0]?.plain_text || 
                   properties.stop_desc?.rich_text?.[0]?.plain_text || 
                   'Unknown Stop',
        stop_lat: properties.stop_lat?.number || 0,
        stop_lon: properties.stop_lon?.number || 0,
      }
    }).filter(stop => stop.stop_lat !== 0 && stop.stop_lon !== 0)

    res.status(200).json({
      success: true,
      data: busStops,
      count: busStops.length,
    })

  } catch (error) {
    console.error('Error fetching bus stops:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bus stop data',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    })
  }
}