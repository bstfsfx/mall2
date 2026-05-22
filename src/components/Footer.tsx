import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>mall2</span>
          <p className={styles.tagline}>為年輕世代打造的極致購物體驗</p>
          <div className={styles.socials}>
            {['IG', 'FB', 'LINE'].map(s => (
              <a key={s} href="#" className={styles.social}>{s}</a>
            ))}
          </div>
        </div>
        <div className={styles.links}>
          <div className={styles.col}>
            <h4>購物指南</h4>
            <Link href="/products">全部商品</Link>
            <Link href="/products?category=new-arrivals">新品上市</Link>
            <Link href="/products?category=sale">特賣優惠</Link>
          </div>
          <div className={styles.col}>
            <h4>會員服務</h4>
            <Link href="/profile">我的帳號</Link>
            <Link href="/orders">我的訂單</Link>
            <Link href="/auth/login">登入 / 註冊</Link>
          </div>
          <div className={styles.col}>
            <h4>客戶服務</h4>
            <Link href="#">退換貨政策</Link>
            <Link href="#">配送資訊</Link>
            <Link href="#">聯絡我們</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">
          <hr className="gold-divider" style={{ margin: '0 0 1rem' }} />
          <p className={styles.copy}>© 2025 mall2. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
