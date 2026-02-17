import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Dashboard() {
  const { tenants, payments, leases, rentRecords, settings } = useApp();

  // Safe calculations
  var totalRent = 0;
  var activeCount = 0;
  var vacatedCount = 0;
  var totalOutstanding = 0;
  var totalPaid = 0;

  if (tenants && tenants.length > 0) {
    for (var i = 0; i < tenants.length; i++) {
      var t = tenants[i];
      if (t && t.status === 'active') {
        totalRent += (t.rent || 0);
        activeCount++;
      } else {
        vacatedCount++;
      }
    }
  }

  // Current month payments
  var currentMonth = new Date().toISOString().slice(0, 7);
  if (payments && payments.length > 0) {
    for (var j = 0; j < payments.length; j++) {
      var p = payments[j];
      if (p && p.date && p.date.startsWith(currentMonth)) {
        totalPaid += (p.amount || 0);
      }
    }
  }

  // Outstanding from rent records
  if (rentRecords && rentRecords.length > 0) {
    for (var k = 0; k < rentRecords.length; k++) {
      var r = rentRecords[k];
      if (r && r.balance && r.balance > 0) {
        totalOutstanding += r.balance;
      }
    }
  }

  // Expiring leases
  var expiringLeases = 0;
  var today = new Date();
  if (leases && leases.length > 0) {
    for (var l = 0; l < leases.length; l++) {
      var lease = leases[l];
      if (lease && lease.endDate) {
        var endDate = new Date(lease.endDate);
        var days = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (days >= 0 && days <= 90) expiringLeases++;
      }
    }
  }

  // Top defaulters
  var defaulters: Array<{name: string; premises: string; balance: number}> = [];
  if (tenants && rentRecords) {
    for (var m = 0; m < tenants.length; m++) {
      var tenant = tenants[m];
      if (!tenant || tenant.status !== 'active') continue;
      
      var balance = 0;
      for (var n = 0; n < rentRecords.length; n++) {
        if (rentRecords[n] && rentRecords[n].tenantId === tenant.id) {
          balance = rentRecords[n].balance || 0;
        }
      }
      
      if (balance > 0) {
        defaulters.push({ name: tenant.name || '', premises: tenant.premises || '', balance: balance });
      }
    }
    defaulters.sort(function(a, b) { return b.balance - a.balance; });
  }
  var topDefaulters = defaulters.slice(0, 5);

  // Recent payments
  var recentPayments: Array<{id: string; name: string; amount: number; date: string}> = [];
  if (payments && payments.length > 0) {
    var sorted = payments.slice().sort(function(a, b) {
      return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
    });
    for (var q = 0; q < Math.min(5, sorted.length); q++) {
      var pay = sorted[q];
      var tName = 'Unknown';
      if (tenants) {
        for (var r = 0; r < tenants.length; r++) {
          if (tenants[r] && tenants[r].id === pay.tenantId) {
            tName = tenants[r].name || 'Unknown';
            break;
          }
        }
      }
      recentPayments.push({ id: pay.id, name: tName, amount: pay.amount || 0, date: pay.date || '' });
    }
  }

  function formatNum(num: number) {
    if (!num || isNaN(num)) return '0';
    return num.toLocaleString();
  }

  var plazaName = (settings && settings.plazaName) || 'Plaza Rent Management';

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Monthly Rent</p>
            <p className="text-xl font-bold text-blue-600">Rs {formatNum(totalRent)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Paid This Month</p>
            <p className="text-xl font-bold text-green-600">Rs {formatNum(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Outstanding</p>
            <p className="text-xl font-bold text-red-600">Rs {formatNum(totalOutstanding)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <p className="text-gray-500 text-sm">Active Tenants</p>
            <p className="text-xl font-bold text-indigo-600">{activeCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
            <p className="text-gray-500 text-sm">Vacated</p>
            <p className="text-xl font-bold text-gray-600">{vacatedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Leases Expiring</p>
            <p className="text-xl font-bold text-yellow-600">{expiringLeases}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Defaulters */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b bg-red-50">
              <h2 className="text-lg font-bold text-red-800">🚨 Top Defaulters</h2>
            </div>
            <div className="p-4">
              {topDefaulters.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-2">Tenant</th>
                      <th className="pb-2">Shop</th>
                      <th className="pb-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDefaulters.map(function(d, idx) {
                      return (
                        <tr key={idx} className="border-t">
                          <td className="py-2 font-medium">{d.name}</td>
                          <td className="py-2">{d.premises}</td>
                          <td className="py-2 text-right text-red-600 font-bold">Rs {formatNum(d.balance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-4">✅ No defaulters!</p>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b bg-green-50">
              <h2 className="text-lg font-bold text-green-800">💰 Recent Payments</h2>
            </div>
            <div className="p-4">
              {recentPayments.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
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
                          <td className="py-2 font-medium">{p.name}</td>
                          <td className="py-2 text-right text-green-600 font-bold">Rs {formatNum(p.amount)}</td>
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
          <h2 className="text-lg font-bold text-gray-800 mb-4">⚡ Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/rent-sheet" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">📋 Rent Sheet</a>
            <a href="/tenants" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">👥 Tenants</a>
            <a href="/whatsapp" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">💬 WhatsApp</a>
            <a href="/import" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">📥 Import Data</a>
            <a href="/settings" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm">⚙️ Settings</a>
          </div>
        </div>
      </div>
    </Layout>
  );
}