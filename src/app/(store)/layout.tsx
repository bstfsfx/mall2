import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import '../globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'mall2 | 潮流服飾購物',
  description: '最懂你的潮流服飾購物平台，每日更新最新單品',
};

async function getSiteSettings() {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('logo_url')
      .eq('id', 'global')
      .single();
    return data;
  } catch (err) {
    console.error('Error fetching site settings in layout:', err);
    return null;
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="zh-TW" className={geistSans.variable}>
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar logoUrl={settings?.logo_url} />
            <CartDrawer />
            <main style={{ paddingTop: '72px' }}>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

