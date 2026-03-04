# Complete Supabase Setup Guide

## The Issue
Your app can store data locally in localStorage, but Supabase tables aren't being updated because RLS (Row Level Security) policies are blocking write operations.

## Step-by-Step Solution

### Step 1: Create All Tables
1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Copy the entire SQL from `/scripts/03-create-tables-safe.sql`
4. Paste it into the SQL editor
5. Click **"Run"** button
6. Wait for completion (should see "Success" message)

### Step 2: Disable RLS Policies (for Development)
1. Create another **new query** in SQL Editor
2. Copy the entire SQL from `/scripts/04-fix-rls-policies.sql`
3. Paste it into the SQL editor
4. Click **"Run"** button
5. You should see a success message and a table showing RLS status

### Step 3: Test the App
1. Refresh your app in the browser
2. Go to the Tenants page
3. Add a new tenant
4. Check your Supabase dashboard → **Table Editor** → **tenants** table
5. You should see your new tenant in the Supabase table

### Step 4: Verify Data Sync
In your browser console, you should see logs like:
```
[v0] Adding tenant: John Doe
[v0] Inserting to Supabase tenants table...
[v0] Tenant inserted to Supabase successfully
```

## What These Scripts Do

### `03-create-tables-safe.sql`
- Creates all 8 required tables: tenants, leases, payments, rent_records, rent_history, deposit_adjustments, database_connections, settings
- Sets up proper column types and constraints
- Creates the settings table with default values
- Is safe to run multiple times (won't error if tables exist)

### `04-fix-rls-policies.sql`
- **Disables RLS** on all tables for development
- This allows your app to write data without authentication issues
- For production, you should re-enable RLS with proper authentication policies

## Important Notes

- **localStorage still works as fallback** - Even if Supabase fails, your data saves locally
- **Data persists across page refreshes** - Both Supabase AND localStorage
- **Production recommendation** - Before deploying to production, re-enable RLS with proper authentication policies

## Troubleshooting

If you still see errors:

1. **Check browser console** (F12)
   - Look for `[v0]` logs to see if inserts are succeeding
   - Check the full error message if there's a failure

2. **Verify tables exist**
   - Go to Supabase → Table Editor
   - You should see: tenants, leases, payments, rent_records, rent_history, deposit_adjustments, database_connections, settings

3. **Check RLS status**
   - Run this query in Supabase SQL Editor:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE tablename IN ('tenants', 'leases', 'payments', 'rent_records', 'rent_history', 'deposit_adjustments', 'database_connections', 'settings');
   ```
   - All should show `false` for rowsecurity (meaning RLS is disabled)

## Next Steps After Setup

Once everything is working:
1. All your local data will sync to Supabase
2. You can access it from the Supabase dashboard
3. Consider setting up proper authentication for production
