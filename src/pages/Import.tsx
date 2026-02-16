import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';

export function Import() {
  const [rawData, setRawData] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [previewData, setPreviewData] = useState<Array<Record<string, string>>>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const parseData = () => {
    if (!rawData.trim()) {
      setMessage('Please paste data first');
      setImportStatus('error');
      return;
    }

    const lines = rawData.trim().split('\n');
    if (lines.length < 2) {
      setMessage('Data must have headers and at least one row');
      setImportStatus('error');
      return;
    }

    // Detect delimiter (tab or comma)
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    
    const headers = lines[0].split(delimiter).map(h => h.trim());
    const rows: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter);
      if (values.length >= 2) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        rows.push(row);
      }
    }

    setPreviewData(rows);
    setImportStatus('preview');
    setMessage(`Found ${rows.length} records ready to import`);
  };

  const handleImport = () => {
    // In a real app, this would save to context/database
    setImportStatus('success');
    setMessage(`Successfully imported ${previewData.length} records for ${selectedMonth}`);
    
    // Clear after 3 seconds
    setTimeout(() => {
      setRawData('');
      setPreviewData([]);
      setImportStatus('idle');
      setMessage('');
    }, 3000);
  };

  const sampleData = `Sr No\tTenant Name\tPremises\tEffective Date\tRent\tOutstanding previous Months\tPaid of current Month\tBalance
1\tZafar Mahmood\t1M\t01-Jul-23\t97437\t215309\t140000\t172746
2\tZahoor ul Hassan\t3M\t20-Sep-23\t53944\t33266\t70000\t17210
3\tNadeem Qaiser\t4M\t01-Jul-22\t50820\t74440\t51000\t74260`;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📥 Import Data</h1>
            <p className="text-gray-500 mt-1">Import rent sheet data from Excel or CSV</p>
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            importStatus === 'success' ? 'bg-green-100 text-green-800' :
            importStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {importStatus === 'success' ? <CheckCircle className="w-5 h-5" /> :
             importStatus === 'error' ? <AlertCircle className="w-5 h-5" /> :
             <FileText className="w-5 h-5" />}
            {message}
          </div>
        )}

        {/* Import Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-6">
            {/* Month Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import for Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Data Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Data from Excel
              </label>
              <textarea
                rows={10}
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                placeholder="Paste your Excel data here (Tab or Comma separated)..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-2">
                Copy data from Excel including headers and paste here. Tab-separated or comma-separated formats are supported.
              </p>
            </div>

            {/* Sample Format */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Format:</h4>
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {sampleData}
              </pre>
              <button
                onClick={() => setRawData(sampleData)}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Use sample data
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={parseData}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Preview Import
              </button>
              {previewData.length > 0 && (
                <button
                  onClick={handleImport}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Import Data
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Preview ({previewData.length} records)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0] || {}).map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 10 && (
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 text-center">
                Showing first 10 of {previewData.length} records
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 How to Import</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Open your rent sheet in Excel</li>
            <li>Select all data including headers (Ctrl+A)</li>
            <li>Copy the data (Ctrl+C)</li>
            <li>Paste in the text area above (Ctrl+V)</li>
            <li>Click "Preview Import" to verify data</li>
            <li>Click "Import Data" to add to system</li>
          </ol>

          <h4 className="text-md font-semibold text-gray-900 mt-6 mb-3">Supported Columns:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Tenant Name', 'Premises', 'Rent', 'Outstanding', 'Paid', 'Balance', 'Effective Date', 'IESCO No'].map((col) => (
              <span key={col} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
