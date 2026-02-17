import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Payments() {
  const { tenants, payments, addPayment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [formData, setFormData] = useState({
    tenantId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'cash' as 'cash' | 'bank' | 'online',
    transactionNo: '',
    depositedAccount: '',
    attachment: '',
    attachmentName: '',
  });

  const activeTenants = tenants.filter(function(t) { return t.status === 'active'; });

  const handleFileChange = function(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = function() {
        setFormData(function(prev) {
          return { ...prev, attachment: reader.result as string, attachmentName: file.name };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = function(e: React.FormEvent) {
    e.preventDefault();
    const tenant = tenants.find(function(t) { return t.id === formData.tenantId; });
    const newPayment = {
      id: 'P' + Date.now(),
      tenantId: formData.tenantId,
      amount: parseInt(formData.amount),
      date: formData.date,
      method: formData.method,
      transactionNo: formData.transactionNo,
      depositedAccount: formData.depositedAccount,
      attachment: formData.attachment,
      attachmentName: formData.attachmentName,
    };
    
    addPayment(newPayment);
    setLastPayment({ ...newPayment, tenantName: tenant?.name, premises: tenant?.premises });
    setShowForm(false);
    setShowReceipt(true);
    setFormData({
      tenantId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'cash',
      transactionNo: '',
      depositedAccount: '',
      attachment: '',
      attachmentName: '',
    });
  };

  const handlePrintReceipt = function() {
    if (!lastPayment) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(
      '<!DOCTYPE html><html><head><title>Payment Receipt</title>' +
      '<style>' +
      'body { font-family: Arial, sans-serif; padding: 40px; max-width: 400px; margin: 0 auto; }' +
      '.receipt { border: 2px solid #000; padding: 20px; }' +
      '.header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }' +
      '.header h1 { margin: 0; font-size: 24px; }' +
      '.header p { margin: 5px 0; color: #666; }' +
      '.title { text-align: center; font-size: 18px; font-weight: bold; margin: 15px 0; background: #000; color: #fff; padding: 5px; }' +
      '.row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ccc; }' +
      '.row:last-child { border-bottom: none; }' +
      '.label { color: #666; }' +
      '.value { font-weight: bold; }' +
      '.amount { font-size: 24px; text-align: center; margin: 20px 0; padding: 15px; background: #f0f0f0; }' +
      '.amount span { color: green; }' +
      '.footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #000; font-size: 12px; color: #666; }' +
      '</style></head><body>' +
      '<div class="receipt">' +
      '<div class="header"><h1>PLAZA RENT</h1><p>Payment Receipt</p></div>' +
      '<div class="title">RECEIPT</div>' +
      '<div class="row"><span class="label">Receipt No:</span><span class="value">' + lastPayment.id + '</span></div>' +
      '<div class="row"><span class="label">Date:</span><span class="value">' + new Date(lastPayment.date).toLocaleDateString() + '</span></div>' +
      '<div class="row"><span class="label">Tenant:</span><span class="value">' + lastPayment.tenantName + '</span></div>' +
      '<div class="row"><span class="label">Shop:</span><span class="value">' + lastPayment.premises + '</span></div>' +
      '<div class="row"><span class="label">Method:</span><span class="value">' + lastPayment.method.toUpperCase() + '</span></div>' +
      (lastPayment.transactionNo ? '<div class="row"><span class="label">Transaction #:</span><span class="value">' + lastPayment.transactionNo + '</span></div>' : '') +
      '<div class="amount">Amount Received<br/><span>Rs ' + lastPayment.amount.toLocaleString() + '</span></div>' +
      '<div class="footer"><p>Thank you for your payment!</p><p>This is a computer generated receipt.</p></div>' +
      '</div>' +
      '<script>window.onload = function() { window.print(); }<\/script>' +
      '</body></html>'
    );
    printWindow.document.close();
  };

  const getPaymentWithTenant = function(payment: any) {
    const tenant = tenants.find(function(t) { return t.id === payment.tenantId; });
    return { ...payment, tenantName: tenant?.name || 'Unknown', premises: tenant?.premises || '' };
  };

  const sortedPayments = [...payments].sort(function(a, b) {
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

        {/* Receipt Modal */}
        {showReceipt && lastPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="text-center mb-4">
                <div className="text-green-500 text-5xl mb-2">✓</div>
                <h2 className="text-xl font-bold">Payment Recorded!</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Tenant:</span>
                  <span className="font-bold">{lastPayment.tenantName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Shop:</span>
                  <span className="font-bold">{lastPayment.premises}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-green-600">Rs {lastPayment.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-bold">{new Date(lastPayment.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  🖨️ Print Receipt
                </button>
                <button
                  onClick={function() { setShowReceipt(false); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add Payment</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tenant *</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.tenantId}
                      onChange={function(e) { setFormData(function(prev) { return { ...prev, tenantId: e.target.value }; }); }}
                      required
                    >
                      <option value="">-- Select Tenant --</option>
                      {activeTenants.map(function(t) {
                        return <option key={t.id} value={t.id}>{t.name} - {t.premises}</option>;
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs) *</label>
                    <input
                      type="number"
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.amount}
                      onChange={function(e) { setFormData(function(prev) { return { ...prev, amount: e.target.value }; }); }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.date}
                      onChange={function(e) { setFormData(function(prev) { return { ...prev, date: e.target.value }; }); }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.method}
                      onChange={function(e) { setFormData(function(prev) { return { ...prev, method: e.target.value as 'cash' | 'bank' | 'online' }; }); }}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction No</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.transactionNo}
                      onChange={function(e) { setFormData(function(prev) { return { ...prev, transactionNo: e.target.value }; }); }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposited Account</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.depositedAccount}
                      onChange={function(e) { setFormData(function(prev) { return { ...prev, depositedAccount: e.target.value }; }); }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Bank Slip/Receipt)</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="w-full border rounded-lg px-3 py-2"
                      onChange={handleFileChange}
                    />
                    {formData.attachmentName && (
                      <p className="text-sm text-green-600 mt-1">✓ {formData.attachmentName}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save Payment
                  </button>
                  <button
                    type="button"
                    onClick={function() { setShowForm(false); }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payments List */}
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
                  <th className="p-3 text-left">Transaction #</th>
                  <th className="p-3 text-center">Attachment</th>
                  <th className="p-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.length > 0 ? sortedPayments.map(function(payment) {
                  const p = getPaymentWithTenant(payment);
                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="p-3 font-medium">{p.tenantName}</td>
                      <td className="p-3">{p.premises}</td>
                      <td className="p-3 text-right text-green-600 font-bold">Rs {p.amount.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={
                          p.method === 'cash' ? 'px-2 py-1 rounded text-xs bg-green-100 text-green-700' :
                          p.method === 'bank' ? 'px-2 py-1 rounded text-xs bg-blue-100 text-blue-700' :
                          'px-2 py-1 rounded text-xs bg-purple-100 text-purple-700'
                        }>
                          {p.method.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">{p.transactionNo || '-'}</td>
                      <td className="p-3 text-center">
                        {p.attachment ? (
                          <a
                            href={p.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            📎 View
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={function() {
                            setLastPayment(p);
                            handlePrintReceipt();
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          🖨️ Print
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No payments recorded yet
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