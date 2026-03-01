# Supabase Setup Guide

## Overview
Your rental management application has been successfully set up with Supabase as the backend database. All data is now persisted in the cloud instead of localStorage.

## Database Schema

### Tables Created

1. **users** - Extended Supabase auth user profiles
   - Fields: id, username, role (admin/owner/accountant), name, timestamps

2. **tenants** - Rental property tenants
   - Fields: name, CNIC, phone, email, premises, effective_date, monthly_rent, security_deposit, status

3. **leases** - Lease agreements
   - Fields: tenant_id, start_date, end_date, duration_months, increment_percent, reminder_days, status

4. **rent_records** - Monthly rent tracking
   - Fields: tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward

5. **payments** - Payment history
   - Fields: tenant_id, month_year, amount, payment_date, payment_method, transaction details

6. **rent_history** - Rent increase history
   - Fields: tenant_id, old_rent, new_rent, effective_date, increment_percent

7. **deposit_adjustments** - Security deposit adjustments
   - Fields: tenant_id, description, amount, date

8. **settings** - Plaza/building configuration
   - Fields: plaza_name, address, phone, logo, header/footer text, bank details, increment settings

## Configuration

### Environment Variables
The following environment variables are required in your `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are set in the Vercel project settings under the "Vars" section.

### Supabase Client
The client is initialized in `src/lib/supabase.ts` with helper functions for all CRUD operations:

- Authentication: `signUp()`, `signIn()`, `signOut()`, `getCurrentUser()`
- Tenants: `getTenants()`, `addTenant()`, `updateTenant()`, `deleteTenant()`
- Leases: `getLeases()`, `addLease()`, `updateLease()`
- Payments: `getPayments()`, `addPayment()`
- Rent Records: `getRentRecords()`, `addRentRecord()`, `updateRentRecord()`
- Rent History: `getRentHistory()`, `addRentHistory()`
- Deposit Adjustments: `getDepositAdjustments()`, `addDepositAdjustment()`
- Settings: `getSettings()`, `updateSettings()`, `createSettings()`

## Application Integration

### AppContext
The React context in `src/context/AppContext.tsx` has been updated to:
1. Load all data from Supabase on mount
2. Save new tenants to Supabase with `addTenant()`, `updateTenant()`, `deleteTenant()`
3. Maintain backward compatibility with localStorage as a fallback

### Data Flow
```
UI Components → AppContext → Supabase Client → Supabase Database
```

## Sample Data
The database has been seeded with:
- 5 sample tenants (Zafar Mahmood, Zahoor ul Hassan, Nadeem Qaiser, Gulfam Tailor, Yasin Barbar Shop)
- 5 corresponding leases
- Rent records for February 2026
- Payment history for December 2025
- Plaza settings for "Grand Commercial Plaza"

## Next Steps

1. **Test the Integration**: Open the app and verify that tenants appear from the database
2. **Add New Tenants**: Create new tenants and confirm they're saved to Supabase
3. **Authentication**: Set up user authentication via Supabase Auth if needed
4. **Row Level Security (RLS)**: Consider enabling RLS policies to restrict data access by user role

## Dependencies Added
- `@supabase/supabase-js`: ^2.45.0

## Common Operations

### Query Tenants
```typescript
const { data: tenants, error } = await supabase
  .from('tenants')
  .select('*')
  .eq('status', 'active');
```

### Add Payment
```typescript
const { data: payment, error } = await supabase
  .from('payments')
  .insert([{
    tenant_id: tenantId,
    month_year: '2026-03',
    amount: 50000,
    payment_date: '2026-03-15',
    payment_method: 'bank'
  }]).select();
```

### Update Tenant Rent
```typescript
const { data: updated, error } = await supabase
  .from('tenants')
  .update({ monthly_rent: 107181 })
  .eq('id', tenantId)
  .select();
```

## Troubleshooting

- **"Missing Supabase environment variables"**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel project settings
- **Data not loading**: Check browser console for errors. Verify network connectivity and that the Supabase project is active
- **Duplicate data**: The migrations use `ON CONFLICT DO NOTHING` to prevent duplicates when re-running scripts
