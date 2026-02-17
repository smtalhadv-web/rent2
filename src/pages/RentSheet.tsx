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
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  
  // Payment Form - Complete
  const [paymentMonth, setPaymentMonth] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentTransactionNo, setPaymentTransactionNo] = useState('');
  const [paymentDepositAccount, setPaymentDepositAccount] = useState('');
  const [paymentAttachment, setPaymentAttachment] = useState('');
  const [paymentAttachmentName, setPaymentAttachmentName] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  
  // Last Payment for Receipt
  const [lastPaymentData, setLastPaymentData] = useState<any>(null);
  
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
  var plazaName = (settings && settings.plazaName) ? settings.plazaName : 'PLAZA RENT MANAGEMENT';
  var plazaAddress = (settings && settings.address) ? settings.address : 'Commercial Area';
  var plazaPhone = (settings && settings.phone) ? settings.phone : '';
  var plazaEmail = (settings && settings.email) ? settings.email : '';
  var footerText = (settings && settings.footerText) ? settings.footerText : 'Thank you for your payment!';
  var headerText = (settings && settings.headerText) ? settings.headerText : '';

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
  function getRentRecord(tenantId: string, month?: string) {
    var m = month || selectedMonth;
    if (!rentRecords || rentRecords.length === 0) return null;
    for (var j = 0; j < rentRecords.length; j++) {
      if (rentRecords[j] && rentRecords[j].tenantId === tenantId && rentRecords[j].monthYear === m) {
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

  // Get tenant payments for a month
  function getTenantPaymentsForMonth(tenantId: string, month: string) {
    var result: typeof payments = [];
    if (!payments || payments.length === 0) return result;
    for (var l = 0; l < payments.length; l++) {
      var p = payments[l] as any;
      if (p && p.tenantId === tenantId && p.monthYear === month) {
        result.push(p);
      }
    }
    return result;
  }

  // Get all tenant payments
  function getAllTenantPayments(tenantId: string) {
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

  // Handle file upload
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    var file = e.target.files && e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onloadend = function() {
        setPaymentAttachment(reader.result as string);
        setPaymentAttachmentName(file.name);
      };
      reader.readAsDataURL(file);
    }
  }

  // Open Payment Modal
  function openPaymentModal(tenantId: string) {
    setSelectedTenantId(tenantId);
    setPaymentMonth(selectedMonth);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('cash');
    setPaymentTransactionNo('');
    setPaymentDepositAccount('');
    setPaymentAttachment('');
    setPaymentAttachmentName('');
    setPaymentRemarks('');
    setShowPaymentModal(true);
  }

  // Calculate payment details for modal
  function getPaymentDetails() {
    var tenant = getSelectedTenant();
    if (!tenant) return { rent: 0, outstanding: 0, totalDue: 0, previousPaid: 0 };
    
    var rentData = getRentRecord(selectedTenantId, paymentMonth);
    var rent = tenant.rent || 0;
    var outstanding = rentData ? (rentData.outstanding || 0) : 0;
    var previousPaid = rentData ? (rentData.paid || 0) : 0;
    var totalDue = rent + outstanding - previousPaid;
    
    return { rent: rent, outstanding: outstanding, totalDue: totalDue, previousPaid: previousPaid };
  }

  // Submit Payment
  function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTenantId || !paymentAmount) return;
    
    var tenant = getSelectedTenant();
    var details = getPaymentDetails();
    var paidNow = parseInt(paymentAmount) || 0;
    var balanceAfter = details.totalDue - paidNow;
    
    var paymentData = {
      id: 'P' + Date.now(),
      tenantId: selectedTenantId,
      amount: paidNow,
      date: paymentDate,
      method: paymentMethod as 'cash' | 'bank' | 'online',
      transactionNo: paymentTransactionNo,
      depositedAccount: paymentDepositAccount,
      monthYear: paymentMonth,
      attachment: paymentAttachment,
      remarks: paymentRemarks,
    };
    
    addPayment(paymentData);
    
    // Store for receipt
    setLastPaymentData({
      id: paymentData.id,
      tenantName: tenant ? tenant.name : '',
      tenantPhone: tenant ? tenant.phone : '',
      premises: tenant ? tenant.premises : '',
      month: paymentMonth,
      date: paymentDate,
      rent: details.rent,
      outstanding: details.outstanding,
      previousPaid: details.previousPaid,
      paidNow: paidNow,
      totalDue: details.totalDue,
      balanceAfter: balanceAfter,
      method: paymentMethod,
      transactionNo: paymentTransactionNo,
      depositAccount: paymentDepositAccount,
    });
    
    setShowPaymentModal(false);
    setShowReceiptModal(true);
  }

  // Print Receipt
  function printReceipt() {
    if (!lastPaymentData) return;
    var d = lastPaymentData;

    var printWindow = window.open('', '_blank');
    if (!printWindow) return;

    var html = '<!DOCTYPE html><html><head><title>Payment Receipt</title>';
    html += '<style>';
    html += '@page { size: A5; margin: 10mm; }';
    html += 'body { font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; font-size: 14px; }';
    html += '.receipt { border: 2px solid #000; padding: 20px; }';
    html += '.header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }';
    html += '.header h1 { margin: 0; font-size: 22px; color: #1e40af; }';
    html += '.header p { margin: 3px 0; color: #666; font-size: 12px; }';
    html += '.title { text-align: center; background: #1e40af; color: white; padding: 8px; font-size: 16px; font-weight: bold; margin: 15px 0; }';
    html += '.info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #ccc; }';
    html += '.info-row .label { color: #666; }';
    html += '.info-row .value { font-weight: bold; }';
    html += '.section { margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }';
    html += '.section-title { font-weight: bold; margin-bottom: 8px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }';
    html += '.amount-box { text-align: center; margin: 20px 0; padding: 20px; border: 2px dashed #16a34a; background: #f0fdf4; }';
    html += '.amount-box .label { font-size: 14px; color: #666; }';
    html += '.amount-box .amount { font-size: 32px; font-weight: bold; color: #16a34a; }';
    html += '.balance-box { text-align: center; margin: 15px 0; padding: 15px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 5px; }';
    html += '.balance-box .label { font-size: 12px; color: #666; }';
    html += '.balance-box .amount { font-size: 24px; font-weight: bold; color: #dc2626; }';
    html += '.footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px solid #000; }';
    html += '.footer p { margin: 3px 0; font-size: 11px; color: #666; }';
    html += '.signature { margin-top: 30px; display: flex; justify-content: space-between; }';
    html += '.signature div { text-align: center; width: 45%; }';
    html += '.signature .line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; font-size: 12px; }';
    html += '</style></head><body>';
    
    html += '<div class="receipt">';
    
    // Header
    html += '<div class="header">';
    html += '<h1>' + plazaName + '</h1>';
    if (plazaAddress) html += '<p>' + plazaAddress + '</p>';
    if (plazaPhone) html += '<p>Phone: ' + plazaPhone + '</p>';
    if (plazaEmail) html += '<p>Email: ' + plazaEmail + '</p>';
    if (headerText) html += '<p>' + headerText + '</p>';
    html += '</div>';
    
    // Title
    html += '<div class="title">PAYMENT RECEIPT</div>';
    
    // Receipt Info
    html += '<div class="info-row"><span class="label">Receipt No:</span><span class="value">' + d.id + '</span></div>';
    html += '<div class="info-row"><span class="label">Date:</span><span class="value">' + d.date + '</span></div>';
    html += '<div class="info-row"><span class="label">Payment For:</span><span class="value">' + d.month + '</span></div>';
    
    // Tenant Info
    html += '<div class="section">';
    html += '<div class="section-title">Tenant Details</div>';
    html += '<div class="info-row"><span class="label">Name:</span><span class="value">' + d.tenantName + '</span></div>';
    html += '<div class="info-row"><span class="label">Shop/Premises:</span><span class="value">' + d.premises + '</span></div>';
    if (d.tenantPhone) html += '<div class="info-row"><span class="label">Phone:</span><span class="value">' + d.tenantPhone + '</span></div>';
    html += '</div>';
    
    // Payment Breakdown
    html += '<div class="section">';
    html += '<div class="section-title">Payment Details</div>';
    html += '<div class="info-row"><span class="label">Monthly Rent:</span><span class="value">Rs ' + formatNum(d.rent) + '</span></div>';
    html += '<div class="info-row"><span class="label">Previous Outstanding:</span><span class="value" style="color:#ea580c">Rs ' + formatNum(d.outstanding) + '</span></div>';
    html += '<div class="info-row"><span class="label">Previously Paid:</span><span class="value" style="color:#16a34a">Rs ' + formatNum(d.previousPaid) + '</span></div>';
    html += '<div class="info-row" style="border-top:1px solid #000;padding-top:8px;margin-top:5px;"><span class="label"><strong>Total Due:</strong></span><span class="value" style="color:#dc2626"><strong>Rs ' + formatNum(d.totalDue) + '</strong></span></div>';
    html += '</div>';
    
    // Amount Paid
    html += '<div class="amount-box">';
    html += '<div class="label">Amount Received</div>';
    html += '<div class="amount">Rs ' + formatNum(d.paidNow) + '</div>';
    html += '</div>';
    
    // Balance After
    if (d.balanceAfter > 0) {
      html += '<div class="balance-box">';
      html += '<div class="label">Balance Remaining</div>';
      html += '<div class="amount">Rs ' + formatNum(d.balanceAfter) + '</div>';
      html += '</div>';
    } else if (d.balanceAfter < 0) {
      html += '<div class="balance-box" style="background:#f0fdf4;border-color:#86efac;">';
      html += '<div class="label">Advance Payment</div>';
      html += '<div class="amount" style="color:#16a34a;">Rs ' + formatNum(Math.abs(d.balanceAfter)) + '</div>';
      html += '</div>';
    } else {
      html += '<div class="balance-box" style="background:#f0fdf4;border-color:#86efac;">';
      html += '<div class="label">Status</div>';
      html += '<div class="amount" style="color:#16a34a;font-size:18px;">FULLY PAID ✓</div>';
      html += '</div>';
    }
    
    // Payment Method
    html += '<div class="section">';
    html += '<div class="info-row"><span class="label">Payment Method:</span><span class="value">' + d.method.toUpperCase() + '</span></div>';
    if (d.transactionNo) html += '<div class="info-row"><span class="label">Transaction No:</span><span class="value">' + d.transactionNo + '</span></div>';
    if (d.depositAccount) html += '<div class="info-row"><span class="label">Deposited To:</span><span class="value">' + d.depositAccount + '</span></div>';
    html += '</div>';
    
    // Signatures
    html += '<div class="signature">';
    html += '<div><div class="line">Received By</div></div>';
    html += '<div><div class="line">Tenant Signature</div></div>';
    html += '</div>';
    
    // Footer
    html += '<div class="footer">';
    html += '<p><strong>' + footerText + '</strong></p>';
    html += '<p>This is a computer generated receipt.</p>';
    html += '<p>Generated on: ' + new Date().toLocaleString() + '</p>';
    html += '</div>';
    
    html += '</div>';
    html += '<script>window.onload = function() { window.print(); };<\/script>';
    html += '</body></html>';

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
    
    html += '<div class="footer"><p>' + footerText + '</p></div>';
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
    message += '📋 *Invoice for ' + selectedMonth + '*\n\n';
    message += '🏠 Shop: ' + (tenant.premises || '') + '\n';
    message += '💰 Monthly Rent: Rs ' + formatNum(monthlyRent) + '\n';
    message += '📊 Outstanding: Rs ' + formatNum(outstanding) + '\n';
    message += '━━━━━━━━━━━━\n';
    message += '💵 *Total Due: Rs ' + formatNum(totalDue) + '*\n\n';
    message += 'Please pay at your earliest convenience.\n\n';
    message += 'Regards,\n' + plazaName + '\n';
    if (plazaPhone) message += '📞 ' + plazaPhone;

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

  // Get payment details for display
  var paymentDetails = getPaymentDetails();

  return (
    <Layout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📋 Rent Sheet - {selectedMonth}</h1>
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
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="Search tenant or shop..." value={searchTerm} onChange={function(e) { setSearchTerm(e.target.value); }} />
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

        {/* ==================== PAYMENT MODAL ==================== */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-2">💰 Add Payment</h2>
              <p className="text-gray-600 mb-4">{getSelectedTenant()?.name} - {getSelectedTenant()?.premises}</p>
              
              {/* Payment Summary Box */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-sm mb-2 text-gray-700">Payment Summary for {paymentMonth}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span>Monthly Rent:</span><span className="font-bold">Rs {formatNum(paymentDetails.rent)}</span></div>
                  <div className="flex justify-between"><span>Outstanding:</span><span className="font-bold text-orange-600">Rs {formatNum(paymentDetails.outstanding)}</span></div>
                  <div className="flex justify-between"><span>Already Paid:</span><span className="font-bold text-green-600">Rs {formatNum(paymentDetails.previousPaid)}</span></div>
                  <div className="flex justify-between border-t pt-1"><span><strong>Total Due:</strong></span><span className="font-bold text-red-600">Rs {formatNum(paymentDetails.totalDue)}</span></div>
                </div>
              </div>

              <form onSubmit={submitPayment}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Month *</label>
                    <input type="month" className="w-full border rounded px-3 py-2" value={paymentMonth} onChange={function(e) { setPaymentMonth(e.target.value); }} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Date *</label>
                    <input type="date" className="w-full border rounded px-3 py-2" value={paymentDate} onChange={function(e) { setPaymentDate(e.target.value); }} required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Amount (Rs) *</label>
                    <input type="number" className="w-full border rounded px-3 py-2 text-lg font-bold" value={paymentAmount} onChange={function(e) { setPaymentAmount(e.target.value); }} placeholder="Enter amount" required />
                    {paymentAmount && (
                      <p className="text-sm mt-1">
                        Balance after payment: <span className={parseInt(paymentAmount) >= paymentDetails.totalDue ? 'text-green-600' : 'text-red-600'}>
                          Rs {formatNum(paymentDetails.totalDue - (parseInt(paymentAmount) || 0))}
                        </span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Method</label>
                    <select className="w-full border rounded px-3 py-2" value={paymentMethod} onChange={function(e) { setPaymentMethod(e.target.value); }}>
                      <option value="cash">💵 Cash</option>
                      <option value="bank">🏦 Bank Transfer</option>
                      <option value="online">📱 Online Payment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Transaction No</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={paymentTransactionNo} onChange={function(e) { setPaymentTransactionNo(e.target.value); }} placeholder="Optional" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Deposited To Account</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={paymentDepositAccount} onChange={function(e) { setPaymentDepositAccount(e.target.value); }} placeholder="Account number (optional)" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">📎 Attachment (Bank Slip/Receipt)</label>
                    <input type="file" className="w-full border rounded px-3 py-2" accept="image/*,.pdf" onChange={handleFileUpload} />
                    {paymentAttachmentName && <p className="text-sm text-green-600 mt-1">✓ {paymentAttachmentName}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Remarks</label>
                    <textarea className="w-full border rounded px-3 py-2" rows={2} value={paymentRemarks} onChange={function(e) { setPaymentRemarks(e.target.value); }} placeholder="Any notes..."></textarea>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded font-bold">💾 Save Payment</button>
                  <button type="button" onClick={function() { setShowPaymentModal(false); }} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== RECEIPT MODAL ==================== */}
        {showReceiptModal && lastPaymentData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="text-center mb-4">
                <div className="text-green-500 text-5xl mb-2">✓</div>
                <h2 className="text-xl font-bold text-green-600">Payment Recorded!</h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between py-1 border-b"><span>Tenant:</span><span className="font-bold">{lastPaymentData.tenantName}</span></div>
                <div className="flex justify-between py-1 border-b"><span>Shop:</span><span className="font-bold">{lastPaymentData.premises}</span></div>
                <div className="flex justify-between py-1 border-b"><span>Month:</span><span className="font-bold">{lastPaymentData.month}</span></div>
                <div className="flex justify-between py-1 border-b"><span>Amount Paid:</span><span className="font-bold text-green-600">Rs {formatNum(lastPaymentData.paidNow)}</span></div>
                <div className="flex justify-between py-1"><span>Balance:</span><span className={'font-bold ' + (lastPaymentData.balanceAfter > 0 ? 'text-red-600' : 'text-green-600')}>Rs {formatNum(lastPaymentData.balanceAfter)}</span></div>
              </div>
              
              <div className="flex gap-2">
                <button onClick={printReceipt} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">🖨️ Print Receipt</button>
                <button onClick={function() { setShowReceiptModal(false); }} className="flex-1 bg-gray-300 py-2 rounded">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== INVOICE MODAL ==================== */}
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">🧾 Invoice - {getSelectedTenant()?.name}</h2>
              
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

        {/* ==================== TENANT EDIT MODAL ==================== */}
        {showTenantModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">✏️ Edit Tenant</h2>
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
                      <option value="active">✅ Active</option>
                      <option value="vacated">🚪 Vacated</option>
                      <option value="suspended">⏸️ Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">💾 Save</button>
                  <button type="button" onClick={function() { setShowTenantModal(false); }} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== LEASE MODAL ==================== */}
        {showLeaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">📄 Lease - {getSelectedTenant()?.name}</h2>
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
                  <label className="block text-sm font-medium mb-1">Reminder Days Before Expiry</label>
                  <select className="w-full border rounded px-3 py-2" value={leaseReminderDays} onChange={function(e) { setLeaseReminderDays(e.target.value); }}>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded">💾 Save Lease</button>
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