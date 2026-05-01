const { Client } = require('@notionhq/client');

module.exports = async function(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 環境変数チェック
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    return res.status(500).json({
      success: false,
      error: 'Environment variables not configured'
    });
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          { property: 'stop_lat', number: { is_not_empty: true } },
          { property: 'stop_lon', number: { is_not_empty: true } }
        ]
      }
    });

    const busStops = response.results
      .map(page => {
        const p = page.properties;
        return {
          stop_id: p.stop_id?.rich_text?.[0]?.plain_text || 
                   p.stop_id?.title?.[0]?.plain_text || page.id,
          stop_desc: p.stop_desc?.title?.[0]?.plain_text || 
                     p.stop_desc?.rich_text?.[0]?.plain_text || 'Unknown',
          stop_lat: p.stop_lat?.number || 0,
          stop_lon: p.stop_lon?.number || 0
        };
      })
      .filter(stop => stop.stop_lat !== 0 && stop.stop_lon !== 0);

    res.status(200).json({
      success: true,
      data: busStops,
      count: busStops.length
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
      details: error.message
    });
  }
};