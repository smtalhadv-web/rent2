import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Dashboard() {
  const { tenants, payments, leases, rentRecords } = useApp();

  // Calculate stats safely
  var totalRent = 0;
  var activeCount = 0;
  var vacatedCount = 0;

  for (var i = 0; i < tenants.length; i++) {
    if (tenants[i].status === 'active') {
      totalRent = totalRent + tenants[i].rent;
      activeCount = activeCount + 1;
    } else {
      vacatedCount = vacatedCount + 1;
    }
  }

  // Calculate total paid this month
  var currentMonth = new Date().toISOString().slice(0, 7);
  var totalPaid = 0;
  for (var j = 0; j < payments.length; j++) {
    if (payments[j].date && payments[j].date.startsWith(currentMonth)) {
      totalPaid = totalPaid + payments[j].amount;
    }
  }

  // Calculate outstanding
  var totalOutstanding = 0;
  for (var k = 0; k < rentRecords.length; k++) {
    if (rentRecords[k].balance > 0) {
      totalOutstanding = totalOutstanding + rentRecords[k].balance;
    }
  }

  // Leases expiring soon (next 90 days)
  var expiringLeases = 0;
  var today = new Date();
  for (var l = 0; l < leases.length; l++) {
    var endDate = new Date(leases[l].endDate);
    var diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 90) {
      expiringLeases = expiringLeases + 1;
    }
  }

  // Top 5 defaulters
  var defaulters: Array<{name: string; premises: string; balance: number}> = [];
  for (var m = 0; m < tenants.length; m++) {
    var tenant = tenants[m];
    if (tenant.status !== 'active') continue;
    
    var tenantBalance = 0;
    for (var n = 0; n < rentRecords.length; n++) {
      if (rentRecords[n].tenantId === tenant.id && rentRecords[n].balance > 0) {
        tenantBalance = rentRecords[n].balance;
      }
    }
    
    if (tenantBalance > 0) {
      defaulters.push({
        name: tenant.name,
        premises: tenant.premises,
        balance: tenantBalance
      });
    }
  }
  
  defaulters.sort(function(a, b) { return b.balance - a.balance; });
  var topDefaulters = defaulters.slice(0, 5);

  // Recent payments
  var recentPayments: Array<{id: string; tenantName: string; amount: number; date: string}> = [];
  var sortedPayments = payments.slice().sort(function(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  for (var p = 0; p < Math.min(5, sortedPayments.length); p++) {
    var payment = sortedPayments[p];
    var paymentTenant = null;
    for (var q = 0; q < tenants.length; q++) {
      if (tenants[q].id === payment.tenantId) {
        paymentTenant = tenants[q];
        break;
      }
    }
    recentPayments.push({
      id: payment.id,
      tenantName: paymentTenant ? paymentTenant.name : 'Unknown',
      amount: payment.amount,
      date: payment.date
    });
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Monthly Rent</p>
            <p className="text-xl font-bold text-blue-600">Rs {totalRent.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Paid This Month</p>
            <p className="text-xl font-bold text-green-600">Rs {totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Outstanding</p>
            <p className="text-xl font-bold text-red-600">Rs {totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Active Tenants</p>
            <p className="text-xl font-bold text-blue-600">{activeCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Vacated</p>
            <p className="text-xl font-bold text-gray-600">{vacatedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Leases Expiring</p>
            <p className="text-xl font-bold text-yellow-600">{expiringLeases}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Defaulters */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Top Defaulters</h2>
            </div>
            <div className="p-4">
              {topDefaulters.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm">
                      <th className="pb-2">Tenant</th>
                      <th className="pb-2">Shop</th>
                      <th className="pb-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDefaulters.map(function(d, idx) {
                      return (
                        <tr key={idx} className="border-t">
                          <td className="py-2">{d.name}</td>
                          <td className="py-2">{d.premises}</td>
                          <td className="py-2 text-right text-red-600 font-bold">
                            Rs {d.balance.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-4">No defaulters</p>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Recent Payments</h2>
            </div>
            <div className="p-4">
              {recentPayments.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Tenant</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map(function(p) {
                      return (
                        <tr key={p.id} className="border-t">
                          <td className="py-2">{p.date}</td>
                          <td className="py-2">{p.tenantName}</td>
                          <td className="py-2 text-right text-green-600 font-bold">
                            Rs {p.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent payments</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <a href="/payments" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              + Add Payment
            </a>
            <a href="/tenants" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + Add Tenant
            </a>
            <a href="/rent-sheet" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              View Rent Sheet
            </a>
            <a href="/invoice" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
              Generate Invoice
            </a>
            <a href="/whatsapp" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
              WhatsApp Reminders
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}