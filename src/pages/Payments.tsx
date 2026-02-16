import { useState } from 'react';
import { Plus, Search, Eye, X, CreditCard, Banknote, Smartphone, Receipt } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { Payment, PaymentMethod } from '../types';

export function Payments() {
  const { tenants, payments, addPayment, rentRecords, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);

  const [formData, setFormData] = useState({
    tenantId: '',
    monthYear: format(new Date(), 'yyyy-MM'),
    amount: 0,
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'cash' as PaymentMethod,
    transactionNo: '',
    depositedAccount: '',
  });

  const activeTenants = tenants.filter((t) => t.status === 'active');

  const filteredPayments = payments
    .filter((payment) => {
      const tenant = tenants.find((t) => t.id === payment.tenantId);
      const matchesSearch =
        tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant?.premises.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
      return matchesSearch && matchesMethod;
    })
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const getTenantName = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId)?.name || 'Unknown';
  };

  const getTenantPremises = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId)?.premises || '-';
  };

  const getTenantOutstanding = (tenantId: string, monthYear: string) => {
    const record = rentRecords.find(
      (r) => r.tenantId === tenantId && r.monthYear === monthYear
    );
    return record?.balance || 0;
  };

  const resetForm = () => {
    setFormData({
      tenantId: '',
      monthYear: format(new Date(), 'yyyy-MM'),
      amount: 0,
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'cash',
      transactionNo: '',
      depositedAccount: '',
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPayment(formData);
    handleCloseModal();
  };

  const handleView = (payment: Payment) => {
    setViewingPayment(payment);
    setShowViewModal(true);
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return Banknote;
      case 'bank':
        return CreditCard;
      case 'online':
        return Smartphone;
    }
  };

  const getMethodBadge = (method: PaymentMethod) => {
    const styles = {
      cash: 'bg-green-100 text-green-800',
      bank: 'bg-blue-100 text-blue-800',
      online: 'bg-purple-100 text-purple-800',
    };
    const Icon = getMethodIcon(method);
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${styles[method]}`}>
        <Icon className="w-3 h-3" />
        {method.charAt(0).toUpperCase() + method.slice(1)}
      </span>
    );
  };

  const getMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
      });
    }
    return months;
  };

  const canAddPayment = user?.role === 'admin' || user?.role === 'accountant';

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 mt-1">Record and manage rent payments</p>
          </div>
          {canAddPayment && (
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Record Payment
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Banknote className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cash Payments</p>
                <p className="text-xl font-bold text-gray-900">
                  Rs {payments.filter((p) => p.paymentMethod === 'cash').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank Payments</p>
                <p className="text-xl font-bold text-gray-900">
                  Rs {payments.filter((p) => p.paymentMethod === 'bank').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Online Payments</p>
                <p className="text-xl font-bold text-gray-900">
                  Rs {payments.filter((p) => p.paymentMethod === 'online').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tenant, premises, or transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getTenantName(payment.tenantId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getTenantPremises(payment.tenantId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(parseISO(`${payment.monthYear}-01`), 'MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        Rs {payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(parseISO(payment.paymentDate), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMethodBadge(payment.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.transactionNo || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleView(payment)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No payments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseModal} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tenant *</label>
                  <select
                    required
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Tenant</option>
                    {activeTenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} - {t.premises}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.tenantId && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-800">
                      Outstanding for {format(parseISO(`${formData.monthYear}-01`), 'MMMM yyyy')}:{' '}
                      <strong>
                        Rs {getTenantOutstanding(formData.tenantId, formData.monthYear).toLocaleString()}
                      </strong>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                    <select
                      required
                      value={formData.monthYear}
                      onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {getMonthOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Rs) *</label>
                    <input
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <select
                      required
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction No</label>
                    <input
                      type="text"
                      value={formData.transactionNo}
                      onChange={(e) => setFormData({ ...formData, transactionNo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deposited Account</label>
                    <input
                      type="text"
                      value={formData.depositedAccount}
                      onChange={(e) => setFormData({ ...formData, depositedAccount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Payment Modal */}
      {showViewModal && viewingPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowViewModal(false)}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Payment Receipt</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    Rs {viewingPayment.amount.toLocaleString()}
                  </p>
                  <p className="text-gray-500 mt-1">Payment Received</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Tenant</span>
                    <span className="font-medium">{getTenantName(viewingPayment.tenantId)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Premises</span>
                    <span className="font-medium">{getTenantPremises(viewingPayment.tenantId)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Month</span>
                    <span className="font-medium">
                      {format(parseISO(`${viewingPayment.monthYear}-01`), 'MMMM yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Payment Date</span>
                    <span className="font-medium">
                      {format(parseISO(viewingPayment.paymentDate), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Method</span>
                    {getMethodBadge(viewingPayment.paymentMethod)}
                  </div>
                  {viewingPayment.transactionNo && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Transaction No</span>
                      <span className="font-medium">{viewingPayment.transactionNo}</span>
                    </div>
                  )}
                  {viewingPayment.depositedAccount && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Deposited To</span>
                      <span className="font-medium">{viewingPayment.depositedAccount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
