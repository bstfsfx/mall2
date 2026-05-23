-- ==========================================
-- Online Inquiry / 詢價單 Migration
-- ==========================================

CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    product_interest TEXT,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'closed')),
    reply_message TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit inquiries" ON inquiries
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Admins can view and manage inquiries" ON inquiries
  FOR ALL TO authenticated USING (true);