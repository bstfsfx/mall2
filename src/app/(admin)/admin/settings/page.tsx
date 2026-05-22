'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface SiteSettings {
  id: string;
  logo_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_banners: string[];
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [logoUrl, setLogoUrl] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [banners, setBanners] = useState<string[]>([]);
  const [newBannerUrl, setNewBannerUrl] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (fetchErr) throw fetchErr;

      if (data) {
        setSettings(data);
        setLogoUrl(data.logo_url ?? '');
        setHeroTitle(data.hero_title ?? '');
        setHeroSubtitle(data.hero_subtitle ?? '');
        setBanners(data.hero_banners ?? []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '載入網站設定失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logo/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site_assets')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      setSuccess('Logo 上傳成功 (點擊儲存以套用變更)');
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '上傳 Logo 失敗');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site_assets')
        .getPublicUrl(filePath);

      setBanners(prev => [...prev, publicUrl]);
      setSuccess('Banner 上傳成功 (點擊儲存以套用變更)');
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '上傳 Banner 失敗');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleAddBannerUrl = () => {
    if (!newBannerUrl.trim()) return;
    setBanners(prev => [...prev, newBannerUrl.trim()]);
    setNewBannerUrl('');
  };

  const handleRemoveBanner = (index: number) => {
    setBanners(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === banners.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBanners(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: saveErr } = await supabase
        .from('site_settings')
        .update({
          logo_url: logoUrl || null,
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          hero_banners: banners,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'global');

      if (saveErr) throw saveErr;

      setSuccess('網站設定已成功儲存！');
      fetchSettings();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '儲存網站設定失敗');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleSave} className={styles.layout}>
        {/* Left column: General Info & Brand Logo */}
        <div className={`glass ${styles.leftCard}`}>
          <h3 className={styles.cardTitle}>⚙️ 全站基礎設定</h3>
          <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.formGroup}>
            <label>品牌 Logo 標誌</label>
            <div className={styles.uploadRow}>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
                id="logoFileInput"
              />
              <label htmlFor="logoFileInput" className={`btn btn-ghost ${styles.uploadBtn}`}>
                {uploadingLogo ? '上傳中...' : '📁 上傳 Logo'}
              </label>
              <span className={styles.orText}>或</span>
              <input
                type="text"
                className="input"
                placeholder="輸入 Logo 圖片 URL..."
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
              />
            </div>
            {logoUrl && (
              <div className={styles.logoPreviewWrap}>
                <p className={styles.previewLabel}>Logo 預覽：</p>
                <div className={styles.logoPreview}>
                  <img src={logoUrl} alt="Logo Preview" />
                  <button type="button" className={styles.removePreviewBtn} onClick={() => setLogoUrl('')}>✕</button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="heroTitleInput">首頁 Hero 主標題</label>
            <input
              id="heroTitleInput"
              type="text"
              className="input"
              value={heroTitle}
              onChange={e => setHeroTitle(e.target.value)}
              placeholder="例如：mall2 潮流服飾"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="heroSubtitleInput">首頁 Hero 副標題描述</label>
            <textarea
              id="heroSubtitleInput"
              className="input"
              value={heroSubtitle}
              onChange={e => setHeroSubtitle(e.target.value)}
              placeholder="請輸入首頁 Banner 的副標題，描述品牌理念..."
              rows={4}
              required
            />
          </div>

          <button type="submit" className={`btn btn-gold ${styles.saveBtn}`} disabled={saving || uploadingLogo || uploadingBanner}>
            {saving ? '正在儲存設定...' : '💾 儲存所有變更'}
          </button>
        </div>

        {/* Right column: Dynamic Hero Banners list */}
        <div className={`glass ${styles.rightCard}`}>
          <h3 className={styles.cardTitle}>📸 首頁輪播圖管理 (Hero Banners)</h3>
          <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

          <div className={styles.formGroup}>
            <label>新增輪播圖片 (建議比例 16:9 或 21:9 大圖)</label>
            <div className={styles.uploadRow}>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                style={{ display: 'none' }}
                id="bannerFileInput"
              />
              <label htmlFor="bannerFileInput" className={`btn btn-ghost ${styles.uploadBtn}`}>
                {uploadingBanner ? '上傳中...' : '📁 上傳本機 Banner'}
              </label>
              <span className={styles.orText}>或</span>
              <input
                type="text"
                className="input"
                placeholder="輸入 Banner 圖片 URL..."
                value={newBannerUrl}
                onChange={e => setNewBannerUrl(e.target.value)}
              />
              <button type="button" className="btn btn-outline-gold" onClick={handleAddBannerUrl}>
                新增
              </button>
            </div>
          </div>

          <div className={styles.bannersList}>
            <label>現有輪播圖清單 ({banners.length} 張)</label>
            {banners.length === 0 ? (
              <p className={styles.noBanners}>目前尚未設定任何輪播圖，首頁將顯示預設深色背景。</p>
            ) : (
              <div className={styles.bannerGrid}>
                {banners.map((url, idx) => (
                  <div key={idx} className={styles.bannerItem}>
                    <div className={styles.bannerThumb}>
                      <img src={url} alt={`Banner ${idx + 1}`} />
                      <div className={styles.bannerBadge}>#{idx + 1}</div>
                    </div>
                    <div className={styles.bannerInfo}>
                      <p className={styles.bannerUrlText} title={url}>{url}</p>
                      <div className={styles.bannerActions}>
                        <button
                          type="button"
                          className={styles.moveBtn}
                          onClick={() => handleMoveBanner(idx, 'up')}
                          disabled={idx === 0}
                          title="往前移動"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className={styles.moveBtn}
                          onClick={() => handleMoveBanner(idx, 'down')}
                          disabled={idx === banners.length - 1}
                          title="往後移動"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleRemoveBanner(idx)}
                          title="刪除此圖"
                        >
                          ✕ 刪除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
