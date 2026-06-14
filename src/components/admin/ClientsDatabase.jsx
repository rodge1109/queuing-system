import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, Calendar, DollarSign, Activity, FileText, ChevronRight, X, Clock, MapPin, Truck, Stethoscope, History, Plus, Edit, AlertTriangle } from 'lucide-react';

export default function ClientsDatabase() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form State
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      if (data.success) {
        setClients(data.clients);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const openClientProfile = async (client) => {
    setSelectedClient(client);
    setHistoryLoading(true);
    setClientHistory([]);
    try {
      const res = await fetch(`/api/admin/clients/${encodeURIComponent(client.phone)}/history`);
      const data = await res.json();
      if (data.success) {
        setClientHistory(data.history);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenAddForm = () => {
    setEditingClient(null);
    setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    setFormError('');
    setShowClientForm(true);
  };

  const handleOpenEditForm = (client) => {
    setEditingClient(client);
    setFormData({ 
      name: client.name || '', 
      phone: client.phone || '', 
      email: client.email || '', 
      address: client.address || '', 
      notes: client.notes || '' 
    });
    setFormError('');
    setShowClientForm(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const url = editingClient 
        ? `/api/admin/clients/${editingClient.id}` 
        : '/api/admin/clients';
      const method = editingClient ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setShowClientForm(false);
        fetchClients();
        if (selectedClient && editingClient && selectedClient.id === editingClient.id) {
          setSelectedClient({ ...selectedClient, ...data.client });
        }
      } else {
        setFormError(data.message || 'Failed to save client');
      }
    } catch (err) {
      console.error('Error saving client:', err);
      setFormError('An error occurred while saving.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex justify-between items-center bg-white p-4 border border-[#e0e0e0] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest">Client Database</h2>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Total Registered: {clients.length}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#10b981] transition-colors"
            />
          </div>
          <button 
            onClick={handleOpenAddForm}
            className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Add Client
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white border border-[#e0e0e0] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f4f4f4] border-b border-[#e0e0e0]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Client Info</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Total Visits</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Total Spent</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Last Visit</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">Loading clients...</td></tr>
            ) : filteredClients.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No clients found.</td></tr>
            ) : (
              filteredClients.map((client, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{client.name || 'Walk-in Client'}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-medium flex items-center gap-1">
                          <Phone size={10} /> {client.phone !== 'Unknown' ? client.phone : 'No Number'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-full">
                      {client.total_visits}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-gray-800 tracking-tighter">₱{parseFloat(client.total_spent || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-600 font-medium">{new Date(client.last_visit).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-center flex items-center justify-center gap-4">
                    <button 
                      onClick={() => openClientProfile(client)}
                      className="text-[#10b981] hover:text-[#059669] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                    >
                      View Profile <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Client Form Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-widest text-gray-800">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={() => setShowClientForm(false)} className="text-gray-400 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            
            {formError && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} /> {formError}
              </div>
            )}

            <form onSubmit={handleSaveClient} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Full Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 p-2 text-sm focus:border-[#10b981] outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Phone Number *</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full border border-gray-200 p-2 text-sm focus:border-[#10b981] outline-none" placeholder="09123456789" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Email Address</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-200 p-2 text-sm focus:border-[#10b981] outline-none" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border border-gray-200 p-2 text-sm focus:border-[#10b981] outline-none" placeholder="123 Main St, City" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Personal Notes / Medical History</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows="3" className="w-full border border-gray-200 p-2 text-sm focus:border-[#10b981] outline-none" placeholder="Any important notes..."></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowClientForm(false)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-[#10b981] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#059669] transition-colors disabled:opacity-50">
                  {formLoading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Profile Modal */}
      {selectedClient && !showClientForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#f8f9fa] w-full max-w-5xl min-h-[600px] shadow-2xl flex flex-col mt-10 mb-10 relative">
            {/* Modal Header */}
            <div className="bg-[#10b981] p-6 text-white flex justify-between items-start shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded flex items-center justify-center">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-widest">{selectedClient.name || 'Walk-in Client'}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm font-medium opacity-90">
                    <span className="flex items-center gap-1"><Phone size={14} /> {selectedClient.phone !== 'Unknown' ? selectedClient.phone : 'N/A'}</span>
                    {selectedClient.email && <span className="flex items-center gap-1"><Mail size={14} /> {selectedClient.email}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenEditForm(selectedClient)}
                  className="bg-white text-[#10b981] hover:bg-gray-100 px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mr-4 shadow-sm transition-colors"
                >
                  <Edit size={14} /> Edit Profile
                </button>
                <button onClick={() => setSelectedClient(null)} className="text-white hover:bg-white/20 p-2 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar: Details */}
              <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-100 pb-2">Client Details</h4>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1"><MapPin size={12}/> Address</p>
                    <p className="text-sm font-medium text-gray-800">{selectedClient.address || <span className="text-gray-400 italic">No address provided</span>}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1"><FileText size={12}/> Notes / Medical</p>
                    <div className="bg-amber-50 border border-amber-100 p-3 text-sm text-amber-900 rounded-none min-h-[100px] whitespace-pre-wrap">
                      {selectedClient.notes || <span className="text-amber-700/50 italic">No notes available. Click Edit Profile to add records.</span>}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Lifetime Statistics</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Visits</p>
                        <p className="text-xl font-black text-gray-800">{selectedClient.total_visits}</p>
                      </div>
                      <div className="bg-gray-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Spent</p>
                        <p className="text-xl font-black text-gray-800">₱{parseFloat(selectedClient.total_spent || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content: History */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-800 mb-4 flex items-center gap-2">
                  <History size={16} className="text-[#10b981]" /> Transaction History
                </h4>

                {historyLoading ? (
                  <div className="p-8 text-center text-gray-500 font-medium">Loading history...</div>
                ) : clientHistory.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 bg-white border border-dashed border-gray-300">No transactions found for this client.</div>
                ) : (
                  <div className="space-y-4">
                    {clientHistory.map((txn, i) => {
                      const isTransport = txn.service_type === 'Transport';
                      return (
                        <div key={i} className="bg-white border border-gray-200 p-4 shadow-sm flex items-start gap-4 hover:border-[#10b981] transition-colors">
                          <div className={`w-10 h-10 rounded shrink-0 flex items-center justify-center text-white ${isTransport ? 'bg-blue-500' : 'bg-[#10b981]'}`}>
                            {isTransport ? <Truck size={18} /> : <Stethoscope size={18} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-gray-800">{txn.service_type} <span className="text-gray-400 font-normal">|</span> {txn.transaction_type || 'Booking'}</p>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                  <Calendar size={12} /> {new Date(txn.preferred_date || txn.created_at).toLocaleDateString()} at {txn.preferred_time || new Date(txn.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-lg tracking-tighter text-gray-800">₱{parseFloat(txn.total_amount || 0).toLocaleString()}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${txn.status === 'completed' || txn.transport_status === 'completed' ? 'text-green-600' : 'text-amber-500'}`}>
                                  {txn.transport_status || txn.status}
                                </p>
                              </div>
                            </div>
                            {isTransport && (txn.pickup_lat || txn.pickup_address) && (
                              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500"/> Pickup recorded</span>
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center gap-1"><MapPin size={12} className="text-red-500"/> Dropoff recorded</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
