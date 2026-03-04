-- Create settings table for rent management app
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plaza_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  header_text TEXT,
  footer_text TEXT,
  logo TEXT,
  whatsapp_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for SELECT
CREATE POLICY settings_select_policy ON settings
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policy for INSERT
CREATE POLICY settings_insert_policy ON settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policy for UPDATE
CREATE POLICY settings_update_policy ON settings
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policy for DELETE
CREATE POLICY settings_delete_policy ON settings
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS settings_user_id_idx ON settings(user_id);
