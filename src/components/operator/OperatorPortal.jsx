import React, { useState, useEffect } from 'react';
import { 
  Home, Car, Users, Wallet, ChevronLeft, UserCircle, 
  Settings, LogOut, Bell, Menu, X, PlusCircle, CreditCard, 
  CheckCircle2, Clock, MapPin, AlertCircle, Trash2, Search, Edit2, Upload, Image, RefreshCw
} from 'lucide-react';

const PesoIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 7h6a4 4 0 0 1 0 8H7" />
    <path d="M7 11h8" />
    <path d="M7 15h8" />
    <path d="M7 7v11" />
  </svg>
);

const OperatorPortal = ({ setCurrentPage }) => {
  const [operator, setOperator] = useState(() => {
    const saved = localStorage.getItem('operator_user');
    return saved ? JSON.parse(saved) : { full_name: 'Operator Admin', phone_number: '+63 912 345 6789' };
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  
  // Mock Data
  const [vehicles, setVehicles] = useState([
    { id: 'V1', plate_number: 'ABC 1234', make: 'Toyota', model: 'Vios', status: 'Approved', active: true, assigned_driver: 'Juan Dela Cruz' },
    { id: 'V2', plate_number: 'XYZ 9876', make: 'Honda', model: 'City', status: 'Approved', active: false, assigned_driver: null },
    { id: 'V3', plate_number: 'DEF 5678', make: 'Mitsubishi', model: 'Mirage', status: 'Pending', active: false, assigned_driver: null }
  ]);

  const [drivers, setDrivers] = useState([
    { id: 'D1', name: 'Juan Dela Cruz', phone: '+63 999 111 2222', status: 'Active', assigned_vehicle: 'V1', earnings: 1540.50 },
    { id: 'D2', name: 'Maria Santos', phone: '+63 999 333 4444', status: 'Offline', assigned_vehicle: null, earnings: 890.00 },
  ]);

  const [newVehicle, setNewVehicle] = useState({ plate_number: '', make: '', model: '', photo_url: '' });
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('operator_user');
    setCurrentPage('home');
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingPhoto(true);
    try {
      const res = await fetch('/api/staff/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setNewVehicle(prev => ({ ...prev, photo_url: data.url }));
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.plate_number || !newVehicle.make || !newVehicle.model) return;
    
    if (editingVehicleId) {
      setVehicles(vehicles.map(v => v.id === editingVehicleId ? { ...v, ...newVehicle } : v));
      alert("Vehicle updated successfully.");
    } else {
      setVehicles([...vehicles, {
        id: `V${vehicles.length + 1}`,
        plate_number: newVehicle.plate_number,
        make: newVehicle.make,
        model: newVehicle.model,
        photo_url: newVehicle.photo_url || '',
        status: 'Pending', // As requested, requires admin approval
        active: false,
        assigned_driver: null
      }]);
      alert("Vehicle added successfully and is pending admin approval.");
    }
    
    setNewVehicle({ plate_number: '', make: '', model: '', photo_url: '' });
    setEditingVehicleId(null);
    setShowAddVehicle(false);
  };

  const handleDeleteVehicle = (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setVehicles(vehicles.filter(v => v.id !== id));
      // Optionally also unassign from drivers if this was a real app
    }
  };

  // --- Sub-Components for Tabs ---
  
  const OverviewTab = () => {
    const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
    const activeVehiclesCount = vehicles.filter(v => v.active).length;
    
    return (
      <div className="p-5 space-y-6 animate-fadeIn pb-24">
        <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#00B14F] to-[#009241] p-5 rounded-3xl text-white shadow-lg shadow-green-200">
            <p className="text-xs font-medium opacity-80 uppercase tracking-widest mb-1">Fleet Earnings</p>
            <div className="flex items-center gap-1">
              <PesoIcon className="w-5 h-5" />
              <p className="text-2xl font-black">{totalEarnings.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Active Vehicles</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-black text-gray-900">{activeVehiclesCount}</p>
              <p className="text-sm text-gray-400 font-medium pb-1">/ {vehicles.length}</p>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Total Drivers</p>
            <p className="text-2xl font-black text-gray-900">{drivers.length}</p>
          </div>
          
          <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Pending Cars</p>
            <p className="text-2xl font-black text-orange-500">{vehicles.filter(v => v.status === 'Pending').length}</p>
          </div>
        </div>
        
        {/* Recent Activity (Mock) */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Recent Activity</h3>
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-[#00B14F] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Trip Completed</p>
                  <p className="text-xs text-gray-400 font-medium">Juan Dela Cruz • Vios (ABC 1234)</p>
                </div>
              </div>
              <p className="text-sm font-black text-[#00B14F]">+₱150.00</p>
            </div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Vehicle Pending</p>
                  <p className="text-xs text-gray-400 font-medium">Mirage (DEF 5678) waiting for admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VehiclesTab = () => {
    return (
      <div className="p-5 space-y-6 animate-fadeIn pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">My Vehicles</h2>
          <button 
            onClick={() => {
              setEditingVehicleId(null);
              setNewVehicle({ plate_number: '', make: '', model: '', photo_url: '' });
              setShowAddVehicle(true);
            }}
            className="flex items-center gap-1.5 bg-[#00B14F] text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            <PlusCircle className="w-4 h-4" /> Add
          </button>
        </div>
        
        <div className="space-y-4">
          {vehicles.map(v => (
            <div key={v.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden ${v.status === 'Approved' ? 'bg-[#E1F5EE] text-[#00B14F]' : 'bg-orange-50 text-orange-500'}`}>
                    {v.photo_url ? (
                      <img src={v.photo_url} alt={v.plate_number} className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 uppercase">{v.plate_number}</h3>
                    <p className="text-xs text-gray-400 font-medium">{v.make} {v.model}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${v.status === 'Approved' ? 'bg-[#00B14F]/10 text-[#00B14F]' : 'bg-orange-100 text-orange-600'}`}>
                    {v.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingVehicleId(v.id);
                        setNewVehicle({ plate_number: v.plate_number, make: v.make, model: v.model, photo_url: v.photo_url || '' });
                        setShowAddVehicle(true);
                      }}
                      className="p-1.5 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {v.status === 'Approved' && (
                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">Driver: {v.assigned_driver || 'Unassigned'}</span>
                  </div>
                  {!v.assigned_driver && (
                    <button className="text-[10px] font-bold text-[#00B14F] uppercase tracking-widest hover:underline">
                      Assign
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const DriversTab = () => {
    return (
      <div className="p-5 space-y-6 animate-fadeIn pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Driver Roster</h2>
          <button className="flex items-center gap-1.5 bg-[#00B14F] text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <PlusCircle className="w-4 h-4" /> Invite
          </button>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search drivers..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#00B14F] shadow-sm font-medium"
          />
        </div>
        
        <div className="space-y-4">
          {drivers.map(d => (
            <div key={d.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <UserCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{d.name}</h3>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{d.phone}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${d.status === 'Active' ? 'bg-[#00B14F]' : 'bg-gray-300'}`} />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{d.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <div className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">
                    {d.assigned_vehicle ? vehicles.find(v => v.id === d.assigned_vehicle)?.plate_number : 'No Vehicle'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#00B14F]">
                  <PesoIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-black">{d.earnings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const WalletTab = () => {
    const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
    return (
      <div className="p-5 space-y-6 animate-fadeIn pb-24">
        <h2 className="text-xl font-bold text-gray-900">Wallet & Earnings</h2>
        
        <div className="bg-[#00B14F] rounded-3xl p-6 text-white shadow-xl shadow-[#00B14F]/20 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium text-white/80 uppercase tracking-widest mb-1">Available Balance</p>
              <div className="flex items-center gap-1">
                <PesoIcon className="w-8 h-8" />
                <h1 className="text-4xl font-black">{totalEarnings.toFixed(2)}</h1>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button className="flex-1 bg-white text-[#00B14F] py-3 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-md">
                Cash Out
              </button>
              <button className="flex-1 bg-[#009241] text-white border border-white/20 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all">
                History
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Add Vehicle Modal ---
  const AddVehicleModal = () => (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${showAddVehicle ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddVehicle(false)} />
      <div className={`w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 relative z-10 transition-transform duration-300 ${showAddVehicle ? 'translate-y-0' : 'translate-y-full sm:translate-y-8 sm:scale-95'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">{editingVehicleId ? "Edit Vehicle" : "Register New Vehicle"}</h3>
          <button onClick={() => setShowAddVehicle(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSaveVehicle} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Plate Number</label>
            <input 
              required
              value={newVehicle.plate_number}
              onChange={(e) => setNewVehicle({...newVehicle, plate_number: e.target.value.toUpperCase()})}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:border-[#00B14F] focus:bg-white transition-colors"
              placeholder="e.g. ABC 1234"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Make</label>
              <input 
                required
                value={newVehicle.make}
                onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#00B14F] focus:bg-white transition-colors"
                placeholder="e.g. Toyota"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Model</label>
              <input 
                required
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#00B14F] focus:bg-white transition-colors"
                placeholder="e.g. Vios"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Vehicle Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-[150px] h-[150px] shrink-0 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden relative group hover:border-[#00B14F] transition-colors">
                {newVehicle.photo_url ? (
                  <img src={newVehicle.photo_url} alt="Vehicle" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#00B14F] transition-colors">
                    <Image className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">150x150</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleUploadPhoto}
                  disabled={uploadingPhoto}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 leading-relaxed mb-3">
                  Upload a clear, photo-realistic image of the vehicle.
                </p>
                {uploadingPhoto && (
                  <div className="flex items-center gap-2 text-sm font-bold text-[#00B14F]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          </div>

          {!editingVehicleId && (
            <div className="bg-orange-50 rounded-2xl p-4 flex items-start gap-3 mt-2">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-orange-800 leading-relaxed">
                New vehicles require admin approval before they can be assigned to drivers and start taking trips.
              </p>
            </div>
          )}
          
          <button 
            type="submit"
            className="w-full bg-[#00B14F] hover:bg-[#009241] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider active:scale-95 transition-all mt-6 shadow-lg shadow-green-100"
          >
            {editingVehicleId ? "Save Changes" : "Submit for Approval"}
          </button>
        </form>
      </div>
    </div>
  );

  // --- Main Layout ---
  return (
    <div className="min-h-screen bg-gray-50 font-['DM_Sans',_sans-serif] text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDrawerOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Operator Hub</h1>
            <p className="text-[10px] font-medium text-[#00B14F] uppercase tracking-widest">{operator?.full_name}</p>
          </div>
        </div>
        <button className="relative p-2 bg-gray-50 rounded-full">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'vehicles' && <VehiclesTab />}
        {activeTab === 'drivers' && <DriversTab />}
        {activeTab === 'wallet' && <WalletTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-md mx-auto flex items-center justify-around p-3">
          {[
            { id: 'overview', icon: Home, label: 'Overview' },
            { id: 'vehicles', icon: Car, label: 'Vehicles' },
            { id: 'drivers', icon: Users, label: 'Drivers' },
            { id: 'wallet', icon: Wallet, label: 'Wallet' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all ${activeTab === tab.id ? 'text-[#00B14F] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[9px] font-bold uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-80'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Sidebar Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-4/5 max-w-sm bg-white h-full flex flex-col animate-slideRight">
            <div className="p-6 bg-[#00B14F] text-white">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                  <UserCircle className="w-10 h-10" />
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <h2 className="text-xl font-bold">{operator?.full_name}</h2>
              <p className="text-sm font-medium text-white/80 mt-1">{operator?.phone_number}</p>
              <div className="mt-4 inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Fleet Operator
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
              <button className="w-full flex items-center gap-4 px-4 py-3.5 text-left text-gray-700 hover:bg-gray-50 rounded-2xl font-bold transition-colors">
                <Settings className="w-5 h-5 text-gray-400" /> Settings
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-3.5 text-left text-gray-700 hover:bg-gray-50 rounded-2xl font-bold transition-colors">
                <AlertCircle className="w-5 h-5 text-gray-400" /> Help & Support
              </button>
            </div>
            
            <div className="p-5 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {AddVehicleModal()}
      
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slideRight { animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default OperatorPortal;
