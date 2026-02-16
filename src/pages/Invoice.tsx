import { useState, useRef } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Invoice() {
  const { tenants, rentRecords, payments, settings } = useApp();
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const invoiceRef = useRef<HTMLDivElement>(null);

  const activeTenants = tenants.filter(t => t.status === 'active');
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  // Get rent record for selected month
  const rentRecord = rentRecords.find(
    r => r.tenantId === selectedTenantId && r.monthYear === selectedMonth
  );

  // Get payments for selected month
  const tenantPayments = payments.filter(
    p => p.tenantId === selectedTenantId && p.monthYear === selectedMonth
  );

  const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);

  // Calculate totals
  const currentRent = selectedTenant?.monthlyRent || 0;
  const previousBalance = rentRecord?.outstandingPrevious || 0;
  const totalDue = currentRent + previousBalance - totalPaid;

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${selectedTenant?.name || 'Tenant'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; }
          .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }
          .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { color: #1e40af; font-size: 28px; }
          .header p { color: #666; margin-top: 5px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-section h3 { color: #1e40af; margin-bottom: 10px; }
          .info-section p { margin: 5px 0; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f3f4f6; color: #1e40af; }
          .total-row td { font-weight: bold; font-size: 18px; background: #1e40af; color: white; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          @media print { body { padding: 0; } .invoice { border: none; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const invoiceNumber = selectedTenantId 
    ? `INV-${selectedMonth.replace('-', '')}-${selectedTenantId.slice(-4).toUpperCase()}`
    : 'INV-XXXX-XXXX';
  
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🧾 Generate Invoice</h1>
            <p className="text-gray-500 mt-1">Create professional invoices for tenants</p>
          </div>
        </div>

        {/* Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tenant
              </label>
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select Tenant --</option>
                {activeTenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} - {tenant.premises}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handlePrint}
                disabled={!selectedTenantId}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                🖨️ Print Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Preview */}
        {selectedTenant ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Invoice Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  🖨️ Print
                </button>
                <button
                  onClick={() => {
                    const phone = selectedTenant.phone.replace(/[^0-9]/g, '');
                    const message = `Dear ${selectedTenant.name}, your invoice for ${formatMonth(selectedMonth)} is ready. Total Due: ${formatCurrency(totalDue)}. Please pay at your earliest convenience.`;
                    window.open(`https://wa.me/92${phone.slice(-10)}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>

            <div ref={invoiceRef} className="p-8">
              {/* Invoice Content */}
              <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center border-b-2 border-indigo-800 pb-6 mb-6">
                  <h1 className="text-3xl font-bold text-indigo-800">
                    {settings.plazaName || 'PLAZA MANAGEMENT'}
                  </h1>
                  <p className="text-gray-600 mt-1">{settings.address || 'Commercial Plaza'}</p>
                  <p className="text-gray-600">{settings.phone || 'Contact: 0300-0000000'}</p>
                </div>

                {/* Invoice Info */}
                <div className="flex justify-between mb-8">
                  <div>
                    <h3 className="text-indigo-800 font-semibold mb-2">BILL TO:</h3>
                    <p className="font-semibold text-lg">{selectedTenant.name}</p>
                    <p>Shop/Premises: <strong>{selectedTenant.premises}</strong></p>
                    <p>Phone: {selectedTenant.phone}</p>
                    {selectedTenant.email && <p>Email: {selectedTenant.email}</p>}
                  </div>
                  <div className="text-right">
                    <h3 className="text-indigo-800 font-semibold mb-2">INVOICE</h3>
                    <p>Invoice #: <strong>{invoiceNumber}</strong></p>
                    <p>Date: <strong>{today}</strong></p>
                    <p>Period: <strong>{formatMonth(selectedMonth)}</strong></p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 text-indigo-800">Description</th>
                      <th className="text-right p-3 text-indigo-800">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">Monthly Rent - {formatMonth(selectedMonth)}</td>
                      <td className="p-3 text-right">{formatCurrency(currentRent)}</td>
                    </tr>
                    {previousBalance > 0 && (
                      <tr className="border-b bg-red-50">
                        <td className="p-3 text-red-600">Previous Outstanding Balance</td>
                        <td className="p-3 text-right text-red-600">{formatCurrency(previousBalance)}</td>
                      </tr>
                    )}
                    {previousBalance < 0 && (
                      <tr className="border-b bg-green-50">
                        <td className="p-3 text-green-600">Advance Payment (Credit)</td>
                        <td className="p-3 text-right text-green-600">({formatCurrency(Math.abs(previousBalance))})</td>
                      </tr>
                    )}
                    {totalPaid > 0 && (
                      <tr className="border-b bg-green-50">
                        <td className="p-3 text-green-600">Payment Received</td>
                        <td className="p-3 text-right text-green-600">({formatCurrency(totalPaid)})</td>
                      </tr>
                    )}
                    <tr className="bg-indigo-800 text-white">
                      <td className="p-4 font-bold text-lg">TOTAL DUE</td>
                      <td className="p-4 text-right font-bold text-lg">
                        {totalDue < 0 ? (
                          <span className="text-green-300">Credit: {formatCurrency(Math.abs(totalDue))}</span>
                        ) : (
                          formatCurrency(totalDue)
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Payment Info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-indigo-800 mb-2">Payment Information:</h3>
                  <p>Bank: {settings.bankName || 'HBL / Meezan Bank'}</p>
                  <p>Account Title: {settings.accountTitle || 'Plaza Management'}</p>
                  <p>Account No: {settings.accountNumber || '0000-0000000000'}</p>
                </div>

                {/* Footer */}
                <div className="border-t pt-6 text-center text-gray-600 text-sm">
                  <p>{settings.footerText || 'Thank you for your business!'}</p>
                  <p className="mt-2">For queries, contact: {settings.phone || '0300-0000000'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🧾</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Tenant</h3>
            <p className="text-gray-500">Choose a tenant from the dropdown above to generate an invoice</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
