'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface SiteSettings {
  id: string;
  logo_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_banners: { url: string; alt?: string }[];
  
  // Logistics
  blackcat_fee: number;
  hsinchu_fee: number;
  free_shipping_threshold: number;
  blackcat_enabled: boolean;
  hsinchu_enabled: boolean;

  // Bank Transfer
  bank_name: string | null;
  bank_code: string | null;
  bank_account: string | null;
  bank_recipient: string | null;

  // ECPay
  ecpay_merchant_id: string | null;
  ecpay_hash_key: string | null;
  ecpay_hash_iv: string | null;
  ecpay_mode: 'test' | 'prod';
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'brand' | 'logistics' | 'payment'>('brand');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Brand states
  const [logoUrl, setLogoUrl] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [banners, setBanners] = useState<{ url: string; alt?: string }[]>([]);
  const [newBannerUrl, setNewBannerUrl] = useState('');

  // Logistics states
  const [blackcatFee, setBlackcatFee] = useState(120);
  const [hsinchuFee, setHsinchuFee] = useState(100);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1500);
  const [blackcatEnabled, setBlackcatEnabled] = useState(true);
  const [hsinchuEnabled, setHsinchuEnabled] = useState(true);

  // Bank states
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankRecipient, setBankRecipient] = useState('');

  // ECPay states
  const [ecpayMerchantId, setEcpayMerchantId] = useState('2000132');
  const [ecpayHashKey, setEcpayHashKey] = useState('');
  const [ecpayHashIv, setEcpayHashIv] = useState('');
  const [ecpayMode, setEcpayMode] = useState<'test' | 'prod'>('test');

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
        // Populate Brand
        setLogoUrl(data.logo_url ?? '');
        setHeroTitle(data.hero_title ?? '');
        setHeroSubtitle(data.hero_subtitle ?? '');
        setBanners(data.hero_banners ?? []);

        // Populate Logistics
        setBlackcatFee(Number(data.blackcat_fee ?? 120));
        setHsinchuFee(Number(data.hsinchu_fee ?? 100));
        setFreeShippingThreshold(Number(data.free_shipping_threshold ?? 1500));
        setBlackcatEnabled(data.blackcat_enabled !== false);
        setHsinchuEnabled(data.hsinchu_enabled !== false);

        // Populate Bank
        setBankName(data.bank_name ?? '');
        setBankCode(data.bank_code ?? '');
        setBankAccount(data.bank_account ?? '');
        setBankRecipient(data.bank_recipient ?? '');

        // Populate ECPay
        setEcpayMerchantId(data.ecpay_merchant_id ?? '2000132');
        setEcpayHashKey(data.ecpay_hash_key ?? '');
        setEcpayHashIv(data.ecpay_hash_iv ?? '');
        setEcpayMode(data.ecpay_mode ?? 'test');
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

      setBanners(prev => [...prev, { url: publicUrl, alt: '' }]);
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
    setBanners(prev => [...prev, { url: newBannerUrl.trim(), alt: '' }]);
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
          // Brand info
          logo_url: logoUrl || null,
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          hero_banners: banners,

          // Logistics info
          blackcat_fee: Number(blackcatFee),
          hsinchu_fee: Number(hsinchuFee),
          free_shipping_threshold: Number(freeShippingThreshold),
          blackcat_enabled: blackcatEnabled,
          hsinchu_enabled: hsinchuEnabled,

          // Bank transfer info
          bank_name: bankName || null,
          bank_code: bankCode || null,
          bank_account: bankAccount || null,
          bank_recipient: bankRecipient || null,

          // ECPay info
          ecpay_merchant_id: ecpayMerchantId || null,
          ecpay_hash_key: ecpayHashKey || null,
          ecpay_hash_iv: ecpayHashIv || null,
          ecpay_mode: ecpayMode,

          updated_at: new Date().toISOString(),
        })
        .eq('id', 'global');

      if (saveErr) throw saveErr;

      setSuccess('所有設定已成功儲存！');
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
      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'brand' ? styles.activeTabBtn : ''}`}
          onClick={() => { setActiveTab('brand'); setError(null); setSuccess(null); }}
        >
          ✨ 品牌與外觀
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'logistics' ? styles.activeTabBtn : ''}`}
          onClick={() => { setActiveTab('logistics'); setError(null); setSuccess(null); }}
        >
          🚚 物流配送設定
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'payment' ? styles.activeTabBtn : ''}`}
          onClick={() => { setActiveTab('payment'); setError(null); setSuccess(null); }}
        >
          💳 金流串接設定
        </button>
      </div>

      <form onSubmit={handleSave}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {/* Tab 1: Brand & Identity */}
        {activeTab === 'brand' && (
          <div className={styles.layout}>
            {/* Left column: logo & title */}
            <div className={`glass ${styles.leftCard}`}>
              <h3 className={styles.cardTitle}>⚙️ 全站基礎與品牌</h3>
              <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

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
                  placeholder="請輸入首頁 Banner 的副標題描述..."
                  rows={4}
                  required
                />
              </div>

              <button type="submit" className={`btn btn-gold ${styles.saveBtn}`} disabled={saving || uploadingLogo || uploadingBanner}>
                {saving ? '正在儲存設定...' : '💾 儲存品牌設定'}
              </button>
            </div>

            {/* Right column: Banners */}
            <div className={`glass ${styles.rightCard}`}>
              <h3 className={styles.cardTitle}>📸 首頁輪播圖管理 (Hero Banners)</h3>
              <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

              <div className={styles.formGroup}>
                <label>新增輪播圖片 (建議 16:9 或 21:9 大圖)</label>
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
                    {banners.map((banner, idx) => (
                      <div key={idx} className={styles.bannerItem}>
                        <div className={styles.bannerThumb}>
                          <img src={banner.url} alt={banner.alt || `Banner ${idx + 1}`} />
                          <div className={styles.bannerBadge}>#{idx + 1}</div>
                        </div>
                        <div className={styles.bannerInfo}>
                          <p className={styles.bannerUrlText} title={banner.url}>{banner.url}</p>
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
          </div>
        )}

        {/* Tab 2: Logistics settings */}
        {activeTab === 'logistics' && (
          <div className={`glass ${styles.settingsCard}`}>
            <h3 className={styles.cardTitle}>🚚 物流與配送方案設定</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              設定前台消費者可選擇的宅配配送服務與運費門檻。
            </p>
            <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

            <div className={styles.formGrid}>
              {/* Carrier 1: Black Cat */}
              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className={styles.toggleRow}>
                  <input
                    type="checkbox"
                    id="blackcatToggle"
                    className={styles.toggleInput}
                    checked={blackcatEnabled}
                    onChange={e => setBlackcatEnabled(e.target.checked)}
                  />
                  <label htmlFor="blackcatToggle" className={styles.toggleLabel}>黑貓宅急便 (啟用此物流)</label>
                </div>
                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label htmlFor="blackcatFeeInput">黑貓標準運費 (NT$)</label>
                  <input
                    id="blackcatFeeInput"
                    type="number"
                    min="0"
                    className="input"
                    value={blackcatFee}
                    onChange={e => setBlackcatFee(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={!blackcatEnabled}
                    required
                  />
                </div>
              </div>

              {/* Carrier 2: Hsinchu Logistics */}
              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className={styles.toggleRow}>
                  <input
                    type="checkbox"
                    id="hsinchuToggle"
                    className={styles.toggleInput}
                    checked={hsinchuEnabled}
                    onChange={e => setHsinchuEnabled(e.target.checked)}
                  />
                  <label htmlFor="hsinchuToggle" className={styles.toggleLabel}>新竹貨運 (啟用此物流)</label>
                </div>
                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label htmlFor="hsinchuFeeInput">新竹貨運標準運費 (NT$)</label>
                  <input
                    id="hsinchuFeeInput"
                    type="number"
                    min="0"
                    className="input"
                    value={hsinchuFee}
                    onChange={e => setHsinchuFee(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={!hsinchuEnabled}
                    required
                  />
                </div>
              </div>
            </div>

            <hr className="gold-divider" style={{ margin: '2rem 0' }} />

            <div className={styles.formGroup} style={{ maxWidth: '400px' }}>
              <label htmlFor="thresholdInput">全館免運費消費門檻金額 (NT$)</label>
              <input
                id="thresholdInput"
                type="number"
                min="0"
                className="input"
                value={freeShippingThreshold}
                onChange={e => setFreeShippingThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                required
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                當消費者購物車小計超過此金額時，配送運費將自動減免為 0 元。
              </p>
            </div>

            <button type="submit" className={`btn btn-gold ${styles.saveBtn}`} style={{ maxWidth: '300px' }} disabled={saving}>
              {saving ? '正在儲存設定...' : '💾 儲存物流配送設定'}
            </button>
          </div>
        )}

        {/* Tab 3: Payment settings */}
        {activeTab === 'payment' && (
          <div className={`glass ${styles.settingsCard}`}>
            <h3 className={styles.cardTitle}>💳 金流收款管道設定</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              設定消費結帳時的付款方式，包含手動銀行轉帳及自動綠界第三方信用卡支付。
            </p>
            <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

            <div className={styles.formGrid}>
              {/* Option 1: Bank Transfer */}
              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--gold-light)', marginBottom: '1.25rem' }}>🏦 銀行ATM轉帳/匯款設定</h4>
                
                <div className={styles.formGroup}>
                  <label htmlFor="bankNameInput">收款銀行名稱</label>
                  <input
                    id="bankNameInput"
                    type="text"
                    className="input"
                    placeholder="例如：台灣銀行"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="bankCodeInput">銀行代碼 (3碼)</label>
                  <input
                    id="bankCodeInput"
                    type="text"
                    maxLength={3}
                    className="input"
                    placeholder="例如：004"
                    value={bankCode}
                    onChange={e => setBankCode(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="bankAccountInput">收款帳戶帳號</label>
                  <input
                    id="bankAccountInput"
                    type="text"
                    className="input"
                    placeholder="例如：1234-5678-9012"
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="bankRecipientInput">收款戶名</label>
                  <input
                    id="bankRecipientInput"
                    type="text"
                    className="input"
                    placeholder="例如：摩爾時尚股份有限公司"
                    value={bankRecipient}
                    onChange={e => setBankRecipient(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Option 2: ECPay Credit Card */}
              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--gold-light)', marginBottom: '1.25rem' }}>🛡️ 綠界 ECPay 信用卡收款設定</h4>

                <div className={styles.formGroup}>
                  <label htmlFor="ecpayModeInput">金流串接環境 (測試/正式環境切換)</label>
                  <select
                    id="ecpayModeInput"
                    className="input"
                    value={ecpayMode}
                    onChange={e => setEcpayMode(e.target.value as 'test' | 'prod')}
                  >
                    <option value="test">🔴 測試模擬環境 (ECPay Sandbox)</option>
                    <option value="prod">🟢 正式營運環境 (ECPay Live Production)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="ecpayMerchantInput">特店編號 (Merchant ID)</label>
                  <input
                    id="ecpayMerchantInput"
                    type="text"
                    className="input"
                    placeholder="測試帳號請填 2000132"
                    value={ecpayMerchantId}
                    onChange={e => setEcpayMerchantId(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="ecpayKeyInput">Hash Key</label>
                  <input
                    id="ecpayKeyInput"
                    type="password"
                    className="input"
                    placeholder="請輸入 Hash Key..."
                    value={ecpayHashKey}
                    onChange={e => setEcpayHashKey(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="ecpayIvInput">Hash IV</label>
                  <input
                    id="ecpayIvInput"
                    type="password"
                    className="input"
                    placeholder="請輸入 Hash IV..."
                    value={ecpayHashIv}
                    onChange={e => setEcpayHashIv(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className={`btn btn-gold ${styles.saveBtn}`} style={{ maxWidth: '300px', marginTop: '2rem' }} disabled={saving}>
              {saving ? '正在儲存設定...' : '💾 儲存金流收款設定'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
