const { Client } = require('@notionhq/client');

module.exports = async function(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // 環境変数チェック
  if (!process.env.NOTION_TOKEN) {
    return res.status(500).json({
      success: false,
      error: 'NOTION_TOKEN not configured'
    });
  }

  if (!process.env.NOTION_DATABASE_ID) {
    return res.status(500).json({
      success: false,
      error: 'NOTION_DATABASE_ID not configured'
    });
  }

  try {
    console.log('Initializing Notion client...');
    const notion = new Client({ 
      auth: process.env.NOTION_TOKEN 
    });
    
    console.log('Querying database:', process.env.NOTION_DATABASE_ID);
    
    // すべてのデータを取得（100件制限を回避）
    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;
    
    while (hasMore) {
      const queryOptions = {
        database_id: process.env.NOTION_DATABASE_ID,
        filter: {
          and: [
            { property: 'stop_lat', number: { is_not_empty: true } },
            { property: 'stop_lon', number: { is_not_empty: true } }
          ]
        },
        sorts: [
          { property: 'stop_id', direction: 'ascending' }
        ],
        page_size: 100
      };
      
      if (startCursor) {
        queryOptions.start_cursor = startCursor;
      }
      
      console.log(`Fetching page with cursor: ${startCursor || 'first'}`);
      const response = await notion.databases.query(queryOptions);
      
      allResults = allResults.concat(response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
      
      console.log(`Page fetched: ${response.results.length} items, has_more: ${hasMore}`);
    }
    
    console.log(`Total items fetched: ${allResults.length}`);

    console.log('Database query successful, processing results...');
    
    const busStops = allResults
      .map(page => {
        const props = page.properties;
        
        // デバッグ用ログ
        console.log('Processing page:', page.id, props);
        
        return {
          stop_id: props.stop_id?.rich_text?.[0]?.plain_text || 
                   props.stop_id?.title?.[0]?.plain_text || 
                   page.id.substring(0, 8),
          stop_desc: props.stop_desc?.title?.[0]?.plain_text || 
                     props.stop_desc?.rich_text?.[0]?.plain_text || 
                     'Unknown Stop',
          stop_lat: props.stop_lat?.number || 0,
          stop_lon: props.stop_lon?.number || 0
        };
      })
      .filter(stop => {
        const isValid = stop.stop_lat !== 0 && stop.stop_lon !== 0;
        if (!isValid) {
          console.log('Filtered out invalid stop:', stop);
        }
        return isValid;
      });

    console.log(`Processed ${busStops.length} valid bus stops`);

    return res.status(200).json({
      success: true,
      data: busStops,
      count: busStops.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch bus stop data',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};