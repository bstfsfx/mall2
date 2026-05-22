const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const connectionString = 'postgresql://postgres.xwrtoeddqhbcwymvfkri:XR4D3QAUP%40Y@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    
    const sql = fs.readFileSync('supabase/migrations/20260522_articles.sql', 'utf8');
    await client.query(sql);
    console.log('Articles migration executed successfully.');
    
  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await client.end();
  }
}

main();
