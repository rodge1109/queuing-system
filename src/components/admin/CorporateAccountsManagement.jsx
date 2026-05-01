import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Landmark, 
  ShieldCheck, 
  X, 
  Edit3, 
  Loader2,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Building2,
  CreditCard,
  User,
  Phone,
  Mail,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileText,
  Receipt,
  History,
  TrendingUp,
  AlertTriangle,
  Download,
  Filter,
  Check
} from 'lucide-react';

function CorporateAccountsManagement() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    account_number: '',
    company_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    credit_limit: '',
    status: 'active'
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, trips, ledger, invoices, payments
  
  // Real Data for Billing
  const [ledger, setLedger] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [trips, setTrips] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchBillingData(selectedAccount.id);
    }
  }, [selectedAccount]);

  const fetchBillingData = async (accountId) => {
    setIsBillingLoading(true);
    try {
      const [ledgerRes, invoicesRes, tripsRes, paymentsRes] = await Promise.all([
        fetch(`/api/corporate-accounts/${accountId}/ledger`),
        fetch(`/api/corporate-accounts/${accountId}/invoices`),
        fetch(`/api/corporate-accounts/${accountId}/trips`),
        fetch(`/api/corporate-accounts/${accountId}/payments`)
      ]);
      
      const ledgerData = await ledgerRes.json();
      const invoicesData = await invoicesRes.json();
      const tripsData = await tripsRes.json();
      const paymentsData = await paymentsRes.json();

      if (ledgerData.success) setLedger(ledgerData.ledger);
      if (invoicesData.success) setInvoices(invoicesData.invoices);
      if (tripsData.success) setTrips(tripsData.trips);
      if (paymentsData.success) setPayments(paymentsData.payments);
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
    } finally {
      setIsBillingLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/corporate-accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setError('Could not load accounts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/corporate-accounts/${editingId}` : '/api/corporate-accounts';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          credit_limit: parseFloat(formData.credit_limit) || 0
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          account_number: '',
          company_name: '',
          contact_person: '',
          contact_email: '',
          contact_phone: '',
          credit_limit: '',
          status: 'active'
        });
        setEditingId(null);
        fetchAccounts();
      } else {
        setError(data.message || 'Error saving account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      const res = await fetch(`/api/corporate-accounts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAccounts();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      const res = await fetch(`/api/corporate-accounts/${selectedAccount.id}/invoices/generate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert('Invoice generated successfully!');
        fetchBillingData(selectedAccount.id); // Refresh active tabs
        fetchAccounts(); // Refresh global balance
      } else {
        alert(data.message || 'Failed to generate invoice');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating invoice');
    }
  };

  const handleRecordPayment = async (paymentData) => {
    try {
      const res = await fetch(`/api/corporate-accounts/${selectedAccount.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Payment recorded successfully!');
        fetchBillingData(selectedAccount.id);
        fetchAccounts();
      } else {
        alert(data.message || 'Failed to record payment');
      }
    } catch (err) {
      console.error(err);
      alert('Error recording payment');
    }
  };

  const handleManualAdjustment = async (adjustmentData) => {
    try {
      const res = await fetch(`/api/corporate-accounts/${selectedAccount.id}/ledger/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustmentData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Adjustment recorded successfully!');
        fetchBillingData(selectedAccount.id);
        fetchAccounts();
      } else {
        alert(data.message || 'Failed to record adjustment');
      }
    } catch (err) {
      console.error(err);
      alert('Error recording adjustment');
    }
  };

  const handleEdit = (account) => {
    setFormData({
      account_number: account.account_number,
      company_name: account.company_name,
      contact_person: account.contact_person || '',
      contact_email: account.contact_email || '',
      contact_phone: account.contact_phone || '',
      credit_limit: account.credit_limit || '',
      status: account.status || 'active'
    });
    setEditingId(account.id);
    setShowAddModal(true);
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.account_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedAccount) {
    return <AccountDetailView 
      account={selectedAccount} 
      onBack={() => setSelectedAccount(null)}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      ledger={ledger}
      invoices={invoices}
      trips={trips}
      payments={payments}
      onGenerateInvoice={handleGenerateInvoice}
      onRecordPayment={handleRecordPayment}
      onManualAdjustment={handleManualAdjustment}
      isBillingLoading={isBillingLoading}
    />;
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] animate-fadeIn">
      {/* Financial Dashboard Summary */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border-b border-gray-100">
        <SummaryCard 
          label="Total Receivables" 
          value="₱124,500.00" 
          icon={<TrendingUp className="text-blue-500" />} 
          trend="+12% from last month"
        />
        <SummaryCard 
          label="Overdue Amount" 
          value="₱18,240.00" 
          icon={<AlertTriangle className="text-red-500" />} 
          trend="8 clients overdue"
          warning
        />
        <SummaryCard 
          label="Collected (MTD)" 
          value="₱82,400.00" 
          icon={<CheckCircle2 className="text-green-500" />} 
          trend="On track for target"
        />
        <SummaryCard 
          label="Aging Summary" 
          value="31-60 Days" 
          icon={<History className="text-orange-500" />} 
          trend="Avg. collection: 24 days"
        />
      </div>

      {/* Header Section */}
      <div className="p-6 flex justify-between items-center bg-white border-b border-gray-100">
        <div>
          <h2 className="text-xl font-black text-black tracking-tighter uppercase flex items-center gap-2">
            <Landmark className="text-[#24a148]" size={24} />
            Account Ledger Management
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Corporate Billing System & Receivables</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 bg-white border-2 border-gray-100 text-gray-600 px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download size={14} />
            Export Aging Report
          </button>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({
                account_number: '',
                company_name: '',
                contact_person: '',
                contact_email: '',
                contact_phone: '',
                credit_limit: '',
                status: 'active'
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-[#24a148] text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-[#1e8a3d] transition-all shadow-md active:scale-95"
          >
            <Plus size={16} />
            Register New Account
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex gap-4 bg-white">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by company name or account number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f4f4f4] border-0 border-b border-gray-300 text-[13px] focus:outline-none focus:border-[#24a148] transition-all"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-[#f8f9fa]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-sm font-medium">Loading accounts...</span>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            <Building2 size={48} className="mb-4 opacity-20" />
            <p className="text-sm">No corporate accounts found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map(account => (
              <div key={account.id} className="group bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${
                  account.status === 'active' ? 'bg-[#24a148] text-white' : 'bg-gray-400 text-white'
                }`}>
                  {account.status}
                </div>

                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#f4f4f4] flex items-center justify-center text-[#24a148]">
                      <Building2 size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-black truncate text-base tracking-tight uppercase">{account.company_name}</h3>
                      <p className="text-[10px] text-gray-500 font-mono tracking-wider">{account.account_number}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-500 uppercase font-bold tracking-tighter">Credit Limit</span>
                      <span className="text-black font-bold">₱{parseFloat(account.credit_limit || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-500 uppercase font-bold tracking-tighter">Current Balance</span>
                      <span className={`font-bold ${parseFloat(account.balance) > parseFloat(account.credit_limit) ? 'text-red-500' : 'text-[#24a148]'}`}>
                        ₱{parseFloat(account.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          (account.balance / account.credit_limit) > 0.9 ? 'bg-red-500' : 'bg-[#24a148]'
                        }`}
                        style={{ width: `${Math.min((account.balance / (account.credit_limit || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <User size={12} className="text-[#24a148]" />
                      <span className="truncate">{account.contact_person || 'No contact specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <Phone size={12} className="text-[#24a148]" />
                      <span>{account.contact_phone || '---'}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button 
                      onClick={() => setSelectedAccount(account)}
                      className="flex-1 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Receipt size={12} />
                      Manage Billing
                    </button>
                    <button 
                      onClick={() => handleEdit(account)}
                      className="px-3 py-2 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 hover:text-black transition-colors"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button 
                      onClick={() => handleDelete(account.id)}
                      className="px-3 py-2 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-gray-200 shadow-2xl overflow-hidden animate-zoomIn">
            <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-black uppercase tracking-tighter">
                  {editingId ? 'Edit Corporate Client' : 'Add Corporate Client'}
                </h3>
                <p className="text-xs text-gray-500">Configure client billing and identity details</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-700 text-xs animate-shake">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#24a148] uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={12} />
                    Account Number
                  </label>
                  <input 
                    required
                    value={formData.account_number}
                    onChange={e => setFormData({...formData, account_number: e.target.value})}
                    placeholder="e.g. CORP-001"
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#24a148] uppercase tracking-widest flex items-center gap-2">
                    <Building2 size={12} />
                    Company Name
                  </label>
                  <input 
                    required
                    value={formData.company_name}
                    onChange={e => setFormData({...formData, company_name: e.target.value})}
                    placeholder="Full Business Name"
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} />
                  Contact Person
                </label>
                <input 
                  value={formData.contact_person}
                  onChange={e => setFormData({...formData, contact_person: e.target.value})}
                  placeholder="Primary Contact Full Name"
                  className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} />
                    Contact Email
                  </label>
                  <input 
                    type="email"
                    value={formData.contact_email}
                    onChange={e => setFormData({...formData, contact_email: e.target.value})}
                    placeholder="email@company.com"
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={12} />
                    Contact Phone
                  </label>
                  <input 
                    value={formData.contact_phone}
                    onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#24a148] uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={12} />
                    Credit Limit ($)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={formData.credit_limit}
                    onChange={e => setFormData({...formData, credit_limit: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-[#f4f4f4] border-0 border-b border-[#24a148] p-2.5 text-[12px] font-bold text-black focus:outline-none focus:ring-0 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#24a148] text-white text-[14px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:bg-[#1e8a3d] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      {editingId ? 'Update Corporate Profile' : 'Confirm & Save Client'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.2s ease-out; }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
}

// Sub-components for better organization
function SummaryCard({ label, value, icon, trend, warning }) {
  return (
    <div className={`p-4 border border-gray-100 shadow-sm ${warning ? 'bg-red-50/30' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${warning ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-xl font-black text-black tracking-tight">{value}</h4>
    </div>
  );
}

function AccountDetailView({ account, onBack, activeTab, setActiveTab, ledger, invoices, trips, payments, onGenerateInvoice, onRecordPayment, onManualAdjustment, isBillingLoading }) {
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    amount: '',
    method: 'Bank Transfer',
    check_number: '',
    bank_name: '',
    notes: ''
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  const openInvoiceDetail = async (invoice) => {
    setSelectedInvoice(invoice);
    setIsLoadingInvoice(true);
    try {
      const res = await fetch(`/api/corporate-accounts/${account.id}/invoices/${invoice.id}`);
      const data = await res.json();
      if (data.success) setInvoiceDetail(data);
    } catch (err) {
      console.error('Failed to load invoice detail:', err);
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const closeInvoiceDetail = () => {
    setSelectedInvoice(null);
    setInvoiceDetail(null);
  };

  const handlePaymentSubmit = () => {
    if (!paymentForm.amount || isNaN(paymentForm.amount) || Number(paymentForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (paymentForm.method === 'Check' && (!paymentForm.check_number || !paymentForm.bank_name)) {
      alert('Please enter check number and bank name');
      return;
    }
    
    onRecordPayment({
      invoice_id: paymentForm.invoice_id ? parseInt(paymentForm.invoice_id) : null,
      amount: parseFloat(paymentForm.amount),
      method: paymentForm.method,
      check_number: paymentForm.check_number,
      bank_name: paymentForm.bank_name,
      notes: paymentForm.notes
    });

    // Reset form
    setPaymentForm({ 
      invoice_id: '', 
      amount: '', 
      method: 'Bank Transfer',
      check_number: '',
      bank_name: '',
      notes: ''
    });
  };

  return (
    <div className="flex flex-col h-full bg-white animate-fadeIn">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <X size={20} className="text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-black uppercase tracking-tighter">{account.company_name}</h2>
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${account.status === 'active' ? 'bg-[#24a148] text-white' : 'bg-gray-400 text-white'}`}>
                {account.status}
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile Reference: {account.account_number}</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="text-right border-r pr-4 border-gray-100">
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Outstanding</p>
             <p className="text-xl font-black text-red-500 tracking-tight">₱{parseFloat(account.balance || 0).toLocaleString()}</p>
           </div>
           <div className="text-right">
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Available Credit</p>
             <p className="text-xl font-black text-[#24a148] tracking-tight">₱{parseFloat(account.credit_limit - (account.balance || 0)).toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-100 flex gap-8">
        {[
          { id: 'overview', label: 'Financial Overview', icon: <TrendingUp size={14} /> },
          { id: 'trips', label: 'Service Logs', icon: <History size={14} /> },
          { id: 'ledger', label: 'Company Ledger', icon: <FileText size={14} /> },
          { id: 'invoices', label: 'Invoices', icon: <Receipt size={14} /> },
          { id: 'payments', label: 'Payment History', icon: <CreditCard size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${
              activeTab === tab.id ? 'border-[#24a148] text-[#24a148]' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6 bg-[#f8f9fa]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
               <div className="bg-white p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#24a148]" />
                    Receivables Performance
                  </h3>
                  <div className="h-48 bg-gray-50 flex items-end justify-between p-4 gap-2">
                    {[40, 70, 45, 90, 65, 80, 55, 30, 95, 60].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#24a148]/20 hover:bg-[#24a148] transition-all relative group" style={{ height: `${h}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          ${h*100}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">Aging Summary</h3>
                    <div className="space-y-4">
                      {[
                        { label: '0-30 Days', value: '$45,000', color: 'bg-green-500', p: 60 },
                        { label: '31-60 Days', value: '$12,500', color: 'bg-yellow-500', p: 25 },
                        { label: '61-90 Days', value: '$5,000', color: 'bg-orange-500', p: 10 },
                        { label: 'Over 90 Days', value: '$2,400', color: 'bg-red-500', p: 5 },
                      ].map(age => (
                        <div key={age.label}>
                          <div className="flex justify-between text-[10px] font-bold mb-1">
                            <span>{age.label}</span>
                            <span>{age.value}</span>
                          </div>
                          <div className="w-full bg-gray-50 h-1 rounded-full overflow-hidden">
                            <div className={`h-full ${age.color}`} style={{ width: `${age.p}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">Account Contacts</h3>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f4f4f4] flex items-center justify-center text-gray-400"><User size={16}/></div>
                          <div>
                            <p className="text-[11px] font-black text-black uppercase tracking-tighter">{account.contact_person}</p>
                            <p className="text-[10px] text-gray-500 font-bold">Primary Administrator</p>
                          </div>
                       </div>
                       <div className="space-y-2 pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                            <Mail size={12} className="text-[#24a148]" />
                            {account.contact_email}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                            <Phone size={12} className="text-[#24a148]" />
                            {account.contact_phone}
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-black p-6 shadow-xl border border-gray-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                    <Receipt size={16} className="text-[#24a148]" />
                    Quick Billing
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-6">Process current unbilled services</p>
                  <div className="space-y-4 mb-8">
                     <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Unbilled Trips</span>
                        <span className="text-white font-black">12 Items</span>
                     </div>
                     <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Accrued Amount</span>
                        <span className="text-[#24a148] font-black tracking-tighter">$1,452.00</span>
                     </div>
                  </div>
                  <button className="w-full bg-[#24a148] text-white py-3 text-[10px] font-black uppercase tracking-[2px] shadow-lg hover:bg-[#1e8a3d] transition-all">
                    Generate New Invoice
                  </button>
               </div>

               <div className="bg-white p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                     <div className="p-3 border-2 border-[#24a148] bg-green-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded shadow-sm text-[#24a148]"><Landmark size={16}/></div>
                        <div>
                          <p className="text-[11px] font-black text-black uppercase tracking-tighter">Bank Transfer</p>
                          <p className="text-[9px] text-gray-400 font-bold">DEFAULT BILLING</p>
                        </div>
                        <Check size={16} className="ml-auto text-[#24a148]" />
                     </div>
                     <div className="p-3 border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-all cursor-pointer">
                        <div className="p-2 bg-white rounded shadow-sm text-gray-400"><CreditCard size={16}/></div>
                        <div>
                          <p className="text-[11px] font-black text-black uppercase tracking-tighter">Corporate Card</p>
                          <p className="text-[9px] text-gray-400 font-bold">VISA ENDING IN 4492</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-black">Company Service Logs</h3>
              <div className="flex gap-2">
                 <button className="p-2 border border-gray-200 text-gray-400 hover:text-black transition-all bg-white"><Filter size={14}/></button>
                 <button className="p-2 border border-gray-200 text-gray-400 hover:text-black transition-all bg-white"><Download size={14}/></button>
              </div>
            </div>
            <table className="w-full text-left">
               <thead>
                 <tr className="bg-white border-b border-gray-100">
                   <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                   <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Passenger</th>
                   <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Route</th>
                   <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fare</th>
                   <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {trips.map(trip => (
                   <tr key={trip.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                     <td className="p-4 text-[11px] font-mono text-gray-500">{trip.date}</td>
                     <td className="p-4 text-[11px] font-bold text-black uppercase tracking-tight">{trip.passenger}</td>
                     <td className="p-4 text-[11px] text-gray-600 truncate max-w-[200px]">{trip.route}</td>
                     <td className="p-4 text-[11px] font-black text-black">₱{parseFloat(trip.fare || 0).toFixed(2)}</td>
                     <td className="p-4 text-right">
                       <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                         trip.status === 'billed' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                       }`}>
                         {trip.status}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center drag-handle">
              <h3 className="text-xs font-black uppercase tracking-widest text-black">Audit Ledger (Single Source of Truth)</h3>
              <button 
                onClick={() => setShowAdjustmentModal(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
              >
                <Plus size={14} />
                Manual Adjustment
              </button>
            </div>
            <table className="w-full text-left">
               <thead>
                 <tr className="bg-white border-b border-gray-100">
                   <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                   <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</th>
                   <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                   <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Debit (+)</th>
                   <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Credit (-)</th>
                   <th className="p-4 text-[10px] font-black text-black uppercase tracking-widest text-right">Balance</th>
                 </tr>
               </thead>
               <tbody>
                 {ledger.map(entry => (
                   <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                     <td className="p-4 text-[11px] font-mono text-gray-500">{entry.date}</td>
                     <td className="p-4 text-[11px] font-bold text-blue-600">{entry.reference}</td>
                     <td className="p-4 text-[11px] text-gray-600">{entry.description}</td>
                     <td className="p-4 text-[11px] font-bold text-red-500">{parseFloat(entry.debit || 0) > 0 ? `+ ₱${parseFloat(entry.debit || 0).toFixed(2)}` : '--'}</td>
                     <td className="p-4 text-[11px] font-bold text-green-600">{parseFloat(entry.credit || 0) > 0 ? `- ₱${parseFloat(entry.credit || 0).toFixed(2)}` : '--'}</td>
                     <td className="p-4 text-[11px] font-black text-black text-right">₱{parseFloat(entry.balance || 0).toFixed(2)}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {invoices.map(invoice => (
               <div key={invoice.id} className="bg-white border border-gray-200 shadow-sm group hover:shadow-md transition-all">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#24a148]" />
                      <span className="text-[11px] font-black text-black">{invoice.invoice_number}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Billing Period</p>
                    <p className="text-[12px] font-black text-black mb-4">{invoice.period_start ? invoice.period_start + " to " + invoice.period_end : invoice.date || "N/A"}</p>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-lg font-black text-black tracking-tighter">₱{parseFloat(invoice.amount || 0).toFixed(2)}</p>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 text-gray-400 hover:text-black transition-all"><Download size={16}/></button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-all"><Mail size={16}/></button>
                      </div>
                    </div>
                  </div>
                   <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                     <button
                       onClick={() => openInvoiceDetail(invoice)}
                       className="w-full py-2 bg-white border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all">
                       View Invoice Details
                     </button>
                   </div>
               </div>
             ))}
             {/* Create Invoice Card */}
             <div 
                onClick={onGenerateInvoice}
                className="bg-[#f4f4f4] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 gap-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#24a148] shadow-sm"><Plus size={24}/></div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Create New Billing<br/>Statement</p>
             </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white border border-gray-100 shadow-sm overflow-hidden h-fit">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-black">Recent Payments Received</h3>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ref #</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Check #</th>
                    <th className="p-4 text-[10px] font-black text-black uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-400 text-xs uppercase tracking-widest font-bold">No payments recorded yet</td>
                      </tr>
                    ) : payments.map((pay, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                        <td className="p-4 text-[11px] font-mono text-gray-500">{pay.date}</td>
                        <td className="p-4 text-[11px] font-bold text-[#24a148]">{pay.ref || pay.id}</td>
                        <td className="p-4 text-[11px] text-gray-600">{pay.method}</td>
                        <td className="p-4 text-[11px] font-mono text-gray-500">{pay.method === 'Check' ? pay.check_number : '--'}</td>
                        <td className="p-4 text-[11px] font-black text-black text-right">₱{parseFloat(pay.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white p-6 border border-gray-200 shadow-xl h-fit sticky top-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-black mb-6 flex items-center gap-2">
                  <ArrowDownLeft size={16} className="text-[#24a148]" />
                  Record Payment
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Invoice</label>
                    <select 
                      value={paymentForm.invoice_id}
                      onChange={(e) => setPaymentForm({...paymentForm, invoice_id: e.target.value})}
                      className="w-full bg-[#f4f4f4] border-0 border-b border-gray-200 p-3 text-[11px] focus:outline-none"
                    >
                      <option value="">Manual / Advance Payment</option>
                      {invoices.filter(i => i.status !== 'paid').map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.invoice_number} (₱{parseFloat(inv.amount || 0).toFixed(2)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Amount to Pay (₱)</label>
                    <input 
                      type="number" 
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      placeholder="0.00" 
                      className="w-full bg-[#f4f4f4] border-0 border-b border-[#24a148] p-3 text-lg font-black focus:outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Method</label>
                    <select 
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                      className="w-full bg-[#f4f4f4] border-0 border-b border-gray-200 p-2.5 text-[11px] focus:outline-none"
                    >
                      <option>Bank Transfer</option>
                      <option>Check</option>
                      <option>Cash</option>
                    </select>
                  </div>

                  {paymentForm.method === 'Check' && (
                    <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Check #</label>
                        <input 
                          type="text" 
                          value={paymentForm.check_number}
                          onChange={(e) => setPaymentForm({...paymentForm, check_number: e.target.value})}
                          placeholder="e.g. 123456" 
                          className="w-full bg-[#f4f4f4] border-0 border-b border-gray-200 p-2 text-[11px] focus:outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Bank Name</label>
                        <input 
                          type="text" 
                          value={paymentForm.bank_name}
                          onChange={(e) => setPaymentForm({...paymentForm, bank_name: e.target.value})}
                          placeholder="e.g. BDO / Metrobank" 
                          className="w-full bg-[#f4f4f4] border-0 border-b border-gray-200 p-2 text-[11px] focus:outline-none" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Additional Notes</label>
                    <textarea 
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                      placeholder="Enter payment notes..." 
                      className="w-full bg-[#f4f4f4] border-0 border-b border-gray-200 p-2 text-[11px] focus:outline-none min-h-[60px] resize-none" 
                    />
                  </div>

                  <button 
                    onClick={handlePaymentSubmit}
                    className="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[2px] shadow-lg hover:bg-gray-800 transition-all mt-4"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Manual Adjustment Modal */}
      {showAdjustmentModal && (
        <ManualAdjustmentModal 
          onClose={() => setShowAdjustmentModal(false)}
          onConfirm={(data) => {
            onManualAdjustment(data);
            setShowAdjustmentModal(false);
          }}
        />
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          detail={invoiceDetail}
          isLoading={isLoadingInvoice}
          onClose={closeInvoiceDetail}
          account={account}
        />
      )}
    </div>
  );
}

function InvoiceDetailModal({ invoice, detail, isLoading, onClose, account }) {
  const lineItems = detail?.lineItems || [];
  const subtotal = lineItems.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
  const total = parseFloat(invoice.amount || subtotal);
  const [isExporting, setIsExporting] = React.useState(false);

  // ── Print: hide everything except the invoice ──────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // ── PDF export via jsPDF + html2canvas ─────────────────────────────────────
  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      const el = document.getElementById('invoice-printable-root');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgW = pageW - 20;
      const imgH = imgW / ratio;
      let yPos = 10;
      if (imgH <= pageH - 20) {
        pdf.addImage(imgData, 'PNG', 10, yPos, imgW, imgH);
      } else {
        // Multi-page support
        let heightLeft = imgH;
        while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', 10, yPos - (imgH - heightLeft), imgW, imgH);
          heightLeft -= (pageH - 20);
          if (heightLeft > 0) { pdf.addPage(); yPos = 10; }
        }
      }
      pdf.save(`${invoice.invoice_number || 'invoice'}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF export failed. Please try Print instead.');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Word export via HTML blob (.doc) ───────────────────────────────────────
  const handleDownloadWord = () => {
    const rows = lineItems.map((item, idx) => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #e5e7eb;font-size:11px;color:#6b7280;">${idx + 1}</td>
        <td style="padding:6px 8px;border:1px solid #e5e7eb;font-size:11px;">${item.date}<br/><span style="font-size:10px;color:#9ca3af;">${item.time || ''}</span></td>
        <td style="padding:6px 8px;border:1px solid #e5e7eb;font-size:11px;font-weight:bold;">${item.passenger}</td>
        <td style="padding:6px 8px;border:1px solid #e5e7eb;font-size:11px;color:#4b5563;">${item.route || item.service_type}</td>
        <td style="padding:6px 8px;border:1px solid #e5e7eb;font-size:11px;font-weight:bold;text-align:right;">&#8369;${parseFloat(item.total_amount || 0).toFixed(2)}</td>
      </tr>`).join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><title>${invoice.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #111; margin: 40px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #f4f4f4; padding: 8px; font-size: 10px; text-align: left; border: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px; }
        .label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
        .total-row td { padding: 10px 8px; font-weight: bold; font-size: 14px; border-top: 2px solid #111; }
      </style>
      </head><body>
        <table style="border:none;margin-bottom:24px;">
          <tr>
            <td style="width:50%;border:none;vertical-align:top;">
              <div class="label">Billed To</div>
              <h2 style="margin:4px 0;font-size:16px;">${account.company_name}</h2>
              <div style="font-size:12px;color:#6b7280;">Account: ${account.account_number}</div>
              <div style="font-size:12px;color:#6b7280;">${account.contact_person || ''}</div>
              <div style="font-size:12px;color:#6b7280;">${account.contact_email || ''}</div>
            </td>
            <td style="width:50%;border:none;text-align:right;vertical-align:top;">
              <h1>${invoice.invoice_number}</h1>
              <div class="label">Invoice Date</div>
              <div style="font-size:12px;margin-bottom:8px;">${invoice.date || 'N/A'}</div>
              <div class="label">Billing Period</div>
              <div style="font-size:12px;margin-bottom:8px;">${invoice.period_start ? invoice.period_start + ' to ' + invoice.period_end : 'N/A'}</div>
              <div class="label">Status</div>
              <div style="font-size:12px;font-weight:bold;color:${invoice.status === 'paid' ? '#16a34a' : '#dc2626'};">${(invoice.status || '').toUpperCase()}</div>
            </td>
          </tr>
        </table>

        <div class="label" style="margin-bottom:8px;">Service Line Items</div>
        <table>
          <thead><tr>
            <th>#</th><th>Date / Time</th><th>Passenger</th><th>Service / Route</th><th style="text-align:right;">Amount</th>
          </tr></thead>
          <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:16px;color:#9ca3af;">No records</td></tr>'}</tbody>
          <tfoot>
            <tr><td colspan="4" style="padding:8px;font-size:11px;text-align:right;border-top:1px solid #e5e7eb;">Subtotal</td><td style="padding:8px;font-size:11px;text-align:right;border-top:1px solid #e5e7eb;">&#8369;${subtotal.toFixed(2)}</td></tr>
            <tr class="total-row"><td colspan="4" style="padding:8px;font-size:13px;font-weight:900;text-align:right;">TOTAL DUE</td><td style="padding:8px;font-size:13px;font-weight:900;text-align:right;">&#8369;${total.toFixed(2)}</td></tr>
          </tfoot>
        </table>
        <p style="font-size:10px;color:#9ca3af;margin-top:32px;text-align:center;">Generated by Corporate Billing System &bull; ${new Date().toLocaleDateString()}</p>
      </body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number || 'invoice'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Print styles injected inline — only #invoice-printable-root shows on print */}
      <style>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden;
          }
          /* Show the printable root and its contents */
          #invoice-printable-root, #invoice-printable-root * {
            visibility: visible;
          }
          /* Position the printable area at the top left and center it */
          #invoice-printable-root {
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            margin: 0 auto !important;
            width: 190mm !important; /* Standard A4 width minus margins */
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Specifically hide UI elements even if they are inside the printable root */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div id="invoice-print-portal" className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
        <div id="invoice-printable-root" className="w-full max-w-3xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

          {/* Top bar — hidden on print */}
          <div className="no-print flex justify-between items-center px-8 py-5 bg-black text-white shrink-0">
            <div className="flex items-center gap-4">
              <FileText size={20} className="text-[#24a148]" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice</p>
                <h3 className="text-xl font-black tracking-tight">{invoice.invoice_number}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center p-16 text-gray-400">
              <Loader2 className="animate-spin mr-3" size={24} />
              <span className="text-sm font-medium">Loading invoice details...</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">

              {/* ── Invoice Header ── */}
              <div className="px-8 py-6 border-b border-gray-100 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Billed To</p>
                  <h4 className="text-base font-black text-black uppercase tracking-tight">{account.company_name}</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Account: {account.account_number}</p>
                  <p className="text-[11px] text-gray-500">{account.contact_person}</p>
                  <p className="text-[11px] text-gray-500">{account.contact_email}</p>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice Number</p>
                    <p className="text-lg font-black text-black">{invoice.invoice_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice Date</p>
                    <p className="text-[12px] font-bold text-black">{invoice.date || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billing Period</p>
                    <p className="text-[12px] font-bold text-black">
                      {invoice.period_start ? `${invoice.period_start} → ${invoice.period_end}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{invoice.status}</span>
                  </div>
                </div>
              </div>

              {/* ── Line Items ── */}
              <div className="px-8 py-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Service Line Items</p>
                <table className="w-full text-left border border-gray-100">
                  <thead>
                    <tr className="bg-[#f4f4f4]">
                      <th className="px-4 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">#</th>
                      <th className="px-4 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">Date / Time</th>
                      <th className="px-4 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">Passenger</th>
                      <th className="px-4 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">Service / Route</th>
                      <th className="px-4 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-400 text-sm italic">
                          No service records found for this invoice.
                        </td>
                      </tr>
                    ) : lineItems.map((item, idx) => (
                      <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-[11px] text-gray-400 font-mono">{idx + 1}</td>
                        <td className="px-4 py-3 text-[11px] font-mono text-gray-500">
                          <div>{item.date}</div>
                          <div className="text-[10px] text-gray-400">{item.time}</div>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-bold text-black">{item.passenger}</td>
                        <td className="px-4 py-3 text-[11px] text-gray-600 max-w-[220px] truncate">{item.route}</td>
                        <td className="px-4 py-3 text-[11px] font-black text-black text-right">
                          ₱{parseFloat(item.total_amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Totals ── */}
              <div className="px-8 py-6 border-t border-gray-100">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex justify-between w-60 text-[11px]">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Subtotal</span>
                    <span className="font-bold text-black">₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-60 text-[11px]">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Tax (0%)</span>
                    <span className="font-bold text-black">₱0.00</span>
                  </div>
                  <div className="flex justify-between w-60 pt-3 border-t-2 border-black text-base">
                    <span className="font-black text-black uppercase tracking-tight">Total Due</span>
                    <span className="font-black text-black">₱{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="px-8 pb-6 text-center">
                <p className="text-[10px] text-gray-400">Thank you for your business. &bull; Generated {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* ── Action Footer — hidden on print ── */}
          <div className="no-print px-8 py-4 border-t border-gray-100 flex justify-between items-center shrink-0 bg-gray-50">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {lineItems.length} record{lineItems.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all">
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 border border-gray-700 text-gray-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-700 hover:text-white transition-all"
              >
                🖨 Print
              </button>
              <button
                onClick={handleDownloadWord}
                className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all"
              >
                <Download size={13} /> Word (.doc)
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                {isExporting ? 'Exporting...' : 'PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ManualAdjustmentModal({ onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    type: 'debit',
    amount: '',
    description: '',
    reference: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!formData.description) {
      alert('Please enter a description');
      return;
    }
    onConfirm({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white shadow-2xl animate-zoomIn">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-black text-white">
          <h3 className="text-sm font-black uppercase tracking-widest">Manual Ledger Adjustment</h3>
          <button onClick={onClose} className="hover:rotate-90 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Adjustment Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'debit'})}
                className={`py-2 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  formData.type === 'debit' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                Debit (+) Increase Balance
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'credit'})}
                className={`py-2 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  formData.type === 'credit' ? 'bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                Credit (-) Decrease Balance
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Amount</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              className="w-full bg-[#f4f4f4] border-0 border-b border-black p-3 text-lg font-black focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
            <input 
              type="text" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="e.g. Account Correction"
              className="w-full bg-[#f4f4f4] border-0 border-b border-gray-200 p-2 text-[12px] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Reference (Optional)</label>
            <input 
              type="text" 
              value={formData.reference}
              onChange={(e) => setFormData({...formData, reference: e.target.value})}
              placeholder="e.g. CORR-001"
              className="w-full bg-[#f4f4f4] border-0 border-b border-gray-200 p-2 text-[12px] focus:outline-none"
            />
          </div>

          <div className="pt-4 flex gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CorporateAccountsManagement;
