import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Invoice() {
  const { tenants, rentRecords, payments, settings } = useApp();
  const [tenantId, setTenantId] = useState('');
  const [month, setMonth] = useState('2026-02');

  // Get active tenants safely
  var activeTenants: typeof tenants = [];
  if (tenants && tenants.length > 0) {
    for (var i = 0; i < tenants.length; i++) {
      if (tenants[i] && tenants[i].status === 'active') {
        activeTenants.push(tenants[i]);
      }
    }
  }

  // Get selected tenant safely
  var tenant = null;
  if (tenantId && tenants && tenants.length > 0) {
    for (var j = 0; j < tenants.length; j++) {
      if (tenants[j] && tenants[j].id === tenantId) {
        tenant = tenants[j];
        break;
      }
    }
  }

  // Get rent record for selected month safely
  var rentRecord = null;
  if (tenantId && rentRecords && rentRecords.length > 0) {
    for (var k = 0; k < rentRecords.length; k++) {
      if (rentRecords[k] && rentRecords[k].tenantId === tenantId && rentRecords[k].monthYear === month) {
        rentRecord = rentRecords[k];
        break;
      }
    }
  }

  // Get recent payments for tenant safely
  var recentPayments: typeof payments = [];
  if (tenantId && payments && payments.length > 0) {
    var tenantPayments: typeof payments = [];
    for (var l = 0; l < payments.length; l++) {
      if (payments[l] && payments[l].tenantId === tenantId) {
        tenantPayments.push(payments[l]);
      }
    }
    tenantPayments.sort(function(a, b) {
      var dateA = a && a.date ? new Date(a.date).getTime() : 0;
      var dateB = b && b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
    recentPayments = tenantPayments.slice(0, 3);
  }

  // Calculate totals with safe defaults
  var monthlyRent = 0;
  var outstanding = 0;
  var paidAmount = 0;
  var totalDue = 0;

  if (tenant) {
    monthlyRent = tenant.rent || 0;
    if (rentRecord) {
      outstanding = rentRecord.outstanding || 0;
      paidAmount = rentRecord.paid || 0;
      totalDue = rentRecord.balance || 0;
    } else {
      totalDue = monthlyRent;
    }
  }

  // Invoice details
  var invoiceNo = 'INV-' + month.replace('-', '') + '-' + (tenantId ? tenantId.slice(-4).toUpperCase() : '0000');
  var today = new Date().toLocaleDateString('en-PK');
  
  // Settings with defaults
  var plazaName = (settings && settings.plazaName) ? settings.plazaName : 'PLAZA RENT';
  var plazaAddress = (settings && settings.address) ? settings.address : '';
  var plazaPhone = (settings && settings.phone) ? settings.phone : '';
  var footerText = (settings && settings.footerText) ? settings.footerText : 'Thank you for your business!';

  function formatNumber(num: number) {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    return num.toLocaleString();
  }

  function handlePrint() {
    if (!tenant) return;

    var tenantName = tenant.name || 'Unknown';
    var tenantPremises = tenant.premises || '';
    var tenantPhone = tenant.phone || 'N/A';

    var printWindow = window.open('', '_blank');
    if (!printWindow) return;

    var html = '<!DOCTYPE html>';
    html += '<html><head><title>Invoice - ' + tenantName + '</title>';
    html += '<style>';
    html += 'body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }';
    html += '.invoice { border: 1px solid #ddd; padding: 30px; }';
    html += '.header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }';
    html += '.header h1 { color: #2563eb; margin: 0; font-size: 28px; }';
    html += '.header p { margin: 5px 0; color: #666; }';
    html += '.info { display: flex; justify-content: space-between; margin-bottom: 20px; }';
    html += '.info-box h3 { margin: 0 0 5px 0; font-size: 14px; color: #666; }';
    html += '.info-box p { margin: 3px 0; }';
    html += 'table { width: 100%; border-collapse: collapse; margin: 20px 0; }';
    html += 'th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }';
    html += 'th { background: #f5f5f5; }';
    html += '.text-right { text-align: right; }';
    html += '.total-row { background: #fee2e2; }';
    html += '.total-row td { font-weight: bold; font-size: 18px; color: #dc2626; }';
    html += '.footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }';
    html += '</style></head><body>';
    
    html += '<div class="invoice">';
    
    // Header
    html += '<div class="header">';
    html += '<h1>' + plazaName + '</h1>';
    if (plazaAddress) html += '<p>' + plazaAddress + '</p>';
    if (plazaPhone) html += '<p>Phone: ' + plazaPhone + '</p>';
    html += '</div>';
    
    // Invoice Info
    html += '<div class="info">';
    html += '<div class="info-box">';
    html += '<h3>INVOICE</h3>';
    html += '<p><strong>Invoice #:</strong> ' + invoiceNo + '</p>';
    html += '<p><strong>Date:</strong> ' + today + '</p>';
    html += '<p><strong>Month:</strong> ' + month + '</p>';
    html += '</div>';
    html += '<div class="info-box" style="text-align: right;">';
    html += '<h3>BILL TO</h3>';
    html += '<p><strong>' + tenantName + '</strong></p>';
    html += '<p>Shop: ' + tenantPremises + '</p>';
    html += '<p>Phone: ' + tenantPhone + '</p>';
    html += '</div>';
    html += '</div>';
    
    // Items Table
    html += '<table>';
    html += '<thead><tr><th>Description</th><th class="text-right">Amount (Rs)</th></tr></thead>';
    html += '<tbody>';
    html += '<tr><td>Monthly Rent - ' + month + '</td><td class="text-right">' + formatNumber(monthlyRent) + '</td></tr>';
    html += '<tr><td>Outstanding Previous Months</td><td class="text-right">' + formatNumber(outstanding) + '</td></tr>';
    html += '<tr><td>Paid Current Month</td><td class="text-right" style="color: green;">-' + formatNumber(paidAmount) + '</td></tr>';
    html += '</tbody>';
    html += '<tfoot>';
    html += '<tr class="total-row"><td><strong>TOTAL DUE</strong></td><td class="text-right">Rs ' + formatNumber(totalDue) + '</td></tr>';
    html += '</tfoot>';
    html += '</table>';
    
    // Recent Payments
    if (recentPayments.length > 0) {
      html += '<h3>Recent Payments</h3>';
      html += '<table>';
      html += '<thead><tr><th>Date</th><th class="text-right">Amount</th><th>Method</th></tr></thead>';
      html += '<tbody>';
      for (var m = 0; m < recentPayments.length; m++) {
        var p = recentPayments[m];
        if (p) {
          html += '<tr>';
          html += '<td>' + (p.date || 'N/A') + '</td>';
          html += '<td class="text-right" style="color: green;">Rs ' + formatNumber(p.amount || 0) + '</td>';
          html += '<td>' + (p.method || 'cash') + '</td>';
          html += '</tr>';
        }
      }
      html += '</tbody></table>';
    }
    
    // Footer
    html += '<div class="footer">';
    html += '<p>' + footerText + '</p>';
    if (plazaPhone) html += '<p>For queries contact: ' + plazaPhone + '</p>';
    html += '</div>';
    
    html += '</div>';
    html += '<script>window.onload = function() { window.print(); };<\/script>';
    html += '</body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
  }

  function handleWhatsApp() {
    if (!tenant) return;
    
    var tenantName = tenant.name || 'Tenant';
    var tenantPhone = tenant.phone || '';
    
    var message = 'Dear ' + tenantName + ',\n\n';
    message += 'Your invoice for ' + month + ':\n\n';
    message += 'Monthly Rent: Rs ' + formatNumber(monthlyRent) + '\n';
    message += 'Outstanding: Rs ' + formatNumber(outstanding) + '\n';
    message += 'Total Due: Rs ' + formatNumber(totalDue) + '\n\n';
    message += 'Please pay at your earliest convenience.\n\n';
    message += 'Regards,\n' + plazaName;
    
    var phone = tenantPhone.replace(/[^0-9]/g, '');
    if (phone.length >= 10) {
      phone = '92' + phone.slice(-10);
    }
    
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(message), '_blank');
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Generate Invoice</h1>

        {/* Selection */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Tenant *</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={tenantId}
                onChange={function(e) { setTenantId(e.target.value); }}
              >
                <option value="">-- Select Tenant --</option>
                {activeTenants.map(function(t) {
                  return <option key={t.id} value={t.id}>{t.name || 'Unknown'} - {t.premises || ''}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="month"
                className="w-full border rounded-lg px-3 py-2"
                value={month}
                onChange={function(e) { setMonth(e.target.value); }}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handlePrint}
                disabled={!tenantId}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleWhatsApp}
                disabled={!tenantId}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                💬 WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Preview */}
        {tenant ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {/* Header */}
              <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-blue-600">{plazaName}</h1>
                {plazaAddress && <p className="text-gray-600">{plazaAddress}</p>}
                {plazaPhone && <p className="text-gray-600">Phone: {plazaPhone}</p>}
              </div>

              {/* Invoice Info */}
              <div className="flex flex-wrap justify-between mb-6 gap-4">
                <div>
                  <h2 className="font-bold text-lg">INVOICE</h2>
                  <p className="text-gray-600">Invoice #: {invoiceNo}</p>
                  <p className="text-gray-600">Date: {today}</p>
                  <p className="text-gray-600">Month: {month}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold">Bill To:</h3>
                  <p className="font-medium">{tenant.name || 'Unknown'}</p>
                  <p>Shop: {tenant.premises || 'N/A'}</p>
                  <p>Phone: {tenant.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Description</th>
                    <th className="border p-3 text-right">Amount (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">Monthly Rent - {month}</td>
                    <td className="border p-3 text-right">{formatNumber(monthlyRent)}</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Outstanding Previous Months</td>
                    <td className="border p-3 text-right">{formatNumber(outstanding)}</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Paid Current Month</td>
                    <td className="border p-3 text-right text-green-600">-{formatNumber(paidAmount)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-red-50">
                    <td className="border p-3 font-bold">TOTAL DUE</td>
                    <td className="border p-3 text-right font-bold text-red-600 text-xl">
                      Rs {formatNumber(totalDue)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Recent Payments */}
              {recentPayments.length > 0 && (
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
                      {recentPayments.map(function(p) {
                        if (!p) return null;
                        return (
                          <tr key={p.id}>
                            <td className="border p-2">{p.date || 'N/A'}</td>
                            <td className="border p-2 text-right text-green-600">Rs {formatNumber(p.amount || 0)}</td>
                            <td className="border p-2">{p.method || 'cash'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer */}
              <div className="text-center border-t pt-4 text-sm text-gray-600">
                <p>{footerText}</p>
                {plazaPhone && <p className="mt-2">For queries: {plazaPhone}</p>}
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