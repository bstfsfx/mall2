-- ==========================================
-- Discount Codes Migration
-- ==========================================

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
    discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_uses INTEGER DEFAULT NULL,
    used_count INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active);

-- Create orders discount field
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- RLS for discount_codes
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Allow admin full access, public read for validation
CREATE POLICY "Admins full access" ON discount_codes FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can view active codes for validation" ON discount_codes FOR SELECT TO anon USING (true);

-- Increment used count RPC function
CREATE OR REPLACE FUNCTION increment_discount_used_count(code TEXT)
RETURNS void AS $$
  UPDATE discount_codes
  SET used_count = used_count + 1, updated_at = NOW()
  WHERE UPPER(code) = UPPER(increment_discount_used_count.code);
$$ LANGUAGE sql SECURITY DEFINER;