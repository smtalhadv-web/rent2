import { useMemo } from 'react';
import {
  Users,
  DollarSign,
  AlertTriangle,
  Building,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

export function Dashboard() {
  const { tenants, leases, rentRecords, payments } = useApp();

  const currentMonthYear = format(new Date(), 'yyyy-MM');

  const stats = useMemo(() => {
    const activeTenants = tenants.filter((t) => t.status === 'active');
    const vacatedTenants = tenants.filter((t) => t.status === 'vacated');
    
    const totalMonthlyRent = activeTenants.reduce((sum, t) => sum + t.monthlyRent, 0);
    
    const currentRecords = rentRecords.filter((r) => r.monthYear === currentMonthYear);
    const totalPaidThisMonth = currentRecords.reduce((sum, r) => sum + r.paid, 0);
    const totalOutstanding = currentRecords.reduce((sum, r) => sum + r.balance, 0);

    const leaseExpiringSoon = leases.filter((l) => {
      if (l.status === 'expired') return false;
      const daysToExpiry = differenceInDays(parseISO(l.endDate), new Date());
      return daysToExpiry > 0 && daysToExpiry <= 60;
    }).length;

    return {
      totalMonthlyRent,
      totalPaidThisMonth,
      totalOutstanding,
      activeTenantsCount: activeTenants.length,
      vacatedShopsCount: vacatedTenants.length,
      leaseExpiringSoon,
    };
  }, [tenants, leases, rentRecords, currentMonthYear]);

  const recentPayments = useMemo(() => {
    return payments
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 5);
  }, [payments]);

  const defaulters = useMemo(() => {
    return rentRecords
      .filter((r) => r.monthYear === currentMonthYear && r.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);
  }, [rentRecords, currentMonthYear]);

  const expiringLeases = useMemo(() => {
    return leases
      .filter((l) => {
        if (l.status === 'expired') return false;
        const daysToExpiry = differenceInDays(parseISO(l.endDate), new Date());
        return daysToExpiry > 0 && daysToExpiry <= 90;
      })
      .sort((a, b) => differenceInDays(parseISO(a.endDate), parseISO(b.endDate)));
  }, [leases]);

  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM');
      
      const records = rentRecords.filter((r) => r.monthYear === monthYear);
      const rent = records.reduce((sum, r) => sum + r.rent, 0);
      const paid = records.reduce((sum, r) => sum + r.paid, 0);
      
      months.push({ month: monthName, rent, paid });
    }
    return months;
  }, [rentRecords]);

  const statusData = useMemo(() => {
    const active = tenants.filter((t) => t.status === 'active').length;
    const vacated = tenants.filter((t) => t.status === 'vacated').length;
    const suspended = tenants.filter((t) => t.status === 'suspended').length;
    
    return [
      { name: 'Active', value: active, color: '#22c55e' },
      { name: 'Vacated', value: vacated, color: '#ef4444' },
      { name: 'Suspended', value: suspended, color: '#f59e0b' },
    ].filter((d) => d.value > 0);
  }, [tenants]);

  const getTenantName = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId)?.name || 'Unknown';
  };

  const getTenantPremises = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId)?.premises || '-';
  };

  const statCards = [
    {
      title: 'Total Monthly Rent',
      value: `Rs ${stats.totalMonthlyRent.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-blue-500',
      change: '+5%',
      isPositive: true,
    },
    {
      title: 'Collected This Month',
      value: `Rs ${stats.totalPaidThisMonth.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: `${Math.round((stats.totalPaidThisMonth / stats.totalMonthlyRent) * 100) || 0}%`,
      isPositive: true,
    },
    {
      title: 'Outstanding Balance',
      value: `Rs ${stats.totalOutstanding.toLocaleString()}`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '',
      isPositive: false,
    },
    {
      title: 'Active Tenants',
      value: stats.activeTenantsCount.toString(),
      icon: Users,
      color: 'bg-indigo-500',
      change: '',
      isPositive: true,
    },
    {
      title: 'Vacated Shops',
      value: stats.vacatedShopsCount.toString(),
      icon: Building,
      color: 'bg-gray-500',
      change: '',
      isPositive: false,
    },
    {
      title: 'Lease Expiring Soon',
      value: stats.leaseExpiringSoon.toString(),
      icon: Clock,
      color: 'bg-amber-500',
      change: 'Within 60 days',
      isPositive: false,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">{format(new Date(), 'MMMM yyyy')} Overview</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <span
                    className={`flex items-center text-sm font-medium ${
                      stat.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.isPositive ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Rent vs Collection</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${(value / 1000)}k`} />
                  <Tooltip
                    formatter={(value) => `Rs ${Number(value).toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="rent" name="Rent Due" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paid" name="Collected" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Status</h3>
            <div className="h-64 flex items-center justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">No tenant data</p>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
            <div className="space-y-4">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {getTenantName(payment.tenantId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(parseISO(payment.paymentDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <span className="font-semibold text-green-600 text-sm">
                      Rs {payment.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent payments</p>
              )}
            </div>
          </div>

          {/* Defaulters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Defaulters</h3>
            <div className="space-y-4">
              {defaulters.length > 0 ? (
                defaulters.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {getTenantName(record.tenantId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTenantPremises(record.tenantId)}
                      </p>
                    </div>
                    <span className="font-semibold text-red-600 text-sm">
                      Rs {record.balance.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No defaulters</p>
              )}
            </div>
          </div>

          {/* Expiring Leases */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiring Leases</h3>
            <div className="space-y-4">
              {expiringLeases.length > 0 ? (
                expiringLeases.map((lease) => {
                  const daysLeft = differenceInDays(parseISO(lease.endDate), new Date());
                  return (
                    <div
                      key={lease.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {getTenantName(lease.tenantId)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Expires: {format(parseISO(lease.endDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          daysLeft <= 30
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {daysLeft} days
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No expiring leases</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
