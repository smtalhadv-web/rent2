import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface RentSheetRow {
  id: string;
  tenant_id: string;
  tenant_name: string;
  premises: string;
  status: string;
  rent: number;
  outstanding_previous: number;
  paid: number;
  balance: number;
  carry_forward: number;
}

export function RentSheet() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7);
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sheetData, setSheetData] = useState<RentSheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch rent sheet data directly from database
  useEffect(() => {
    const fetchRentSheet = async () => {
      try {
        setLoading(true);
        setError('');

        // Get current month data
        const { data: currentMonth, error: fetchError } = await supabase
          .from('rent_records')
          .select(`
            id,
            tenant_id,
            month_year,
            rent,
            outstanding_previous,
            paid,
            balance,
            carry_forward,
            tenants!inner (
              name,
              premises,
              status
            )
          `)
          .eq('month_year', selectedMonth);

        if (fetchError) {
          console.error('[v0] Fetch error:', fetchError);
          setError(fetchError.message);
          setSheetData([]);
          return;
        }

        // Get previous month to get carry forward
        const prevMonth = new Date(selectedMonth + '-01');
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        const prevMonthStr = prevMonth.toISOString().slice(0, 7);

        const { data: previousMonthData } = await supabase
          .from('rent_records')
          .select('tenant_id, carry_forward')
          .eq('month_year', prevMonthStr);

        // Create a map of previous month carry forward
        const carryForwardMap: Record<string, number> = {};
        previousMonthData?.forEach((record: any) => {
          carryForwardMap[record.tenant_id] = record.carry_forward || 0;
        });

        // Transform data - use previous month carry forward as outstanding previous
        const transformed: RentSheetRow[] = (currentMonth || []).map((record: any) => {
          const outstandingFromPrevious = carryForwardMap[record.tenant_id] || 0;
          const rent = record.rent || 0;
          const paid = record.paid || 0;
          const carryForward = outstandingFromPrevious + rent - paid;

          return {
            id: record.id,
            tenant_id: record.tenant_id,
            tenant_name: record.tenants?.name || 'Unknown',
            premises: record.tenants?.premises || 'N/A',
            status: record.tenants?.status || 'active',
            rent: rent,
            outstanding_previous: outstandingFromPrevious,
            paid: paid,
            balance: carryForward,
            carry_forward: carryForward,
          };
        });

        console.log('[v0] Loaded rent sheet data:', transformed.length, 'records');
        setSheetData(transformed);
      } catch (err) {
        console.error('[v0] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRentSheet();
  }, [selectedMonth]);

  // Format number
  const formatNum = (num: number) => {
    return (num || 0).toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Filter data
  const filteredData = sheetData.filter((row) => {
    const matchStatus = filterStatus === 'all' || row.status === filterStatus;
    const matchSearch =
      !searchTerm ||
      row.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.premises.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Calculate totals
  const totals = {
    rent: filteredData.reduce((sum, r) => sum + (r.rent || 0), 0),
    outstanding: filteredData.reduce((sum, r) => sum + (r.outstanding_previous || 0), 0),
    paid: filteredData.reduce((sum, r) => sum + (r.paid || 0), 0),
    carryForward: filteredData.reduce((sum, r) => sum + (r.carry_forward || 0), 0),
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rent Sheet</h1>
          <p className="text-gray-600">Monthly rent collection tracking</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-gray-600 text-sm">Total Rent</p>
            <p className="text-2xl font-bold text-blue-600">Rs {formatNum(totals.rent)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-gray-600 text-sm">Outstanding Previous</p>
            <p className="text-2xl font-bold text-orange-600">Rs {formatNum(totals.outstanding)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-gray-600 text-sm">Paid This Month</p>
            <p className="text-2xl font-bold text-green-600">Rs {formatNum(totals.paid)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-gray-600 text-sm">Carry Forward</p>
            <p className="text-2xl font-bold text-red-600">Rs {formatNum(totals.carryForward)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Tenants</option>
                <option value="active">Active</option>
                <option value="vacated">Vacated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Tenant name or shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
            Error: {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 text-gray-600">
            Loading rent sheet data...
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left text-sm font-semibold">#</th>
                    <th className="p-3 text-left text-sm font-semibold">Tenant Name</th>
                    <th className="p-3 text-left text-sm font-semibold">Shop</th>
                    <th className="p-3 text-right text-sm font-semibold">Rent</th>
                    <th className="p-3 text-right text-sm font-semibold">Outstanding Previous</th>
                    <th className="p-3 text-right text-sm font-semibold">Paid This Month</th>
                    <th className="p-3 text-right text-sm font-semibold">Carry Forward</th>
                    <th className="p-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((row, idx) => (
                      <tr key={row.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">{idx + 1}</td>
                        <td className="p-3 text-sm font-medium">{row.tenant_name}</td>
                        <td className="p-3 text-sm">{row.premises}</td>
                        <td className="p-3 text-sm text-right">Rs {formatNum(row.rent)}</td>
                        <td className="p-3 text-sm text-right text-orange-600 font-semibold">
                          Rs {formatNum(row.outstanding_previous)}
                        </td>
                        <td className="p-3 text-sm text-right text-green-600 font-semibold">
                          Rs {formatNum(row.paid)}
                        </td>
                        <td className="p-3 text-sm text-right text-red-600 font-bold">
                          Rs {formatNum(row.carry_forward)}
                        </td>
                        <td className="p-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              row.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-gray-500">
                        No rent records found for {selectedMonth}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Footer */}
            {filteredData.length > 0 && (
              <div className="bg-gray-50 border-t">
                <table className="w-full">
                  <tbody>
                    <tr className="font-bold text-gray-900">
                      <td colSpan={3} className="p-3 text-right">TOTAL:</td>
                      <td className="p-3 text-right text-blue-600">Rs {formatNum(totals.rent)}</td>
                      <td className="p-3 text-right text-orange-600">Rs {formatNum(totals.outstanding)}</td>
                      <td className="p-3 text-right text-green-600">Rs {formatNum(totals.paid)}</td>
                      <td className="p-3 text-right text-red-600">Rs {formatNum(totals.carryForward)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Formula Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Calculation Formula:</strong> Carry Forward = Outstanding Previous + Rent - Paid This Month
          </p>
        </div>
      </div>
    </Layout>
  );
}
