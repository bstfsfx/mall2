'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category_id: string | null;
  image_url: string | null;
  images: string[] | any;
  description: string | null;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  categories: {
    name: string;
  } | null;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal/panel states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>('active');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').order('name'),
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;

      setProducts(prodRes.data ?? []);
      setCategories(catRes.data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

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

  const handleEditClick = (p: Product) => {
    setEditId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setPrice(Number(p.price));
    setStock(p.stock);
    setCategoryId(p.category_id ?? '');
    setDescription(p.description ?? '');
    setImgUrl(p.image_url ?? '');
    setStatus(p.status);
    setError(null);
    setShowForm(true);
  };

  const handleNewClick = () => {
    setEditId(null);
    setName('');
    setSlug('');
    setPrice(0);
    setStock(0);
    setCategoryId(categories[0]?.id ?? '');
    setDescription('');
    setImgUrl('');
    setStatus('active');
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim()) {
      setError('請輸入商品名稱與代稱');
      return;
    }

    const payload = {
      name,
      slug,
      price,
      stock,
      category_id: categoryId || null,
      description: description || null,
      image_url: imgUrl || null,
      status,
    };

    try {
      if (editId) {
        const { error: editErr } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editId);
        if (editErr) throw editErr;
      } else {
        const { error: insErr } = await supabase
          .from('products')
          .insert(payload);
        if (insErr) throw insErr;
      }
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '儲存商品失敗');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('您確定要永久刪除此商品嗎？刪除後無法復原！')) return;
    setError(null);

    try {
      const { error: delErr } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '刪除商品失敗');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <button onClick={handleNewClick} className="btn btn-gold">
          ➕ 新增潮流單品
        </button>
      </div>

      {error && <div className={styles.pageError}>{error}</div>}

      {/* Modal/Form Overlaid panel */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={`glass ${styles.formCard}`}>
            <div className={styles.formHeader}>
              <h3>{editId ? '📝 編輯商品單品' : '➕ 新增商品單品'}</h3>
              <button className={styles.closeModal} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.group}>
                  <label htmlFor="pName">商品名稱</label>
                  <input
                    id="pName"
                    type="text"
                    className="input"
                    placeholder="例如：OVERSIZE 落肩帽T"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      if (!editId) setSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-'));
                    }}
                    required
                  />
                </div>
                <div className={styles.group}>
                  <label htmlFor="pSlug">商品代稱 (Slug, 網址用)</label>
                  <input
                    id="pSlug"
                    type="text"
                    className="input"
                    placeholder="例如：oversized-hoodie-black"
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-'))}
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.group}>
                  <label htmlFor="pPrice">商品價格 (NT$)</label>
                  <input
                    id="pPrice"
                    type="number"
                    className="input"
                    min={0}
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    required
                  />
                </div>
                <div className={styles.group}>
                  <label htmlFor="pStock">庫存數量</label>
                  <input
                    id="pStock"
                    type="number"
                    className="input"
                    min={0}
                    value={stock}
                    onChange={e => setStock(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.group}>
                  <label htmlFor="pCat">商品分類</label>
                  <select
                    id="pCat"
                    className="input"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    style={{ background: 'var(--bg-surface)' }}
                  >
                    <option value="">選擇分類</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.group}>
                  <label htmlFor="pStatus">商品狀態</label>
                  <select
                    id="pStatus"
                    className="input"
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    style={{ background: 'var(--bg-surface)' }}
                  >
                    <option value="active">上架中 (Active)</option>
                    <option value="draft">草稿箱 (Draft)</option>
                    <option value="archived">已存檔 (Archived)</option>
                  </select>
                </div>
              </div>

              <div className={styles.group}>
                <label>商品圖片</label>
                <div className={styles.uploadArea}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="pImgFile"
                  />
                  <label htmlFor="pImgFile" className={`btn btn-ghost ${styles.uploadBtn}`}>
                    {uploading ? '上傳中...' : '📁 上傳商品圖片'}
                  </label>
                  <span className={styles.uploadSeparator}>或</span>
                  <input
                    type="text"
                    className="input"
                    placeholder="輸入圖片網址 URL"
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

              <div className={styles.group}>
                <label htmlFor="pDesc">商品描述</label>
                <textarea
                  id="pDesc"
                  className="input"
                  placeholder="介紹商品的特色、尺寸規格、材質..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '1rem' }} disabled={uploading}>
                儲存商品資訊
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products list table */}
      <div className={`glass ${styles.tableCard}`}>
        {loading ? (
          <div className={styles.loading}>
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <p className={styles.empty}>目前沒有任何商品，點擊上方新增按鈕開始建立商品！</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>圖片</th>
                  <th>商品名稱</th>
                  <th>分類</th>
                  <th>價格</th>
                  <th>庫存</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.itemThumb}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} />
                        ) : (
                          <div className={styles.thumbPlaceholder} />
                        )}
                      </div>
                    </td>
                    <td>
                      <p className={styles.pName}>{p.name}</p>
                      <p className={styles.pSlug}>/{p.slug}</p>
                    </td>
                    <td>{p.categories?.name ?? '未分類'}</td>
                    <td className={styles.amount}>NT$ {Number(p.price).toLocaleString()}</td>
                    <td className={p.stock === 0 ? styles.outOfStock : ''}>
                      {p.stock} 件 {p.stock === 0 && '(已售完)'}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        p.status === 'active' ? styles.statusActive :
                        p.status === 'draft' ? styles.statusDraft : styles.statusArchived
                      }`}>
                        {p.status === 'active' ? '上架中' :
                         p.status === 'draft' ? '草稿' : '封存'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button onClick={() => handleEditClick(p)} className={styles.editBtn}>編輯</button>
                      <button onClick={() => handleDelete(p.id)} className={styles.delBtn}>刪除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
