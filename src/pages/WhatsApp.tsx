import { useState, useMemo } from 'react';
import { MessageCircle, Copy, ExternalLink, Phone, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

type ReminderType = 'rent' | 'overdue' | 'lease';

export function WhatsApp() {
  const { tenants, leases, rentRecords, getWhatsAppMessage, settings } = useApp();
  const [reminderType, setReminderType] = useState<ReminderType>('rent');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentMonthYear = format(new Date(), 'yyyy-MM');

  const tenantsWithData = useMemo(() => {
    const activeTenants = tenants.filter((t) => t.status === 'active');

    return activeTenants.map((tenant) => {
      const currentRecord = rentRecords.find(
        (r) => r.tenantId === tenant.id && r.monthYear === currentMonthYear
      );
      const lease = leases.find((l) => l.tenantId === tenant.id);
      const daysToExpiry = lease ? differenceInDays(parseISO(lease.endDate), new Date()) : null;

      return {
        tenant,
        balance: currentRecord?.balance || 0,
        isPending: (currentRecord?.balance || 0) > 0,
        lease,
        daysToExpiry,
        isLeaseExpiring: daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= 60,
      };
    });
  }, [tenants, rentRecords, leases, currentMonthYear]);

  const filteredTenants = useMemo(() => {
    switch (reminderType) {
      case 'rent':
        return tenantsWithData.filter((t) => t.isPending);
      case 'overdue':
        return tenantsWithData.filter((t) => t.balance > t.tenant.monthlyRent);
      case 'lease':
        return tenantsWithData.filter((t) => t.isLeaseExpiring);
      default:
        return tenantsWithData;
    }
  }, [tenantsWithData, reminderType]);

  const handleCopyMessage = (tenantId: string) => {
    const message = getWhatsAppMessage(tenantId, reminderType);
    navigator.clipboard.writeText(message);
    setCopiedId(tenantId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsApp = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    const message = getWhatsAppMessage(tenantId, reminderType);
    if (tenant) {
      const phone = tenant.phone.replace(/[^0-9]/g, '');
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  const reminderCards = [
    {
      type: 'rent' as ReminderType,
      title: 'Rent Due Reminders',
      description: 'Send reminder for pending rent payments',
      icon: AlertCircle,
      color: 'bg-amber-500',
      count: tenantsWithData.filter((t) => t.isPending).length,
    },
    {
      type: 'overdue' as ReminderType,
      title: 'Overdue Reminders',
      description: 'Send reminder for outstanding balances',
      icon: AlertCircle,
      color: 'bg-red-500',
      count: tenantsWithData.filter((t) => t.balance > t.tenant.monthlyRent).length,
    },
    {
      type: 'lease' as ReminderType,
      title: 'Lease Expiry Reminders',
      description: 'Notify tenants about expiring leases',
      icon: Clock,
      color: 'bg-blue-500',
      count: tenantsWithData.filter((t) => t.isLeaseExpiring).length,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Reminders</h1>
            <p className="text-gray-500 mt-1">Send rent and lease reminders via WhatsApp</p>
          </div>
        </div>

        {/* Reminder Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reminderCards.map((card) => (
            <button
              key={card.type}
              onClick={() => setReminderType(card.type)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                reminderType === card.type
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{card.count}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{card.description}</p>
            </button>
          ))}
        </div>

        {/* Message Template */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Template</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{settings.whatsappTemplate}</p>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Variables: {'{{tenant}}'}, {'{{month}}'}, {'{{balance}}'} will be replaced with actual values
          </p>
        </div>

        {/* Tenants List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {reminderType === 'rent' && 'Tenants with Pending Rent'}
              {reminderType === 'overdue' && 'Tenants with Overdue Balances'}
              {reminderType === 'lease' && 'Tenants with Expiring Leases'}
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredTenants.map(({ tenant, balance, daysToExpiry }) => {
              const message = getWhatsAppMessage(tenant.id, reminderType);
              return (
                <div key={tenant.id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{tenant.name}</h4>
                        <p className="text-sm text-gray-500">{tenant.premises}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{tenant.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      {reminderType !== 'lease' ? (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Outstanding</p>
                          <p className="text-xl font-bold text-red-600">
                            Rs {balance.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Lease Expires</p>
                          <p className="text-xl font-bold text-amber-600">{daysToExpiry} days</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{message}</p>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleCopyMessage(tenant.id)}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        copiedId === tenant.id
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {copiedId === tenant.id ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Message
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenWhatsApp(tenant.id)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredTenants.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-500">
                {reminderType === 'rent' && 'No tenants with pending rent payments'}
                {reminderType === 'overdue' && 'No tenants with overdue balances'}
                {reminderType === 'lease' && 'No leases expiring within 60 days'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
