import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

export function Invoice() {
  const { tenants, rentRecords, payments, settings } = useApp();
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const printRef = useRef<HTMLDivElement>(null);

  const activeTenants = tenants.filter(function(t) { return t.status === 'active'; });
  const tenant = tenants.find(function(t) { return t.id === selectedTenant; });

  const rentRecord = rentRecords.find(function(r) {
    return r.tenantId === selectedTenant && r.monthYear === selectedMonth;
  });

  const tenantPayments = payments
    .filter(function(p) { return p.tenantId === selectedTenant; })
    .sort(function(a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); })
    .slice(0, 3);

  const handlePrint = function() {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(
      '<!DOCTYPE html><html><head><title>Invoice - ' + (tenant?.name || 'Tenant') + '</title>' +
      '<style>' +
      'body { font-family: Arial, sans-serif; padding: 20px; }' +
      '.invoice { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }' +
      '.header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }' +
      '.header h1 { color: #2563eb; margin: 0; }' +
      '.table { width: 100%; border-collapse: collapse; margin: 20px 0; }' +
      '.table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }' +
      '.table th { background: #f3f4f6; }' +
      '.total { font-size: 1.5em; text-align: right; color: #dc2626; font-weight: bold; }' +
      '.footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }' +
      '</style></head><body>' +
      content.innerHTML +
      '<script>window.onload = function() { window.print(); window.close(); }<\/script>' +
      '</body></html>'
    );
    printWindow.document.close();
  };

  const handleWhatsApp = function() {
    if (!tenant) return;
    const balance = rentRecord?.balance || tenant.rent;
    const message = 'Dear ' + tenant.name + ',\n\nYour invoice for ' + selectedMonth + ':\n\nMonthly Rent: Rs ' + tenant.rent.toLocaleString() + '\nOutstanding: Rs ' + (rentRecord?.outstanding || 0).toLocaleString() + '\nTotal Due: Rs ' + balance.toLocaleString() + '\n\nPlease pay at your earliest convenience.\n\nRegards,\n' + settings.plazaName;
    const phone = tenant.phone.replace(/[^0-9]/g, '');
    window.open('https://wa.me/92' + phone.slice(-10) + '?text=' + encodeURIComponent(message), '_blank');
  };

  const invoiceNumber = 'INV-' + selectedMonth.replace('-', '') + '-' + (selectedTenant ? selectedTenant.slice(-4).toUpperCase() : '0000');
  const today = new Date().toLocaleDateString('en-PK');

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Generate Invoice</h1>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Tenant</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={selectedTenant}
                onChange={function(e) { setSelectedTenant(e.target.value); }}
              >
                <option value="">-- Select Tenant --</option>
                {activeTenants.map(function(t) {
                  return <option key={t.id} value={t.id}>{t.name} - {t.premises}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="month"
                className="w-full border rounded-lg px-3 py-2"
                value={selectedMonth}
                onChange={function(e) { setSelectedMonth(e.target.value); }}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handlePrint}
                disabled={!selectedTenant}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Print
              </button>
              <button
                onClick={handleWhatsApp}
                disabled={!selectedTenant}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>

        {tenant ? (
          <div className="bg-white rounded-lg shadow">
            <div ref={printRef} className="p-6">
              <div className="text-center border-b-2 border-blue-600 pb-4 mb-4">
                <h1 className="text-2xl font-bold text-blue-600">{settings.plazaName}</h1>
                <p className="text-gray-600">{settings.address}</p>
                <p className="text-gray-600">Phone: {settings.phone}</p>
              </div>

              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="font-bold text-lg">INVOICE</h2>
                  <p className="text-gray-600">Invoice #: {invoiceNumber}</p>
                  <p className="text-gray-600">Date: {today}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold">Bill To:</h3>
                  <p>{tenant.name}</p>
                  <p>Shop: {tenant.premises}</p>
                  <p>Phone: {tenant.phone}</p>
                </div>
              </div>

              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Description</th>
                    <th className="border p-2 text-right">Amount (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Monthly Rent - {selectedMonth}</td>
                    <td className="border p-2 text-right">{tenant.rent.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Outstanding Previous Months</td>
                    <td className="border p-2 text-right">{(rentRecord?.outstanding || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Paid Current Month</td>
                    <td className="border p-2 text-right text-green-600">-{(rentRecord?.paid || 0).toLocaleString()}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-red-50">
                    <td className="border p-2 font-bold">TOTAL DUE</td>
                    <td className="border p-2 text-right font-bold text-red-600 text-xl">
                      Rs {(rentRecord?.balance || tenant.rent).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {tenantPayments.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Recent Payments:</h3>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">Date</th>
                        <th className="border p-2 text-right">Amount</th>
                        <th className="border p-2 text-left">Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantPayments.map(function(p) {
                        return (
                          <tr key={p.id}>
                            <td className="border p-2">{new Date(p.date).toLocaleDateString()}</td>
                            <td className="border p-2 text-right text-green-600">Rs {p.amount.toLocaleString()}</td>
                            <td className="border p-2">{p.method}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="text-center border-t pt-4 text-sm text-gray-600">
                <p>{settings.footerText || 'Thank you for your business!'}</p>
                <p className="mt-2">For queries: {settings.phone}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            <p className="text-4xl mb-4">🧾</p>
            <p>Select a tenant to generate invoice</p>
          </div>
        )}
      </div>
    </Layout>
  );
}