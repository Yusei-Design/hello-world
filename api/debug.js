module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const debug = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        VERCEL: process.env.VERCEL || 'undefined',
        VERCEL_ENV: process.env.VERCEL_ENV || 'undefined'
      },
      notion: {
        token_exists: !!process.env.NOTION_TOKEN,
        token_starts_with: process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN.substring(0, 10) + '...' : 'NOT_SET',
        token_length: process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN.length : 0,
        database_id_exists: !!process.env.NOTION_DATABASE_ID,
        database_id: process.env.NOTION_DATABASE_ID ? process.env.NOTION_DATABASE_ID.substring(0, 8) + '...' : 'NOT_SET',
        database_id_length: process.env.NOTION_DATABASE_ID ? process.env.NOTION_DATABASE_ID.length : 0
      }
    };

    // Notion接続テスト（環境変数が設定されている場合）
    if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID) {
      try {
        const { Client } = require('@notionhq/client');
        const notion = new Client({ auth: process.env.NOTION_TOKEN });
        
        const testResponse = await notion.databases.query({
          database_id: process.env.NOTION_DATABASE_ID,
          page_size: 1 // 1件だけテスト
        });
        
        debug.notion.connection_test = {
          success: true,
          result_count: testResponse.results.length,
          has_more: testResponse.has_more
        };
        
      } catch (error) {
        debug.notion.connection_test = {
          success: false,
          error: error.message,
          error_code: error.code || 'unknown'
        };
      }
    }

    res.status(200).json({
      success: true,
      debug: debug
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};