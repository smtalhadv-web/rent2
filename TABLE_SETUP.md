# Supabase Table Setup Instructions

## Problem
You're getting a 400 error when updating tenants. This usually means the tables don't exist or have different column names.

## Solution

### Step 1: Create All Tables in Supabase

Go to your Supabase Dashboard → SQL Editor and run the complete SQL script:

Copy the entire content from `/scripts/01-create-tables.sql`

**Key columns that MUST exist in the `tenants` table:**
- id (UUID) - Primary Key
- name (TEXT) - Not null
- cnic (TEXT)
- phone (TEXT)
- email (TEXT)
- premises (TEXT) - Not null
- effective_date (DATE)
- monthly_rent (DECIMAL)
- security_deposit (DECIMAL)
- deposit_account_no (TEXT)
- utility_no (TEXT)
- status (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Step 2: Verify Tables Exist

In Supabase Dashboard:
1. Go to the Table Editor on the left sidebar
2. You should see these tables:
   - users
   - tenants
   - leases
   - rent_records
   - payments
   - rent_history
   - deposit_adjustments
   - settings
   - database_connections

### Step 3: Check Row Level Security (RLS)

Each table should have RLS policies enabled. Click on each table and check:
- Tables with RLS enabled show a shield icon
- Policies should allow authenticated users to read/write

### Step 4: If Tables Already Exist

If you get an error saying tables already exist, you can drop them first:

```sql
DROP TABLE IF EXISTS database_connections CASCADE;
DROP TABLE IF EXISTS deposit_adjustments CASCADE;
DROP TABLE IF EXISTS rent_history CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS rent_records CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then run the create tables script again.

### Step 5: Test the Connection

Once tables are created:
1. Refresh your app
2. Try adding a new tenant
3. Try editing the tenant
4. The 400 error should be gone

## If Still Getting 400 Error

Check the browser console (F12) for the detailed error message. Common causes:
- Table doesn't exist: Run the SQL script
- Column name mismatch: Check that column names match exactly
- Data type error: Ensure numeric fields are numbers, text fields are strings
- RLS policy blocking the update: Check policies in Supabase dashboard

## Quick Test

To verify your setup works:
1. Add a new tenant with name "Test Tenant"
2. The tenant should appear in the list
3. Click edit and change the name to "Updated Tenant"
4. It should update without errors
