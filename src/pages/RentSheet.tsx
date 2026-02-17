import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function RentSheet() {
  const { tenants, rentRecords } = useApp();
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tenants based on status
  var filteredTenants: typeof tenants = [];
  for (var i = 0; i < tenants.length; i++) {
    var t = tenants[i];
    
    // Filter by status
    if (filterStatus === 'active' && t.status !== 'active') continue;
    if (filterStatus === 'vacated' && t.status !== 'vacated') continue;
    
    // Filter by search
    if (searchTerm) {
      var search = searchTerm.toLowerCase();
      var nameMatch = t.name && t.name.toLowerCase().indexOf(search) >= 0;
      var premisesMatch = t.premises && t.premises.toLowerCase().indexOf(search) >= 0;
      if (!nameMatch && !premisesMatch) continue;
    }
    
    filteredTenants.push(t);
  }

  // Get rent data for each tenant
  function getRentData(tenantId: string) {
    for (var j = 0; j < rentRecords.length; j++) {
      if (rentRecords[j].tenantId === tenantId && rentRecords[j].monthYear === selectedMonth) {
        return rentRecords[j];
      }
    }
    return null;
  }

  // Calculate totals
  var totalRent = 0;
  var totalOutstanding = 0;
  var totalPaid = 0;
  var totalBalance = 0;

  for (var k = 0; k < filteredTenants.length; k++) {
    var tenant = filteredTenants[k];
    var rentData = getRentData(tenant.id);
    
    var rent = tenant.rent || 0;
    var outstanding = rentData ? (rentData.outstanding || 0) : 0;
    var paid = rentData ? (rentData.paid || 0) : 0;
    var balance = rentData ? (rentData.balance || 0) : rent;
    
    totalRent = totalRent + rent;
    totalOutstanding = totalOutstanding + outstanding;
    totalPaid = totalPaid + paid;
    totalBalance = totalBalance + balance;
  }

  function handlePrint() {
    window.print();
  }

  function handleExport() {
    var csv = 'Sr No,Tenant Name,Premises,Monthly Rent,Outstanding,Paid,Balance\n';
    
    for (var m = 0; m < filteredTenants.length; m++) {
      var t = filteredTenants[m];
      var rd = getRentData(t.id);
      
      var rent = t.rent || 0;
      var outstanding = rd ? (rd.outstanding || 0) : 0;
      var paid = rd ? (rd.paid || 0) : 0;
      var balance = rd ? (rd.balance || 0) : rent;
      
      csv += (m + 1) + ',';
      csv += '"' + (t.name || '') + '",';
      csv += '"' + (t.premises || '') + '",';
      csv += rent + ',';
      csv += outstanding + ',';
      csv += paid + ',';
      csv += balance + '\n';
    }
    
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'rent-sheet-' + selectedMonth + '.csv';
    a.click();
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Rent Sheet - {selectedMonth}</h1>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              📊 Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="month"
                className="w-full border rounded-lg px-3 py-2"
                value={selectedMonth}
                onChange={function(e) { setSelectedMonth(e.target.value); }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={filterStatus}
                onChange={function(e) { setFilterStatus(e.target.value); }}
              >
                <option value="all">All Tenants</option>
                <option value="active">Active Only</option>
                <option value="vacated">Vacated Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Search tenant or shop..."
                value={searchTerm}
                onChange={function(e) { setSearchTerm(e.target.value); }}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-600 text-sm">Total Rent</p>
            <p className="text-xl font-bold text-blue-800">Rs {totalRent.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-600 text-sm">Outstanding</p>
            <p className="text-xl font-bold text-orange-800">Rs {totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 text-sm">Total Paid</p>
            <p className="text-xl font-bold text-green-800">Rs {totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">Total Balance</p>
            <p className="text-xl font-bold text-red-800">Rs {totalBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Rent Sheet Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Sr#</th>
                  <th className="p-3 text-left">Tenant Name</th>
                  <th className="p-3 text-left">Premises</th>
                  <th className="p-3 text-right">Monthly Rent</th>
                  <th className="p-3 text-right">Outstanding</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map(function(tenant, index) {
                    var rentData = getRentData(tenant.id);
                    
                    var rent = tenant.rent || 0;
                    var outstanding = rentData ? (rentData.outstanding || 0) : 0;
                    var paid = rentData ? (rentData.paid || 0) : 0;
                    var balance = rentData ? (rentData.balance || 0) : rent;
                    
                    var balanceColor = 'text-gray-800';
                    if (balance > 0) balanceColor = 'text-red-600';
                    if (balance < 0) balanceColor = 'text-green-600';
                    
                    return (
                      <tr key={tenant.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">{tenant.name || 'N/A'}</td>
                        <td className="p-3">{tenant.premises || 'N/A'}</td>
                        <td className="p-3 text-right">{rent.toLocaleString()}</td>
                        <td className="p-3 text-right text-orange-600">{outstanding.toLocaleString()}</td>
                        <td className="p-3 text-right text-green-600">{paid.toLocaleString()}</td>
                        <td className={'p-3 text-right font-bold ' + balanceColor}>
                          {balance.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          {tenant.status === 'active' ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Vacated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No tenants found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="p-3" colSpan={3}>TOTAL</td>
                  <td className="p-3 text-right">{totalRent.toLocaleString()}</td>
                  <td className="p-3 text-right text-orange-600">{totalOutstanding.toLocaleString()}</td>
                  <td className="p-3 text-right text-green-600">{totalPaid.toLocaleString()}</td>
                  <td className="p-3 text-right text-red-600">{totalBalance.toLocaleString()}</td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}