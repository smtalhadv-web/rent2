import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function RentSheet() {
  const { tenants, rentRecords, payments, leases, settings, addPayment, updateTenant, addLease, updateLease } = useApp();
  
  // State
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [filterStatus, setFilterStatus] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  
  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentTransactionNo, setPaymentTransactionNo] = useState('');
  const [paymentDepositAccount, setPaymentDepositAccount] = useState('');
  
  // Tenant Form
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantCnic, setTenantCnic] = useState('');
  const [tenantPremises, setTenantPremises] = useState('');
  const [tenantRent, setTenantRent] = useState('');
  const [tenantDeposit, setTenantDeposit] = useState('');
  const [tenantStatus, setTenantStatus] = useState('active');
  const [tenantIescoNo, setTenantIescoNo] = useState('');
  const [tenantEffectiveDate, setTenantEffectiveDate] = useState('');
  
  // Lease Form
  const [leaseStartDate, setLeaseStartDate] = useState('');
  const [leaseEndDate, setLeaseEndDate] = useState('');
  const [leaseIncrement, setLeaseIncrement] = useState('10');
  const [leaseReminderDays, setLeaseReminderDays] = useState('30');

  // Safe settings
  var plazaName = (settings && settings.plazaName) ? settings.plazaName : 'PLAZA RENT';
  var plazaAddress = (settings && settings.address) ? settings.address : '';
  var plazaPhone = (settings && settings.phone) ? settings.phone : '';

  // Format number safely
  function formatNum(num: number | undefined | null): string {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return num.toLocaleString();
  }

  // Filter tenants
  var filteredTenants: typeof tenants = [];
  if (tenants && tenants.length > 0) {
    for (var i = 0; i < tenants.length; i++) {
      var t = tenants[i];
      if (!t) continue;
      
      if (filterStatus === 'active' && t.status !== 'active') continue;
      if (filterStatus === 'vacated' && t.status !== 'vacated') continue;
      
      if (searchTerm) {
        var search = searchTerm.toLowerCase();
        var nameMatch = t.name && t.name.toLowerCase().indexOf(search) >= 0;
        var premisesMatch = t.premises && t.premises.toLowerCase().indexOf(search) >= 0;
        if (!nameMatch && !premisesMatch) continue;
      }
      
      filteredTenants.push(t);
    }
  }

  // Get rent record
  function getRentRecord(tenantId: string) {
    if (!rentRecords || rentRecords.length === 0) return null;
    for (var j = 0; j < rentRecords.length; j++) {
      if (rentRecords[j] && rentRecords[j].tenantId === tenantId && rentRecords[j].monthYear === selectedMonth) {
        return rentRecords[j];
      }
    }
    return null;
  }

  // Get lease for tenant
  function getLease(tenantId: string) {
    if (!leases || leases.length === 0) return null;
    for (var k = 0; k < leases.length; k++) {
      if (leases[k] && leases[k].tenantId === tenantId) {
        return leases[k];
      }
    }
    return null;
  }

  // Get tenant payments
  function getTenantPayments(tenantId: string) {
    var result: typeof payments = [];
    if (!payments || payments.length === 0) return result;
    for (var l = 0; l < payments.length; l++) {
      if (payments[l] && payments[l].tenantId === tenantId) {
        result.push(payments[l]);
      }
    }
    result.sort(function(a, b) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return result;
  }

  // Get selected tenant
  function getSelectedTenant() {
    if (!selectedTenantId || !tenants) return null;
    for (var m = 0; m < tenants.length; m++) {
      if (tenants[m] && tenants[m].id === selectedTenantId) {
        return tenants[m];
      }
    }
    return null;
  }

  // Calculate totals
  var totalRent = 0;
  var totalOutstanding = 0;
  var totalPaid = 0;
  var totalBalance = 0;

  for (var n = 0; n < filteredTenants.length; n++) {
    var tenant = filteredTenants[n];
    var rentData = getRentRecord(tenant.id);
    
    var rent = tenant.rent || 0;
    var outstanding = rentData ? (rentData.outstanding || 0) : 0;
    var paid = rentData ? (rentData.paid || 0) : 0;
    var balance = rentData ? (rentData.balance || 0) : rent + outstanding;
    
    totalRent += rent;
    totalOutstanding += outstanding;
    totalPaid += paid;
    totalBalance += balance;
  }

  // Open Payment Modal
  function openPaymentModal(tenantId: string) {
    setSelectedTenantId(tenantId);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('cash');
    setPaymentTransactionNo('');
    setPaymentDepositAccount('');
    setShowPaymentModal(true);
  }

  // Submit Payment
  function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTenantId || !paymentAmount) return;
    
    addPayment({
      id: 'P' + Date.now(),
      tenantId: selectedTenantId,
      amount: parseInt(paymentAmount),
      date: paymentDate,
      method: paymentMethod as 'cash' | 'bank' | 'online',
      transactionNo: paymentTransactionNo,
      depositedAccount: paymentDepositAccount,
      monthYear: selectedMonth,
    });
    
    setShowPaymentModal(false);
    alert('Payment saved!');
  }

  // Print Receipt
  function printReceipt() {
    var tenant = getSelectedTenant();
    if (!tenant) return;

    var printWindow = window.open('', '_blank');
    if (!printWindow) return;

    var html = '<!DOCTYPE html><html><head><title>Receipt</title>';
    html += '<style>';
    html += 'body { font-family: Arial; padding: 40px; max-width: 400px; margin: 0 auto; }';
    html += '.box { border: 2px solid #000; padding: 20px; }';
    html += '.center { text-align: center; }';
    html += '.title { background: #000; color: #fff; padding: 10px; text-align: center; margin: 10px 0; }';
    html += '.row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ccc; }';
    html += '.big { font-size: 28px; text-align: center; margin: 20px 0; padding: 20px; background: #f0f0f0; color: green; }';
    html += '</style></head><body>';
    html += '<div class="box">';
    html += '<div class="center"><h1>' + plazaName + '</h1><p>Payment Receipt</p></div>';
    html += '<div class="title">RECEIPT</div>';
    html += '<div class="row"><span>Receipt No:</span><span>P' + Date.now() + '</span></div>';
    html += '<div class="row"><span>Month:</span><span>' + selectedMonth + '</span></div>';
    html += '<div class="row"><span>Date:</span><span>' + paymentDate + '</span></div>';
    html += '<div class="row"><span>Tenant:</span><span>' + (tenant.name || '') + '</span></div>';
    html += '<div class="row"><span>Shop:</span><span>' + (tenant.premises || '') + '</span></div>';
    html += '<div class="row"><span>Method:</span><span>' + paymentMethod.toUpperCase() + '</span></div>';
    if (paymentTransactionNo) {
      html += '<div class="row"><span>Transaction:</span><span>' + paymentTransactionNo + '</span></div>';
    }
    html += '<div class="big">Rs ' + formatNum(parseInt(paymentAmount)) + '</div>';
    html += '<div class="center"><p>Thank you!</p></div>';
    html += '</div>';
    html += '<script>window.print();<\/script></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
  }

  // Open Invoice Modal
  function openInvoiceModal(tenantId: string) {
    setSelectedTenantId(tenantId);
    setShowInvoiceModal(true);
  }

  // Print Invoice
  function printInvoice() {
    var tenant = getSelectedTenant();
    if (!tenant) return;

    var rentData = getRentRecord(selectedTenantId);
    var monthlyRent = tenant.rent || 0;
    var outstanding = rentData ? (rentData.outstanding || 0) : 0;
    var paidAmount = rentData ? (rentData.paid || 0) : 0;
    var totalDue = rentData ? (rentData.balance || 0) : monthlyRent + outstanding;
    var invoiceNo = 'INV-' + selectedMonth.replace('-', '') + '-' + selectedTenantId.slice(-4).toUpperCase();
    var today = new Date().toLocaleDateString('en-PK');

    var printWindow = window.open('', '_blank');
    if (!printWindow) return;

    var html = '<!DOCTYPE html><html><head><title>Invoice</title>';
    html += '<style>';
    html += 'body { font-family: Arial; padding: 20px; max-width: 800px; margin: 0 auto; }';
    html += '.header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }';
    html += '.header h1 { color: #2563eb; margin: 0; }';
    html += '.info { display: flex; justify-content: space-between; margin-bottom: 20px; }';
    html += 'table { width: 100%; border-collapse: collapse; margin: 20px 0; }';
    html += 'th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }';
    html += 'th { background: #f5f5f5; }';
    html += '.total { background: #fee2e2; font-weight: bold; font-size: 18px; color: #dc2626; }';
    html += '.footer { text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; }';
    html += '</style></head><body>';
    
    html += '<div class="header"><h1>' + plazaName + '</h1>';
    if (plazaAddress) html += '<p>' + plazaAddress + '</p>';
    if (plazaPhone) html += '<p>Phone: ' + plazaPhone + '</p>';
    html += '</div>';
    
    html += '<div class="info">';
    html += '<div><strong>Invoice:</strong> ' + invoiceNo + '<br/><strong>Date:</strong> ' + today + '<br/><strong>Month:</strong> ' + selectedMonth + '</div>';
    html += '<div style="text-align:right"><strong>Bill To:</strong><br/>' + (tenant.name || '') + '<br/>Shop: ' + (tenant.premises || '') + '<br/>Phone: ' + (tenant.phone || 'N/A') + '</div>';
    html += '</div>';
    
    html += '<table>';
    html += '<tr><th>Description</th><th style="text-align:right">Amount (Rs)</th></tr>';
    html += '<tr><td>Monthly Rent - ' + selectedMonth + '</td><td style="text-align:right">' + formatNum(monthlyRent) + '</td></tr>';
    html += '<tr><td>Outstanding Previous</td><td style="text-align:right">' + formatNum(outstanding) + '</td></tr>';
    html += '<tr><td>Paid Current Month</td><td style="text-align:right;color:green">-' + formatNum(paidAmount) + '</td></tr>';
    html += '<tr class="total"><td>TOTAL DUE</td><td style="text-align:right">Rs ' + formatNum(totalDue) + '</td></tr>';
    html += '</table>';
    
    html += '<div class="footer"><p>Thank you for your business!</p></div>';
    html += '<script>window.print();<\/script></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
  }

  // WhatsApp Invoice
  function sendWhatsApp() {
    var tenant = getSelectedTenant();
    if (!tenant) return;

    var rentData = getRentRecord(selectedTenantId);
    var monthlyRent = tenant.rent || 0;
    var outstanding = rentData ? (rentData.outstanding || 0) : 0;
    var totalDue = rentData ? (rentData.balance || 0) : monthlyRent + outstanding;

    var message = 'Dear ' + (tenant.name || 'Tenant') + ',\n\n';
    message += 'Invoice for ' + selectedMonth + ':\n\n';
    message += 'Rent: Rs ' + formatNum(monthlyRent) + '\n';
    message += 'Outstanding: Rs ' + formatNum(outstanding) + '\n';
    message += 'Total Due: Rs ' + formatNum(totalDue) + '\n\n';
    message += 'Please pay at earliest.\n\n';
    message += 'Regards,\n' + plazaName;

    var phone = (tenant.phone || '').replace(/[^0-9]/g, '');
    if (phone.length >= 10) phone = '92' + phone.slice(-10);
    
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(message), '_blank');
  }

  // Open Tenant Edit Modal
  function openTenantModal(tenantId: string) {
    var tenant = null;
    for (var x = 0; x < tenants.length; x++) {
      if (tenants[x].id === tenantId) {
        tenant = tenants[x];
        break;
      }
    }
    if (!tenant) return;

    setSelectedTenantId(tenantId);
    setTenantName(tenant.name || '');
    setTenantPhone(tenant.phone || '');
    setTenantEmail(tenant.email || '');
    setTenantCnic(tenant.cnic || '');
    setTenantPremises(tenant.premises || '');
    setTenantRent(String(tenant.rent || ''));
    setTenantDeposit(String(tenant.deposit || ''));
    setTenantStatus(tenant.status || 'active');
    setTenantIescoNo(tenant.iescoNo || '');
    setTenantEffectiveDate(tenant.effectiveDate || '');
    setShowTenantModal(true);
  }

  // Submit Tenant Edit
  function submitTenantEdit(e: React.FormEvent) {
    e.preventDefault();
    
    updateTenant({
      id: selectedTenantId,
      name: tenantName,
      phone: tenantPhone,
      email: tenantEmail,
      cnic: tenantCnic,
      premises: tenantPremises,
      rent: parseInt(tenantRent) || 0,
      deposit: parseInt(tenantDeposit) || 0,
      status: tenantStatus as 'active' | 'vacated' | 'suspended',
      iescoNo: tenantIescoNo,
      effectiveDate: tenantEffectiveDate,
      depositAccountNo: '',
    });
    
    setShowTenantModal(false);
    alert('Tenant updated!');
  }

  // Open Lease Modal
  function openLeaseModal(tenantId: string) {
    setSelectedTenantId(tenantId);
    
    var lease = getLease(tenantId);
    if (lease) {
      setLeaseStartDate(lease.startDate || '');
      setLeaseEndDate(lease.endDate || '');
      setLeaseIncrement(String(lease.incrementPercent || 10));
      setLeaseReminderDays(String(lease.reminderDays || 30));
    } else {
      setLeaseStartDate('');
      setLeaseEndDate('');
      setLeaseIncrement('10');
      setLeaseReminderDays('30');
    }
    
    setShowLeaseModal(true);
  }

  // Submit Lease
  function submitLease(e: React.FormEvent) {
    e.preventDefault();
    
    var existingLease = getLease(selectedTenantId);
    var leaseData = {
      id: existingLease ? existingLease.id : 'L' + Date.now(),
      tenantId: selectedTenantId,
      startDate: leaseStartDate,
      endDate: leaseEndDate,
      incrementPercent: parseInt(leaseIncrement) || 10,
      reminderDays: parseInt(leaseReminderDays) || 30,
      status: 'running' as const,
      documents: existingLease ? existingLease.documents : [],
    };
    
    if (existingLease) {
      updateLease(leaseData);
    } else {
      addLease(leaseData);
    }
    
    setShowLeaseModal(false);
    alert('Lease saved!');
  }

  // Get lease status
  function getLeaseStatus(tenantId: string) {
    var lease = getLease(tenantId);
    if (!lease) return { text: 'No Lease', color: 'bg-gray-100 text-gray-600' };
    
    var endDate = new Date(lease.endDate);
    var today = new Date();
    var days = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: 'Expired', color: 'bg-red-100 text-red-700' };
    if (days <= 30) return { text: days + 'd left', color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Active', color: 'bg-green-100 text-green-700' };
  }

  // Export to Excel
  function handleExport() {
    var csv = 'Sr,Tenant,Shop,Rent,Outstanding,Paid,Balance,Phone,IESCO,Status\n';
    
    for (var p = 0; p < filteredTenants.length; p++) {
      var t = filteredTenants[p];
      var rd = getRentRecord(t.id);
      
      csv += (p + 1) + ',';
      csv += '"' + (t.name || '') + '",';
      csv += '"' + (t.premises || '') + '",';
      csv += (t.rent || 0) + ',';
      csv += (rd ? rd.outstanding || 0 : 0) + ',';
      csv += (rd ? rd.paid || 0 : 0) + ',';
      csv += (rd ? rd.balance || 0 : (t.rent || 0)) + ',';
      csv += '"' + (t.phone || '') + '",';
      csv += '"' + (t.iescoNo || '') + '",';
      csv += (t.status || '') + '\n';
    }
    
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'rent-sheet-' + selectedMonth + '.csv';
    a.click();
  }

  // Print Rent Sheet
  function handlePrint() {
    window.print();
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Rent Sheet - {selectedMonth}</h1>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">🖨️ Print</button>
            <button onClick={handleExport} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm">📊 Export</button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <input type="month" className="w-full border rounded px-3 py-2" value={selectedMonth} onChange={function(e) { setSelectedMonth(e.target.value); }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full border rounded px-3 py-2" value={filterStatus} onChange={function(e) { setFilterStatus(e.target.value); }}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="vacated">Vacated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="Search..." value={searchTerm} onChange={function(e) { setSearchTerm(e.target.value); }} />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-600 text-xs">Total Rent</p>
            <p className="text-lg font-bold text-blue-800">Rs {formatNum(totalRent)}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-orange-600 text-xs">Outstanding</p>
            <p className="text-lg font-bold text-orange-800">Rs {formatNum(totalOutstanding)}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-600 text-xs">Paid</p>
            <p className="text-lg font-bold text-green-800">Rs {formatNum(totalPaid)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-xs">Balance</p>
            <p className="text-lg font-bold text-red-800">Rs {formatNum(totalBalance)}</p>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Tenant</th>
                  <th className="p-2 text-left">Shop</th>
                  <th className="p-2 text-right">Rent</th>
                  <th className="p-2 text-right">Outstanding</th>
                  <th className="p-2 text-right">Paid</th>
                  <th className="p-2 text-right">Balance</th>
                  <th className="p-2 text-center">Lease</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length > 0 ? filteredTenants.map(function(tenant, idx) {
                  var rd = getRentRecord(tenant.id);
                  var rent = tenant.rent || 0;
                  var outstanding = rd ? (rd.outstanding || 0) : 0;
                  var paid = rd ? (rd.paid || 0) : 0;
                  var balance = rd ? (rd.balance || 0) : rent + outstanding;
                  var leaseStatus = getLeaseStatus(tenant.id);
                  
                  var balanceColor = balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : '';
                  
                  return (
                    <tr key={tenant.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2 font-medium">{tenant.name || 'N/A'}</td>
                      <td className="p-2">{tenant.premises || 'N/A'}</td>
                      <td className="p-2 text-right">{formatNum(rent)}</td>
                      <td className="p-2 text-right text-orange-600">{formatNum(outstanding)}</td>
                      <td className="p-2 text-right text-green-600">{formatNum(paid)}</td>
                      <td className={'p-2 text-right font-bold ' + balanceColor}>{formatNum(balance)}</td>
                      <td className="p-2 text-center">
                        <span className={'px-2 py-0.5 rounded text-xs ' + leaseStatus.color}>{leaseStatus.text}</span>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center gap-1 flex-wrap">
                          <button onClick={function() { openPaymentModal(tenant.id); }} className="bg-green-500 text-white px-2 py-1 rounded text-xs" title="Add Payment">💰</button>
                          <button onClick={function() { openInvoiceModal(tenant.id); }} className="bg-blue-500 text-white px-2 py-1 rounded text-xs" title="Invoice">🧾</button>
                          <button onClick={function() { openTenantModal(tenant.id); }} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs" title="Edit Tenant">✏️</button>
                          <button onClick={function() { openLeaseModal(tenant.id); }} className="bg-purple-500 text-white px-2 py-1 rounded text-xs" title="Lease">📄</button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={9} className="p-8 text-center text-gray-500">No tenants found</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="p-2" colSpan={3}>TOTAL ({filteredTenants.length} tenants)</td>
                  <td className="p-2 text-right">{formatNum(totalRent)}</td>
                  <td className="p-2 text-right text-orange-600">{formatNum(totalOutstanding)}</td>
                  <td className="p-2 text-right text-green-600">{formatNum(totalPaid)}</td>
                  <td className="p-2 text-right text-red-600">{formatNum(totalBalance)}</td>
                  <td className="p-2" colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Add Payment - {getSelectedTenant()?.name}</h2>
              <form onSubmit={submitPayment}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Amount (Rs) *</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={paymentAmount} onChange={function(e) { setPaymentAmount(e.target.value); }} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={paymentDate} onChange={function(e) { setPaymentDate(e.target.value); }} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Method</label>
                  <select className="w-full border rounded px-3 py-2" value={paymentMethod} onChange={function(e) { setPaymentMethod(e.target.value); }}>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Transaction No</label>
                  <input type="text" className="w-full border rounded px-3 py-2" value={paymentTransactionNo} onChange={function(e) { setPaymentTransactionNo(e.target.value); }} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Deposit Account</label>
                  <input type="text" className="w-full border rounded px-3 py-2" value={paymentDepositAccount} onChange={function(e) { setPaymentDepositAccount(e.target.value); }} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded">Save & Receipt</button>
                  <button type="button" onClick={function() { submitPayment; printReceipt(); }} className="bg-blue-600 text-white px-4 py-2 rounded">🖨️</button>
                  <button type="button" onClick={function() { setShowPaymentModal(false); }} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Invoice - {getSelectedTenant()?.name}</h2>
              
              {(function() {
                var tenant = getSelectedTenant();
                var rd = getRentRecord(selectedTenantId);
                var rent = tenant ? (tenant.rent || 0) : 0;
                var outstanding = rd ? (rd.outstanding || 0) : 0;
                var paid = rd ? (rd.paid || 0) : 0;
                var balance = rd ? (rd.balance || 0) : rent + outstanding;
                
                return (
                  <div>
                    <div className="bg-gray-50 rounded p-4 mb-4">
                      <div className="flex justify-between py-1 border-b"><span>Shop:</span><span className="font-bold">{tenant?.premises || ''}</span></div>
                      <div className="flex justify-between py-1 border-b"><span>Month:</span><span className="font-bold">{selectedMonth}</span></div>
                      <div className="flex justify-between py-1 border-b"><span>Rent:</span><span>Rs {formatNum(rent)}</span></div>
                      <div className="flex justify-between py-1 border-b"><span>Outstanding:</span><span className="text-orange-600">Rs {formatNum(outstanding)}</span></div>
                      <div className="flex justify-between py-1 border-b"><span>Paid:</span><span className="text-green-600">Rs {formatNum(paid)}</span></div>
                      <div className="flex justify-between py-2 text-lg"><span className="font-bold">Total Due:</span><span className="font-bold text-red-600">Rs {formatNum(balance)}</span></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={printInvoice} className="flex-1 bg-blue-600 text-white py-2 rounded">🖨️ Print</button>
                      <button onClick={sendWhatsApp} className="flex-1 bg-green-600 text-white py-2 rounded">💬 WhatsApp</button>
                      <button onClick={function() { setShowInvoiceModal(false); }} className="flex-1 bg-gray-300 py-2 rounded">Close</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tenant Edit Modal */}
        {showTenantModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Tenant</h2>
              <form onSubmit={submitTenantEdit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={tenantName} onChange={function(e) { setTenantName(e.target.value); }} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={tenantPhone} onChange={function(e) { setTenantPhone(e.target.value); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" className="w-full border rounded px-3 py-2" value={tenantEmail} onChange={function(e) { setTenantEmail(e.target.value); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CNIC</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={tenantCnic} onChange={function(e) { setTenantCnic(e.target.value); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Premises/Shop *</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={tenantPremises} onChange={function(e) { setTenantPremises(e.target.value); }} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Monthly Rent *</label>
                    <input type="number" className="w-full border rounded px-3 py-2" value={tenantRent} onChange={function(e) { setTenantRent(e.target.value); }} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Security Deposit</label>
                    <input type="number" className="w-full border rounded px-3 py-2" value={tenantDeposit} onChange={function(e) { setTenantDeposit(e.target.value); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">IESCO No</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={tenantIescoNo} onChange={function(e) { setTenantIescoNo(e.target.value); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Effective Date</label>
                    <input type="date" className="w-full border rounded px-3 py-2" value={tenantEffectiveDate} onChange={function(e) { setTenantEffectiveDate(e.target.value); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select className="w-full border rounded px-3 py-2" value={tenantStatus} onChange={function(e) { setTenantStatus(e.target.value); }}>
                      <option value="active">Active</option>
                      <option value="vacated">Vacated</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Save</button>
                  <button type="button" onClick={function() { setShowTenantModal(false); }} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lease Modal */}
        {showLeaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Lease - {getSelectedTenant()?.name}</h2>
              <form onSubmit={submitLease}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={leaseStartDate} onChange={function(e) { setLeaseStartDate(e.target.value); }} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={leaseEndDate} onChange={function(e) { setLeaseEndDate(e.target.value); }} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Annual Increment %</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={leaseIncrement} onChange={function(e) { setLeaseIncrement(e.target.value); }} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Reminder Days</label>
                  <select className="w-full border rounded px-3 py-2" value={leaseReminderDays} onChange={function(e) { setLeaseReminderDays(e.target.value); }}>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded">Save Lease</button>
                  <button type="button" onClick={function() { setShowLeaseModal(false); }} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}