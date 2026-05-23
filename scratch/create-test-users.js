const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.xwrtoeddqhbcwymvfkri:XR4D3QAUP%40Y@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

const users = [
  { email: 'test@mall2.com', password: 'test1234', name: '測試用戶' },
  { email: 'user1@mall2.com', password: 'user11234', name: '一般會員 1' },
  { email: 'user2@mall2.com', password: 'user21234', name: '一般會員 2' },
];

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    for (const user of users) {
      const userId = require('crypto').randomUUID();

      // Check if user already exists
      const existing = await client.query(
        "SELECT id FROM auth.users WHERE email = $1",
        [user.email]
      );

      if (existing.rows.length > 0) {
        console.log(`- User exists: ${user.email} — skipping`);
        continue;
      }

      // Insert into auth.users
      await client.query(`
        INSERT INTO auth.users (
          instance_id, id, aud, role,
          email, encrypted_password,
          email_confirmed_at,
          raw_user_meta_data,
          created_at, updated_at,
          confirmation_token, recovery_token,
          email_change_token_new, email_change
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          $1, 'authenticated', 'authenticated',
          $2,
          crypt($3, gen_salt('bf')),
          now(),
          $4::jsonb,
          now(), now(),
          '', '', '', ''
        )
      `, [userId, user.email, user.password, JSON.stringify({ full_name: user.name })]);

      console.log(`✓ Created auth user: ${user.email}`);

      // Insert into profiles (ignore if user_id already has profile)
      try {
        await client.query(`
          INSERT INTO profiles (id, role, name)
          VALUES ($1, 'customer', $2)
        `, [userId, user.name]);
        console.log(`✓ Created profile: ${user.email}`);
      } catch (profileErr) {
        if (profileErr.code === '23505') {
          console.log(`- Profile exists: ${user.email}`);
        } else throw profileErr;
      }
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

main();