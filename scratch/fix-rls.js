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
    
    console.log('Applying RLS fix...');
    const sql = `
      -- Create a security definer function to check admin status without triggering RLS
      CREATE OR REPLACE FUNCTION public.is_admin()
      RETURNS boolean AS $$
      DECLARE
        user_role text;
      BEGIN
        SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
        RETURN user_role = 'admin';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

      -- Drop the old recursive policies on profiles
      DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
      DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

      -- Create new policies using the function
      CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
      CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

      -- Fix Categories policies
      DROP POLICY IF EXISTS "Categories insertable by admin" ON public.categories;
      DROP POLICY IF EXISTS "Categories updatable by admin" ON public.categories;
      DROP POLICY IF EXISTS "Categories deletable by admin" ON public.categories;
      
      CREATE POLICY "Categories insertable by admin" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
      CREATE POLICY "Categories updatable by admin" ON public.categories FOR UPDATE USING (public.is_admin());
      CREATE POLICY "Categories deletable by admin" ON public.categories FOR DELETE USING (public.is_admin());

      -- Fix Products policies
      DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
      DROP POLICY IF EXISTS "Products insertable by admin" ON public.products;
      DROP POLICY IF EXISTS "Products updatable by admin" ON public.products;
      DROP POLICY IF EXISTS "Products deletable by admin" ON public.products;

      CREATE POLICY "Admins can view all products" ON public.products FOR SELECT USING (public.is_admin());
      CREATE POLICY "Products insertable by admin" ON public.products FOR INSERT WITH CHECK (public.is_admin());
      CREATE POLICY "Products updatable by admin" ON public.products FOR UPDATE USING (public.is_admin());
      CREATE POLICY "Products deletable by admin" ON public.products FOR DELETE USING (public.is_admin());
    `;
    
    await client.query(sql);
    
    console.log('✅ RLS Fix applied successfully.');
  } catch (error) {
    console.error('Error executing script:', error);
  } finally {
    await client.end();
  }
}

main();
