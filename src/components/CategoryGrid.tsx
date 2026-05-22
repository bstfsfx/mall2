import Link from 'next/link';
import { GoldIcons, CATEGORIES } from '@/components/ui/GoldIcons';
import styles from './CategoryGrid.module.css';

export default function CategoryGrid() {
  return (
    <div className={styles.grid}>
      {CATEGORIES.map((cat, i) => {
        const IconComponent = GoldIcons[cat.icon as keyof typeof GoldIcons];
        return (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className={styles.card}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className={styles.iconWrap}>
              {IconComponent && <IconComponent />}
              <div className={styles.glow} />
            </div>
            <span className={styles.label}>{cat.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
