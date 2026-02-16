import { useState } from 'react';
import { Plus, Search, Edit2, FileText, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO, differenceInDays, addMonths } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { Lease, LeaseStatus } from '../types';

export function Leases() {
  const { tenants, leases, addLease, updateLease, applyRentIncrement, user, rentHistory } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaseStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showIncrementModal, setShowIncrementModal] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tenantId: '',
    startDate: '',
    endDate: '',
    durationMonths: 12,
    incrementPercent: 10,
    reminderDays: 30,
    status: 'running' as LeaseStatus,
  });

  const tenantsWithoutLease = tenants.filter(
    (t) => t.status === 'active' && !leases.find((l) => l.tenantId === t.id)
  );

  const filteredLeases = leases.filter((lease) => {
    const tenant = tenants.find((t) => t.id === lease.tenantId);
    const matchesSearch =
      tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant?.premises.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lease.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTenantName = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId)?.name || 'Unknown';
  };

  const getTenantPremises = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId)?.premises || '-';
  };

  const getTenantRent = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId)?.monthlyRent || 0;
  };

  const resetForm = () => {
    setFormData({
      tenantId: '',
      startDate: '',
      endDate: '',
      durationMonths: 12,
      incrementPercent: 10,
      reminderDays: 30,
      status: 'running',
    });
    setEditingLease(null);
  };

  const handleOpenModal = (lease?: Lease) => {
    if (lease) {
      setEditingLease(lease);
      setFormData({
        tenantId: lease.tenantId,
        startDate: lease.startDate,
        endDate: lease.endDate,
        durationMonths: lease.durationMonths,
        incrementPercent: lease.incrementPercent,
        reminderDays: lease.reminderDays,
        status: lease.status,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleDurationChange = (months: number) => {
    if (formData.startDate) {
      const endDate = addMonths(parseISO(formData.startDate), months);
      setFormData({
        ...formData,
        durationMonths: months,
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
    } else {
      setFormData({ ...formData, durationMonths: months });
    }
  };

  const handleStartDateChange = (startDate: string) => {
    const endDate = addMonths(parseISO(startDate), formData.durationMonths);
    setFormData({
      ...formData,
      startDate,
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLease) {
      updateLease(editingLease.id, formData);
    } else {
      addLease(formData);
    }
    handleCloseModal();
  };

  const handleRenew = (lease: Lease) => {
    const newStartDate = parseISO(lease.endDate);
    const newEndDate = addMonths(newStartDate, lease.durationMonths);
    updateLease(lease.id, {
      startDate: format(newStartDate, 'yyyy-MM-dd'),
      endDate: format(newEndDate, 'yyyy-MM-dd'),
      status: 'renewed',
    });
  };

  const handleApplyIncrement = () => {
    if (selectedTenantId) {
      applyRentIncrement(selectedTenantId);
      setShowIncrementModal(false);
      setSelectedTenantId(null);
    }
  };

  const getStatusBadge = (status: LeaseStatus) => {
    const styles = {
      running: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      renewed: 'bg-blue-100 text-blue-800',
    };
    const icons = {
      running: CheckCircle,
      expired: AlertTriangle,
      renewed: Clock,
    };
    const Icon = icons[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getExpiryInfo = (lease: Lease) => {
    const daysToExpiry = differenceInDays(parseISO(lease.endDate), new Date());
    if (daysToExpiry < 0) {
      return { text: 'Expired', color: 'text-red-600', urgent: true };
    } else if (daysToExpiry <= 30) {
      return { text: `${daysToExpiry} days left`, color: 'text-red-600', urgent: true };
    } else if (daysToExpiry <= 60) {
      return { text: `${daysToExpiry} days left`, color: 'text-amber-600', urgent: false };
    }
    return { text: `${daysToExpiry} days left`, color: 'text-green-600', urgent: false };
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lease Management</h1>
            <p className="text-gray-500 mt-1">Track and manage lease agreements</p>
          </div>
          {isAdmin && tenantsWithoutLease.length > 0 && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Lease
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tenant name or premises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeaseStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="expired">Expired</option>
              <option value="renewed">Renewed</option>
            </select>
          </div>
        </div>

        {/* Leases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeases.map((lease) => {
            const expiryInfo = getExpiryInfo(lease);
            const tenantRent = getTenantRent(lease.tenantId);
            const tenantHistory = rentHistory.filter((h) => h.tenantId === lease.tenantId);
            
            return (
              <div
                key={lease.id}
                className={`bg-white rounded-xl shadow-sm border ${
                  expiryInfo.urgent ? 'border-red-200' : 'border-gray-100'
                } p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{getTenantName(lease.tenantId)}</h3>
                    <p className="text-sm text-gray-500">{getTenantPremises(lease.tenantId)}</p>
                  </div>
                  {getStatusBadge(lease.status)}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Start Date</span>
                    <span className="font-medium">{format(parseISO(lease.startDate), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">End Date</span>
                    <span className="font-medium">{format(parseISO(lease.endDate), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium">{lease.durationMonths} months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Annual Increment</span>
                    <span className="font-medium">{lease.incrementPercent}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current Rent</span>
                    <span className="font-medium text-indigo-600">Rs {tenantRent.toLocaleString()}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg ${expiryInfo.urgent ? 'bg-red-50' : 'bg-gray-50'} mb-4`}>
                  <p className={`text-sm font-medium ${expiryInfo.color}`}>{expiryInfo.text}</p>
                </div>

                {tenantHistory.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">Rent History</p>
                    {tenantHistory.slice(-2).map((h) => (
                      <p key={h.id} className="text-xs text-blue-800">
                        Rs {h.oldRent.toLocaleString()} → Rs {h.newRent.toLocaleString()} (+{h.incrementPercent}%)
                      </p>
                    ))}
                  </div>
                )}

                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(lease)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    {lease.status !== 'running' && (
                      <button
                        onClick={() => handleRenew(lease)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Renew
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTenantId(lease.tenantId);
                        setShowIncrementModal(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      +{lease.incrementPercent}%
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredLeases.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No leases found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseModal} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingLease ? 'Edit Lease' : 'Add New Lease'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tenant *</label>
                  <select
                    required
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    disabled={!!editingLease}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Tenant</option>
                    {editingLease ? (
                      <option value={editingLease.tenantId}>
                        {getTenantName(editingLease.tenantId)} - {getTenantPremises(editingLease.tenantId)}
                      </option>
                    ) : (
                      tenantsWithoutLease.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} - {t.premises}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Months)</label>
                    <select
                      value={formData.durationMonths}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                      <option value={24}>24 Months</option>
                      <option value={36}>36 Months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Increment %
                    </label>
                    <input
                      type="number"
                      value={formData.incrementPercent}
                      onChange={(e) =>
                        setFormData({ ...formData, incrementPercent: Number(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Days
                    </label>
                    <select
                      value={formData.reminderDays}
                      onChange={(e) =>
                        setFormData({ ...formData, reminderDays: Number(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={30}>30 Days Before</option>
                      <option value={60}>60 Days Before</option>
                      <option value={90}>90 Days Before</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as LeaseStatus })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="running">Running</option>
                    <option value="expired">Expired</option>
                    <option value="renewed">Renewed</option>
                  </select>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingLease ? 'Update Lease' : 'Add Lease'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Increment Modal */}
      {showIncrementModal && selectedTenantId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowIncrementModal(false)}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply Rent Increment</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to apply the annual rent increment for{' '}
                <strong>{getTenantName(selectedTenantId)}</strong>?
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-indigo-800">
                  Current Rent: <strong>Rs {getTenantRent(selectedTenantId).toLocaleString()}</strong>
                </p>
                <p className="text-sm text-indigo-800">
                  New Rent:{' '}
                  <strong>
                    Rs{' '}
                    {Math.round(
                      getTenantRent(selectedTenantId) *
                        (1 + (leases.find((l) => l.tenantId === selectedTenantId)?.incrementPercent || 10) / 100)
                    ).toLocaleString()}
                  </strong>
                </p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowIncrementModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyIncrement}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Apply Increment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
