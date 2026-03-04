# Quick Supabase Setup Guide

Your app is mostly working! The 406 error on the settings table just means the table doesn't exist yet. Here's how to fix it in **2 minutes**:

## Step 1: Go to Your Supabase Dashboard

1. Visit [supabase.com](https://supabase.com) and log in
2. Select your **rent2** project
3. Click **SQL Editor** in the left sidebar

## Step 2: Run the Setup Script

1. Click **New Query**
2. Copy and paste the entire SQL code from `/scripts/01-create-tables.sql`
3. Click **Run** (green play button)
4. Wait for it to complete (should show "Success")

## Step 3: Refresh Your App

1. Go back to your app
2. Press **F5** to refresh the page
3. The 406 error should be gone!

## What This Does

The SQL script creates these tables in Supabase:
- `users` - User accounts
- `tenants` - Tenant information  
- `leases` - Lease agreements
- `rent_records` - Monthly rent tracking
- `payments` - Payment records
- `rent_history` - Rent increase history
- `deposit_adjustments` - Security deposit adjustments
- `settings` - App configuration
- `database_connections` - SQL database connections (your feature)

All tables have proper security policies so only authenticated users can access them.

## Need Help?

If you get an error:
1. Check the error message carefully
2. Make sure you're in the correct Supabase project
3. Try running the script in smaller chunks (copy one CREATE TABLE statement at a time)

That's it! Once the tables are created, your app will be fully functional.
