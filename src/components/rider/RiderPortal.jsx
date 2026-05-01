
import React, { useState, useEffect } from 'react';
import { Car, ChevronLeft } from 'lucide-react';

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

  useEffect(() => {
    if (rider) {
      localStorage.setItem('rider_user', JSON.stringify(rider));
    } else {
      localStorage.removeItem('rider_user');
    }
  }, [rider]);

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
      const interval = setInterval(checkActive, 10000); // Check every 10s if no job
      return () => clearInterval(interval);
    }
  }, [rider, activeJob]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/rider/requests');
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (e) { }
  };

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
        setError('Rider not found or unauthorized');
      }
    } catch (e) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = async (id) => {
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

  const startTracking = () => {
    if (locationPulse) clearInterval(locationPulse);
    const interval = setInterval(() => {
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
          if (locationPulse) clearInterval(locationPulse);
          fetchRequests();
        } else {
          setActiveJob(prev => ({ ...prev, transport_status: newStatus }));
        }
      }
    } catch (e) { }
  };

  if (!rider) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-[#f4f4f4] p-4">
        <div className="w-full max-w-md bg-white border border-[#e0e0e0] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#1c1917] mb-2 uppercase tracking-tight">Rider Portal</h1>
            <p className="text-sm text-[#666]">Authenticate to track and accept orders</p>
          </div>
          <form onSubmit={login} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#444] mb-2 uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Rider Username"
                required
                className="w-full bg-[#f4f4f4] border-0 p-3 text-sm focus:ring-2 focus:ring-[#1c1917] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#444] mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
                className="w-full bg-[#f4f4f4] border-0 p-3 text-sm focus:ring-2 focus:ring-[#1c1917] outline-none transition-all"
              />
            </div>
            {error && <div className="p-3 bg-red-50 text-red-600 text-xs border border-red-100">{error}</div>}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#1c1917] text-white p-4 font-bold text-sm tracking-widest hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN TO DASHBOARD'}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-[#f4f4f4] text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Demo Access: rider1 / rider123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] pb-24">
      <header className="bg-white border-b border-[#e0e0e0] p-4 flex justify-between items-center sticky top-0 z-50">
        <div>
          <p className="text-xs font-bold text-[#666] uppercase">Active Rider</p>
          <h2 className="font-bold text-[#1c1917]">{rider.name}</h2>
        </div>
        <button onClick={() => { setRider(null); if (locationPulse) clearInterval(locationPulse); }} className="text-xs font-bold border border-[#e0e0e0] px-3 py-1 hover:bg-red-50 hover:text-red-600 transition-colors">LOGOUT</button>
      </header>

      {activeJob ? (
        <div className="p-4 space-y-4">
          <div className="bg-white border border-[#1c1917] border-l-8 overflow-hidden shadow-lg">
            <div className="p-4 bg-[#1c1917] text-white flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest">Active Trip #{activeJob.id}</span>
              <span className="text-xs font-bold uppercase">{activeJob.transport_status.replace(/_/g, ' ')}</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <div className="w-0.5 h-full bg-gray-200 border-dashed border-l-2" />
                  <div className="w-3 h-3 rounded-full bg-red-600" />
                </div>
                <div className="flex flex-col gap-8 flex-1">
                  <div>
                    <p className="text-[10px] font-bold text-[#666] uppercase">Pickup</p>
                    <p className="text-sm font-bold text-[#1c1917]">{activeJob.pickup_location}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#666] uppercase">Destination</p>
                    <p className="text-sm font-bold text-[#1c1917]">{activeJob.destination_location}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-1 gap-2">
                {activeJob.transport_status === 'accepted' && (
                  <button onClick={() => updateStatus('on_way_to_pickup')} className="bg-[#1c1917] text-white p-4 font-black text-sm tracking-widest uppercase">Start Journey</button>
                )}
                {activeJob.transport_status === 'on_way_to_pickup' && (
                  <button onClick={() => updateStatus('arrived_at_pickup')} className="bg-[#24b0a9] text-white p-4 font-black text-sm tracking-widest uppercase">I Have Arrived</button>
                )}
                {activeJob.transport_status === 'arrived_at_pickup' && (
                  <button onClick={() => updateStatus('picked_up')} className="bg-[#E4FE7B] text-[#1c1917] p-4 font-black text-sm tracking-widest uppercase">Client is Onboard</button>
                )}
                {activeJob.transport_status === 'picked_up' && (
                  <button onClick={() => updateStatus('completed')} className="bg-[#da1e28] text-white p-4 font-black text-sm tracking-widest uppercase">Drop-off Finished</button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-end mb-4 pt-4">
            <h3 className="text-2xl font-black text-[#1c1917] uppercase tracking-tighter italic">Available Jobs</h3>
            <button onClick={fetchRequests} className="text-xs font-bold bg-white border border-[#1c1917] px-4 py-2 hover:bg-[#1c1917] hover:text-white transition-all">REFRESH</button>
          </div>

          <div className="grid gap-4">
            {requests.map(req => (
              <div key={req.id} className="bg-white border border-[#e0e0e0] p-6 shadow-sm hover:border-[#1c1917] transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-[#999] block mb-1">REFERENCE #{req.id}</span>
                    <h4 className="text-lg font-black text-[#1c1917]">PHP {(parseFloat(req.total_amount) || 0).toFixed(2)}</h4>
                  </div>
                  <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 uppercase">Nearby</div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1" />
                    <p className="text-xs text-[#1c1917] font-medium">{req.pickup_location}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600 mt-1" />
                    <p className="text-xs text-[#1c1917] font-medium">{req.destination_location}</p>
                  </div>
                </div>
                <button
                  onClick={() => acceptJob(req.id)}
                  className="w-full bg-[#1c1917] text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-[#333] transition-colors"
                >
                  Accept Job
                </button>
              </div>
            ))}
          </div>

          {requests.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed border-[#ccc]">
              <div className="text-4xl mb-4 opacity-20"><svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
              <p className="text-sm font-bold text-[#999] uppercase tracking-widest">Scanning for requests...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiderPortal;
