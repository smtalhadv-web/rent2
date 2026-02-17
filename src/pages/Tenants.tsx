import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Tenants() {
  const { tenants, addTenant, updateTenant } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [premises, setPremises] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [status, setStatus] = useState('active');
  const [iescoNo, setIescoNo] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  function resetForm() {
    setName(''); setPhone(''); setEmail(''); setCnic('');
    setPremises(''); setRent(''); setDeposit('');
    setStatus('active'); setIescoNo(''); setEffectiveDate('');
    setEditingId('');
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(tenant: any) {
    setEditingId(tenant.id);
    setName(tenant.name || '');
    setPhone(tenant.phone || '');
    setEmail(tenant.email || '');
    setCnic(tenant.cnic || '');
    setPremises(tenant.premises || '');
    setRent(String(tenant.rent || ''));
    setDeposit(String(tenant.deposit || ''));
    setStatus(tenant.status || 'active');
    setIescoNo(tenant.iescoNo || '');
    setEffectiveDate(tenant.effectiveDate || '');
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    var tenantData = {
      id: editingId || 'T' + Date.now(),
      name: name,
      phone: phone,
      email: email,
      cnic: cnic,
      premises: premises,
      rent: parseInt(rent) || 0,
      deposit: parseInt(deposit) || 0,
      status: status as 'active' | 'vacated' | 'suspended',
      iescoNo: iescoNo,
      effectiveDate: effectiveDate,
      depositAccountNo: '',
    };
    
    if (editingId) {
      updateTenant(tenantData);
    } else {
      addTenant(tenantData);
    }
    
    setShowForm(false);
    resetForm();
  }

  // Filter tenants
  var filteredTenants: typeof tenants = [];
  if (tenants && tenants.length > 0) {
    for (var i = 0; i < tenants.length; i++) {
      var t = tenants[i];
      if (!t) continue;
      
      if (filterStatus !== 'all' && t.status !== filterStatus) continue;
      
      if (searchTerm) {
        var search = searchTerm.toLowerCase();
        var nameMatch = t.name && t.name.toLowerCase().indexOf(search) >= 0;
        var premisesMatch = t.premises && t.premises.toLowerCase().indexOf(search) >= 0;
        var phoneMatch = t.phone && t.phone.indexOf(search) >= 0;
        if (!nameMatch && !premisesMatch && !phoneMatch) continue;
      }
      
      filteredTenants.push(t);
    }
  }

  var activeCount = 0;
  var vacatedCount = 0;
  if (tenants) {
    for (var j = 0; j < tenants.length; j++) {
      if (tenants[j] && tenants[j].status === 'active') activeCount++;
      else vacatedCount++;
    }
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">👥 Tenants</h1>
          <button
            onClick={openAddForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Tenant
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{(tenants || []).length}</p>
            <p className="text-blue-800 text-sm">Total</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-green-800 text-sm">Active</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-600">{vacatedCount}</p>
            <p className="text-gray-800 text-sm">Vacated</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="🔍 Search name, shop, phone..."
                value={searchTerm}
                onChange={function(e) { setSearchTerm(e.target.value); }}
              />
            </div>
            <div>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={filterStatus}
                onChange={function(e) { setFilterStatus(e.target.value); }}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="vacated">Vacated Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingId ? '✏️ Edit Tenant' : '➕ Add Tenant'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={name} onChange={function(e) { setName(e.target.value); }} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone (WhatsApp)</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={phone} onChange={function(e) { setPhone(e.target.value); }} placeholder="03XX-XXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={function(e) { setEmail(e.target.value); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CNIC</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={cnic} onChange={function(e) { setCnic(e.target.value); }} placeholder="XXXXX-XXXXXXX-X" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Shop / Premises *</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={premises} onChange={function(e) { setPremises(e.target.value); }} placeholder="e.g., Shop 1, G-Floor" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Monthly Rent (Rs) *</label>
                    <input type="number" className="w-full border rounded px-3 py-2" value={rent} onChange={function(e) { setRent(e.target.value); }} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Security Deposit (Rs)</label>
                    <input type="number" className="w-full border rounded px-3 py-2" value={deposit} onChange={function(e) { setDeposit(e.target.value); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">IESCO / Utility No</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={iescoNo} onChange={function(e) { setIescoNo(e.target.value); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Effective Date</label>
                    <input type="date" className="w-full border rounded px-3 py-2" value={effectiveDate} onChange={function(e) { setEffectiveDate(e.target.value); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select className="w-full border rounded px-3 py-2" value={status} onChange={function(e) { setStatus(e.target.value); }}>
                      <option value="active">✅ Active</option>
                      <option value="vacated">🚪 Vacated</option>
                      <option value="suspended">⏸️ Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">💾 Save</button>
                  <button type="button" onClick={function() { setShowForm(false); resetForm(); }} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tenants Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Shop</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-right">Rent</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length > 0 ? filteredTenants.map(function(tenant, idx) {
                  var statusColor = tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
                  return (
                    <tr key={tenant.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-medium">{tenant.name || 'N/A'}</td>
                      <td className="p-3">{tenant.premises || 'N/A'}</td>
                      <td className="p-3">{tenant.phone || '-'}</td>
                      <td className="p-3 text-right font-bold">Rs {(tenant.rent || 0).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={'px-2 py-1 rounded text-xs ' + statusColor}>{tenant.status || 'active'}</span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={function() { openEditForm(tenant); }}
                          className="text-blue-600 hover:underline"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">No tenants found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}