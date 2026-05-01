// Vercel Function for Notion API integration
import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Initialize Notion client
    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!databaseId) {
      res.status(500).json({ error: 'Database ID not configured' });
      return;
    }

    // Query Notion database
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
    });

    // Transform data
    const busStops = response.results.map((page) => {
      const properties = page.properties;
      
      return {
        stop_id: properties.stop_id?.rich_text?.[0]?.plain_text || 
                 properties.stop_id?.title?.[0]?.plain_text || 
                 page.id,
        stop_desc: properties.stop_desc?.title?.[0]?.plain_text || 
                   properties.stop_desc?.rich_text?.[0]?.plain_text || 
                   'Unknown Stop',
        stop_lat: properties.stop_lat?.number || 0,
        stop_lon: properties.stop_lon?.number || 0,
      };
    }).filter(stop => stop.stop_lat !== 0 && stop.stop_lon !== 0);

    res.status(200).json({
      success: true,
      data: busStops,
      count: busStops.length,
    });

  } catch (error) {
    console.error('Error fetching bus stops:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bus stop data',
      details: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error',
    });
  }
}