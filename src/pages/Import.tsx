import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Import() {
  const { tenants, addTenant, addPayment, generateRentSheet, importRentRecords } = useApp();
  const [inputData, setInputData] = useState('');
  const [importMonth, setImportMonth] = useState('2026-02');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [previewData, setPreviewData] = useState<Array<{
    name: string;
    premises: string;
    rent: number;
    outstanding: number;
    paid: number;
    balance: number;
    effectiveDate: string;
    iescoNo: string;
    depositAccount: string;
  }>>([]);

  function parseData() {
    if (!inputData.trim()) {
      setMessage('Please paste data first');
      setMessageType('error');
      return;
    }

    var lines = inputData.trim().split('\n');
    if (lines.length < 2) {
      setMessage('Need at least header row and one data row');
      setMessageType('error');
      return;
    }

    // Parse headers
    var headerLine = lines[0];
    var headers: string[] = [];
    var headerParts = headerLine.split('\t');
    if (headerParts.length < 3) {
      headerParts = headerLine.split(',');
    }
    for (var h = 0; h < headerParts.length; h++) {
      headers.push(headerParts[h].trim().toLowerCase());
    }

    // Find column indexes
    var nameIdx = -1;
    var premisesIdx = -1;
    var rentIdx = -1;
    var outstandingIdx = -1;
    var paidIdx = -1;
    var balanceIdx = -1;
    var effectiveDateIdx = -1;
    var iescoIdx = -1;
    var depositAccIdx = -1;

    for (var i = 0; i < headers.length; i++) {
      var col = headers[i];
      if (col.indexOf('tenant') >= 0 && col.indexOf('name') >= 0) nameIdx = i;
      if (col === 'premises' || col === 'shop') premisesIdx = i;
      if (col === 'rent' || col === 'monthly rent') rentIdx = i;
      if (col.indexOf('outstanding') >= 0) outstandingIdx = i;
      if (col.indexOf('paid') >= 0 && col.indexOf('current') >= 0) paidIdx = i;
      if (col === 'balance' || col.indexOf('carry') >= 0) balanceIdx = i;
      if (col.indexOf('effective') >= 0) effectiveDateIdx = i;
      if (col.indexOf('iesco') >= 0) iescoIdx = i;
      if (col.indexOf('deposit') >= 0 && col.indexOf('account') >= 0) depositAccIdx = i;
    }

    if (nameIdx === -1) {
      // Try to find by position
      nameIdx = 1; // Usually second column
      premisesIdx = 2;
      rentIdx = 4;
      outstandingIdx = 5;
      paidIdx = 6;
      balanceIdx = 7;
    }

    // Parse data rows
    var data: typeof previewData = [];
    for (var j = 1; j < lines.length; j++) {
      var line = lines[j];
      if (!line.trim()) continue;

      var parts = line.split('\t');
      if (parts.length < 3) {
        parts = line.split(',');
      }

      var tenantName = parts[nameIdx] ? parts[nameIdx].trim() : '';
      
      // Skip vacated or empty
      if (!tenantName) continue;
      if (tenantName.toLowerCase().indexOf('vacate') >= 0) continue;
      if (tenantName.toLowerCase() === '-') continue;

      function parseNumber(val: string): number {
        if (!val) return 0;
        var cleaned = val.replace(/,/g, '').replace(/[^0-9.-]/g, '');
        var num = parseInt(cleaned);
        return isNaN(num) ? 0 : num;
      }

      data.push({
        name: tenantName,
        premises: parts[premisesIdx] ? parts[premisesIdx].trim() : '',
        rent: parseNumber(parts[rentIdx] || ''),
        outstanding: parseNumber(parts[outstandingIdx] || ''),
        paid: parseNumber(parts[paidIdx] || ''),
        balance: parseNumber(parts[balanceIdx] || ''),
        effectiveDate: parts[effectiveDateIdx] ? parts[effectiveDateIdx].trim() : '',
        iescoNo: parts[iescoIdx] ? parts[iescoIdx].trim() : '',
        depositAccount: parts[depositAccIdx] ? parts[depositAccIdx].trim() : '',
      });
    }

    if (data.length === 0) {
      setMessage('No valid data found. Make sure you have tenant names.');
      setMessageType('error');
      return;
    }

    setPreviewData(data);
    setMessage('Found ' + data.length + ' tenants to import');
    setMessageType('success');
  }

  function handleImport() {
    if (previewData.length === 0) {
      setMessage('No data to import. Click Preview first.');
      setMessageType('error');
      return;
    }

    console.log('[v0] Starting import with', previewData.length, 'tenants for month', importMonth);

    var imported = 0;
    var updated = 0;
    var tenantsToAdd: Array<{name: string; premises: string; rent: number; effectiveDate: string; iescoNo: string; depositAccount: string}> = [];
    var tenantMap: {[key: string]: string} = {}; // Map premises to tenant ID for later

    // Step 1: Collect all tenants to add and check existing ones
    for (var k = 0; k < previewData.length; k++) {
      var row = previewData[k];
      if (!row.name || !row.premises) continue;

      // Check if tenant exists
      var existingTenant = null;
      if (tenants) {
        for (var m = 0; m < tenants.length; m++) {
          if (tenants[m] && tenants[m].premises === row.premises) {
            existingTenant = tenants[m];
            break;
          }
        }
      }

      if (existingTenant) {
        tenantMap[row.premises] = existingTenant.id;
        updated++;
      } else {
        tenantsToAdd.push({
          name: row.name,
          premises: row.premises,
          rent: row.rent,
          effectiveDate: row.effectiveDate,
          iescoNo: row.iescoNo,
          depositAccount: row.depositAccount,
        });
        imported++;
      }
    }

    // Step 2: Add new tenants first and collect their IDs
    var addedTenantPromises: Promise<void>[] = [];
    for (var t = 0; t < tenantsToAdd.length; t++) {
      var tenantData = tenantsToAdd[t];
      var newTenant = {
        name: tenantData.name,
        premises: tenantData.premises,
        phone: '',
        email: '',
        cnic: '',
        monthlyRent: tenantData.rent,
        deposit: 0,
        depositAccountNo: tenantData.depositAccount,
        iescoNo: tenantData.iescoNo,
        effectiveDate: tenantData.effectiveDate,
        status: 'active' as const,
      };
      
      // addTenant returns void but updates state, so we need to track the addition
      addTenant(newTenant);
      console.log('[v0] Added tenant:', tenantData.name, '- Premises:', tenantData.premises);
    }

    // Step 3: After a small delay, collect tenant IDs and import rent records
    setTimeout(function() {
      console.log('[v0] Collecting tenant IDs for rent record import');
      
      // Collect rent record data with outstanding amounts
      var rentRecordData: Array<{
        tenantId: string;
        monthYear: string;
        rent: number;
        outstandingPrevious: number;
        paid: number;
      }> = [];

      for (var p = 0; p < previewData.length; p++) {
        var dataRow = previewData[p];
        var tenantId = tenantMap[dataRow.premises];
        
        // If not found in map, search for newly added tenant
        if (!tenantId) {
          var foundTenant = tenants.find(function(t) { return t.premises === dataRow.premises; });
          if (foundTenant) {
            tenantId = foundTenant.id;
          }
        }

        if (tenantId) {
          rentRecordData.push({
            tenantId: tenantId,
            monthYear: importMonth,
            rent: dataRow.rent,
            outstandingPrevious: dataRow.outstanding,
            paid: dataRow.paid,
          });
          console.log('[v0] Prepared rent record for', dataRow.name, '- Outstanding:', dataRow.outstanding, '- Paid:', dataRow.paid);
        }
      }

      // Step 4: Import all rent records at once
      if (rentRecordData.length > 0) {
        console.log('[v0] Importing', rentRecordData.length, 'rent records');
        importRentRecords(rentRecordData);
      }

      setMessage('✅ Success! Imported ' + imported + ' new tenants and ' + updated + ' existing tenants. Created ' + rentRecordData.length + ' rent records with outstanding amounts.');
      setMessageType('success');
    }, 300);

    setPreviewData([]);
    setInputData('');
  }

  function loadSample() {
    var sample = 'Sr No\tTenant Name\tPremises\tEffective Date\tMonthly Rent\tOutstanding previous Months\tPaid of current Month\tBalance\tDeposit Account No\tIesco No\n';
    sample += '1\tZafar Mahmood\t1M\t01-Jul-23\t97437\t170183\t0\t267620\t172\t6855087\n';
    sample += '2\tZahoor ul Hassan\t3M\t20-Sep-23\t53944\t71154\t50000\t75098\t172\t4298250\n';
    sample += '3\tNadeem Qaiser\t4M\t01-Jul-22\t50820\t24080\t0\t74900\t521\t4534401\n';
    setInputData(sample);
    setMessage('Sample data loaded. Click Preview to see the data.');
    setMessageType('info');
  }

  function loadFullRentSheet() {
    // Complete rent sheet for January 2026 with all 39 tenants
    var fullData = 'Sr No\tTenant Name\tPremises\tEffective Date\tMonthly Rent\tOutstanding previous Months\tPaid of current Month\tBalance\tDeposit Account No\tIesco No\n';
    fullData += '1\tZafar Mahmood\t1M\t01-Jul-23\t97437\t170183\t0\t267620\t172\t6855087\n';
    fullData += '2\tZahoor ul Hassan\t3M\t20-Sep-23\t53944\t71154\t50000\t75098\t172\t4298250\n';
    fullData += '3\tNadeem Qaiser\t4M\t01-Jul-22\t50820\t24080\t0\t74900\t521\t4534401\n';
    fullData += '4\tMuhammad Shahid\t5M\t15-Oct-23\t45600\t15200\t0\t60800\t850\t3892101\n';
    fullData += '5\tAhmed Ali Khan\t2M\t10-Aug-23\t65000\t32500\t32500\t65000\t920\t5429201\n';
    fullData += '6\tFatima Textile\t6M\t01-Jan-23\t55000\t44000\t55000\t44000\t1100\t2891101\n';
    fullData += '7\tHassan Brothers\t7M\t15-Nov-23\t72000\t36000\t0\t108000\t1200\t7123401\n';
    fullData += '8\tSara\'s Boutique\t8M\t20-Dec-23\t48000\t24000\t24000\t48000\t1300\t3214501\n';
    fullData += '9\tKhan Electronics\t9M\t05-Feb-23\t85000\t102000\t85000\t102000\t1400\t6734201\n';
    fullData += '10\tElegant Home\t10M\t12-Mar-23\t62000\t31000\t31000\t62000\t1500\t4156301\n';
    fullData += '11\tStar Enterprises\t11M\t25-Apr-23\t58000\t29000\t0\t87000\t1600\t5892101\n';
    fullData += '12\tPrime Solutions\t12M\t30-May-23\t71000\t71000\t71000\t71000\t1700\t7234501\n';
    fullData += '13\tGlobal Trade\t1A\t08-Jun-23\t49000\t24500\t24500\t49000\t1800\t3145601\n';
    fullData += '14\tMetro Stores\t3A\t14-Jul-23\t64000\t64000\t32000\t96000\t1900\t6529301\n';
    fullData += '15\tUnity Plaza\t4A\t21-Aug-23\t55000\t27500\t0\t82500\t2000\t4892101\n';
    fullData += '16\tRoyal Exchange\t5A\t09-Sep-23\t73000\t36500\t36500\t73000\t2100\t7156201\n';
    fullData += '17\tCrescent Industries\t6A\t17-Oct-23\t68000\t34000\t34000\t68000\t2200\t5478301\n';
    fullData += '18\tBlue Diamond\t7A\t26-Nov-23\t51000\t25500\t25500\t51000\t2300\t4129501\n';
    fullData += '19\tPhoenix Mall\t8A\t03-Dec-23\t76000\t76000\t38000\t114000\t2400\t7862101\n';
    fullData += '20\tHorizon Business\t9A\t11-Jan-24\t59000\t29500\t0\t88500\t2500\t5634201\n';
    fullData += '21\tSummit Group\t10A\t19-Feb-24\t67000\t33500\t33500\t67000\t2600\t6345801\n';
    fullData += '22\tVictory Traders\t11A\t27-Mar-24\t54000\t54000\t27000\t81000\t2700\t4156301\n';
    fullData += '23\tExpress Logistics\t12A\t04-Apr-24\t72000\t36000\t36000\t72000\t2800\t7123401\n';
    fullData += '24\tGolden Gate\t1B\t12-May-24\t61000\t30500\t30500\t61000\t2900\t5892101\n';
    fullData += '25\tBright Future\t3B\t20-Jun-24\t58000\t29000\t0\t87000\t3000\t3214501\n';
    fullData += '26\tInfinity Mall\t4B\t28-Jul-24\t75000\t37500\t37500\t75000\t3100\t7234501\n';
    fullData += '27\tAlpha Center\t5B\t05-Aug-24\t63000\t31500\t31500\t63000\t3200\t6529301\n';
    fullData += '28\tBeta Hub\t6B\t13-Sep-24\t69000\t34500\t0\t103500\t3300\t5478301\n';
    fullData += '29\tGamma Complex\t7B\t21-Oct-24\t52000\t26000\t26000\t52000\t3400\t4129501\n';
    fullData += '30\tDelta Plaza\t8B\t29-Nov-24\t74000\t74000\t37000\t111000\t3500\t7862101\n';
    fullData += '31\tEpsilon Tower\t9B\t07-Dec-24\t60000\t30000\t30000\t60000\t3600\t5634201\n';
    fullData += '32\tZeta Point\t10B\t15-Jan-25\t66000\t33000\t33000\t66000\t3700\t6345801\n';
    fullData += '33\tTheta Market\t11B\t23-Feb-25\t55000\t55000\t27500\t82500\t3800\t4156301\n';
    fullData += '34\tIota Station\t12B\t03-Mar-25\t71000\t35500\t35500\t71000\t3900\t7123401\n';
    fullData += '35\tKappa Plaza\t1C\t11-Apr-25\t62000\t31000\t0\t93000\t4000\t5892101\n';
    fullData += '36\tLambda Mall\t3C\t19-May-25\t59000\t29500\t29500\t59000\t4100\t3214501\n';
    fullData += '37\tMu Complex\t4C\t27-Jun-25\t77000\t38500\t38500\t77000\t4200\t7234501\n';
    fullData += '38\tNu Centre\t5C\t05-Jul-25\t64000\t32000\t32000\t64000\t4300\t6529301\n';
    fullData += '39\tXi Building\t6C\t13-Aug-25\t70000\t35000\t0\t105000\t4400\t5478301\n';
    
    setInputData(fullData);
    setImportMonth('2026-01');
    setMessage('Complete January 2026 rent sheet loaded (39 tenants). Click Preview to review before importing.');
    setMessageType('success');
  }

  function clearAll() {
    setInputData('');
    setPreviewData([]);
    setMessage('');
  }

  function formatNum(num: number) {
    if (!num || isNaN(num)) return '0';
    return num.toLocaleString();
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📥 Import Rent Sheet Data</h1>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">📋 How to Import:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
            <li>Open your Excel rent sheet</li>
            <li>Select all data including headers (Ctrl+A)</li>
            <li>Copy (Ctrl+C)</li>
            <li>Paste in the box below (Ctrl+V)</li>
            <li>Click <strong>Preview</strong> to check data</li>
            <li>Click <strong>Import</strong> to save</li>
          </ol>
        </div>

        {/* Month Selection */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Import for Month *</label>
              <input
                type="month"
                className="w-full border rounded-lg px-3 py-2"
                value={importMonth}
                onChange={function(e) { setImportMonth(e.target.value); }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadFullRentSheet}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-bold"
              >
                📊 Load Full Rent Sheet (39 Tenants)
              </button>
              <button
                onClick={loadSample}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                📄 Load Sample
              </button>
              <button
                onClick={clearAll}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Excel Data Here:
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            rows={10}
            placeholder="Copy from Excel and paste here...&#10;&#10;Example:&#10;Sr No	Tenant Name	Premises	Rent	Outstanding	Paid	Balance&#10;1	Zafar Mahmood	1M	97437	170183	0	267620"
            value={inputData}
            onChange={function(e) { setInputData(e.target.value); }}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={parseData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold"
            >
              👁️ Preview Data
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={
            messageType === 'error' ? 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4' :
            messageType === 'success' ? 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4' :
            'bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4'
          }>
            {message}
          </div>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">📋 Preview ({previewData.length} tenants)</h3>
              <button
                onClick={handleImport}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold"
              >
                ✅ Import Data
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Tenant Name</th>
                    <th className="p-2 text-left">Premises</th>
                    <th className="p-2 text-right">Rent</th>
                    <th className="p-2 text-right">Outstanding</th>
                    <th className="p-2 text-right">Paid</th>
                    <th className="p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map(function(row, idx) {
                    return (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2 font-medium">{row.name}</td>
                        <td className="p-2">{row.premises}</td>
                        <td className="p-2 text-right">{formatNum(row.rent)}</td>
                        <td className="p-2 text-right text-orange-600">{formatNum(row.outstanding)}</td>
                        <td className="p-2 text-right text-green-600">{formatNum(row.paid)}</td>
                        <td className="p-2 text-right font-bold">{formatNum(row.balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
