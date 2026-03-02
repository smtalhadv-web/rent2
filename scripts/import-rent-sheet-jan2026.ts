import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Data from the rent sheet for January 2026
const rentSheetData = [
  { sr: 1, name: 'Zafar Mahmood', premises: '1M', effectiveDate: '01-Jul-23', rent: 97437, outstanding: 172746, paid: 100000, balance: 170183, deposit: 172, utilityNo: '6855087', transactionDate: '30-1-26' },
  { sr: 2, name: 'Zahoor ul Hassan', premises: '3M', effectiveDate: '20-Sep-23', rent: 53944, outstanding: 17210, paid: 71154, balance: 172, utilityNo: '4298250', transactionDate: '' },
  { sr: 3, name: 'Nadeem Qaiser', premises: '4M', effectiveDate: '01-Jul-22', rent: 50820, outstanding: 74260, paid: 101000, balance: 24080, deposit: 521, utilityNo: '4534401', transactionDate: '28-1-26' },
  { sr: 4, name: 'Gulfam Tailor', premises: '5M', effectiveDate: '01-Jul-23', rent: 46452, outstanding: 135132, paid: 47000, balance: 134584, deposit: 172, utilityNo: '319974', transactionDate: '29-1-26' },
  { sr: 5, name: 'Yasin Barbar Shop', premises: '6M', effectiveDate: '01-Oct-21', rent: 43923, outstanding: 11979, paid: 43923, balance: 11979, deposit: 172, utilityNo: '319972', transactionDate: '' },
  { sr: 6, name: 'Tassadaq Hussain', premises: '7M', effectiveDate: '01-Feb-17', rent: 65592, outstanding: 101363, paid: 100000, balance: 66955, deposit: 521, utilityNo: '5389448', transactionDate: '30-1-26' },
  { sr: 7, name: 'Zulfiqar Tailor', premises: '7M-2', effectiveDate: '01-Feb-23', rent: 36443, outstanding: 15448, paid: 40000, balance: 11891, deposit: 172, utilityNo: '4320055', transactionDate: '29-1-26' },
  { sr: 8, name: 'Shahid Riaz', premises: '8M', effectiveDate: '01-Feb-24', rent: 45000, outstanding: 132766, paid: 50000, balance: 127766, utilityNo: '36314', transactionDate: '' },
  { sr: 9, name: 'Shahzad Ali', premises: '9M', effectiveDate: '01-Feb-24', rent: 45000, outstanding: 81366, paid: 85000, balance: 41366, deposit: 172, utilityNo: '319969', transactionDate: '29-1-26' },
  { sr: 10, name: 'Faiz Rasool (Lace)', premises: '10M', effectiveDate: '01-Jan-22', rent: 33660, outstanding: 39660, paid: 33660, balance: 39660, utilityNo: '92923', transactionDate: '29-1-26' },
  { sr: 11, name: 'Zafar/M Boota', premises: '11M', effectiveDate: '01-May-23', rent: 56514, outstanding: 320746, paid: 100000, balance: 277260, deposit: 521, utilityNo: '319970', transactionDate: '22-1-26' },
  { sr: 12, name: 'Tariq Mahmood', premises: '3B', effectiveDate: '01-Apr-23', rent: 53147, outstanding: 795, paid: 53000, balance: 942, utilityNo: '9006836', transactionDate: '21-1-26' },
  { sr: 13, name: 'Muhammad Nadeem', premises: '4B', effectiveDate: '01-Mar-23', rent: 68200, outstanding: 173864, paid: 100000, balance: 142064, deposit: 521, utilityNo: '7127416', transactionDate: '31-1-26' },
  { sr: 14, name: 'M. Ali', premises: '6A', effectiveDate: '01-Jul-22', rent: 77171, outstanding: 19726, paid: 79650, balance: 17247, deposit: 521, utilityNo: '319962', transactionDate: '25-31-1' },
  { sr: 15, name: 'Asghar Ali', premises: '6B', effectiveDate: '23-Mar-23', rent: 78650, outstanding: 0, paid: 78650, balance: 0, utilityNo: '82449', transactionDate: '28-1-26' },
  { sr: 16, name: 'Amjad Tailor', premises: '8A', effectiveDate: '01-Jan-19', rent: 70862, outstanding: 246873, paid: 317735, balance: 0, deposit: 521, utilityNo: '4303874', transactionDate: '' },
  { sr: 17, name: 'M. Ilyas Tailor', premises: '8B', effectiveDate: '15-Aug-25', rent: 72000, outstanding: -6115, paid: 72000, balance: -6115, utilityNo: '319966', transactionDate: '' },
  { sr: 18, name: 'M. Rizwan Tailor', premises: '9A', effectiveDate: '01-Sep-23', rent: 58564, outstanding: 676, paid: 59240, balance: 0, deposit: 521, utilityNo: '458631', transactionDate: '20-Jan-26' },
  { sr: 19, name: 'M. Khalid (Tandoor)', premises: '9B', effectiveDate: '01-Jan-24', rent: 143000, outstanding: 143000, paid: 143000, balance: 143000, deposit: 173, utilityNo: '4303434', transactionDate: '16-1-26' },
  { sr: 20, name: 'M. Qayyum Khan', premises: '10A', effectiveDate: '01-Jul-23', rent: 75515, outstanding: 520898, paid: 100000, balance: 496413, deposit: 521, utilityNo: '320128', transactionDate: '13-1-26' },
  { sr: 21, name: 'M. yasir (Tailor)', premises: '10B', effectiveDate: '01-Aug-25', rent: 98000, outstanding: 97524, paid: 98000, balance: 97524, utilityNo: '3882', transactionDate: '23-1-26' },
  { sr: 22, name: 'Imran Jew', premises: 'G1-A', effectiveDate: '01-Jan-23', rent: 325000, outstanding: 1074314, paid: 1350000, balance: 49314, deposit: 521, utilityNo: '4303886', transactionDate: '22-1-26' },
  { sr: 23, name: 'Haji M. Rasool', premises: 'G1-B', effectiveDate: '01-Jan-16', rent: 346955, outstanding: 5, paid: 346955, balance: 5, deposit: 4521, utilityNo: '4303402', transactionDate: '09-01-2026' },
  { sr: 24, name: 'ijlal Ice-crream', premises: 'G2-A', effectiveDate: '01-Jan-23', rent: 225000, outstanding: 0, paid: 225000, balance: 225000, utilityNo: '654381', transactionDate: '' },
  { sr: 25, name: 'Sh. M. Shahid', premises: 'G3-A', effectiveDate: '01-Aug-22', rent: 278808, outstanding: 34564, paid: 310000, balance: 3372, utilityNo: '30555', transactionDate: '27-1-26' },
  { sr: 26, name: 'Faisal Ahmed Khan', premises: 'G3-B', effectiveDate: '01-Jan-24', rent: 201300, outstanding: 0, paid: 201300, balance: 0, deposit: 521, utilityNo: '7124129', transactionDate: '19-1-26' },
  { sr: 29, name: 'M&P Courier', premises: 'G6-B', effectiveDate: '15-Oct-2024', rent: 473000, outstanding: -84750, paid: 388250, balance: 388250, deposit: '3772+3667', utilityNo: '', transactionDate: '' },
  { sr: 31, name: 'Leopard Courier', premises: 'G8-B', effectiveDate: '15-04-2024', rent: 209000, outstanding: 8750, paid: 217750, balance: 217750, utilityNo: '159142', transactionDate: '' },
  { sr: 32, name: 'M. Nadeem (patyala Jew)', premises: 'G-9/A', effectiveDate: '01-Feb-24', rent: 197654, outstanding: 562619, paid: 760273, balance: 760273, utilityNo: '319943', transactionDate: '' },
  { sr: 34, name: 'Mr.Rasheed', premises: 'G-9/B', effectiveDate: '10-Jan-23', rent: 146410, outstanding: 0, paid: 146410, balance: 0, deposit: 475, utilityNo: '3443984', transactionDate: '19-1-26' },
  { sr: 35, name: 'TCS', premises: 'G-10', effectiveDate: '01-Apr-24', rent: 385000, outstanding: 594718, paid: 315095, balance: 664623, deposit: 542, utilityNo: '4544342', transactionDate: '' },
  { sr: 36, name: 'Mrs. Bushra (Saloon)', premises: '6-F', effectiveDate: '15-Aug-24', rent: 88000, outstanding: 0, paid: 88000, balance: 0, utilityNo: '2505375', transactionDate: '25-1-26' },
  { sr: 37, name: 'Syed Kazim Raza', premises: '9-F', effectiveDate: '15-Dec-21', rent: 118278, outstanding: 543314, paid: 500000, balance: 161592, deposit: 521, utilityNo: '319971', transactionDate: '7-1-26' },
  { sr: 38, name: 'Mrs. Bushra (Saloon)', premises: '8-F+10-F', effectiveDate: '01-Mar-21', rent: 264000, outstanding: 0, paid: 264000, balance: 0, utilityNo: '4459764', transactionDate: '25-1-26' },
  { sr: 39, name: 'M. Haseeb', premises: '1-S-A', effectiveDate: '01-Jan-25', rent: 35000, outstanding: 140000, paid: 175000, balance: 175000, utilityNo: '319965', transactionDate: '' },
  { sr: 41, name: 'Syed Kazim Raza', premises: '2-S', effectiveDate: '01-Sep-22', rent: 59895, outstanding: 293480, paid: 353375, balance: 353375, utilityNo: '226108', transactionDate: '' },
  { sr: 42, name: 'Shah Jahan 10%', premises: '3-S', effectiveDate: '05-Dec-22', rent: 74429, outstanding: 1133905, paid: 1208334, balance: 1208334, utilityNo: '320121', transactionDate: '' },
  { sr: 43, name: 'Shafiq Sultan', premises: '4-S', effectiveDate: '01-Dec-22', rent: 64130, outstanding: 72290, paid: 64000, balance: 72420, deposit: 521, utilityNo: '1790975', transactionDate: '6-1-26' },
  { sr: 46, name: 'Rafay', premises: '9-S', effectiveDate: '10-1-26', rent: 100000, outstanding: 0, paid: 100000, balance: 0, utilityNo: '319973', transactionDate: '' },
  { sr: 47, name: 'M. Farukh Saeed (Exp) 10%', premises: '10-S', effectiveDate: '01-Aug-21', rent: 86969, outstanding: 283185, paid: 370154, balance: 370154, utilityNo: '4302646', transactionDate: '' },
  { sr: 67, name: 'Telenor', premises: 'Telenor', effectiveDate: '', rent: 43333, outstanding: 129999, paid: 173332, balance: 173332, utilityNo: '', transactionDate: '' },
  { sr: 68, name: 'Appartment', premises: '1053', effectiveDate: '04-Sep-23', rent: 199650, outstanding: 199650, paid: 399300, balance: 399300, utilityNo: '', transactionDate: '' },
  { sr: 69, name: 'Hi Tech Network', premises: '250', effectiveDate: '01-Mar-24', rent: 200000, outstanding: 60000, paid: 570000, balance: -310000, utilityNo: '', transactionDate: '6-1-26' },
];

// Parse date string (e.g., "01-Jul-23" -> "2023-07-01")
function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  const months: { [key: string]: string } = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date().toISOString().split('T')[0];
  
  const day = parts[0].padStart(2, '0');
  const month = months[parts[1]] || '01';
  let year = parts[2];
  
  // Convert 2-digit year to 4-digit
  const yearNum = parseInt(year);
  year = yearNum < 50 ? `20${year}` : `19${year}`;
  
  return `${year}-${month}-${day}`;
}

async function importRentSheetData() {
  try {
    console.log('[v0] Starting rent sheet import for January 2026...');
    
    // Step 1: Clear existing data (optional - comment out if you want to preserve)
    // await supabase.from('payments').delete().neq('id', '');
    // await supabase.from('rent_records').delete().neq('id', '');
    // await supabase.from('leases').delete().neq('id', '');
    // await supabase.from('tenants').delete().neq('id', '');
    
    // Step 2: Insert tenants and collect their IDs
    const tenantMap = new Map<string, string>();
    
    for (const row of rentSheetData) {
      const tenantId = uuidv4();
      const effectiveDate = parseDate(row.effectiveDate || '01-Jan-25');
      
      const { error } = await supabase.from('tenants').insert({
        id: tenantId,
        name: row.name,
        cnic: '',
        phone: '',
        email: '',
        premises: row.premises,
        effective_date: effectiveDate,
        monthly_rent: row.rent,
        security_deposit: Math.abs(row.outstanding) || 100000,
        deposit_account_no: String(row.deposit || ''),
        utility_no: row.utilityNo || '',
        status: row.balance > 0 || row.outstanding > 0 ? 'active' : 'active',
        created_at: effectiveDate,
      });
      
      if (error) {
        console.error(`[v0] Error inserting tenant ${row.name}:`, error);
      } else {
        tenantMap.set(row.name, tenantId);
        console.log(`[v0] Inserted tenant: ${row.name} (${row.premises})`);
      }
    }
    
    // Step 3: Insert rent records for January 2026
    const monthYear = '2026-01';
    let recordCount = 0;
    
    for (const row of rentSheetData) {
      const tenantId = tenantMap.get(row.name);
      if (!tenantId) {
        console.warn(`[v0] Tenant not found for ${row.name}, skipping rent record`);
        continue;
      }
      
      // Calculate outstandingPrevious: it's what was carried forward from previous months
      // From the sheet: it shows the outstanding at the start of this month
      const outstandingPrevious = Math.max(0, row.outstanding);
      const paid = row.paid || 0;
      const balance = row.outstanding + row.rent - paid;
      
      const { error } = await supabase.from('rent_records').insert({
        id: uuidv4(),
        tenant_id: tenantId,
        month_year: monthYear,
        rent: row.rent,
        outstanding_previous: outstandingPrevious,
        paid: paid,
        balance: balance,
        carry_forward: balance,
      });
      
      if (error) {
        console.error(`[v0] Error inserting rent record for ${row.name}:`, error);
      } else {
        recordCount++;
      }
    }
    
    console.log(`[v0] Inserted ${recordCount} rent records for January 2026`);
    
    // Step 4: Insert payments if they were made
    let paymentCount = 0;
    for (const row of rentSheetData) {
      if (row.paid === 0 || !row.transactionDate) continue;
      
      const tenantId = tenantMap.get(row.name);
      if (!tenantId) continue;
      
      // Parse transaction date
      let paymentDate = '2026-01-15';
      if (row.transactionDate) {
        paymentDate = parseDate(row.transactionDate);
      }
      
      const { error } = await supabase.from('payments').insert({
        id: uuidv4(),
        tenant_id: tenantId,
        month_year: monthYear,
        amount: row.paid,
        payment_date: paymentDate,
        payment_method: 'bank',
        transaction_no: `TXN-${row.sr}-JAN2026`,
        deposited_account: String(row.deposit || ''),
        created_at: paymentDate,
      });
      
      if (error) {
        console.error(`[v0] Error inserting payment for ${row.name}:`, error);
      } else {
        paymentCount++;
      }
    }
    
    console.log(`[v0] Inserted ${paymentCount} payment records`);
    console.log('[v0] Rent sheet import completed successfully!');
    
  } catch (error) {
    console.error('[v0] Import failed:', error);
    process.exit(1);
  }
}

importRentSheetData();
