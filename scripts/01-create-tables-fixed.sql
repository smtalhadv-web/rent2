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

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaza_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
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
CREATE INDEX IF NOT EXISTS idx_database_connections_name ON database_connections(name);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (all authenticated users can read their own data)
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policies for tenants table
CREATE POLICY "Allow authenticated read"
  ON tenants FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert"
  ON tenants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update"
  ON tenants FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete"
  ON tenants FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policies for leases table
CREATE POLICY "Allow authenticated read" ON leases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON leases FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON leases FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON leases FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for rent_records table
CREATE POLICY "Allow authenticated read" ON rent_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON rent_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON rent_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON rent_records FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for payments table
CREATE POLICY "Allow authenticated read" ON payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON payments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON payments FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for rent_history table
CREATE POLICY "Allow authenticated read" ON rent_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON rent_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON rent_history FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for deposit_adjustments table
CREATE POLICY "Allow authenticated read" ON deposit_adjustments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON deposit_adjustments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON deposit_adjustments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON deposit_adjustments FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for database_connections table
CREATE POLICY "Allow authenticated read" ON database_connections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON database_connections FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON database_connections FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON database_connections FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for settings table
CREATE POLICY "Allow authenticated read" ON settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON settings FOR DELETE USING (auth.role() = 'authenticated');
