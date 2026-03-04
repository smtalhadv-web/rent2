-- Disable RLS for development (you can re-enable later for production)
-- This allows the app to insert/update/delete data without authentication issues

-- Disable RLS on tenants table
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- Disable RLS on leases table
ALTER TABLE leases DISABLE ROW LEVEL SECURITY;

-- Disable RLS on payments table
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on rent_records table
ALTER TABLE rent_records DISABLE ROW LEVEL SECURITY;

-- Disable RLS on rent_history table
ALTER TABLE rent_history DISABLE ROW LEVEL SECURITY;

-- Disable RLS on deposit_adjustments table
ALTER TABLE deposit_adjustments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on database_connections table
ALTER TABLE database_connections DISABLE ROW LEVEL SECURITY;

-- Disable RLS on settings table
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('tenants', 'leases', 'payments', 'rent_records', 'rent_history', 'deposit_adjustments', 'database_connections', 'settings');
