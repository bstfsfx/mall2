const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.xwrtoeddqhbcwymvfkri:XR4D3QAUP%40Y@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Reading seed_admin_users.sql...');
    const sql = fs.readFileSync('./supabase/seed_admin_users.sql', 'utf8');
    
    console.log('Executing admin seed script...');
    await client.query(sql);
    
    console.log('✅ Success! 3 Admin users have been seeded into the database.');
  } catch (error) {
    console.error('Error executing admin seed script:', error);
  } finally {
    await client.end();
  }
}

main();
