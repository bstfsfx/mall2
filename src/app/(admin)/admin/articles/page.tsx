'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Article {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: 'draft' | 'published';
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  article_categories: { name: string } | null;
}

type Tab = 'articles' | 'categories';

export default function AdminArticles() {
  const [tab, setTab] = useState<Tab>('articles');

  // ---- Articles State ----
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Article Form
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editArticleId, setEditArticleId] = useState<string | null>(null);
  const [aTitle, setATitle] = useState('');
  const [aSlug, setASlug] = useState('');
  const [aCategoryId, setACategoryId] = useState('');
  const [aExcerpt, setAExcerpt] = useState('');
  const [aContent, setAContent] = useState('');
  const [aCoverUrl, setACoverUrl] = useState('');
  const [aStatus, setAStatus] = useState<'draft' | 'published'>('draft');
  const [aMetaTitle, setAMetaTitle] = useState('');
  const [aMetaDesc, setAMetaDesc] = useState('');
  const [uploading, setUploading] = useState(false);

  // Category Form
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [cName, setCName] = useState('');
  const [cSlug, setCSlug] = useState('');
  const [cDesc, setCDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artRes, catRes] = await Promise.all([
        supabase
          .from('articles')
          .select('*, article_categories(name)')
          .order('created_at', { ascending: false }),
        supabase.from('article_categories').select('*').order('name'),
      ]);
      if (artRes.error) throw artRes.error;
      if (catRes.error) throw catRes.error;
      setArticles(artRes.data ?? []);
      setCategories(catRes.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? '載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ---- Article Handlers ----
  const openNewArticle = () => {
    setEditArticleId(null);
    setATitle(''); setASlug(''); setACategoryId(categories[0]?.id ?? '');
    setAExcerpt(''); setAContent(''); setACoverUrl('');
    setAStatus('draft'); setAMetaTitle(''); setAMetaDesc('');
    setError(null);
    setShowArticleForm(true);
  };

  const openEditArticle = (a: Article) => {
    setEditArticleId(a.id);
    setATitle(a.title); setASlug(a.slug); setACategoryId(a.category_id ?? '');
    setAExcerpt(a.excerpt ?? ''); setAContent(a.content); setACoverUrl(a.cover_image_url ?? '');
    setAStatus(a.status); setAMetaTitle(a.meta_title ?? ''); setAMetaDesc(a.meta_description ?? '');
    setError(null);
    setShowArticleForm(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `articles/${Math.random().toString(36).substring(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('products').upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path);
      setACoverUrl(publicUrl);
    } catch (err: any) {
      setError(err?.message ?? '上傳圖片失敗');
    } finally {
      setUploading(false);
    }
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!aTitle.trim() || !aSlug.trim() || !aContent.trim()) {
      setError('請填寫標題、代稱及文章內容');
      return;
    }
    const payload = {
      title: aTitle, slug: aSlug,
      category_id: aCategoryId || null,
      excerpt: aExcerpt || null, content: aContent,
      cover_image_url: aCoverUrl || null, status: aStatus,
      meta_title: aMetaTitle || null, meta_description: aMetaDesc || null,
      published_at: aStatus === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    try {
      if (editArticleId) {
        const { error: e } = await supabase.from('articles').update(payload).eq('id', editArticleId);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from('articles').insert(payload);
        if (e) throw e;
      }
      setShowArticleForm(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message ?? '儲存文章失敗');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('確定要永久刪除此文章嗎？')) return;
    try {
      const { error: e } = await supabase.from('articles').delete().eq('id', id);
      if (e) throw e;
      fetchData();
    } catch (err: any) {
      setError(err?.message ?? '刪除失敗');
    }
  };

  // ---- Category Handlers ----
  const openNewCat = () => {
    setEditCatId(null); setCName(''); setCSlug(''); setCDesc('');
    setError(null); setShowCatForm(true);
  };
  const openEditCat = (c: ArticleCategory) => {
    setEditCatId(c.id); setCName(c.name); setCSlug(c.slug); setCDesc(c.description ?? '');
    setError(null); setShowCatForm(true);
  };
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!cName.trim() || !cSlug.trim()) { setError('請填寫分類名稱與代稱'); return; }
    const payload = { name: cName, slug: cSlug, description: cDesc || null };
    try {
      if (editCatId) {
        const { error: e } = await supabase.from('article_categories').update(payload).eq('id', editCatId);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from('article_categories').insert(payload);
        if (e) throw e;
      }
      setShowCatForm(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message ?? '儲存分類失敗');
    }
  };
  const handleDeleteCat = async (id: string) => {
    if (!confirm('確定要刪除此分類？（相關文章的分類將設為空）')) return;
    try {
      const { error: e } = await supabase.from('article_categories').delete().eq('id', id);
      if (e) throw e;
      fetchData();
    } catch (err: any) {
      setError(err?.message ?? '刪除失敗');
    }
  };

  return (
    <div className={styles.page}>
      {/* Tabs */}
      <div className={styles.tabRow}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'articles' ? styles.tabActive : ''}`} onClick={() => setTab('articles')}>
            📝 文章列表
          </button>
          <button className={`${styles.tab} ${tab === 'categories' ? styles.tabActive : ''}`} onClick={() => setTab('categories')}>
            🗂️ 文章分類
          </button>
        </div>
        <button className="btn btn-gold" onClick={tab === 'articles' ? openNewArticle : openNewCat}>
          {tab === 'articles' ? '➕ 新增文章' : '➕ 新增分類'}
        </button>
      </div>

      {error && <div className={styles.pageError}>{error}</div>}

      {/* ========== Article Form Modal ========== */}
      {showArticleForm && (
        <div className={styles.modalOverlay}>
          <div className={`glass ${styles.formCard} ${styles.formCardLarge}`}>
            <div className={styles.formHeader}>
              <h3>{editArticleId ? '📝 編輯文章' : '➕ 新增文章'}</h3>
              <button className={styles.closeModal} onClick={() => setShowArticleForm(false)}>✕</button>
            </div>
            <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />
            <form onSubmit={handleArticleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.group}>
                  <label htmlFor="aTitle">文章標題 *</label>
                  <input id="aTitle" type="text" className="input" placeholder="輸入文章標題" value={aTitle}
                    onChange={e => { setATitle(e.target.value); if (!editArticleId) setASlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')); }}
                    required />
                </div>
                <div className={styles.group}>
                  <label htmlFor="aSlug">文章代稱 (Slug) *</label>
                  <input id="aSlug" type="text" className="input" placeholder="article-url-slug" value={aSlug}
                    onChange={e => setASlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''))}
                    required />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.group}>
                  <label htmlFor="aCat">文章分類</label>
                  <select id="aCat" className="input" value={aCategoryId} onChange={e => setACategoryId(e.target.value)} style={{ background: 'var(--bg-surface)' }}>
                    <option value="">選擇分類</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className={styles.group}>
                  <label htmlFor="aStatus">發布狀態</label>
                  <select id="aStatus" className="input" value={aStatus} onChange={e => setAStatus(e.target.value as any)} style={{ background: 'var(--bg-surface)' }}>
                    <option value="published">已發布 (Published)</option>
                    <option value="draft">草稿箱 (Draft)</option>
                  </select>
                </div>
              </div>

              <div className={styles.group}>
                <label>封面圖片</label>
                <div className={styles.uploadArea}>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} id="aCoverFile" />
                  <label htmlFor="aCoverFile" className={`btn btn-ghost ${styles.uploadBtn}`}>
                    {uploading ? '上傳中...' : '📁 上傳封面圖片'}
                  </label>
                  <span className={styles.uploadSeparator}>或</span>
                  <input type="text" className="input" placeholder="輸入封面圖片 URL" value={aCoverUrl} onChange={e => setACoverUrl(e.target.value)} />
                </div>
                {aCoverUrl && (
                  <div className={styles.preview}>
                    <img src={aCoverUrl} alt="Cover preview" />
                    <button type="button" className={styles.removePreview} onClick={() => setACoverUrl('')}>✕</button>
                  </div>
                )}
              </div>

              <div className={styles.group}>
                <label htmlFor="aExcerpt">文章摘要 (SEO 描述)</label>
                <textarea id="aExcerpt" className="input" placeholder="簡短描述文章內容（建議 80-160 字，用於 SEO 和列表頁顯示）" value={aExcerpt}
                  onChange={e => setAExcerpt(e.target.value)} rows={3} />
              </div>

              <div className={styles.group}>
                <label htmlFor="aContent">文章內容 * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(支援 Markdown 語法)</span></label>
                <textarea id="aContent" className="input" placeholder="撰寫文章內容，支援 Markdown 語法：# 標題、**粗體**、*斜體*、- 清單..." value={aContent}
                  onChange={e => setAContent(e.target.value)} rows={12} required />
              </div>

              <div className={styles.seoSection}>
                <p className={styles.seoLabel}>🔍 SEO 設定</p>
                <div className={styles.row}>
                  <div className={styles.group}>
                    <label htmlFor="aMetaTitle">Meta 標題</label>
                    <input id="aMetaTitle" type="text" className="input" placeholder="SEO 標題（建議 50-60 字）" value={aMetaTitle} onChange={e => setAMetaTitle(e.target.value)} />
                  </div>
                  <div className={styles.group}>
                    <label htmlFor="aMetaDesc">Meta 描述</label>
                    <input id="aMetaDesc" type="text" className="input" placeholder="SEO 描述（建議 120-160 字）" value={aMetaDesc} onChange={e => setAMetaDesc(e.target.value)} />
                  </div>
                </div>
              </div>

              {error && <div className={styles.formError}>{error}</div>}
              <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '0.5rem' }} disabled={uploading}>
                {editArticleId ? '更新文章' : '發布文章'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========== Category Form Modal ========== */}
      {showCatForm && (
        <div className={styles.modalOverlay}>
          <div className={`glass ${styles.formCard}`}>
            <div className={styles.formHeader}>
              <h3>{editCatId ? '📝 編輯分類' : '➕ 新增分類'}</h3>
              <button className={styles.closeModal} onClick={() => setShowCatForm(false)}>✕</button>
            </div>
            <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />
            <form onSubmit={handleCatSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.group}>
                  <label htmlFor="cName">分類名稱 *</label>
                  <input id="cName" type="text" className="input" placeholder="例如：穿搭技巧" value={cName}
                    onChange={e => { setCName(e.target.value); if (!editCatId) setCSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')); }}
                    required />
                </div>
                <div className={styles.group}>
                  <label htmlFor="cSlug">分類代稱 (Slug) *</label>
                  <input id="cSlug" type="text" className="input" placeholder="category-slug" value={cSlug}
                    onChange={e => setCSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''))}
                    required />
                </div>
              </div>
              <div className={styles.group}>
                <label htmlFor="cDesc">分類描述</label>
                <textarea id="cDesc" className="input" placeholder="簡短描述此分類的內容" value={cDesc} onChange={e => setCDesc(e.target.value)} rows={3} />
              </div>
              {error && <div className={styles.formError}>{error}</div>}
              <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '0.5rem' }}>
                {editCatId ? '更新分類' : '新增分類'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========== Articles Table ========== */}
      {tab === 'articles' && (
        <div className={`glass ${styles.tableCard}`}>
          {loading ? (
            <div className={styles.loading}><div className="spinner" /></div>
          ) : articles.length === 0 ? (
            <p className={styles.empty}>目前沒有文章，點擊上方「新增文章」開始撰寫！</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>封面</th>
                    <th>文章標題</th>
                    <th>分類</th>
                    <th>狀態</th>
                    <th>建立時間</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div className={styles.itemThumb}>
                          {a.cover_image_url ? <img src={a.cover_image_url} alt={a.title} /> : <div className={styles.thumbPlaceholder} />}
                        </div>
                      </td>
                      <td>
                        <p className={styles.pName}>{a.title}</p>
                        <p className={styles.pSlug}>/knowledge/{a.slug}</p>
                      </td>
                      <td>{a.article_categories?.name ?? <span style={{ color: 'var(--text-muted)' }}>未分類</span>}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${a.status === 'published' ? styles.statusActive : styles.statusDraft}`}>
                          {a.status === 'published' ? '已發布' : '草稿'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(a.created_at).toLocaleDateString('zh-TW')}
                      </td>
                      <td className={styles.actions}>
                        <button onClick={() => openEditArticle(a)} className={styles.editBtn}>編輯</button>
                        <button onClick={() => handleDeleteArticle(a.id)} className={styles.delBtn}>刪除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========== Categories Table ========== */}
      {tab === 'categories' && (
        <div className={`glass ${styles.tableCard}`}>
          {loading ? (
            <div className={styles.loading}><div className="spinner" /></div>
          ) : categories.length === 0 ? (
            <p className={styles.empty}>目前沒有分類，點擊上方「新增分類」開始建立！</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>分類名稱</th>
                    <th>代稱 (Slug)</th>
                    <th>描述</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td><p className={styles.pName}>{c.name}</p></td>
                      <td><p className={styles.pSlug}>{c.slug}</p></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.description ?? '—'}</td>
                      <td className={styles.actions}>
                        <button onClick={() => openEditCat(c)} className={styles.editBtn}>編輯</button>
                        <button onClick={() => handleDeleteCat(c.id)} className={styles.delBtn}>刪除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
