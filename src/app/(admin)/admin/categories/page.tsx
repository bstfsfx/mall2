'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCategories(data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '載入分類失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setImgUrl(publicUrl);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '上傳圖片失敗');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setSlug('');
    setImgUrl('');
    setError(null);
  };

  const handleEditClick = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setImgUrl(cat.image_url ?? '');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim()) {
      setError('請填寫分類名稱與代稱');
      return;
    }

    try {
      if (editId) {
        // Update
        const { error: editErr } = await supabase
          .from('categories')
          .update({ name, slug, image_url: imgUrl || null })
          .eq('id', editId);
        if (editErr) throw editErr;
      } else {
        // Insert
        const { error: insErr } = await supabase
          .from('categories')
          .insert({ name, slug, image_url: imgUrl || null });
        if (insErr) throw insErr;
      }
      resetForm();
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '儲存分類失敗');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('您確定要刪除此分類嗎？這可能會使部分商品的分類欄位變為空值。')) return;
    setError(null);

    try {
      const { error: delErr } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '刪除分類失敗');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Form panel */}
        <div className={`glass ${styles.formCard}`}>
          <h3>{editId ? '📝 編輯分類' : '➕ 新增分類'}</h3>
          <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.group}>
              <label htmlFor="catName">分類名稱</label>
              <input
                id="catName"
                type="text"
                className="input"
                placeholder="例如：秋冬大衣、潮流配件"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  // Auto slugify name if not editing
                  if (!editId) setSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-'));
                }}
                required
              />
            </div>

            <div className={styles.group}>
              <label htmlFor="catSlug">分類代稱 (Slug, 用於網址)</label>
              <input
                id="catSlug"
                type="text"
                className="input"
                placeholder="例如：outerwear, accessories"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-'))}
                required
              />
            </div>

            <div className={styles.group}>
              <label>分類圖片</label>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="catImgFile"
                />
                <label htmlFor="catImgFile" className={`btn btn-ghost ${styles.uploadBtn}`}>
                  {uploading ? '上傳中...' : '📁 上傳本機圖片'}
                </label>
                <span className={styles.uploadSeparator}>或</span>
                <input
                  type="text"
                  className="input"
                  placeholder="輸入圖片 URL"
                  value={imgUrl}
                  onChange={e => setImgUrl(e.target.value)}
                />
              </div>
              {imgUrl && (
                <div className={styles.preview}>
                  <img src={imgUrl} alt="Preview" />
                  <button type="button" className={styles.removePreview} onClick={() => setImgUrl('')}>✕</button>
                </div>
              )}
            </div>

            <div className={styles.formBtns}>
              <button type="submit" className="btn btn-gold" disabled={uploading}>
                儲存分類
              </button>
              {editId && (
                <button type="button" className="btn btn-ghost" onClick={resetForm}>
                  取消
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List panel */}
        <div className={`glass ${styles.listCard}`}>
          <h3>📁 分類列表</h3>
          <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

          {loading ? (
            <div className={styles.listLoading}>
              <div className="spinner" />
            </div>
          ) : categories.length === 0 ? (
            <p className={styles.empty}>目前沒有任何分類</p>
          ) : (
            <div className={styles.grid}>
              {categories.map(cat => (
                <div key={cat.id} className={styles.catItem}>
                  <div className={styles.catThumb}>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} />
                    ) : (
                      <div className={styles.thumbPlaceholder} />
                    )}
                  </div>
                  <div className={styles.catInfo}>
                    <p className={styles.catName}>{cat.name}</p>
                    <p className={styles.catSlug}>/{cat.slug}</p>
                  </div>
                  <div className={styles.catActions}>
                    <button onClick={() => handleEditClick(cat)} className={styles.editBtn}>編輯</button>
                    <button onClick={() => handleDelete(cat.id)} className={styles.delBtn}>刪除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
