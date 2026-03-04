-- Drop existing settings table if it exists
DROP TABLE IF EXISTS settings CASCADE;

-- Create settings table for rent management app
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaza_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  header_text TEXT,
  footer_text TEXT,
  logo TEXT,
  whatsapp_template TEXT,
  default_increment_percent NUMERIC DEFAULT 10,
  auto_apply_increment BOOLEAN DEFAULT FALSE,
  bank_name TEXT,
  account_title TEXT,
  account_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for SELECT (allow all authenticated users)
CREATE POLICY settings_select_policy ON settings
  FOR SELECT
  USING (true);

-- Create RLS policy for INSERT (allow all authenticated users)
CREATE POLICY settings_insert_policy ON settings
  FOR INSERT
  WITH CHECK (true);

-- Create RLS policy for UPDATE (allow all authenticated users)
CREATE POLICY settings_update_policy ON settings
  FOR UPDATE
  USING (true);

-- Create RLS policy for DELETE (allow all authenticated users)
CREATE POLICY settings_delete_policy ON settings
  FOR DELETE
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS settings_created_at_idx ON settings(created_at);

-- Insert default settings if not exists
INSERT INTO settings (plaza_name, address, phone, email, header_text, footer_text, whatsapp_template)
VALUES (
  'Plaza Management',
  '',
  '',
  '',
  'Plaza Management System',
  'All rights reserved',
  'Dear {{tenant}}, your rent of {{balance}} is due for {{month}}. Please contact us.'
) ON CONFLICT DO NOTHING;
