import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Import() {
  const { addTenant, addRentRecord } = useApp();
  const [inputData, setInputData] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importMonth, setImportMonth] = useState('2026-02');
  const [message, setMessage] = useState('');

  const parseData = () => {
    const lines = inputData.trim().split('\n');
    if (lines.length < 2) {
      setMessage('Please paste data with headers');
      return;
    }

    const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      if (values.length < 3) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });

      // Skip vacated
      if (row['tenant name']?.toLowerCase().includes('vacate')) continue;
      if (!row['tenant name'] || row['tenant name'] === '') continue;

      data.push({
        name: row['tenant name'] || '',
        premises: row['premises'] || '',
        rent: parseInt(row['rent']?.replace(/,/g, '') || '0'),
        outstanding: parseInt(row['outstanding previous months']?.replace(/,/g, '') || '0'),
        paid: parseInt(row['paid of current month']?.replace(/,/g, '') || '0'),
        balance: parseInt(row['balance']?.replace(/,/g, '') || row['balance carry forward']?.replace(/,/g, '') || '0'),
        effectiveDate: row['effective date'] || '',
        iescoNo: row['iesco no'] || '',
        depositAccount: row['depositd account no'] || '',
      });
    }

    setPreviewData(data);
    setMessage(`Found ${data.length} records to import`);
  };

  const handleImport = () => {
    let imported = 0;
    previewData.forEach(row => {
      if (row.name && row.premises) {
        const tenantId = `T${Date.now()}-${imported}`;
        
        addTenant({
          id: tenantId,
          name: row.name,
          premises: row.premises,
          phone: '',
          email: '',
          cnic: '',
          rent: row.rent,
          deposit: 0,
          depositAccountNo: row.depositAccount,
          iescoNo: row.iescoNo,
          effectiveDate: row.effectiveDate,
          status: 'active',
        });

        addRentRecord({
          id: `RR${Date.now()}-${imported}`,
          tenantId: tenantId,
          monthYear: importMonth,
          rent: row.rent,
          outstanding: row.outstanding,
          paid: row.paid,
          balance: row.balance,
          carryForward: row.balance,
        });

        imported++;
      }
    });

    setMessage(`✅ Successfully imported ${imported} records!`);
    setPreviewData([]);
    setInputData('');
  };

  const sampleData = `Sr No\tTenant Name\tPremises\tEffective Date\tRent\tOutstanding previous Months\tPaid of current Month\tBalance\tDepositd Account No\tIesco No
1\tZafar Mahmood\t1M\t01-Jul-23\t97437\t170183\t0\t267620\t172\t6855087
2\tZahoor ul Hassan\t3M\t20-Sep-23\t53944\t71154\t0\t125098\t172\t4298250`;

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📥 Import Rent Sheet Data</h1>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">How to Import:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Open your Excel rent sheet</li>
            <li>Select all data including headers (Ctrl+A)</li>
            <li>Copy (Ctrl+C)</li>
            <li>Paste below (Ctrl+V)</li>
            <li>Click "Preview" then "Import"</li>
          </ol>
        </div>

        {/* Month Selection */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Import for Month:</label>
          <input
            type="month"
            className="border rounded-lg px-3 py-2"
            value={importMonth}
            onChange={(e) => setImportMonth(e.target.value)}
          />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Excel Data Here:
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            rows={10}
            placeholder="Paste your Excel data here..."
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={parseData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              👁️ Preview
            </button>
            <button
              onClick={() => setInputData(sampleData)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Load Sample
            </button>
            <button
              onClick={() => { setInputData(''); setPreviewData([]); setMessage(''); }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {message}
          </div>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Preview ({previewData.length} records)</h3>
              <button
                onClick={handleImport}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                ✅ Import Data
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Tenant</th>
                    <th className="p-2 text-left">Premises</th>
                    <th className="p-2 text-right">Rent</th>
                    <th className="p-2 text-right">Outstanding</th>
                    <th className="p-2 text-right">Paid</th>
                    <th className="p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">{row.premises}</td>
                      <td className="p-2 text-right">{row.rent.toLocaleString()}</td>
                      <td className="p-2 text-right">{row.outstanding.toLocaleString()}</td>
                      <td className="p-2 text-right text-green-600">{row.paid.toLocaleString()}</td>
                      <td className="p-2 text-right font-bold">{row.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}s