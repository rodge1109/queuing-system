import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Phone, 
  User, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Star, 
  MapPin, 
  Shield, 
  AlertTriangle,
  Menu,
  ChevronRight,
  Home,
  Settings,
  LogOut,
  Power,
  Bell
} from 'lucide-react';

const RiderModernDashboard = ({ rider, onLogout }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [stats, setStats] = useState({ todayTrips: 7, onlineTime: '3h 20m', earnings: 640 });
  const [isNavigating, setIsNavigating] = useState(false);

  // Poll for job requests and active job status
  useEffect(() => {
    const poll = async () => {
      try {
        // 1. Fetch pending requests
        if (isOnline && !activeJob) {
          const reqRes = await fetch('/api/rider/requests');
          const reqData = await reqRes.json();
          if (reqData.success) setPendingRequests(reqData.requests);
        }

        // 2. Fetch active job status if tracking
        if (activeJob) {
          const jobRes = await fetch(`/api/appointments/${activeJob.id}`);
          const jobData = await jobRes.json();
          if (jobData.success) {
            if (jobData.appointment.transport_status === 'completed') {
              setActiveJob(null);
              setIsNavigating(false);
            } else {
              setActiveJob(jobData.appointment);
            }
          }
        }
      } catch (err) {
        console.error('Rider poll error:', err);
      }
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [isOnline, activeJob]);

  // GPS Reporting Simulation
  const [currentPos, setCurrentPos] = useState({ lat: 11.0500, lng: 124.0000 });

  useEffect(() => {
    if (!isOnline) return;

    const reportLocation = async () => {
      let targetLat = currentPos.lat;
      let targetLng = currentPos.lng;

      if (activeJob) {
        // Move towards target (pickup or destination)
        const dest = activeJob.transport_status === 'picked_up' 
          ? { lat: activeJob.dest_lat, lng: activeJob.dest_lng }
          : { lat: activeJob.pickup_lat, lng: activeJob.pickup_lng };

        if (dest.lat && dest.lng) {
          // Move 10% closer to destination every 3 seconds for simulation
          targetLat = currentPos.lat + (dest.lat - currentPos.lat) * 0.1;
          targetLng = currentPos.lng + (dest.lng - currentPos.lng) * 0.1;
        }
      } else {
        // Just slight jitter if idle
        targetLat += (Math.random() - 0.5) * 0.0001;
        targetLng += (Math.random() - 0.5) * 0.0001;
      }

      setCurrentPos({ lat: targetLat, lng: targetLng });

      try {
        await fetch('/api/rider/update-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            riderId: rider.id || 1, 
            lat: targetLat, 
            lng: targetLng,
            appointmentId: activeJob?.id 
          })
        });
      } catch (err) {}
    };

    const interval = setInterval(reportLocation, 3000);
    return () => clearInterval(interval);
  }, [isOnline, activeJob, currentPos, rider.id]);

  const handleAccept = async (job) => {
    try {
      const res = await fetch('/api/rider/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appointmentId: job.id,
          riderId: rider.id || 1 
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveJob(data.trip);
        setPendingRequests(prev => prev.filter(r => r.id !== job.id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      const res = await fetch(`/api/appointments/${activeJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', transport_status: status })
      });
      const data = await res.json();
      if (data.success) {
        if (status === 'completed') {
          setActiveJob(null);
          setIsNavigating(false);
          // Refresh stats
          setStats(prev => ({ ...prev, todayTrips: prev.todayTrips + 1, earnings: prev.earnings + parseFloat(activeJob.total_amount) }));
        } else {
          setActiveJob(data.appointment);
        }
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen font-['DM_Sans',_sans-serif] flex flex-col pb-20">
      {/* Header Bar */}
      <div className={`p-4 transition-colors duration-300 ${isOnline ? 'bg-[#E1F5EE]' : 'bg-gray-100'}`}>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#00B14F] animate-pulse' : 'bg-gray-400'}`}></div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${isOnline ? 'text-[#085041]' : 'text-gray-500'}`}>
              {isOnline ? 'Online · Waiting' : 'Offline · Private'}
            </span>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`w-12 h-6 rounded-full relative transition-all p-1 ${isOnline ? 'bg-[#00B14F]' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-all ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
        <p className="text-[10px] text-gray-500 font-bold">{rider.name} · {rider.plate_number}</p>
      </div>

      <div className="flex-1">
        {!activeJob ? (
          /* Waiting / Online Dashboard */
          <div className="p-4 space-y-4 animate-fadeIn">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Today</p>
                <p className="text-sm font-black text-gray-800">{stats.todayTrips}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Online</p>
                <p className="text-sm font-black text-gray-800">{stats.onlineTime}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Earned</p>
                <p className="text-sm font-black text-[#00B14F]">₱{stats.earnings}</p>
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-gray-900 rounded-3xl p-5 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weekly Rating</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl font-black italic">4.92</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="text-[#EF9F27] fill-[#EF9F27]" />)}
                  </div>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full mb-1">
                  <div className="w-[92%] h-full bg-[#00B14F] rounded-full"></div>
                </div>
                <p className="text-[9px] text-gray-400">Acceptance Rate: 92%</p>
              </div>
              <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5" />
            </div>

            {/* Active Requests List */}
            <div>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Available Requests</h3>
                {pendingRequests.length > 0 && <span className="bg-[#00B14F] text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{pendingRequests.length} New</span>}
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Clock size={20} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Searching for jobs...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="bg-[#E1F5EE] border border-[#5DCAA5] rounded-3xl p-4 shadow-sm animate-bounce-short">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] text-[#0F6E56] font-bold uppercase mb-1">New Booking</p>
                          <p className="text-lg font-black text-[#085041] tracking-tighter">₱{req.total_amount}</p>
                        </div>
                        <span className="bg-white/50 px-2 py-1 rounded-lg text-[10px] font-black text-[#085041]">12.4 km</span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-[#00B14F] rounded-full"></div>
                          <p className="text-[11px] font-bold text-[#0F6E56] truncate">{req.pickup_location}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-[#E24B4A] rounded-full"></div>
                          <p className="text-[11px] font-bold text-[#0F6E56] truncate">{req.destination_location}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleAccept(req)}
                        className="w-full py-4 bg-[#00B14F] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                      >
                        Accept Booking
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active Trip View */
          <div className="flex flex-col h-full bg-[#f5f5f5]">
            {/* Small Navigation Area */}
            <div className="h-[200px] bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <Navigation size={48} />
              </div>
              <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#0f62fe] rounded-xl flex items-center justify-center text-white">
                    <Navigation size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900 tracking-tighter leading-none">Turn Right</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">N. Escario St · 400m</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details Sheet */}
            <div className="flex-1 bg-white rounded-t-[40px] -mt-10 p-6 shadow-2xl z-10 flex flex-col">
              <div className="w-8 h-1 bg-gray-100 rounded-full mx-auto mb-6"></div>
              
              <div className="bg-[#E1F5EE] rounded-3xl p-5 flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] text-[#0F6E56] font-bold uppercase mb-1">Heading to</p>
                  <p className="text-xl font-black text-[#085041] tracking-tighter truncate max-w-[200px]">
                    {activeJob.transport_status === 'picked_up' ? activeJob.destination_location : activeJob.pickup_location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-[#085041]">8 min</p>
                  <p className="text-[9px] text-[#1D9E75] font-bold">1.8 km</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 border-b border-gray-100 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center relative">
                  <User size={24} className="text-gray-300" />
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-gray-50 flex items-center gap-0.5">
                    <Star size={8} className="text-amber-500 fill-amber-500" />
                    <span className="text-[8px] font-bold">4.6</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-900">{activeJob.full_name}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Passenger</p>
                </div>
                <button className="w-10 h-10 bg-[#E1F5EE] text-[#00B14F] rounded-full flex items-center justify-center">
                  <Phone size={18} />
                </button>
              </div>

              <div className="mt-auto space-y-3">
                {activeJob.transport_status !== 'picked_up' ? (
                  <button 
                    onClick={() => handleUpdateStatus('picked_up')}
                    className="w-full py-5 bg-[#00B14F] text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    Confirm Pick Up
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus('completed')}
                    className="w-full py-5 bg-[#0f62fe] text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    Complete Trip
                  </button>
                )}
                <button className="w-full py-4 text-red-500 font-bold uppercase tracking-widest text-[10px]">Report Incident</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      {!activeJob && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-4 flex justify-around items-center z-40 max-w-md mx-auto">
          <div className="flex flex-col items-center gap-1 text-[#00B14F]">
            <Home size={20} />
            <span className="text-[9px] font-black uppercase">Home</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-300">
            <TrendingUp size={20} />
            <span className="text-[9px] font-bold">Earnings</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-300">
            <Star size={20} />
            <span className="text-[9px] font-bold">Rating</span>
          </div>
          <button onClick={onLogout} className="flex flex-col items-center gap-1 text-red-300">
            <LogOut size={20} />
            <span className="text-[9px] font-bold">Logout</span>
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-short { animation: bounce-short 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default RiderModernDashboard;
