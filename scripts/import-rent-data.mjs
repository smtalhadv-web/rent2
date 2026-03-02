import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rentSheetData = [
  { sr: 1, name: 'Zafar Mahmood', premises: '1M', effectiveDate: '2023-07-01', rent: 97437, outstanding: 172746, paid: 100000, utilityNo: '6855087' },
  { sr: 2, name: 'Zahoor ul Hassan', premises: '3M', effectiveDate: '2023-09-20', rent: 53944, outstanding: 17210, paid: 71154, utilityNo: '4298250' },
  { sr: 3, name: 'Nadeem Qaiser', premises: '4M', effectiveDate: '2022-07-01', rent: 50820, outstanding: 74260, paid: 101000, utilityNo: '4534401' },
  { sr: 4, name: 'Gulfam Tailor', premises: '5M', effectiveDate: '2023-07-01', rent: 46452, outstanding: 135132, paid: 47000, utilityNo: '319974' },
  { sr: 5, name: 'Yasin Barbar Shop', premises: '6M', effectiveDate: '2021-10-01', rent: 43923, outstanding: 11979, paid: 43923, utilityNo: '319972' },
  { sr: 6, name: 'Tassadaq Hussain', premises: '7M', effectiveDate: '2017-02-01', rent: 65592, outstanding: 101363, paid: 100000, utilityNo: '5389448' },
  { sr: 7, name: 'Zulfiqar Tailor', premises: '7M-2', effectiveDate: '2023-02-01', rent: 36443, outstanding: 15448, paid: 40000, utilityNo: '4320055' },
  { sr: 8, name: 'Shahid Riaz', premises: '8M', effectiveDate: '2024-02-01', rent: 45000, outstanding: 132766, paid: 50000, utilityNo: '36314' },
  { sr: 9, name: 'Shahzad Ali', premises: '9M', effectiveDate: '2024-02-01', rent: 45000, outstanding: 81366, paid: 85000, utilityNo: '319969' },
  { sr: 10, name: 'Faiz Rasool (Lace)', premises: '10M', effectiveDate: '2022-01-01', rent: 33660, outstanding: 39660, paid: 33660, utilityNo: '92923' },
  { sr: 11, name: 'Zafar/M Boota', premises: '11M', effectiveDate: '2023-05-01', rent: 56514, outstanding: 320746, paid: 100000, utilityNo: '319970' },
  { sr: 12, name: 'Tariq Mahmood', premises: '3B', effectiveDate: '2023-04-01', rent: 53147, outstanding: 795, paid: 53000, utilityNo: '9006836' },
  { sr: 13, name: 'Muhammad Nadeem', premises: '4B', effectiveDate: '2023-03-01', rent: 68200, outstanding: 173864, paid: 100000, utilityNo: '7127416' },
  { sr: 14, name: 'M. Ali', premises: '6A', effectiveDate: '2022-07-01', rent: 77171, outstanding: 19726, paid: 79650, utilityNo: '319962' },
  { sr: 15, name: 'Asghar Ali', premises: '6B', effectiveDate: '2023-03-23', rent: 78650, outstanding: 0, paid: 78650, utilityNo: '82449' },
  { sr: 16, name: 'Amjad Tailor', premises: '8A', effectiveDate: '2019-01-01', rent: 70862, outstanding: 246873, paid: 317735, utilityNo: '4303874' },
  { sr: 17, name: 'M. Ilyas Tailor', premises: '8B', effectiveDate: '2025-08-15', rent: 72000, outstanding: -6115, paid: 72000, utilityNo: '319966' },
  { sr: 18, name: 'M. Rizwan Tailor', premises: '9A', effectiveDate: '2023-09-01', rent: 58564, outstanding: 676, paid: 59240, utilityNo: '458631' },
  { sr: 19, name: 'M. Khalid (Tandoor)', premises: '9B', effectiveDate: '2024-01-01', rent: 143000, outstanding: 143000, paid: 143000, utilityNo: '4303434' },
  { sr: 20, name: 'M. Qayyum Khan', premises: '10A', effectiveDate: '2023-07-01', rent: 75515, outstanding: 520898, paid: 100000, utilityNo: '320128' },
  { sr: 21, name: 'M. yasir (Tailor)', premises: '10B', effectiveDate: '2025-08-01', rent: 98000, outstanding: 97524, paid: 98000, utilityNo: '3882' },
  { sr: 22, name: 'Imran Jew', premises: 'G1-A', effectiveDate: '2023-01-01', rent: 325000, outstanding: 1074314, paid: 1350000, utilityNo: '4303886' },
  { sr: 23, name: 'Haji M. Rasool', premises: 'G1-B', effectiveDate: '2016-01-01', rent: 346955, outstanding: 5, paid: 346955, utilityNo: '4303402' },
  { sr: 24, name: 'ijlal Ice-crream', premises: 'G2-A', effectiveDate: '2023-01-01', rent: 225000, outstanding: 0, paid: 225000, utilityNo: '654381' },
  { sr: 25, name: 'Sh. M. Shahid', premises: 'G3-A', effectiveDate: '2022-08-01', rent: 278808, outstanding: 34564, paid: 310000, utilityNo: '30555' },
  { sr: 26, name: 'Faisal Ahmed Khan', premises: 'G3-B', effectiveDate: '2024-01-01', rent: 201300, outstanding: 0, paid: 201300, utilityNo: '7124129' },
  { sr: 29, name: 'M&P Courier', premises: 'G6-B', effectiveDate: '2024-10-15', rent: 473000, outstanding: -84750, paid: 388250, utilityNo: '' },
  { sr: 31, name: 'Leopard Courier', premises: 'G8-B', effectiveDate: '2024-04-15', rent: 209000, outstanding: 8750, paid: 217750, utilityNo: '159142' },
  { sr: 32, name: 'M. Nadeem (patyala Jew)', premises: 'G-9/A', effectiveDate: '2024-02-01', rent: 197654, outstanding: 562619, paid: 760273, utilityNo: '319943' },
  { sr: 34, name: 'Mr.Rasheed', premises: 'G-9/B', effectiveDate: '2023-01-10', rent: 146410, outstanding: 0, paid: 146410, utilityNo: '3443984' },
  { sr: 35, name: 'TCS', premises: 'G-10', effectiveDate: '2024-04-01', rent: 385000, outstanding: 594718, paid: 315095, utilityNo: '4544342' },
  { sr: 36, name: 'Mrs. Bushra (Saloon)', premises: '6-F', effectiveDate: '2024-08-15', rent: 88000, outstanding: 0, paid: 88000, utilityNo: '2505375' },
  { sr: 37, name: 'Syed Kazim Raza', premises: '9-F', effectiveDate: '2021-12-15', rent: 118278, outstanding: 543314, paid: 500000, utilityNo: '319971' },
  { sr: 38, name: 'Mrs. Bushra (Saloon)', premises: '8-F+10-F', effectiveDate: '2021-03-01', rent: 264000, outstanding: 0, paid: 264000, utilityNo: '4459764' },
  { sr: 39, name: 'M. Haseeb', premises: '1-S-A', effectiveDate: '2025-01-01', rent: 35000, outstanding: 140000, paid: 175000, utilityNo: '319965' },
  { sr: 41, name: 'Syed Kazim Raza', premises: '2-S', effectiveDate: '2022-09-01', rent: 59895, outstanding: 293480, paid: 353375, utilityNo: '226108' },
  { sr: 42, name: 'Shah Jahan 10%', premises: '3-S', effectiveDate: '2022-12-05', rent: 74429, outstanding: 1133905, paid: 1208334, utilityNo: '320121' },
  { sr: 43, name: 'Shafiq Sultan', premises: '4-S', effectiveDate: '2022-12-01', rent: 64130, outstanding: 72290, paid: 64000, utilityNo: '1790975' },
  { sr: 46, name: 'Rafay', premises: '9-S', effectiveDate: '2026-01-10', rent: 100000, outstanding: 0, paid: 100000, utilityNo: '319973' },
  { sr: 47, name: 'M. Farukh Saeed (Exp) 10%', premises: '10-S', effectiveDate: '2021-08-01', rent: 86969, outstanding: 283185, paid: 370154, utilityNo: '4302646' },
  { sr: 67, name: 'Telenor', premises: 'Telenor', effectiveDate: '2020-01-01', rent: 43333, outstanding: 129999, paid: 173332, utilityNo: '' },
  { sr: 68, name: 'Appartment', premises: '1053', effectiveDate: '2023-09-04', rent: 199650, outstanding: 199650, paid: 399300, utilityNo: '' },
  { sr: 69, name: 'Hi Tech Network', premises: '250', effectiveDate: '2024-03-01', rent: 200000, outstanding: 60000, paid: 570000, utilityNo: '' },
];

async function importData() {
  try {
    console.log('[v0] Starting rent sheet import...');
    
    const tenantMap = new Map();
    const monthYear = '2026-01';
    
    // Insert tenants
    for (const row of rentSheetData) {
      const tenantId = uuidv4();
      
      const { error } = await supabase.from('tenants').insert({
        id: tenantId,
        name: row.name,
        cnic: '',
        phone: '',
        email: '',
        premises: row.premises,
        effective_date: row.effectiveDate,
        monthly_rent: row.rent,
        security_deposit: Math.abs(row.outstanding) || 100000,
        deposit_account_no: '',
        utility_no: row.utilityNo || '',
        status: 'active',
        created_at: row.effectiveDate,
      });
      
      if (error) {
        console.error(`[v0] Error with ${row.name}:`, error);
      } else {
        tenantMap.set(row.name, tenantId);
        console.log(`[v0] Added: ${row.name}`);
      }
    }
    
    console.log(`[v0] ${tenantMap.size} tenants inserted`);
    
    // Insert rent records
    let recordCount = 0;
    for (const row of rentSheetData) {
      const tenantId = tenantMap.get(row.name);
      if (!tenantId) continue;
      
      const outstandingPrevious = Math.max(0, row.outstanding);
      const balance = outstandingPrevious + row.rent - row.paid;
      
      const { error } = await supabase.from('rent_records').insert({
        id: uuidv4(),
        tenant_id: tenantId,
        month_year: monthYear,
        rent: row.rent,
        outstanding_previous: outstandingPrevious,
        paid: row.paid || 0,
        balance: balance,
        carry_forward: balance,
      });
      
      if (!error) recordCount++;
    }
    
    console.log(`[v0] ${recordCount} rent records inserted for January 2026`);
    console.log('[v0] Import complete!');
    
  } catch (error) {
    console.error('[v0] Import failed:', error);
    process.exit(1);
  }
}

importData();
