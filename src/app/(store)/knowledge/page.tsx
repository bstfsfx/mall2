import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: '專業知識區｜mall2 時尚穿搭指南',
  description: '探索 mall2 專業知識區，包含潮流趨勢、穿搭技巧、單品指南等豐富文章，幫助你掌握時尚穿搭的每個細節。',
};

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
  article_categories: { id: string; name: string; slug: string } | null;
}

interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

async function getCategories(): Promise<ArticleCategory[]> {
  const { data } = await supabase
    .from('article_categories')
    .select('*')
    .order('name');
  return data ?? [];
}

async function getArticles(categorySlug?: string): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image_url, published_at, created_at, article_categories(id, name, slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('article_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  const { data } = await query;
  return (data ?? []) as Article[];
}

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const activeCat = params.category ?? '';

  const [categories, articles] = await Promise.all([
    getCategories(),
    getArticles(activeCat || undefined),
  ]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className="section-eyebrow">KNOWLEDGE HUB</p>
          <h1 className={styles.heroTitle}>專業知識區</h1>
          <p className={styles.heroSub}>掌握時尚穿搭的每個細節，從潮流趨勢到搭配技巧，讓你的每一套穿搭都充滿自信</p>
        </div>
      </section>

      <div className="container">
        {/* Category Tabs */}
        <div className={styles.catBar}>
          <Link
            href="/knowledge"
            className={`${styles.catChip} ${!activeCat ? styles.catChipActive : ''}`}
          >
            全部文章
          </Link>
          {categories.map(c => (
            <Link
              key={c.id}
              href={`/knowledge?category=${c.slug}`}
              className={`${styles.catChip} ${activeCat === c.slug ? styles.catChipActive : ''}`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Article Grid */}
        {articles.length === 0 ? (
          <div className={styles.empty}>
            <p>此分類目前沒有文章</p>
            <Link href="/knowledge" className="btn btn-outline-gold" style={{ marginTop: '1rem' }}>查看所有文章</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {articles.map((a, idx) => (
              <article key={a.id} className={`${styles.card} animate-fade-in-up animate-delay-${Math.min(idx + 1, 4)}`}>
                <Link href={`/knowledge/${a.slug}`} className={styles.cardLink}>
                  <div className={styles.cardImg}>
                    {a.cover_image_url ? (
                      <img src={a.cover_image_url} alt={a.title} />
                    ) : (
                      <div className={styles.cardImgPlaceholder}>
                        <span>📚</span>
                      </div>
                    )}
                    {a.article_categories && (
                      <span className={styles.cardCat}>{a.article_categories.name}</span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{a.title}</h2>
                    {a.excerpt && <p className={styles.cardExcerpt}>{a.excerpt}</p>}
                    <div className={styles.cardMeta}>
                      <time className={styles.cardDate}>
                        {new Date(a.published_at ?? a.created_at).toLocaleDateString('zh-TW', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </time>
                      <span className={styles.readMore}>閱讀全文 →</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
