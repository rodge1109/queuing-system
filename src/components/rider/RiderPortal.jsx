import React, { useState, useEffect } from 'react';
import { Car, ChevronLeft, MapPin, Navigation, Clock, DollarSign, User, Shield, LogOut, RefreshCw, Bell, ChevronRight, Play, CheckCircle2, UserCircle, Briefcase } from 'lucide-react';

const PesoIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 7h6a4 4 0 0 1 0 8H7" />
    <path d="M7 11h8" />
    <path d="M7 15h8" />
    <path d="M7 7v11" />
  </svg>
);

const RiderPortal = () => {
  const [rider, setRider] = useState(() => {
    const saved = localStorage.getItem('rider_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationPulse, setLocationPulse] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [walletData, setWalletData] = useState({ total: 0, earnings: [] });
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    if (rider) {
      localStorage.setItem('rider_user', JSON.stringify(rider));
    } else {
      localStorage.removeItem('rider_user');
    }
  }, [rider]);

  const fetchWallet = async () => {
    if (!rider) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rider/wallet/${rider.id}`);
      const data = await res.json();
      if (data.success) setWalletData(data);
    } catch (e) { }
    setLoading(false);
  };

  const fetchHistory = async () => {
    if (!rider) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rider/history/${rider.id}`);
      const data = await res.json();
      if (data.success) setHistory(data.history);
    } catch (e) { }
    setLoading(false);
  };

  const fetchInbox = async () => {
    if (!rider) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rider/inbox/${rider.id}`);
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (e) { }
    setLoading(false);
  };

  const fetchRequests = async () => {
    if (!isOnline) return;
    setLoading(true);
    try {
      const res = await fetch('/api/rider/requests');
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (e) { }
    setLoading(false);
  };

  const startTracking = () => {
    if (locationPulse) clearInterval(locationPulse);
    const interval = setInterval(() => {
      if (!rider) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        fetch('/api/rider/update-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            riderId: rider.id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        });
      }, null, { enableHighAccuracy: true });
    }, 5000);
    setLocationPulse(interval);
  };

  useEffect(() => {
    if (rider) {
      if (activeTab === 'wallet') fetchWallet();
      if (activeTab === 'history') fetchHistory();
      if (activeTab === 'inbox') fetchInbox();
      if (activeTab === 'jobs') fetchRequests();
    }
  }, [activeTab, rider]);

  useEffect(() => {
    if (rider && !activeJob) {
      const checkActive = async () => {
        try {
          const res = await fetch(`/api/rider/active-job/${rider.id}`);
          const data = await res.json();
          if (data.success && data.activeJob) {
            setActiveJob(data.activeJob);
            startTracking();
          }
        } catch (e) { }
      };
      checkActive();
      const interval = setInterval(checkActive, 10000);
      return () => clearInterval(interval);
    }
  }, [rider, activeJob]);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/rider/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setRider(data.rider);
        if (data.activeJob) {
          setActiveJob(data.activeJob);
          startTracking();
        }
        fetchRequests();
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (e) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = async (id) => {
    if (!rider) return;
    try {
      const res = await fetch('/api/rider/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, riderId: rider.id })
      });
      const data = await res.json();
      if (data.success) {
        const job = requests.find(r => r.id === id);
        setActiveJob({ ...job, transport_status: 'accepted' });
        startTracking();
      }
    } catch (e) { }
  };

  const triggerSOS = async () => {
    if (!window.confirm('TRIGGER EMERGENCY SOS? This will alert the dispatcher and local authorities.')) return;
    
    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await fetch('/api/rider/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripId: activeJob.id,
            riderId: rider.id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            description: 'Emergency SOS triggered from Rider App'
          })
        });
        const data = await res.json();
        if (data.success) {
          setSosActive(true);
          setActiveJob(prev => ({ ...prev, transport_status: 'sos' }));
        }
      });
    } catch (e) {
      alert('Failed to send SOS. Please call emergency services directly.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch('/api/rider/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: activeJob.id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        if (newStatus === 'completed') {
          setActiveJob(null);
          setSosActive(false);
          if (locationPulse) clearInterval(locationPulse);
          fetchRequests();
          if (activeTab === 'wallet') fetchWallet();
        } else {
          setActiveJob(prev => ({ ...prev, transport_status: newStatus }));
        }
      }
    } catch (e) { }
  };

  const topUp = async (amount) => {
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/rider/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId: rider.id, amount })
      });
      const data = await res.json();
      if (data.success) {
        fetchWallet();
      }
    } catch (e) { }
    setLoading(false);
  };

  if (!rider) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="bg-[#00B14F] h-64 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>
          <div className="relative z-10 text-center px-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Car className="w-10 h-10 text-[#00B14F]" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Grab Driver</h1>
            <p className="text-white/80 text-sm mt-1">Accept jobs, earn more, drive better.</p>
          </div>
        </div>

        <div className="flex-1 px-6 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <form onSubmit={login} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Username</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Password</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] outline-none transition-all"
                  />
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
                  <div className="w-1 h-1 bg-red-600 rounded-full" />
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-[#00B14F] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-green-200 hover:bg-[#009e46] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-[11px] text-gray-400 font-medium">Demo Access: <span className="text-gray-600 font-bold">rider1</span> / <span className="text-gray-600 font-bold">rider123</span></p>
            </div>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <p className="text-xs text-gray-300 font-medium">Version 4.12.0 (Build 992)</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    if (activeJob && activeTab === 'jobs') {
      return (
        <div className="px-4 space-y-4 pt-6">
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-[#00B14F]/20">
            <div className={`p-4 ${sosActive ? 'bg-red-600 animate-pulse' : 'bg-[#00B14F]'} text-white flex justify-between items-center transition-colors`}>
              <div className="flex items-center gap-2">
                {sosActive ? <Shield className="w-4 h-4 fill-white" /> : <Navigation className="w-4 h-4 fill-white animate-pulse" />}
                <span className="text-xs font-black uppercase tracking-widest">{sosActive ? 'EMERGENCY SOS ACTIVE' : 'Ongoing Trip'}</span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-tight">{activeJob.transport_status.replace(/_/g, ' ')}</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex gap-4 mb-8">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-4 h-4 rounded-full border-4 border-[#00B14F] bg-white z-10" />
                  <div className="w-0.5 h-12 bg-gray-100 border-dashed border-l-2 my-1" />
                  <div className="w-4 h-4 rounded-full border-4 border-red-500 bg-white z-10" />
                </div>
                <div className="flex flex-col gap-8 flex-1">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Pick up</p>
                    <p className="text-base font-bold text-gray-900 line-clamp-1">{activeJob.pickup_location}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Drop off</p>
                    <p className="text-base font-bold text-gray-900 line-clamp-1">{activeJob.destination_location}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"><User className="w-5 h-5 text-gray-400" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{activeJob.full_name}</p>
                    <p className="text-[10px] font-medium text-gray-400">Standard Booking</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[#00B14F]">PHP {activeJob.total_amount}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {sosActive && (
                  <div className="mb-2 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-700 uppercase tracking-tight">Help is on the way</p>
                      <p className="text-[10px] text-red-600 mt-0.5">The dispatcher has been notified of your location.</p>
                    </div>
                  </div>
                )}
                {activeJob.transport_status === 'accepted' && <button onClick={() => updateStatus('on_way_to_pickup')} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-gray-200 active:scale-95 transition-all">Start Journey to Pickup</button>}
                {activeJob.transport_status === 'on_way_to_pickup' && <button onClick={() => updateStatus('arrived_at_pickup')} className="w-full bg-[#00B14F] text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-green-100 active:scale-95 transition-all">I Have Arrived</button>}
                {activeJob.transport_status === 'arrived_at_pickup' && <button onClick={() => updateStatus('picked_up')} className="w-full bg-[#00B14F] text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-green-100 active:scale-95 transition-all">Passenger is Onboard</button>}
                {activeJob.transport_status === 'picked_up' && <button onClick={() => updateStatus('completed')} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-gray-100 active:scale-95 transition-all">Confirm Drop-off</button>}
                {!sosActive && <button onClick={triggerSOS} className="w-full mt-4 flex items-center justify-center gap-2 text-red-600 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase border-2 border-red-100 active:bg-red-50 transition-all"><Shield className="w-4 h-4" /> Emergency SOS</button>}
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'jobs':
        return (
          <div className="px-4">
            <div className="flex justify-between items-center mb-6 pt-6">
              <div className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-gray-400" /><h3 className="text-base font-bold text-gray-900">Available Jobs</h3></div>
              <button onClick={fetchRequests} disabled={!isOnline || loading} className={`p-2 rounded-full bg-white shadow-sm border border-gray-100 ${loading ? 'animate-spin' : ''}`}><RefreshCw className="w-5 h-5 text-[#00B14F]" /></button>
            </div>
            {!isOnline ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Bell className="w-10 h-10 text-gray-200" /></div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">You're currently offline</h4>
                <p className="text-sm text-gray-400 max-w-[200px] mx-auto">Go online to start receiving job requests nearby.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {requests.map(req => (
                  <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{req.id}</span><div className="bg-[#00B14F]/10 text-[#00B14F] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Instant</div></div>
                        <h4 className="text-2xl font-black text-gray-900">PHP {(parseFloat(req.total_amount) || 0).toFixed(2)}</h4>
                      </div>
                      <div className="bg-gray-900 text-white p-3 rounded-2xl"><Car className="w-5 h-5" /></div>
                    </div>
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#00B14F] mt-1.5 shrink-0 shadow-sm shadow-green-200" />
                        <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Pickup</p><p className="text-xs text-gray-900 font-bold line-clamp-1">{req.pickup_location}</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-sm shadow-red-200" />
                        <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Drop off</p><p className="text-xs text-gray-900 font-bold line-clamp-1">{req.destination_location}</p></div>
                      </div>
                    </div>
                    <button onClick={() => acceptJob(req.id)} className="w-full bg-[#00B14F] text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-green-50 active:scale-95 transition-all group-hover:bg-[#009e46]">Accept Job</button>
                  </div>
                ))}
                {requests.length === 0 && !loading && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="relative mb-6"><Navigation className="w-12 h-12 mx-auto text-gray-100" /><div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 border-2 border-[#00B14F]/20 rounded-full animate-ping" /></div></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Searching for nearby jobs...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'wallet':
        return (
          <div className="px-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight italic">Rider Wallet</h3>
            <div className="bg-gray-900 rounded-3xl p-8 text-white mb-8 relative overflow-hidden shadow-2xl">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-[#00B14F]/10 rounded-full blur-3xl" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available Balance</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-xl font-bold text-[#00B14F]">PHP</span>
                <span className="text-4xl font-black tracking-tighter">{walletData.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <button className="w-full bg-[#00B14F] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all">Withdraw Earnings</button>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Top-up</p>
              <div className="flex gap-2">
                {[50, 100, 500].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => topUp(amt)}
                    className="flex-1 py-3 bg-gray-50 hover:bg-[#00B14F]/10 hover:text-[#00B14F] text-gray-600 rounded-xl text-xs font-bold transition-all border border-gray-100"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input 
                  type="number" 
                  id="customAmount"
                  placeholder="Other amount" 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs outline-none focus:border-[#00B14F]"
                />
                <button 
                  onClick={() => {
                    const val = document.getElementById('customAmount').value;
                    topUp(parseFloat(val));
                    document.getElementById('customAmount').value = '';
                  }}
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-bold"
                >
                  Top Up
                </button>
              </div>
            </div>

            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Transaction History</h4>
            <div className="space-y-3">
              {walletData.earnings.map(e => (
                <div key={e.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${e.type === 'topup' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-[#00B14F]'} rounded-xl flex items-center justify-center`}>
                      {e.type === 'topup' ? <PlusCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{e.description || `Transaction #${e.id}`}</p>
                      <p className="text-[10px] text-gray-400">{new Date(e.date).toLocaleDateString()} at {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-black ${e.type === 'topup' ? 'text-blue-600' : 'text-gray-900'}`}>
                    {e.type === 'topup' ? '+' : ''}PHP {parseFloat(e.amount).toFixed(2)}
                  </p>
                </div>
              ))}
              {walletData.earnings.length === 0 && <p className="text-center py-10 text-xs text-gray-400 italic">No earnings found for today.</p>}
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="px-4 pt-6">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight italic">Trip History</h3>
            <div className="space-y-4">
              {history.map(trip => (
                <div key={trip.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{trip.id} • {new Date(trip.updated_at).toLocaleDateString()}</span>
                    <span className="text-xs font-black text-[#00B14F]">PHP {trip.total_amount}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1" />
                      <p className="text-[11px] text-gray-600 line-clamp-1">{trip.pickup_location}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00B14F] mt-1" />
                      <p className="text-[11px] text-gray-900 font-bold line-clamp-1">{trip.destination_location}</p>
                    </div>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-20 opacity-30"><Car className="w-16 h-16 mx-auto mb-4" /><p className="text-xs font-bold uppercase">No trips completed yet</p></div>
              )}
            </div>
          </div>
        );
      case 'inbox':
        return (
          <div className="px-4 pt-6">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight italic">Driver Inbox</h3>
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className={`p-5 rounded-3xl border ${n.is_read ? 'bg-white border-gray-100' : 'bg-green-50 border-green-100'} transition-all`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{n.title}</h4>
                    <span className="text-[9px] font-bold text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-20 opacity-30"><Bell className="w-16 h-16 mx-auto mb-4" /><p className="text-xs font-bold uppercase">Your inbox is empty</p></div>
              )}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] pb-32">
      <header className="bg-white px-4 pt-12 pb-6 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#00B14F]/10 rounded-full flex items-center justify-center"><User className="text-[#00B14F] w-6 h-6" /></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{rider.name}</h2>
              <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-[#00B14F]" fill="#00B14F" /><span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Verified Driver</span></div>
            </div>
          </div>
          <button onClick={() => { setRider(null); if (locationPulse) clearInterval(locationPulse); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut className="w-6 h-6" /></button>
        </div>
        {!activeJob && (
          <div className="bg-gray-50 p-1.5 rounded-2xl flex items-center gap-1 border border-gray-100">
            <button onClick={() => setIsOnline(true)} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all ${isOnline ? 'bg-[#00B14F] text-white shadow-md shadow-green-100' : 'text-gray-400'}`}>Online</button>
            <button onClick={() => setIsOnline(false)} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all ${!isOnline ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400'}`}>Offline</button>
          </div>
        )}
      </header>

      {!activeJob && activeTab === 'jobs' && (
        <div className="px-4 -mt-3 mb-6 relative z-10">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 grid grid-cols-2 gap-4">
            <div className="border-r border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Today's Earnings</p><div className="flex items-baseline gap-1"><span className="text-sm font-bold text-[#00B14F]">PHP</span><span className="text-2xl font-black text-gray-900 tracking-tight">1,240.00</span></div></div>
            <div className="pl-2"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Jobs Done</p><div className="flex items-center gap-2"><span className="text-2xl font-black text-gray-900">8</span><div className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">GOOD</div></div></div>
          </div>
        </div>
      )}

      {renderTabContent()}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <button onClick={() => setActiveTab('jobs')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'jobs' ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'jobs' ? 'bg-[#00B14F]/10' : ''}`}><Navigation className={`w-6 h-6 ${activeTab === 'jobs' ? 'text-[#00B14F]' : 'text-gray-900'}`} /></div>
          <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'jobs' ? 'text-[#00B14F]' : 'text-gray-900'}`}>Jobs</span>
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'wallet' ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'wallet' ? 'bg-[#00B14F]/10' : ''}`}><PesoIcon className={`w-6 h-6 ${activeTab === 'wallet' ? 'text-[#00B14F]' : 'text-gray-900'}`} /></div>
          <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'wallet' ? 'text-[#00B14F]' : 'text-gray-900'}`}>Wallet</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'history' ? 'bg-[#00B14F]/10' : ''}`}><Clock className={`w-6 h-6 ${activeTab === 'history' ? 'text-[#00B14F]' : 'text-gray-900'}`} /></div>
          <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'history' ? 'text-[#00B14F]' : 'text-gray-900'}`}>History</span>
        </button>
        <button onClick={() => setActiveTab('inbox')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'inbox' ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'inbox' ? 'bg-[#00B14F]/10' : ''}`}><Bell className={`w-6 h-6 ${activeTab === 'inbox' ? 'text-[#00B14F]' : 'text-gray-900'}`} /></div>
          <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'inbox' ? 'text-[#00B14F]' : 'text-gray-900'}`}>Inbox</span>
        </button>
      </div>
    </div>
  );
};

export default RiderPortal;
