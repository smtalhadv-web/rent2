import { useState, useMemo } from 'react';
import { Calendar, Download, RefreshCw, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

export function RentSheet() {
  const { tenants, rentRecords, generateRentSheet } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'vacated'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = useMemo(() => {
    return rentRecords
      .filter((record) => record.monthYear === selectedMonth)
      .map((record) => {
        const tenant = tenants.find((t) => t.id === record.tenantId);
        return { ...record, tenant };
      })
      .filter((record) => {
        if (!record.tenant) return false;
        const matchesStatus =
          statusFilter === 'all' || record.tenant.status === statusFilter;
        const matchesSearch =
          record.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.tenant.premises.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => (a.tenant?.premises || '').localeCompare(b.tenant?.premises || ''));
  }, [rentRecords, selectedMonth, tenants, statusFilter, searchTerm]);

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => ({
        rent: acc.rent + record.rent,
        outstanding: acc.outstanding + record.outstandingPrevious,
        paid: acc.paid + record.paid,
        balance: acc.balance + record.balance,
      }),
      { rent: 0, outstanding: 0, paid: 0, balance: 0 }
    );
  }, [filteredRecords]);

  const handleGenerateSheet = () => {
    generateRentSheet(selectedMonth);
  };

  const handleExport = () => {
    const headers = ['Tenant', 'Premises', 'Monthly Rent', 'Previous Outstanding', 'Paid', 'Balance', 'Carry Forward'];
    const rows = filteredRecords.map((r) => [
      r.tenant?.name || '',
      r.tenant?.premises || '',
      r.rent.toString(),
      r.outstandingPrevious.toString(),
      r.paid.toString(),
      r.balance.toString(),
      r.carryForward.toString(),
    ]);
    
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent-sheet-${selectedMonth}.csv`;
    a.click();
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
    // Add next month
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    months.push({
      value: format(nextMonth, 'yyyy-MM'),
      label: format(nextMonth, 'MMMM yyyy'),
    });
    return months;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Rent Sheet</h1>
            <p className="text-gray-500 mt-1">
              {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')} rent overview
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateSheet}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Generate Sheet
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              >
                {getMonthOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'vacated')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Tenants</option>
              <option value="active">Active Only</option>
              <option value="vacated">Vacated Only</option>
            </select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Rent</p>
            <p className="text-2xl font-bold text-gray-900">Rs {totals.rent.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Previous Outstanding</p>
            <p className="text-2xl font-bold text-amber-600">Rs {totals.outstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">Rs {totals.paid.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Outstanding Balance</p>
            <p className="text-2xl font-bold text-red-600">Rs {totals.balance.toLocaleString()}</p>
          </div>
        </div>

        {/* Rent Sheet Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premises
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Previous Outstanding
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carry Forward
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium text-sm">
                            {record.tenant?.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {record.tenant?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.tenant?.status === 'active' ? (
                              <span className="text-green-600">Active</span>
                            ) : (
                              <span className="text-red-600">Vacated</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.tenant?.premises}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      Rs {record.rent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-amber-600">
                      Rs {record.outstandingPrevious.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                      Rs {record.paid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span
                        className={`font-medium ${
                          record.balance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        Rs {record.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span
                        className={`px-2 py-1 rounded font-medium ${
                          record.carryForward > 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        Rs {record.carryForward.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filteredRecords.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                      Rs {totals.rent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-amber-600">
                      Rs {totals.outstanding.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                      Rs {totals.paid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-red-600">
                      Rs {totals.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-red-600">
                      Rs {totals.balance.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No rent records for this month</p>
              <button
                onClick={handleGenerateSheet}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Generate Rent Sheet
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
