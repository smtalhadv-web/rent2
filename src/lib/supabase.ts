import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// Vite requires VITE_ prefix for public variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[v0] Initializing Supabase');
console.log('[v0] URL available:', !!supabaseUrl);
console.log('[v0] Key available:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[v0] Missing Supabase environment variables');
  console.error('[v0] Available env keys:', Object.keys(import.meta.env).filter(k => k.includes('SUPABASE') || k.includes('supabase')));
  throw new Error('Missing Supabase environment variables - check your environment setup');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, username: string) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  if (authData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          username,
          name: username,
          role: 'owner',
        },
      ]);

    if (profileError) throw profileError;
  }

  return authData;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Tenants
export const getTenants = async () => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const addTenant = async (tenant: any) => {
  const { data, error } = await supabase
    .from('tenants')
    .insert([tenant])
    .select();

  if (error) throw error;
  return data[0];
};

export const updateTenant = async (id: string, tenant: any) => {
  const { data, error } = await supabase
    .from('tenants')
    .update(tenant)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteTenant = async (id: string) => {
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Leases
export const getLeases = async () => {
  const { data, error } = await supabase
    .from('leases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const addLease = async (lease: any) => {
  const { data, error } = await supabase
    .from('leases')
    .insert([lease])
    .select();

  if (error) throw error;
  return data[0];
};

export const updateLease = async (id: string, lease: any) => {
  const { data, error } = await supabase
    .from('leases')
    .update(lease)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

// Payments
export const getPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('payment_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const addPayment = async (payment: any) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select();

  if (error) throw error;
  return data[0];
};

// Rent Records
export const getRentRecords = async () => {
  const { data, error } = await supabase
    .from('rent_records')
    .select('*')
    .order('month_year', { ascending: false });

  if (error) throw error;
  return data;
};

export const getRentRecord = async (tenantId: string, monthYear: string) => {
  const { data, error } = await supabase
    .from('rent_records')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('month_year', monthYear)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

export const addRentRecord = async (record: any) => {
  const { data, error } = await supabase
    .from('rent_records')
    .insert([record])
    .select();

  if (error) throw error;
  return data[0];
};

export const updateRentRecord = async (id: string, record: any) => {
  const { data, error } = await supabase
    .from('rent_records')
    .update(record)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

// Rent History
export const getRentHistory = async () => {
  const { data, error } = await supabase
    .from('rent_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const addRentHistory = async (history: any) => {
  const { data, error } = await supabase
    .from('rent_history')
    .insert([history])
    .select();

  if (error) throw error;
  return data[0];
};

// Deposit Adjustments
export const getDepositAdjustments = async () => {
  const { data, error } = await supabase
    .from('deposit_adjustments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const addDepositAdjustment = async (adjustment: any) => {
  const { data, error } = await supabase
    .from('deposit_adjustments')
    .insert([adjustment])
    .select();

  if (error) throw error;
  return data[0];
};

// Settings
export const getSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

export const updateSettings = async (id: string, settings: any) => {
  const { data, error } = await supabase
    .from('settings')
    .update(settings)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

export const createSettings = async (settings: any) => {
  const { data, error } = await supabase
    .from('settings')
    .insert([settings])
    .select();

  if (error) throw error;
  return data[0];
};
