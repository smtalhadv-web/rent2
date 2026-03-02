import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function RentSheet() {
  const { tenants, rentRecords } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7);
  });

  // Format number with commas and 0 decimals
  const formatNum = (num: number) => {
    return (num || 0).toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Get rent data for a tenant in a specific month
  const getRentData = (tenantId: string, monthYear: string) => {
    const rentRecord = rentRecords?.find(
      (r) => r.tenantId === tenantId && r.monthYear === monthYear
    );

    if (rentRecord) {
      return {
        rent: rentRecord.rent || 0,
        outstanding: rentRecord.outstandingPrevious || 0,
        paid: rentRecord.paid || 0,
        carryForward: rentRecord.carryForward || rentRecord.balance || 0,
      };
    }

    // Return default values if no record exists
    const tenant = tenants?.find((t) => t.id === tenantId);
    return {
      rent: tenant?.monthlyRent || 0,
      outstanding: 0,
      paid: 0,
      carryForward: tenant?.monthlyRent || 0,
    };
  };

  // Filter tenants
  const filteredTenants = (tenants || []).filter((t) => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSearch =
      !searchTerm ||
      (t.name && t.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.premises && t.premises.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.phone && t.phone.includes(searchTerm));
    return matchStatus && matchSearch;
  });

  // Calculate totals
  let totalRent = 0;
  let totalOutstanding = 0;
  let totalPaid = 0;
  let totalCarryForward = 0;

  for (let i = 0; i < filteredTenants.length; i++) {
    const data = getRentData(filteredTenants[i].id, selectedMonth);
    totalRent += data.rent;
    totalOutstanding += data.outstanding;
    totalPaid += data.paid;
    totalCarryForward += data.carryForward;
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rent Sheet</h1>
          <p className="text-gray-600">Manage and track monthly rent collection</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Rent</p>
            <p className="text-2xl font-bold text-blue-600">Rs {formatNum(totalRent)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Outstanding Previous</p>
            <p className="text-2xl font-bold text-orange-600">Rs {formatNum(totalOutstanding)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">Rs {formatNum(totalPaid)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Carry Forward</p>
            <p className="text-2xl font-bold text-red-600">Rs {formatNum(totalCarryForward)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Tenant Name</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Shop</th>
                  <th className="p-3 text-right text-sm font-semibold text-gray-700">Rent</th>
                  <th className="p-3 text-right text-sm font-semibold text-gray-700">Outstanding Previous</th>
                  <th className="p-3 text-right text-sm font-semibold text-gray-700">Paid This Month</th>
                  <th className="p-3 text-right text-sm font-semibold text-gray-700">Carry Forward</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant, idx) => {
                    const data = getRentData(tenant.id, selectedMonth);
                    const carryForwardColor =
                      data.carryForward > 0 ? 'text-red-600' : 'text-green-600';

                    return (
                      <tr key={tenant.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">{idx + 1}</td>
                        <td className="p-3 text-sm font-medium">{tenant.name || 'N/A'}</td>
                        <td className="p-3 text-sm">{tenant.premises || 'N/A'}</td>
                        <td className="p-3 text-sm text-right font-medium">
                          Rs {formatNum(data.rent)}
                        </td>
                        <td className="p-3 text-sm text-right text-orange-600 font-medium">
                          Rs {formatNum(data.outstanding)}
                        </td>
                        <td className="p-3 text-sm text-right text-green-600 font-medium">
                          Rs {formatNum(data.paid)}
                        </td>
                        <td className={`p-3 text-sm text-right font-bold ${carryForwardColor}`}>
                          Rs {formatNum(data.carryForward)}
                        </td>
                        <td className="p-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              tenant.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {tenant.status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-500">
                      No tenants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Totals */}
          <div className="bg-gray-50 border-t">
            <table className="w-full">
              <tbody>
                <tr className="font-bold">
                  <td colSpan={3} className="p-3 text-right">TOTAL:</td>
                  <td className="p-3 text-right text-blue-600">Rs {formatNum(totalRent)}</td>
                  <td className="p-3 text-right text-orange-600">Rs {formatNum(totalOutstanding)}</td>
                  <td className="p-3 text-right text-green-600">Rs {formatNum(totalPaid)}</td>
                  <td className="p-3 text-right text-red-600">Rs {formatNum(totalCarryForward)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
