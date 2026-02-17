import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function WhatsApp() {
  const { tenants, rentRecords, settings } = useApp();
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [filterType, setFilterType] = useState('outstanding');
  const [copiedId, setCopiedId] = useState('');

  var plazaName = (settings && settings.plazaName) || 'Plaza Management';

  function formatNum(num: number) {
    if (!num || isNaN(num)) return '0';
    return num.toLocaleString();
  }

  // Get tenants with balances
  var tenantsWithData: Array<{
    id: string;
    name: string;
    phone: string;
    premises: string;
    rent: number;
    outstanding: number;
    balance: number;
  }> = [];

  if (tenants && tenants.length > 0) {
    for (var i = 0; i < tenants.length; i++) {
      var t = tenants[i];
      if (!t || t.status !== 'active') continue;
      
      var rentRecord = null;
      if (rentRecords && rentRecords.length > 0) {
        for (var j = 0; j < rentRecords.length; j++) {
          if (rentRecords[j] && rentRecords[j].tenantId === t.id && rentRecords[j].monthYear === selectedMonth) {
            rentRecord = rentRecords[j];
            break;
          }
        }
      }
      
      var rent = t.rent || 0;
      var outstanding = rentRecord ? (rentRecord.outstanding || 0) : 0;
      var balance = rentRecord ? (rentRecord.balance || 0) : rent + outstanding;
      
      if (filterType === 'outstanding' && balance <= 0) continue;
      if (filterType === 'all' && !t.phone) continue;
      
      tenantsWithData.push({
        id: t.id,
        name: t.name || 'Unknown',
        phone: t.phone || '',
        premises: t.premises || '',
        rent: rent,
        outstanding: outstanding,
        balance: balance,
      });
    }
  }

  function generateMessage(tenant: typeof tenantsWithData[0]) {
    var message = 'Dear ' + tenant.name + ',\n\n';
    message += '📋 *Rent Reminder for ' + selectedMonth + '*\n\n';
    message += '🏠 Shop: ' + tenant.premises + '\n';
    message += '💰 Monthly Rent: Rs ' + formatNum(tenant.rent) + '\n';
    if (tenant.outstanding > 0) {
      message += '📊 Previous Outstanding: Rs ' + formatNum(tenant.outstanding) + '\n';
    }
    message += '━━━━━━━━━━━━\n';
    message += '💵 *Total Due: Rs ' + formatNum(tenant.balance) + '*\n\n';
    message += 'Please pay at your earliest convenience.\n\n';
    message += 'Regards,\n' + plazaName;
    return message;
  }

  function copyMessage(tenant: typeof tenantsWithData[0]) {
    var message = generateMessage(tenant);
    navigator.clipboard.writeText(message);
    setCopiedId(tenant.id);
    setTimeout(function() { setCopiedId(''); }, 2000);
  }

  function openWhatsApp(tenant: typeof tenantsWithData[0]) {
    var message = generateMessage(tenant);
    var phone = (tenant.phone || '').replace(/[^0-9]/g, '');
    if (phone.length >= 10) {
      phone = '92' + phone.slice(-10);
    }
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(message), '_blank');
  }

  function sendToAll() {
    if (tenantsWithData.length === 0) return;
    alert('Opening WhatsApp for ' + tenantsWithData.length + ' tenants. Please send each message manually.');
    for (var k = 0; k < tenantsWithData.length; k++) {
      setTimeout(function(tenant) {
        openWhatsApp(tenant);
      }, k * 2000, tenantsWithData[k]);
    }
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">💬 WhatsApp Reminders</h1>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={filterType}
                onChange={function(e) { setFilterType(e.target.value); }}
              >
                <option value="outstanding">Outstanding Only</option>
                <option value="all">All Active Tenants</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={sendToAll}
                disabled={tenantsWithData.length === 0}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                📤 Send to All ({tenantsWithData.length})
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            📌 <strong>{tenantsWithData.length}</strong> tenants with outstanding balance for {selectedMonth}
          </p>
        </div>

        {/* Tenants List */}
        <div className="space-y-4">
          {tenantsWithData.length > 0 ? tenantsWithData.map(function(tenant) {
            return (
              <div key={tenant.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{tenant.name}</h3>
                    <p className="text-gray-600">🏠 {tenant.premises} | 📞 {tenant.phone || 'No phone'}</p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span>Rent: <strong>Rs {formatNum(tenant.rent)}</strong></span>
                      <span className="text-orange-600">Outstanding: <strong>Rs {formatNum(tenant.outstanding)}</strong></span>
                      <span className="text-red-600">Balance: <strong>Rs {formatNum(tenant.balance)}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={function() { copyMessage(tenant); }}
                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      {copiedId === tenant.id ? '✅ Copied!' : '📋 Copy'}
                    </button>
                    <button
                      onClick={function() { openWhatsApp(tenant); }}
                      disabled={!tenant.phone}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm"
                    >
                      💬 WhatsApp
                    </button>
                  </div>
                </div>
                
                {/* Message Preview */}
                <div className="mt-3 bg-gray-50 rounded p-3 text-sm">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700">{generateMessage(tenant)}</pre>
                </div>
              </div>
            );
          }) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              <p className="text-4xl mb-4">✅</p>
              <p>No tenants with outstanding balance!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}