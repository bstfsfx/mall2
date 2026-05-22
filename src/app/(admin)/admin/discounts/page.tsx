import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎫</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: '1rem' }}>功能即將推出</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', lineHeight: 1.6, marginBottom: '2rem' }}>
        折扣碼 (Discount Codes) 模組正在開發中。未來您將能在此設定滿額折、免運或輸入特定代碼的優惠活動。
      </p>
      <Link href="/admin" className="btn btn-gold">
        返回儀表板
      </Link>
    </div>
  );
}
