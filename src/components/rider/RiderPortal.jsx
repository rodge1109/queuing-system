import React, { useState, useEffect, useRef } from 'react';
import { Car, ChevronLeft, MapPin, Navigation, Clock, DollarSign, User, Shield, LogOut, RefreshCw, Bell, ChevronRight, Play, CheckCircle2, UserCircle, Briefcase, Menu, X, History, Home, Settings, HelpCircle, LifeBuoy, Percent, Globe, MessageSquare, Phone, PlusCircle, Compass } from 'lucide-react';
import LiveTrackingMap from '../maps/LiveTrackingMap';

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
  const [declinedJobs, setDeclinedJobs] = useState([]);
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPos, setCurrentPos] = useState({ lat: 11.0500, lng: 124.0000 });
  const [sheetState, setSheetState] = useState('medium'); // 'minimized', 'medium', 'expanded'
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showNewJobAlert, setShowNewJobAlert] = useState(false);
  const prevRequestsCount = useRef(0);

  const playPing = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
      
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.50, ctx.currentTime);
        gain2.gain.setValueAtTime(1, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.5);
      }, 150);
    } catch (e) {
      console.warn("Audio not supported or blocked");
    }
  };

  useEffect(() => {
    if (requests.length > prevRequestsCount.current) {
      if (!activeJob && rider) {
        setSheetState('expanded');
        setShowNewJobAlert(true);
        playPing();
        setTimeout(() => setShowNewJobAlert(false), 4000);
      }
    }
    prevRequestsCount.current = requests.length;
  }, [requests, activeJob, rider]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Error watching position", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const forceGPSRefresh = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        alert(`Location updated successfully! (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      (err) => {
        alert(`GPS Error: ${err.message}. Please make sure location services are enabled for this browser/site.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setCurrentPos({ lat: newLat, lng: newLng });
          fetch('/api/rider/update-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              riderId: rider.id,
              lat: newLat,
              lng: newLng
            })
          });
        },
        (err) => {
          console.error("Tracking location error:", err);
        },
        { enableHighAccuracy: true }
      );
    }, 4000); // update every 4 seconds
    setLocationPulse(interval);
  };

  useEffect(() => {
    if (rider) {
      fetchWallet();
      if (activeTab === 'history') fetchHistory();
      if (activeTab === 'inbox') fetchInbox();
      if (activeTab === 'jobs') fetchRequests();
    }
  }, [activeTab, rider, isOnline]);

  useEffect(() => {
    let interval;
    if (rider && isOnline && activeTab === 'jobs' && !activeJob) {
      interval = setInterval(fetchRequests, 4000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [rider, isOnline, activeTab, activeJob]);

  const prevReqsLength = useRef(0);
  useEffect(() => {
    if (requests.length > prevReqsLength.current && !activeJob) {
      setActiveTab('jobs');
      setSheetState('expanded');
    }
    prevReqsLength.current = requests.length;
  }, [requests.length, activeJob]);

  const todayEarnings = walletData.earnings
    .filter(e => new Date(e.date).toDateString() === new Date().toDateString() && e.type !== 'topup')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
  
  const todayJobs = walletData.earnings
    .filter(e => new Date(e.date).toDateString() === new Date().toDateString() && e.type !== 'topup')
    .length;

  const fetchMessages = async () => {
    if (!activeJob || !isChatOpen) return;
    try {
      const res = await fetch(`/api/rider/messages/${activeJob.id}`);
      const data = await res.json();
      if (data.success) setChatMessages(data.messages);
    } catch (e) { }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !activeJob) return;
    const msg = chatInput;
    setChatInput('');
    try {
      const res = await fetch('/api/rider/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: activeJob.id,
          senderType: 'rider',
          senderId: rider.id,
          message: msg
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, data.message]);
      }
    } catch (e) { }
  };

  useEffect(() => {
    let interval;
    if (isChatOpen && activeJob) {
      fetchMessages();
      interval = setInterval(fetchMessages, 5000);
    }
    return () => clearInterval(interval);
  }, [isChatOpen, activeJob]);

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
        setSheetState('expanded');
        startTracking();
      } else {
        alert(data.message || 'Could not accept job. It may have been taken already.');
        fetchRequests(); // Refresh the list
      }
    } catch (e) {
      alert('Connection error. Please try again.');
    }
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
          setSheetState('medium');
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
            <img src="/uploads/byahero2.png" alt="Byahero Logo" className="h-40 w-auto object-contain mx-auto mb-4 transform translate-y-[10px]" />
            <p className="text-white/80 text-sm mt-1 transform -translate-y-[5px]">Accept jobs, earn more, drive better.</p>
          </div>
        </div>

        <div className="flex-1 px-6 -mt-8 relative z-20">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
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
    switch (activeTab) {
      case 'wallet':
        return (
          <div className="px-4 space-y-4 pt-6 pb-32 animate-in fade-in duration-500 bg-white/60 backdrop-blur-xl min-h-screen">
            <div className="bg-[#00B14F] p-8 rounded-2xl text-white shadow-xl shadow-green-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Available Balance</p>
              <h3 className="text-4xl font-black mb-6 tracking-tighter">PHP {(parseFloat(rider?.balance) || 0).toLocaleString()}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Today's Earnings</p>
                  <p className="text-xl font-black">PHP {todayEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Jobs Done</p>
                  <p className="text-xl font-black">{todayJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Recent Transactions</h4>
              </div>
              <div className="space-y-4">
                {walletData.earnings.slice(0, 5).map(e => (
                  <div key={e.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${e.type === 'topup' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-[#00B14F]'}`}>
                        {e.type === 'topup' ? <PlusCircle className="w-5 h-5" /> : <PesoIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{e.description}</p>
                        <p className="text-[9px] font-medium text-gray-400">{new Date(e.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-black ${e.type === 'topup' ? 'text-blue-600' : 'text-[#00B14F]'}`}>
                      {e.type === 'topup' ? '+' : ''}PHP {parseFloat(e.amount).toLocaleString()}
                    </p>
                  </div>
                ))}
                {walletData.earnings.length === 0 && <p className="text-center py-10 text-xs text-gray-400 italic">No transactions yet.</p>}
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="px-4 pt-6 pb-32 bg-white/60 backdrop-blur-xl min-h-screen">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight italic">Trip History</h3>
            <div className="space-y-4">
              {history.map(trip => (
                <div key={trip.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
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
          <div className="px-4 pt-6 pb-32 bg-white/60 backdrop-blur-xl min-h-screen">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight italic">Inbox</h3>
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className={`p-5 rounded-2xl border ${n.is_read ? 'bg-white border-gray-100' : 'bg-green-50 border-green-100'} transition-all`}>
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

  const renderBottomSheet = () => {
    if (activeTab !== 'jobs') return null;

    return (
      <div 
        className={`fixed left-0 right-0 bottom-0 z-[70] transition-all duration-500 ease-in-out ${
          sheetState === 'minimized' ? 'translate-y-[calc(100%-80px)]' : 
          sheetState === 'medium' ? 'translate-y-[calc(100%-290px)]' : 'translate-y-0'
        }`}
      >
        {/* Handle */}
        <div 
          onClick={() => setSheetState(sheetState === 'expanded' ? 'medium' : 'expanded')}
          className="bg-white/70 backdrop-blur-2xl rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/40 p-4 cursor-pointer"
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
          
          {activeJob ? (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${sosActive ? 'bg-red-100' : 'bg-[#00B14F]/10'} rounded-xl flex items-center justify-center`}>
                  <Car className={`w-5 h-5 ${sosActive ? 'text-red-600' : 'text-[#00B14F]'} animate-pulse`} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Ongoing Trip • {activeJob.transport_status.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-bold text-gray-900 truncate max-w-[180px]">{activeJob.destination_location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${sheetState === 'expanded' ? 'rotate-[-90deg]' : 'rotate-90'}`} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Available Jobs</h3>
                  <p className="text-[10px] font-medium text-gray-400">{requests.length} jobs nearby</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); fetchRequests(); }} className="p-2 text-[#00B14F] hover:bg-green-50 rounded-full transition-colors">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="bg-white/95 backdrop-blur-2xl h-[45vh] overflow-y-auto overflow-x-hidden no-scrollbar px-4 pb-20 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          {activeJob ? (
            <div className="py-4 space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1.5">
                  <div className="w-3.5 h-3.5 rounded-full border-4 border-[#00B14F] bg-white z-10 shrink-0" />
                  <div className="w-0.5 flex-1 bg-gray-200 my-0.5 rounded-full" />
                  <div className="w-3.5 h-3.5 rounded-full border-4 border-red-500 bg-white z-10 shrink-0" />
                </div>
                <div className="flex flex-col justify-between flex-1 py-0.5">
                  <div className="mb-3">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5 tracking-widest">Pick up</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{activeJob.pickup_location}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5 tracking-widest">Drop off</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{activeJob.destination_location}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400 border border-gray-100"><User className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-black text-gray-900 leading-none mb-1">{activeJob.full_name}</p>
                    <span className="text-[9px] font-black text-[#00B14F] uppercase tracking-widest">Standard Booking</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  {(activeJob.phone_number || activeJob.contact_number || activeJob.phone) && (
                    <a 
                      href={`tel:${activeJob.phone_number || activeJob.contact_number || activeJob.phone}`}
                      className="w-10 h-10 bg-[#E1F5EE] text-[#00B14F] rounded-full flex items-center justify-center hover:bg-[#00B14F] hover:text-white transition-all"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  <div className="text-right ml-2">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Fare</p>
                    <p className="text-base font-black text-black tracking-tighter">PHP {activeJob.total_amount}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {activeJob.transport_status === 'accepted' && <button onClick={() => updateStatus('on_way_to_pickup')} className="w-full bg-gray-900 text-white py-3.5 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-gray-800 transition-all">Start Journey to Pickup</button>}
                {activeJob.transport_status === 'on_way_to_pickup' && <button onClick={() => updateStatus('arrived_at_pickup')} className="w-full bg-[#00B14F] text-white py-3.5 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-[#009241] transition-all">I Have Arrived</button>}
                {activeJob.transport_status === 'arrived_at_pickup' && <button onClick={() => updateStatus('picked_up')} className="w-full bg-[#00B14F] text-white py-3.5 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-[#009241] transition-all">Passenger is Onboard</button>}
                {activeJob.transport_status === 'picked_up' && <button onClick={() => updateStatus('completed')} className="w-full bg-gray-900 text-white py-3.5 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-gray-800 transition-all">Confirm Drop-off</button>}
                {!sosActive && <button onClick={triggerSOS} className="w-full flex items-center justify-center gap-1.5 text-red-500 py-3 rounded-full font-black text-[9px] tracking-widest uppercase border border-red-100 hover:bg-red-50 transition-all"><Shield className="w-3 h-3" /> Emergency SOS</button>}
              </div>
            </div>
          ) : (
            <div className="py-6">
              {!isOnline ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Bell className="w-10 h-10 text-gray-200" /></div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">You're currently offline</h4>
                  <p className="text-sm text-gray-400 max-w-[220px] mx-auto">Go online using the toggle at the top to start receiving jobs.</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Car className="w-16 h-16 text-[#00B14F]" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Searching for nearby jobs...</h4>
                  <p className="text-xs text-gray-400">We'll notify you as soon as someone books a ride.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {requests.filter(req => !declinedJobs.includes(req.id)).map(req => (
                    <div key={req.id} className="bg-white/40 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/40 hover:bg-white/60 transition-all active:scale-[0.98]">
                      <div className="flex flex-col mb-4 gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{req.id}</span>
                          <div className="bg-[#00B14F]/10 text-[#00B14F] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0">Instant</div>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <h4 className="text-2xl font-black text-gray-900 tracking-tighter truncate">PHP {parseFloat(req.total_amount).toFixed(2)}</h4>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setDeclinedJobs([...declinedJobs, req.id])} className="bg-gray-900 text-white px-4 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all">Decline</button>
                            <button onClick={() => acceptJob(req.id)} className="bg-[#00B14F] text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-[#009241] transition-all">Accept</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-gray-500 mb-3 bg-gray-50 p-3 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#00B14F] rounded-full shrink-0"></div>
                          <p className="text-xs font-bold truncate text-gray-700">{req.pickup_location}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                          <p className="text-xs font-bold truncate text-gray-700">{req.destination_location}</p>
                        </div>
                      </div>
                      {req.notes && (
                        <div className="bg-yellow-50 rounded-xl p-3 mb-3 border border-yellow-100">
                          <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">Notes from passenger</p>
                          <p className="text-xs font-medium text-gray-700">{req.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                        <div className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 shrink-0" /> <span>{req.service_type}</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0" /> <span>Now</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Fixed Background Map */}
      <div className="fixed inset-0 z-0">
        <LiveTrackingMap 
          riderPos={currentPos}
          pickupPos={activeJob ? { lat: activeJob.pickup_lat || 11.05, lng: activeJob.pickup_lng || 124.00 } : null}
          destPos={activeJob ? { lat: activeJob.dest_lat || 11.06, lng: activeJob.dest_lng || 124.01 } : null}
          status={activeJob?.transport_status}
        />
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />
      </div>

      <div className="relative z-10">
        <header className="bg-white/80 backdrop-blur-lg px-4 pt-4 pb-4 fixed top-0 left-0 right-0 z-[60] shadow-sm border-b border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-[#00B14F]/10 rounded-full flex items-center justify-center"><User className="text-[#00B14F] w-5 h-5" /></div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">{rider.name}</h2>
                <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-[#00B14F]" fill="#00B14F" /><span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Verified</span></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[8px] font-black uppercase tracking-widest ${isOnline ? 'text-[#00B14F]' : 'text-gray-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <button 
                  onClick={() => setIsOnline(!isOnline)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 focus:outline-none ${isOnline ? 'bg-[#00B14F]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${isOnline ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="h-[73px] pointer-events-none w-full" />

        {renderTabContent()}
        {renderBottomSheet()}

        {/* New Job Alert Overlay */}
        {showNewJobAlert && (
          <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300" onClick={() => setShowNewJobAlert(false)}>
            <div className="relative flex items-center justify-center w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-[#00B14F] rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 bg-[#00B14F] rounded-full animate-pulse opacity-90"></div>
              <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <Car className="w-10 h-10 text-[#00B14F]" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2 animate-bounce text-center px-4">New Ride Request!</h2>
            <p className="text-green-400 font-bold mb-8 uppercase tracking-widest text-xs">Tap anywhere to view</p>
          </div>
        )}

        {/* Chat Window Overlay */}
        {isChatOpen && activeJob && (
          <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-300">
            <div className="bg-white rounded-t-2xl h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-500"><User className="w-6 h-6" /></div>
                  <div>
                    <h4 className="text-base font-black text-gray-900 tracking-tight">{activeJob.full_name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Passenger • Trip #{activeJob.id}</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-3 bg-white hover:bg-gray-100 rounded-full shadow-sm transition-all active:scale-90"><X className="w-6 h-6 text-gray-900" /></button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 scrollbar-hide">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                    <MessageSquare className="w-16 h-16 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">No messages yet</p>
                  </div>
                ) : (
                  chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'rider' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                        msg.sender_type === 'rider' 
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100' 
                          : 'bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200'
                      }`}>
                        {msg.message}
                        <p className={`text-[8px] mt-1.5 font-bold uppercase opacity-60 ${msg.sender_type === 'rider' ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <form onSubmit={sendMessage} className="flex gap-3">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  />
                  <button 
                    type="submit"
                    className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-all"
                  >
                    <Play className="w-5 h-5 fill-white" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 px-6 py-1.5 flex justify-between items-center z-[80] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <button onClick={() => { setActiveTab('jobs'); setSheetState('expanded'); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'jobs' ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
            <div className={`p-2 rounded-xl ${activeTab === 'jobs' ? 'bg-[#00B14F]/10' : ''}`}><Navigation className={`w-6 h-6 ${activeTab === 'jobs' ? 'text-[#00B14F]' : 'text-gray-900'}`} /></div>
            <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'jobs' ? 'text-[#00B14F]' : 'text-gray-900'}`}>Jobs</span>
          </button>
          <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'wallet' ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
            <div className={`p-2 rounded-xl ${activeTab === 'wallet' ? 'bg-[#00B14F]/10' : ''}`}><PesoIcon className={`w-6 h-6 ${activeTab === 'wallet' ? 'text-[#00B14F]' : 'text-gray-900'}`} /></div>
            <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'wallet' ? 'text-[#00B14F]' : 'text-gray-900'}`}>Wallet</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
            <div className={`p-2 rounded-xl ${activeTab === 'history' ? 'bg-[#00B14F]/10' : ''}`}><History className={`w-6 h-6 ${activeTab === 'history' ? 'text-[#00B14F]' : 'text-gray-900'}`} /></div>
            <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'history' ? 'text-[#00B14F]' : 'text-gray-900'}`}>History</span>
          </button>
          <button onClick={() => setActiveTab('inbox')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'inbox' ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
            <div className={`p-2 rounded-xl ${activeTab === 'inbox' ? 'bg-[#00B14F]/10' : ''}`}><Bell className={`w-6 h-6 ${activeTab === 'inbox' ? 'text-[#00B14F]' : 'text-gray-900'}`} /></div>
            <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'inbox' ? 'text-[#00B14F]' : 'text-gray-900'}`}>Inbox</span>
          </button>
        </div>

        {/* Side Drawer Overlay */}
        {isDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Side Drawer Content */}
        <div className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[100] shadow-2xl transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          <div className="p-6 bg-gray-900 text-white flex-shrink-0">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <UserCircle className="w-10 h-10 text-gray-900" />
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <h3 className="text-xl font-black">{rider.name}</h3>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Diamond Member</p>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide py-4">
            <div className="px-6 py-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Menu</p>
              <div className="space-y-0.5">
                {[
                  { icon: Globe, label: 'City' },
                  { icon: History, label: 'Request History' },
                  { icon: MapPin, label: 'My Addresses' },
                  { icon: Bell, label: 'Notifications' },
                  { icon: Shield, label: 'Safety' },
                  { icon: Settings, label: 'Settings' },
                  { icon: HelpCircle, label: 'Help' },
                  { icon: LifeBuoy, label: 'Support' }
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    className="w-full flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded-xl transition-all group"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <div className="w-10 h-10 bg-gray-50 group-hover:bg-gray-900 group-hover:text-white rounded-full flex items-center justify-center transition-colors">
                      <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 flex-shrink-0">
            <button 
              onClick={() => { setRider(null); if (locationPulse) clearInterval(locationPulse); }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#00B14F] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#009e46] transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderPortal;
