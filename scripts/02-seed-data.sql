-- Seed data for rental management system

-- Insert sample settings
INSERT INTO settings (plaza_name, address, phone, header_text, footer_text, default_increment_percent, auto_apply_increment, bank_name, account_title, account_number)
VALUES (
  'Grand Commercial Plaza',
  '123 Business District, City Center',
  '+92 300 1234567',
  'Official Rent Invoice',
  'Thank you for your timely payments.',
  10,
  false,
  'Bank Name',
  'Account Title',
  'Account Number'
)
ON CONFLICT DO NOTHING;

-- Insert sample tenants
INSERT INTO tenants (id, name, cnic, phone, email, premises, effective_date, monthly_rent, security_deposit, deposit_account_no, utility_no, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Zafar Mahmood', '', '+923001234567', '', '1M', '2023-07-01', 97437, 200000, '172', '6855087', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Zahoor ul Hassan', '', '+923001234568', '', '3M', '2023-09-20', 53944, 100000, '172', '4298250', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Nadeem Qaiser', '', '+923001234569', '', '4M', '2022-07-01', 50820, 100000, '521', '4534401', 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Gulfam Tailor', '', '+923001234570', '', '5M', '2023-07-01', 46452, 100000, '172', '319974', 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Yasin Barbar Shop', '', '+923001234571', '', '6M', '2021-10-01', 43923, 80000, '172', '319972', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample leases
INSERT INTO leases (id, tenant_id, start_date, end_date, duration_months, increment_percent, reminder_days, status)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2023-07-01', '2024-06-30', 12, 10, 30, 'running'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2023-09-20', '2024-09-19', 12, 10, 30, 'running'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '2022-07-01', '2023-06-30', 12, 10, 30, 'expired'),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '2023-07-01', '2024-06-30', 12, 10, 30, 'running'),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '2021-10-01', '2022-09-30', 12, 10, 30, 'expired')
ON CONFLICT (id) DO NOTHING;

-- Insert sample rent records
INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward)
VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2026-02', 97437, 170183, 0, 267620, 267620),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2026-02', 53944, 71154, 0, 125098, 125098),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '2026-02', 50820, 24080, 0, 74900, 74900),
  ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '2026-02', 46452, 134584, 0, 181036, 181036),
  ('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '2026-02', 43923, 11979, 0, 55902, 55902)
ON CONFLICT (tenant_id, month_year) DO NOTHING;

-- Insert sample payments
INSERT INTO payments (id, tenant_id, month_year, amount, payment_date, payment_method, transaction_no, deposited_account)
VALUES
  ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2025-12', 140000, '2025-12-30', 'bank', '', '172'),
  ('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2025-12', 70000, '2025-12-30', 'bank', '', '172'),
  ('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '2025-12', 51000, '2025-12-11', 'bank', '', '521'),
  ('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '2025-12', 47000, '2025-12-26', 'bank', '', '172'),
  ('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '2025-12', 39930, '2025-12-15', 'bank', '', '172')
ON CONFLICT (id) DO NOTHING;
