# Supabase Database Setup Guide

Your app is showing 404 errors because the database tables don't exist yet in Supabase. Follow these steps to create them.

## Step 1: Go to Supabase Dashboard

1. Visit [https://supabase.com](https://supabase.com) and log in
2. Select your project (the one with ID matching your `VITE_SUPABASE_URL`)
3. Click on "SQL Editor" in the left sidebar

## Step 2: Create the Main Tables

1. Click "New Query" button
2. Copy and paste the entire SQL script below:

```sql
-- Create auth users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'owner', 'accountant')),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnic TEXT,
  phone TEXT,
  email TEXT,
  premises TEXT NOT NULL,
  effective_date DATE,
  monthly_rent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  security_deposit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  deposit_account_no TEXT,
  utility_no TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vacated', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create leases table
CREATE TABLE IF NOT EXISTS leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_months INTEGER NOT NULL,
  increment_percent DECIMAL(5, 2) NOT NULL DEFAULT 10,
  reminder_days INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'expired', 'renewed')),
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rent records table
CREATE TABLE IF NOT EXISTS rent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  rent DECIMAL(12, 2) NOT NULL,
  outstanding_previous DECIMAL(12, 2) NOT NULL DEFAULT 0,
  paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  carry_forward DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, month_year)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank', 'online')),
  transaction_no TEXT,
  deposited_account TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rent history table
CREATE TABLE IF NOT EXISTS rent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  old_rent DECIMAL(12, 2) NOT NULL,
  new_rent DECIMAL(12, 2) NOT NULL,
  effective_date DATE NOT NULL,
  increment_percent DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create deposit adjustments table
CREATE TABLE IF NOT EXISTS deposit_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaza_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  header_text TEXT,
  footer_text TEXT,
  terms_conditions TEXT,
  whatsapp_template TEXT,
  default_increment_percent DECIMAL(5, 2) NOT NULL DEFAULT 10,
  auto_apply_increment BOOLEAN NOT NULL DEFAULT FALSE,
  bank_name TEXT,
  account_title TEXT,
  account_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create database connections table
CREATE TABLE IF NOT EXISTS database_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mysql', 'postgresql', 'sql-server', 'sqlite')),
  host TEXT,
  port INTEGER,
  database TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_premises ON tenants(premises);
CREATE INDEX IF NOT EXISTS idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_rent_records_tenant_id ON rent_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_records_month_year ON rent_records(month_year);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_rent_history_tenant_id ON rent_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deposit_adjustments_tenant_id ON deposit_adjustments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_database_connections_created_at ON database_connections(created_at DESC);

-- Enable RLS (Row Level Security) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_connections ENABLE ROW LEVEL SECURITY;
```

3. Click "Run" button to execute
4. Wait for it to complete (you should see a success message)

## Step 3: Create Row-Level Security (RLS) Policies

These policies ensure users can only access their own data.

1. Click "New Query" again
2. Copy and paste this SQL:

```sql
-- RLS Policies for users
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policies for authenticated users (can read/write all data)
CREATE POLICY "Allow authenticated read" ON tenants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write" ON tenants FOR INSERT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON tenants FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON tenants FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read" ON leases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write" ON leases FOR INSERT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON leases FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON leases FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read" ON rent_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write" ON rent_records FOR INSERT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON rent_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON rent_records FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read" ON payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write" ON payments FOR INSERT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON payments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON payments FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read" ON rent_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write" ON rent_history FOR INSERT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON rent_history FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read" ON deposit_adjustments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write" ON deposit_adjustments FOR INSERT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON deposit_adjustments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON deposit_adjustments FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read" ON settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write" ON settings FOR INSERT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read" ON database_connections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write" ON database_connections FOR INSERT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON database_connections FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON database_connections FOR DELETE USING (auth.role() = 'authenticated');
```

3. Click "Run" to execute

## Step 4: Verify Tables Were Created

1. Go to "Table Editor" in the left sidebar
2. You should see all these tables listed:
   - users
   - tenants
   - leases
   - rent_records
   - payments
   - rent_history
   - deposit_adjustments
   - settings
   - database_connections

## Step 5: Refresh Your App

1. Go back to your app in the browser
2. Press F5 to refresh the page
3. The 404 errors should be gone
4. You can now add database connections in the Settings page

## Troubleshooting

**Still seeing 404 errors?**
- Check that all tables are in the "public" schema (not a custom schema)
- Make sure RLS policies are enabled
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct

**Can't add connections?**
- Open browser DevTools (F12) → Console tab
- Check for any error messages
- Make sure you're logged in to the app

**Need to delete tables and start over?**
- Go to SQL Editor and run:
```sql
DROP TABLE IF EXISTS database_connections;
DROP TABLE IF EXISTS deposit_adjustments;
DROP TABLE IF EXISTS rent_history;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS rent_records;
DROP TABLE IF EXISTS leases;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;
```
Then repeat the setup steps above.
