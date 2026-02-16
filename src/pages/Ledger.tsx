import { useState, useMemo } from 'react';
import { Search, Download, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

export function Ledger() {
  const { tenants, getTenantLedger, depositAdjustments } = useApp();
  const [selectedTenantId, setSelectedTenantId] = useState('');

  const activeTenants = tenants.filter((t) => t.status === 'active' || t.status === 'vacated');

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);
  const ledger = selectedTenantId ? getTenantLedger(selectedTenantId) : null;

  const tenantAdjustments = useMemo(() => {
    return depositAdjustments.filter((a) => a.tenantId === selectedTenantId);
  }, [depositAdjustments, selectedTenantId]);

  const summary = useMemo(() => {
    if (!ledger) return null;

    const totalRent = ledger.records.reduce((sum, r) => sum + r.rent, 0);
    const totalPaid = ledger.payments.reduce((sum, p) => sum + p.amount, 0);
    const currentBalance = ledger.records.length > 0 
      ? ledger.records[ledger.records.length - 1].carryForward 
      : 0;
    const totalAdjustments = tenantAdjustments.reduce((sum, a) => sum + a.amount, 0);

    return {
      totalRent,
      totalPaid,
      currentBalance,
      totalAdjustments,
      securityDeposit: selectedTenant?.securityDeposit || 0,
      netDeposit: (selectedTenant?.securityDeposit || 0) - totalAdjustments,
    };
  }, [ledger, tenantAdjustments, selectedTenant]);

  const handleExportCSV = () => {
    if (!ledger || !selectedTenant) return;

    const headers = ['Month', 'Rent Due', 'Previous Outstanding', 'Total Due', 'Paid', 'Balance'];
    const rows = ledger.records.map((r) => [
      format(parseISO(`${r.monthYear}-01`), 'MMM yyyy'),
      r.rent.toString(),
      r.outstandingPrevious.toString(),
      (r.rent + r.outstandingPrevious).toString(),
      r.paid.toString(),
      r.balance.toString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${selectedTenant.name.replace(/\s+/g, '-')}.csv`;
    a.click();
  };

  const combinedLedger = useMemo(() => {
    if (!ledger) return [];

    const entries: {
      date: string;
      description: string;
      debit: number;
      credit: number;
      balance: number;
    }[] = [];

    let runningBalance = 0;

    // Combine rent records and payments
    ledger.records.forEach((record) => {
      // Add rent charge
      runningBalance += record.rent;
      entries.push({
        date: `${record.monthYear}-01`,
        description: `Rent for ${format(parseISO(`${record.monthYear}-01`), 'MMMM yyyy')}`,
        debit: record.rent,
        credit: 0,
        balance: runningBalance,
      });

      // Add payments for this month
      const monthPayments = ledger.payments.filter((p) => p.monthYear === record.monthYear);
      monthPayments.forEach((payment) => {
        runningBalance -= payment.amount;
        entries.push({
          date: payment.paymentDate,
          description: `Payment received (${payment.paymentMethod})`,
          debit: 0,
          credit: payment.amount,
          balance: runningBalance,
        });
      });
    });

    return entries.sort((a, b) => a.date.localeCompare(b.date));
  }, [ledger]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenant Ledger</h1>
            <p className="text-gray-500 mt-1">View complete tenant account history</p>
          </div>
          {selectedTenantId && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          )}
        </div>

        {/* Tenant Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              >
                <option value="">Select a tenant to view ledger...</option>
                {activeTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} - {t.premises} ({t.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedTenant && summary && (
          <>
            {/* Tenant Info Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">{selectedTenant.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedTenant.name}</h2>
                    <p className="text-indigo-200">{selectedTenant.premises}</p>
                    <p className="text-indigo-200 text-sm">{selectedTenant.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-indigo-200 text-sm">Current Balance</p>
                  <p className={`text-3xl font-bold ${summary.currentBalance > 0 ? 'text-red-300' : 'text-green-300'}`}>
                    Rs {Math.abs(summary.currentBalance).toLocaleString()}
                  </p>
                  <p className="text-sm text-indigo-200">
                    {summary.currentBalance > 0 ? 'Outstanding' : summary.currentBalance < 0 ? 'Advance' : 'Cleared'}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-gray-500">Total Rent Charged</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">Rs {summary.totalRent.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-gray-500">Total Paid</p>
                </div>
                <p className="text-2xl font-bold text-green-600">Rs {summary.totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <p className="text-sm text-gray-500">Security Deposit</p>
                </div>
                <p className="text-2xl font-bold text-indigo-600">Rs {summary.securityDeposit.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <p className="text-sm text-gray-500">Net Deposit</p>
                </div>
                <p className="text-2xl font-bold text-amber-600">Rs {summary.netDeposit.toLocaleString()}</p>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Account Statement</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debit (Rs)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credit (Rs)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance (Rs)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {combinedLedger.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(parseISO(entry.date), 'dd MMM yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {entry.debit > 0 ? (
                            <span className="text-red-600 font-medium">
                              {entry.debit.toLocaleString()}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {entry.credit > 0 ? (
                            <span className="text-green-600 font-medium">
                              {entry.credit.toLocaleString()}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span
                            className={`font-semibold ${
                              entry.balance > 0 ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {entry.balance.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {combinedLedger.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No transactions found for this tenant</p>
                </div>
              )}
            </div>

            {/* Deposit Adjustments */}
            {tenantAdjustments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Deposit Adjustments</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount (Rs)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tenantAdjustments.map((adjustment) => (
                        <tr key={adjustment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(parseISO(adjustment.date), 'dd MMM yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {adjustment.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className="text-red-600 font-medium">
                              -{adjustment.amount.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {!selectedTenantId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Tenant</h3>
            <p className="text-gray-500">Choose a tenant from the dropdown above to view their complete ledger</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
