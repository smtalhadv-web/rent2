-- Import Rent Sheet Data for January 2026
-- This script inserts all 39 tenants and their rent records

-- First, clear existing data for testing (optional - comment out if you want to preserve existing data)
-- DELETE FROM rent_records WHERE month_year = '2026-01';
-- DELETE FROM tenants WHERE name IN (SELECT DISTINCT tenant_name FROM import_data);

-- Insert Tenants and Rent Records for January 2026
-- Using CTE to handle the data import

-- Tenant 1: Zafar Mahmood
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-1', 'Zafar Mahmood', '1M', '2023-07-01', 97437, '6855087', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 97437, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-1-2026-01', 'tenant-1', '2026-01', 97437, 172746, 100000, 170183, 170183, '172', '2026-01-30', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 100000, balance = 170183, carry_forward = 170183;

-- Tenant 2: Zahoor ul Hassan
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-2', 'Zahoor ul Hassan', '3M', '2023-09-20', 53944, '4298250', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 53944, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-2-2026-01', 'tenant-2', '2026-01', 53944, 17210, 0, 71154, 71154, '172', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 71154, carry_forward = 71154;

-- Tenant 3: Nadeem Qaiser
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-3', 'Nadeem Qaiser', '4M', '2022-07-01', 50820, '4534401', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 50820, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-3-2026-01', 'tenant-3', '2026-01', 50820, 74260, 101000, 24080, 24080, '521', '2026-01-28', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 101000, balance = 24080, carry_forward = 24080;

-- Tenant 4: Gulfam Tailor
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-4', 'Gulfam Tailor', '5M', '2023-07-01', 46452, '319974', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 46452, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-4-2026-01', 'tenant-4', '2026-01', 46452, 135132, 47000, 134584, 134584, '172', '2026-01-29', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 47000, balance = 134584, carry_forward = 134584;

-- Tenant 5: Yasin Barbar Shop
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-5', 'Yasin Barbar Shop', '6M', '2021-10-01', 43923, '319972', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 43923, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-5-2026-01', 'tenant-5', '2026-01', 43923, 11979, 43923, 11979, 11979, '172', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 43923, balance = 11979, carry_forward = 11979;

-- Tenant 6: Tassadaq Hussain
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-6', 'Tassadaq Hussain', '7M', '2017-02-01', 65592, '5389448', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 65592, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-6-2026-01', 'tenant-6', '2026-01', 65592, 101363, 100000, 66955, 66955, '521', '2026-01-30', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 100000, balance = 66955, carry_forward = 66955;

-- Tenant 7: Zulfiqar Tailor
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-7', 'Zulfiqar Tailor', '7M-2', '2023-02-01', 36443, '4320055', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 36443, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-7-2026-01', 'tenant-7', '2026-01', 36443, 15448, 40000, 11891, 11891, '172', '2026-01-29', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 40000, balance = 11891, carry_forward = 11891;

-- Tenant 8: Shahid Riaz
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-8', 'Shahid Riaz', '8M', '2024-02-01', 45000, '36314', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 45000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-8-2026-01', 'tenant-8', '2026-01', 45000, 132766, 50000, 127766, 127766, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 50000, balance = 127766, carry_forward = 127766;

-- Tenant 9: Shahzad Ali
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-9', 'Shahzad Ali', '9M', '2024-02-01', 45000, '319969', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 45000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-9-2026-01', 'tenant-9', '2026-01', 45000, 81366, 85000, 41366, 41366, '172', '2026-01-29', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 85000, balance = 41366, carry_forward = 41366;

-- Tenant 10: Faiz Rasool (Lace)
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-10', 'Faiz Rasool (Lace)', '10M', '2022-01-01', 33660, '92923', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 33660, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-10-2026-01', 'tenant-10', '2026-01', 33660, 39660, 33660, 39660, 39660, '', '2026-01-29', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 33660, balance = 39660, carry_forward = 39660;

-- Tenant 11: Zafar/M Boota
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-11', 'Zafar/M Boota', '11M', '2023-05-01', 56514, '319970', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 56514, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-11-2026-01', 'tenant-11', '2026-01', 56514, 320746, 100000, 277260, 277260, '521', '2026-01-22', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 100000, balance = 277260, carry_forward = 277260;

-- Tenant 12: Tariq Mahmood
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-12', 'Tariq Mahmood', '3B', '2023-04-01', 53147, '9006836', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 53147, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-12-2026-01', 'tenant-12', '2026-01', 53147, 795, 53000, 942, 942, '', '2026-01-21', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 53000, balance = 942, carry_forward = 942;

-- Tenant 13: Muhammad Nadeem
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-13', 'Muhammad Nadeem', '4B', '2023-03-01', 68200, '7127416', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 68200, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-13-2026-01', 'tenant-13', '2026-01', 68200, 173864, 100000, 142064, 142064, '521', '2026-01-31', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 100000, balance = 142064, carry_forward = 142064;

-- Tenant 14: M. Ali
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-14', 'M. Ali', '6A', '2022-07-01', 77171, '319962', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 77171, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-14-2026-01', 'tenant-14', '2026-01', 77171, 19726, 79650, 17247, 17247, '521', '2026-01-25', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 79650, balance = 17247, carry_forward = 17247;

-- Tenant 15: Asghar Ali
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-15', 'Asghar Ali', '6B', '2023-03-23', 78650, '82449', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 78650, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-15-2026-01', 'tenant-15', '2026-01', 78650, 0, 78650, 0, 0, '', '2026-01-28', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 78650, balance = 0, carry_forward = 0;

-- Tenant 16: Amjad Tailor
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-16', 'Amjad Tailor', '8A', '2019-01-01', 70862, '4303874', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 70862, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-16-2026-01', 'tenant-16', '2026-01', 70862, 246873, 0, 317735, 317735, '521', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 317735, carry_forward = 317735;

-- Tenant 17: M. Ilyas Tailor
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-17', 'M. Ilyas Tailor', '8B', '2025-08-15', 72000, '319966', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 72000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-17-2026-01', 'tenant-17', '2026-01', 72000, -6115, 72000, -6115, -6115, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 72000, balance = -6115, carry_forward = -6115;

-- Tenant 18: M. Rizwan Tailor
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-18', 'M. Rizwan Tailor', '9A', '2023-09-01', 58564, '458631', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 58564, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-18-2026-01', 'tenant-18', '2026-01', 58564, 676, 59240, 0, 0, '521', '2026-01-20', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 59240, balance = 0, carry_forward = 0;

-- Tenant 19: M. Khalid (Tandoor)
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-19', 'M. Khalid (Tandoor)', '9B', '2024-01-01', 143000, '4303434', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 143000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-19-2026-01', 'tenant-19', '2026-01', 143000, 143000, 143000, 143000, 143000, '173', '2026-01-16', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 143000, balance = 143000, carry_forward = 143000;

-- Tenant 20: M. Qayyum Khan
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-20', 'M. Qayyum Khan', '10A', '2023-07-01', 75515, '320128', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 75515, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-20-2026-01', 'tenant-20', '2026-01', 75515, 520898, 100000, 496413, 496413, '521', '2026-01-13', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 100000, balance = 496413, carry_forward = 496413;

-- Tenant 21: M. yasir (Tailor)
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-21', 'M. yasir (Tailor)', '10B', '2025-08-01', 98000, '3882', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 98000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-21-2026-01', 'tenant-21', '2026-01', 98000, 97524, 98000, 97524, 97524, '', '2026-01-23', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 98000, balance = 97524, carry_forward = 97524;

-- Tenant 22: Imran Jew
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-22', 'Imran Jew', 'G1-A', '2023-01-01', 325000, '4303886', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 325000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-22-2026-01', 'tenant-22', '2026-01', 325000, 1074314, 1350000, 49314, 49314, '521', '2026-01-22', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 1350000, balance = 49314, carry_forward = 49314;

-- Tenant 23: Haji M. Rasool Jew
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-23', 'Haji M. Rasool Jew', 'G1-B', '2016-01-01', 346955, '4303402', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 346955, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-23-2026-01', 'tenant-23', '2026-01', 346955, 5, 346955, 5, 5, '4521', '2026-01-09', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 346955, balance = 5, carry_forward = 5;

-- Tenant 24: ijlal Ice-crream
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-24', 'ijlal Ice-crream', 'G2-A', '2023-01-01', 225000, '654381', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 225000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-24-2026-01', 'tenant-24', '2026-01', 225000, 0, 0, 225000, 225000, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 225000, carry_forward = 225000;

-- Tenant 25: Shahid Jew
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-25', 'Shahid Jew', 'G3-A', '2022-08-01', 278808, '30555', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 278808, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-25-2026-01', 'tenant-25', '2026-01', 278808, 34564, 310000, 3372, 3372, '', '2026-01-27', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 310000, balance = 3372, carry_forward = 3372;

-- Tenant 26: Faisal Jew
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-26', 'Faisal Jew', 'G3-B', '2024-01-01', 201300, '7124129', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 201300, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-26-2026-01', 'tenant-26', '2026-01', 201300, 0, 201300, 0, 0, '521', '2026-01-19', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 201300, balance = 0, carry_forward = 0;

-- Tenant 27: Vacate G2-B+G4 (Skip - no data)

-- Tenant 28: Vacate G6-A (Skip - no data)

-- Tenant 29: M&P Courier
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-29', 'M&P Courier', 'G6-B', '2024-10-15', 473000, '3772', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 473000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-29-2026-01', 'tenant-29', '2026-01', 473000, -84750, 0, 388250, 388250, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 388250, carry_forward = 388250;

-- Tenant 30: G8-A (Empty - skip)

-- Tenant 31: Leopard Courier
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-31', 'Leopard Courier', 'G8-B', '2024-04-15', 209000, '159142', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 209000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-31-2026-01', 'tenant-31', '2026-01', 209000, 8750, 0, 217750, 217750, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 217750, carry_forward = 217750;

-- Tenant 32: M. Nadeem (patyala Jew)
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-32', 'M. Nadeem (patyala Jew)', 'G-9/A', '2024-02-01', 197654, '319943', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 197654, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-32-2026-01', 'tenant-32', '2026-01', 197654, 562619, 0, 760273, 760273, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 760273, carry_forward = 760273;

-- Tenant 33: Vacate G-12 (Skip - no data)

-- Tenant 34: Mr.Rasheed
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-34', 'Mr.Rasheed', 'G-9/B', '2023-01-10', 146410, '3443984', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 146410, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-34-2026-01', 'tenant-34', '2026-01', 146410, 0, 146410, 0, 0, '475', '2026-01-19', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 146410, balance = 0, carry_forward = 0;

-- Tenant 35: TCS
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-35', 'TCS', 'G-10', '2024-04-01', 385000, '4544342', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 385000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-35-2026-01', 'tenant-35', '2026-01', 385000, 594718, 315095, 664623, 664623, '542', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 315095, balance = 664623, carry_forward = 664623;

-- Tenant 36: Mrs. Bushra (Saloon)
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-36', 'Mrs. Bushra (Saloon)', '6-F', '2024-08-15', 88000, '2505375', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 88000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-36-2026-01', 'tenant-36', '2026-01', 88000, 0, 88000, 0, 0, '', '2026-01-25', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 88000, balance = 0, carry_forward = 0;

-- Tenant 37: Syed Kazim Raza
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-37', 'Syed Kazim Raza', '9-F', '2021-12-15', 118278, '319971', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 118278, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-37-2026-01', 'tenant-37', '2026-01', 118278, 543314, 500000, 161592, 161592, '521', '2026-01-07', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 500000, balance = 161592, carry_forward = 161592;

-- Tenant 38: Mrs. Bushra (Saloon) 8-F+10-F
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-38', 'Mrs. Bushra (Saloon)', '8-F+10-F', '2021-03-01', 264000, '4459764', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 264000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-38-2026-01', 'tenant-38', '2026-01', 264000, 0, 264000, 0, 0, '', '2026-01-25', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 264000, balance = 0, carry_forward = 0;

-- Tenant 39: M. Haseeb
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-39', 'M. Haseeb', '1-S-A', '2025-01-01', 35000, '319965', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 35000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-39-2026-01', 'tenant-39', '2026-01', 35000, 140000, 0, 175000, 175000, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 175000, carry_forward = 175000;

-- Tenant 40: Office Plaza (Skip - no rent)

-- Tenant 41: Syed Kazim Raza 2-S
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-41', 'Syed Kazim Raza', '2-S', '2022-09-01', 59895, '226108', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 59895, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-41-2026-01', 'tenant-41', '2026-01', 59895, 293480, 0, 353375, 353375, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 353375, carry_forward = 353375;

-- Tenant 42: Shah Jahan 10%
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-42', 'Shah Jahan 10%', '3-S', '2022-12-05', 74429, '320121', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 74429, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-42-2026-01', 'tenant-42', '2026-01', 74429, 1133905, 0, 1208334, 1208334, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 1208334, carry_forward = 1208334;

-- Tenant 43: Shafiq Sultan
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-43', 'Shafiq Sultan', '4-S', '2022-12-01', 64130, '1790975', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 64130, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-43-2026-01', 'tenant-43', '2026-01', 64130, 72290, 64000, 72420, 72420, '521', '2026-01-06', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 64000, balance = 72420, carry_forward = 72420;

-- Tenant 44, 45: Vacate (Skip - no data)

-- Tenant 46: Rafay
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-46', 'Rafay', '9-S', '2026-01-10', 100000, '319973', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 100000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-46-2026-01', 'tenant-46', '2026-01', 100000, 0, 100000, 0, 0, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 100000, balance = 0, carry_forward = 0;

-- Tenant 47: M. Farukh Saeed (Exp) 10%
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-47', 'M. Farukh Saeed (Exp) 10%', '10-S', '2021-08-01', 86969, '4302646', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 86969, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-47-2026-01', 'tenant-47', '2026-01', 86969, 283185, 0, 370154, 370154, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 370154, carry_forward = 370154;

-- Tenant 48: Vacate Mumty (Skip - no data)

-- Tenant 67: Telenor
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-67', 'Telenor', '-', '2020-01-01', 43333, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 43333, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-67-2026-01', 'tenant-67', '2026-01', 43333, 129999, 0, 173332, 173332, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 173332, carry_forward = 173332;

-- Tenant 68: Appartment
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-68', 'Appartment', '1053', '2023-09-04', 199650, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 199650, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-68-2026-01', 'tenant-68', '2026-01', 199650, 199650, 0, 399300, 399300, '', NULL, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 0, balance = 399300, carry_forward = 399300;

-- Tenant 69: Hi Tech Network
INSERT INTO tenants (id, name, premises, effective_date, monthly_rent, utility_number, created_at, updated_at)
VALUES ('tenant-69', 'Hi Tech Network', '250', '2024-03-01', 200000, '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET monthly_rent = 200000, updated_at = NOW();

INSERT INTO rent_records (id, tenant_id, month_year, rent, outstanding_previous, paid, balance, carry_forward, deposit_account_no, submitted_date, transaction_no, created_at, updated_at)
VALUES ('rent-69-2026-01', 'tenant-69', '2026-01', 200000, 60000, 570000, -310000, -310000, '8', '2026-01-06', '', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET paid = 570000, balance = -310000, carry_forward = -310000;
