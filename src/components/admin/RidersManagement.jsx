import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Star, 
  ChevronLeft, 
  Wallet,
  Building2,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';

export default function RidersManagement({ riders, setRiders }) {
  const [selectedRiderId, setSelectedRiderId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRider, setEditingRider] = useState(null);

  const selectedRider = riders.find(r => r.id === selectedRiderId);

  if (selectedRider && !editingRider) {
    return <RiderProfile rider={selectedRider} onBack={() => setSelectedRiderId(null)} onEdit={() => setEditingRider(selectedRider)} />;
  }

  if (showAddForm || editingRider) {
    return (
      <AddRiderForm 
        rider={editingRider} 
        onCancel={() => { setShowAddForm(false); setEditingRider(null); }} 
        onSave={(updatedRider) => {
          if (editingRider) {
            setRiders(riders.map(r => r.id === updatedRider.id ? updatedRider : r));
          } else {
            setRiders([...riders, updatedRider]);
          }
          setShowAddForm(false);
          setEditingRider(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-white p-6 border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Rider Management</h2>
          <p className="text-[#64748B] text-sm mt-1">Manage, verify and monitor rider performance</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-[#0f62fe] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#465a8f] transition-all flex items-center gap-2"
        >
          <Users className="w-4 h-4" /> Add New Rider
        </button>
      </div>
      
      <RidersList riders={riders} onSelect={(r) => setSelectedRiderId(r.id)} />
    </div>
  );
}

function RidersList({ riders, onSelect }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = riders.filter((r) => {
    const matchesSearch = 
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).includes(search);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-[#f4f4f4] border border-transparent focus:bg-white focus:border-[#0f62fe] outline-none text-sm transition-all"
            placeholder="Search by name, ID or plate number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2.5 bg-[#f4f4f4] border border-transparent focus:bg-white focus:border-[#0f62fe] outline-none text-sm transition-all cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f4f4f4]">
              <th className="px-6 py-4 text-[10px] font-bold text-[#525252] uppercase tracking-widest">Rider</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#525252] uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#525252] uppercase tracking-widest">Vehicle Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#525252] uppercase tracking-widest">Rating</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#525252] uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((rider) => (
              <tr key={rider.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-0 flex items-center justify-center text-blue-600 font-bold">
                      {rider.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#161616] text-sm">{rider.name}</p>
                      <p className="text-[10px] text-[#525252] font-mono uppercase tracking-tighter">ID: #{rider.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${
                    rider.status === 'online' ? 'bg-green-50 border-green-600 text-green-700' :
                    rider.status === 'offline' ? 'bg-gray-50 border-gray-400 text-gray-600' :
                    'bg-red-50 border-red-600 text-red-700'
                  }`}>
                    {rider.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-[#161616] font-medium">{rider.vehicle_type || 'N/A'}</span>
                    <span className="text-[10px] text-[#525252] font-mono">{rider.plate_number || 'No Plate'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-[#161616]">{rider.rating || '4.8'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onSelect(rider)}
                    className="text-[#0f62fe] text-[10px] font-bold uppercase tracking-widest hover:underline"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <p className="text-gray-400 italic text-sm">No riders found matching your search</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiderProfile({ rider, onBack, onEdit }) {
  const [trips, setTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoadingTrips(true);
      try {
        const res = await fetch(`/api/admin/riders/${rider.id}/trips`);
        const data = await res.json();
        if (data.success) setTrips(data.trips);
      } catch (err) { }
      finally { setIsLoadingTrips(false); }
    };
    fetchTrips();
  }, [rider.id]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white border border-gray-200 hover:bg-gray-50 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-[#0F172A]">Rider Profile</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-8 border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 rounded-0 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
              {rider.name?.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-[#161616]">{rider.name}</h3>
            <p className="text-[10px] text-[#525252] font-mono uppercase tracking-widest mt-1">Ref ID: {rider.id}</p>
            
            <div className="mt-6 w-full pt-6 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#525252] font-bold uppercase tracking-wider">Status</span>
                <span className={`font-bold uppercase tracking-widest ${rider.status === 'online' ? 'text-green-600' : 'text-gray-400'}`}>{rider.status}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#525252] font-bold uppercase tracking-wider">Rating</span>
                <div className="flex items-center gap-1 font-bold text-[#161616]">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {rider.rating || '4.8'}
                </div>
              </div>
            </div>

            <div className="mt-8 w-full space-y-2">
              <button 
                onClick={onEdit}
                className="w-full py-3 bg-[#0f62fe] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#465a8f] transition-all"
              >
                Edit Information
              </button>
              <button className="w-full py-3 bg-[#da1e28] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#750e13] transition-all">
                Suspend Rider
              </button>
            </div>
          </div>

          <div className="bg-[#161616] p-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Rider Wallet</p>
                <h4 className="text-3xl font-bold">₱2,350.00</h4>
              </div>
              <Wallet className="text-gray-600 w-8 h-8" />
            </div>
            <button className="w-full py-3 bg-[#393939] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#525252] transition-all">
              Request Payout
            </button>
          </div>
        </div>

        {/* Right Column: Details & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-6 border border-gray-100 shadow-sm h-full">
              <h4 className="text-xs font-bold text-[#525252] uppercase tracking-widest border-b border-gray-100 pb-4 mb-4">Personal Details</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Phone Number</p>
                  <p className="text-sm font-medium">{rider.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Email Address</p>
                  <p className="text-sm font-medium">{rider.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Current Address</p>
                  <p className="text-sm font-medium">{rider.address || 'N/A'}</p>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 border border-gray-100 shadow-sm h-full">
              <h4 className="text-xs font-bold text-[#525252] uppercase tracking-widest border-b border-gray-100 pb-4 mb-4">Vehicle Information</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Vehicle Type</p>
                  <p className="text-sm font-medium">{rider.vehicle_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Plate Number</p>
                  <p className="text-sm font-medium font-mono">{rider.plate_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Brand / Model</p>
                  <p className="text-sm font-medium">{rider.brand_model || 'N/A'}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-[#0F172A]">Trip History</h3>
              <span className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">{trips.length} Total Trips</span>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
              {isLoadingTrips ? (
                <div className="p-12 text-center text-gray-400 italic">Fetching history...</div>
              ) : trips.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#f4f4f4]">
                      <th className="px-6 py-4 text-[9px] font-bold text-[#525252] uppercase tracking-widest">Trip ID</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-[#525252] uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-[#525252] uppercase tracking-widest">Fare</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-[#525252] uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {trips.map(trip => (
                      <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono">#{trip.id}</td>
                        <td className="px-6 py-4">{new Date(trip.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold">PHP {parseFloat(trip.total_amount).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter ${trip.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-gray-300 italic text-sm">This rider hasn't completed any trips yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddRiderForm({ rider, onCancel, onSave }) {
  const [form, setForm] = useState(rider || {
    name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    address: "",
    vehicle_type: "",
    plate_number: "",
    brand_model: "",
    status: "offline"
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = rider ? `/api/admin/riders/${rider.id}` : '/api/admin/riders';
      const method = rider ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        onSave(data.rider || { ...form, id: rider?.id });
      } else {
        alert(data.message || 'Error saving rider');
      }
    } catch (err) {
      alert('Network error while saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 shadow-sm animate-fadeIn max-w-4xl mx-auto">
      <div className="p-8 border-b border-gray-100">
        <h2 className="text-xl font-bold text-[#161616]">{rider ? 'Edit Rider Profile' : 'Register New Rider'}</h2>
        <p className="text-[#64748B] text-sm mt-1">Ensure all information is accurate and verified</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-[#0f62fe] uppercase tracking-widest border-b pb-2">Personal Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  required
                  className="w-full bg-[#f4f4f4] border-b-2 border-transparent focus:border-[#0f62fe] p-3 text-sm outline-none transition-all"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email"
                  className="w-full bg-[#f4f4f4] border-b-2 border-transparent focus:border-[#0f62fe] p-3 text-sm outline-none transition-all"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest mb-2">Phone Number</label>
                <input 
                  required
                  className="w-full bg-[#f4f4f4] border-b-2 border-transparent focus:border-[#0f62fe] p-3 text-sm outline-none transition-all"
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-[#0f62fe] uppercase tracking-widest border-b pb-2">Account Credentials</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest mb-2">Login Username</label>
                <input 
                  required
                  disabled={!!rider}
                  className="w-full bg-[#f4f4f4] border-b-2 border-transparent focus:border-[#0f62fe] p-3 text-sm outline-none transition-all disabled:opacity-50"
                  value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                />
              </div>
              {!rider && (
                <div>
                  <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest mb-2">Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full bg-[#f4f4f4] border-b-2 border-transparent focus:border-[#0f62fe] p-3 text-sm outline-none transition-all"
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  />
                </div>
              )}
              {rider && (
                <div>
                   <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest mb-2">Rider Account Status</label>
                   <select 
                    className="w-full bg-[#f4f4f4] border-b-2 border-transparent focus:border-[#0f62fe] p-3 text-sm outline-none transition-all"
                    value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                   >
                     <option value="offline">Offline</option>
                     <option value="online">Online</option>
                     <option value="suspended">Suspended</option>
                   </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <h4 className="text-xs font-bold text-[#0f62fe] uppercase tracking-widest border-b pb-2">Vehicle Specification</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest mb-2">Vehicle Type</label>
              <select 
                required
                className="w-full bg-[#f4f4f4] border-b-2 border-transparent focus:border-[#0f62fe] p-3 text-sm outline-none transition-all"
                value={form.vehicle_type} onChange={e => setForm({...form, vehicle_type: e.target.value})}
              >
                <option value="">Select Type</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Car">Car (Sedan/SUV)</option>
                <option value="Luxury Van">Luxury White Van</option>
                <option value="Truck">Logistics Truck</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest mb-2">Plate Number</label>
              <input 
                required
                className="w-full bg-[#f4f4f4] border-b-2 border-transparent focus:border-[#0f62fe] p-3 text-sm outline-none transition-all font-mono"
                value={form.plate_number} onChange={e => setForm({...form, plate_number: e.target.value})}
                placeholder="ABC-1234"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-widest mb-2">Brand / Model</label>
              <input 
                required
                className="w-full bg-[#f4f4f4] border-b-2 border-transparent focus:border-[#0f62fe] p-3 text-sm outline-none transition-all"
                value={form.brand_model} onChange={e => setForm({...form, brand_model: e.target.value})}
                placeholder="e.g. Toyota Vios"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 border-t border-gray-100">
          <button 
            type="button"
            onClick={onCancel}
            className="px-8 py-3 bg-gray-100 text-[#161616] text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-[#0f62fe] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#465a8f] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Rider Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
