-- ==========================================
-- mall2 Supabase Site Settings Update
-- ==========================================

-- 1. Site Settings Table
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  logo_url TEXT,
  hero_title TEXT DEFAULT 'mall2 潮流服飾',
  hero_subtitle TEXT DEFAULT '探索最新的時尚單品，展現你的獨特風格。專為年輕世代打造的極致購物體驗。',
  hero_banners JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only one row exists
ALTER TABLE public.site_settings ADD CONSTRAINT single_row CHECK (id = 'global');

-- Insert default row
INSERT INTO public.site_settings (id) VALUES ('global') ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Storage Bucket for site assets (logo, banners)
INSERT INTO storage.buckets (id, name, public) VALUES ('site_assets', 'site_assets', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Site assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'site_assets');
CREATE POLICY "Admins can upload site assets" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'site_assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update site assets" ON storage.objects FOR UPDATE USING (
  bucket_id = 'site_assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete site assets" ON storage.objects FOR DELETE USING (
  bucket_id = 'site_assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
