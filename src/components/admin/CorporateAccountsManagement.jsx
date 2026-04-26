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
  Mail
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

  useEffect(() => {
    fetchAccounts();
  }, []);

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

  return (
    <div className="flex flex-col h-full bg-white animate-fadeIn">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-2xl font-bold text-black tracking-tighter italic uppercase flex items-center gap-2">
            <Landmark className="text-[#24a148]" size={24} />
            Corporate Accounts
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage corporate clients, credit limits, and billing profiles</p>
        </div>
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
          className="flex items-center gap-2 bg-[#24a148] text-white px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#1e8a3d] transition-all shadow-md active:scale-95"
        >
          <Plus size={18} />
          Add Corporate Client
        </button>
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
                      <h3 className="font-bold text-black truncate text-base tracking-tight uppercase italic">{account.company_name}</h3>
                      <p className="text-[10px] text-gray-500 font-mono tracking-wider">{account.account_number}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-500 uppercase font-bold tracking-tighter">Credit Limit</span>
                      <span className="text-black font-bold">${parseFloat(account.credit_limit || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-500 uppercase font-bold tracking-tighter">Current Balance</span>
                      <span className={`font-bold ${parseFloat(account.balance) > parseFloat(account.credit_limit) ? 'text-red-500' : 'text-[#24a148]'}`}>
                        ${parseFloat(account.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
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
                      onClick={() => handleEdit(account)}
                      className="flex-1 py-2 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 hover:text-black transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit3 size={12} />
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => handleDelete(account.id)}
                      className="w-10 h-8 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all flex items-center justify-center"
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
                <h3 className="text-xl font-bold text-black uppercase tracking-tighter italic">
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

export default CorporateAccountsManagement;
