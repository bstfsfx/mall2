import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  article_categories: { id: string; name: string; slug: string } | null;
}

async function getArticle(slug: string): Promise<Article | null> {
  const { data } = await supabase
    .from('articles')
    .select('*, article_categories(id, name, slug)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return data as Article | null;
}

async function getRelated(categoryId: string | null, excludeId: string): Promise<Article[]> {
  if (!categoryId) return [];
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image_url, published_at, article_categories(id, name, slug)')
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(3);
  return (data ?? []) as unknown as Article[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: '文章不存在' };
  return {
    title: article.meta_title ?? `${article.title}｜mall2 專業知識區`,
    description: article.meta_description ?? article.excerpt ?? '閱讀 mall2 專業知識區的精選時尚文章',
    openGraph: {
      title: article.meta_title ?? article.title,
      description: article.meta_description ?? article.excerpt ?? '',
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  };
}

// Minimal Markdown → HTML renderer (headings, bold, italic, lists, tables, paragraphs)
function renderMarkdown(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Tables - header row
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => `<th>${c.trim()}</th>`).join('');
      return `<tr>${cells}</tr>`;
    });

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);

  // Wrap table rows in <table>
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (m) => {
    // Replace first row's th with th (header), rest with td
    const rows = m.split('</tr>').filter(Boolean);
    const built = rows.map((r, i) => {
      if (i === 0) return r + '</tr>';
      return r.replace(/<th>/g, '<td>').replace(/<\/th>/g, '</td>') + '</tr>';
    }).join('\n');
    return `<table>${built}</table>`;
  });

  // Remove separator rows (|---|---|)
  html = html.replace(/<tr><th>[-\s|:]+<\/th><\/tr>/g, '');

  // Paragraphs: wrap non-tag lines
  const lines = html.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^<(h[1-6]|ul|ol|li|table|tr|th|td|hr|blockquote)/.test(trimmed)) {
      result.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }
  return result.join('\n');
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await getRelated(article.article_categories?.id ?? null, article.id);
  const htmlContent = renderMarkdown(article.content);

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
          <Link href="/">首頁</Link>
          <span>/</span>
          <Link href="/knowledge">專業知識區</Link>
          {article.article_categories && (
            <>
              <span>/</span>
              <Link href={`/knowledge?category=${article.article_categories.slug}`}>
                {article.article_categories.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>{article.title}</span>
        </nav>
      </div>

      {/* Cover Image */}
      {article.cover_image_url && (
        <div className={styles.coverWrap}>
          <img src={article.cover_image_url} alt={article.title} className={styles.coverImg} />
          <div className={styles.coverOverlay} />
        </div>
      )}

      {/* Article Content */}
      <div className="container">
        <div className={styles.layout}>
          {/* Main Article */}
          <main className={styles.main}>
            <div className={`glass ${styles.articleCard}`}>
              {/* Meta */}
              <div className={styles.articleMeta}>
                {article.article_categories && (
                  <Link
                    href={`/knowledge?category=${article.article_categories.slug}`}
                    className={styles.catBadge}
                  >
                    {article.article_categories.name}
                  </Link>
                )}
                <time className={styles.date}>
                  {new Date(article.published_at ?? article.created_at).toLocaleDateString('zh-TW', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </time>
              </div>

              <h1 className={styles.title}>{article.title}</h1>

              {article.excerpt && (
                <p className={styles.excerpt}>{article.excerpt}</p>
              )}

              <hr className="gold-divider" />

              {/* Article Body */}
              <div
                className={styles.articleBody}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>

            {/* Related Articles */}
            {related.length > 0 && (
              <section className={styles.relatedSection}>
                <h2 className={styles.relatedTitle}>相關文章</h2>
                <div className={styles.relatedGrid}>
                  {related.map(r => (
                    <Link key={r.id} href={`/knowledge/${r.slug}`} className={styles.relatedCard}>
                      <div className={styles.relatedImg}>
                        {r.cover_image_url
                          ? <img src={r.cover_image_url} alt={r.title} />
                          : <div className={styles.relatedImgPlaceholder}>📚</div>}
                      </div>
                      <div className={styles.relatedBody}>
                        <p className={styles.relatedCardTitle}>{r.title}</p>
                        {r.excerpt && <p className={styles.relatedExcerpt}>{r.excerpt}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={`glass ${styles.sideCard}`}>
              <h3 className={styles.sideTitle}>🔙 返回知識專區</h3>
              <Link href="/knowledge" className="btn btn-outline-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}>
                查看所有文章
              </Link>
            </div>

            <div className={`glass ${styles.sideCard}`}>
              <h3 className={styles.sideTitle}>🛍️ 探索商品</h3>
              <p className={styles.sideText}>根據文章中的穿搭建議，找到最適合你的單品</p>
              <div className={styles.sideLinks}>
                <Link href="/products?category=tops" className={styles.sideLink}>👕 上衣</Link>
                <Link href="/products?category=bottoms" className={styles.sideLink}>👖 下裝</Link>
                <Link href="/products?category=outerwear" className={styles.sideLink}>🧥 外套</Link>
                <Link href="/products?category=accessories" className={styles.sideLink}>👜 配件</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
