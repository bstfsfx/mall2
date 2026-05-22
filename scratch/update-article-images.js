const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const images = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1485230895905-eb56ba77114b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1434389678369-184ac91ddff3?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1489987707023-afc232d799f2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550614000-4b95d466bcbe?q=80&w=800&auto=format&fit=crop'
];

async function main() {
  const client = new Client({ 
    connectionString: 'postgresql://postgres.xwrtoeddqhbcwymvfkri:XR4D3QAUP%40Y@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  try {
    const { rows } = await client.query('SELECT id FROM articles ORDER BY created_at ASC');
    
    for (let i = 0; i < rows.length; i++) {
      const img = images[i % images.length];
      await client.query('UPDATE articles SET cover_image_url = $1 WHERE id = $2', [img, rows[i].id]);
      console.log(`Updated article ${rows[i].id}`);
    }
    console.log('Successfully updated all article cover images!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
