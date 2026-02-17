import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Payments() {
  const { tenants, payments, addPayment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('cash');
  const [transactionNo, setTransactionNo] = useState('');

  // Get active tenants
  var activeTenants: typeof tenants = [];
  for (var i = 0; i < tenants.length; i++) {
    if (tenants[i].status === 'active') {
      activeTenants.push(tenants[i]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    addPayment({
      id: 'P' + Date.now(),
      tenantId: tenantId,
      amount: parseInt(amount),
      date: date,
      method: method as 'cash' | 'bank' | 'online',
      transactionNo: transactionNo,
      depositedAccount: '',
    });
    
    setShowForm(false);
    setTenantId('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setMethod('cash');
    setTransactionNo('');
    
    alert('Payment saved!');
  }

  function printReceipt(paymentId: string) {
    var payment = null;
    var tenant = null;
    
    for (var i = 0; i < payments.length; i++) {
      if (payments[i].id === paymentId) {
        payment = payments[i];
        break;
      }
    }
    
    if (!payment) return;
    
    for (var j = 0; j < tenants.length; j++) {
      if (tenants[j].id === payment.tenantId) {
        tenant = tenants[j];
        break;
      }
    }

    var tenantName = tenant ? tenant.name : 'Unknown';
    var premises = tenant ? tenant.premises : '';

    var printWindow = window.open('', '_blank');
    if (!printWindow) return;

    var html = '<!DOCTYPE html>';
    html += '<html><head><title>Receipt</title>';
    html += '<style>';
    html += 'body { font-family: Arial; padding: 40px; max-width: 400px; margin: 0 auto; }';
    html += '.box { border: 2px solid #000; padding: 20px; }';
    html += '.center { text-align: center; }';
    html += '.row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ccc; }';
    html += '.big { font-size: 24px; text-align: center; margin: 20px 0; padding: 15px; background: #eee; }';
    html += '</style></head><body>';
    html += '<div class="box">';
    html += '<div class="center"><h1>PLAZA RENT</h1><p>Payment Receipt</p></div>';
    html += '<hr/>';
    html += '<div class="row"><span>Receipt No:</span><span>' + payment.id + '</span></div>';
    html += '<div class="row"><span>Date:</span><span>' + payment.date + '</span></div>';
    html += '<div class="row"><span>Tenant:</span><span>' + tenantName + '</span></div>';
    html += '<div class="row"><span>Shop:</span><span>' + premises + '</span></div>';
    html += '<div class="row"><span>Method:</span><span>' + (payment.method || 'cash') + '</span></div>';
    if (payment.transactionNo) {
      html += '<div class="row"><span>Transaction:</span><span>' + payment.transactionNo + '</span></div>';
    }
    html += '<div class="big"><strong>Rs ' + payment.amount.toLocaleString() + '</strong></div>';
    html += '<div class="center"><p>Thank you!</p></div>';
    html += '</div>';
    html += '<script>window.print();<\/script>';
    html += '</body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
  }

  function getTenantName(id: string) {
    for (var i = 0; i < tenants.length; i++) {
      if (tenants[i].id === id) {
        return tenants[i].name;
      }
    }
    return 'Unknown';
  }

  function getTenantPremises(id: string) {
    for (var i = 0; i < tenants.length; i++) {
      if (tenants[i].id === id) {
        return tenants[i].premises;
      }
    }
    return '';
  }

  function getMethodBadge(m: string) {
    if (!m) m = 'cash';
    var colors = {
      cash: 'bg-green-100 text-green-700',
      bank: 'bg-blue-100 text-blue-700',
      online: 'bg-purple-100 text-purple-700'
    };
    var color = colors[m as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    return <span className={'px-2 py-1 rounded text-xs ' + color}>{m.toUpperCase()}</span>;
  }

  var sortedPayments = payments.slice().sort(function(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <button
            onClick={function() { setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Payment
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Add Payment</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tenant *</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={tenantId}
                    onChange={function(e) { setTenantId(e.target.value); }}
                    required
                  >
                    <option value="">Select Tenant</option>
                    {activeTenants.map(function(t) {
                      return <option key={t.id} value={t.id}>{t.name} - {t.premises}</option>;
                    })}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Amount (Rs) *</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={amount}
                    onChange={function(e) { setAmount(e.target.value); }}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={date}
                    onChange={function(e) { setDate(e.target.value); }}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Method</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={method}
                    onChange={function(e) { setMethod(e.target.value); }}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Transaction No</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={transactionNo}
                    onChange={function(e) { setTransactionNo(e.target.value); }}
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={function() { setShowForm(false); }}
                    className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Tenant</th>
                  <th className="p-3 text-left">Shop</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-left">Method</th>
                  <th className="p-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.length > 0 ? (
                  sortedPayments.map(function(p) {
                    return (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{p.date}</td>
                        <td className="p-3 font-medium">{getTenantName(p.tenantId)}</td>
                        <td className="p-3">{getTenantPremises(p.tenantId)}</td>
                        <td className="p-3 text-right text-green-600 font-bold">Rs {p.amount.toLocaleString()}</td>
                        <td className="p-3">{getMethodBadge(p.method || 'cash')}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={function() { printReceipt(p.id); }}
                            className="text-blue-600 hover:underline"
                          >
                            🖨️ Print
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No payments yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}