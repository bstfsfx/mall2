import './globals.css';
import { Geist } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: 'mall2',
  description: 'Mall2 Admin & Storefront',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className={geistSans.variable}>
      <body style={{ background: '#08080c' }}>{children}</body>
    </html>
  );
}
