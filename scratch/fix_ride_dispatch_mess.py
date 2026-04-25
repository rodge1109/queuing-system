import os

file_path = r'c:\website\queuing-system\src\App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Identify the range of RideDispatch
start_marker = "function RideDispatch"
end_marker = "/* ==========================================================================\n   GEOFENCING MANAGEMENT MODULE"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    # Try alternate end marker
    end_marker = "function GeofenceDashboard"
    end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_ride_dispatch = """function RideDispatch({ trips, stats, riders, onRefresh }) {
  const [activeQueueTab, setActiveQueueTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    if (trips !== undefined) {
      const timer = setTimeout(() => setIsReady(true), 300);
      return () => clearTimeout(timer);
    }
  }, [trips]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          email: data.email || 'dispatch@internal.com',
          serviceType: data.vehiclePreference || 'Standard',
          preferredDate: new Date().toISOString().split('T')[0],
          preferredTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pickupLocation: data.pickupLocation,
          destinationLocation: data.destinationLocation,
          pickupLat: 11.0500 + (Math.random() - 0.5) * 0.05,
          pickupLng: 124.0000 + (Math.random() - 0.5) * 0.05,
          destLat: 11.0500 + (Math.random() - 0.5) * 0.05,
          destLng: 124.0000 + (Math.random() - 0.5) * 0.05,
          totalAmount: 150 + Math.floor(Math.random() * 300),
          agentCode: 'DISPATCHER'
        })
      });
      if (response.ok) {
        setIsCreatingBooking(false);
        onRefresh();
      }
    } catch (error) {}
  };

  const handleAssignRider = async (bookingId, riderId) => {
    if (!window.confirm('Assign this rider?')) return;
    try {
      const response = await fetch('/api/rider/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: bookingId, riderId })
      });
      if (response.ok) {
        setSelectedBooking(null);
        onRefresh();
      }
    } catch (error) {}
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel booking?')) return;
    try {
      const response = await fetch(`/api/admin/trips/${bookingId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (response.ok) {
        setSelectedBooking(null);
        onRefresh();
      }
    } catch (error) {}
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const queueTrips = trips.filter(t => {
     if (activeQueueTab === 'pending') return !t.rider_id && t.transport_status !== 'completed' && t.transport_status !== 'cancelled';
     if (activeQueueTab === 'assigned') return !!t.rider_id && t.transport_status !== 'completed' && t.transport_status !== 'cancelled';
     if (activeQueueTab === 'scheduled') {
       const tripDate = t.preferred_date ? new Date(t.preferred_date) : null;
       tripDate && tripDate.setHours(0, 0, 0, 0);
       return (t.status === 'confirmed' || t.status === 'pending') && t.transport_status !== 'completed' && t.transport_status !== 'cancelled' && (!tripDate || tripDate >= today);
     }
     return true;
  }).filter(t => 
     t.id.toString().includes(searchTerm) || 
     t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isReady) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#161616] gap-4">
        <RefreshCw size={28} className="text-[#0f62fe] animate-spin" />
        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Loading Dispatch Module...</p>
      </div>
    );
  }

  return (
    <div className="h-full relative flex flex-col min-h-0 overflow-hidden bg-[#161616] rounded-0">
      {/* LAYER 0: Full Screen Background Map */}
      <div className="absolute inset-0 z-0">
         <DispatchMap trips={trips} riders={riders} selectedBooking={selectedBooking} />
      </div>

      {/* LAYER 1: Top Metrics & Global Controls (Floating) */}
      <div className="relative z-20 p-4 pointer-events-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-auto">
          <div className="flex gap-4 max-w-full overflow-x-auto scrollbar-hide py-2 px-1">
             {[
               { label: 'Pending', value: trips.filter(t => !t.rider_id && t.transport_status !== 'cancelled').length, color: 'cyan', icon: <Clock />, max: 50 },
               { label: 'Ongoing', value: trips.filter(t => t.rider_id && t.transport_status !== 'completed' && t.transport_status !== 'cancelled').length, color: 'blue', icon: <Navigation />, max: 50 },
               { label: 'Drivers', value: riders.filter(r => r.status === 'available').length, color: 'green', icon: <User />, max: 50 }
             ].map((stat, i) => (
               <MetricCard 
                 key={i} label={stat.label} value={stat.value} max={stat.max} color={stat.color} icon={stat.icon} size="sm"
               />
             ))}
          </div>

          <div className="flex gap-2 bg-[#161616]/60 backdrop-blur-md p-2 border border-white/10 shadow-xl rounded-sm">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input 
                  type="text" placeholder="Search ID / Passenger..." 
                  className="bg-white/5 border border-white/10 rounded-sm pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe] w-48 md:w-64"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button onClick={() => setIsCreatingBooking(true)} className="bg-[#0f62fe] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0353e9] flex items-center gap-2 shadow-lg">
               <Plus size={14} /> Create
             </button>
             <button onClick={onRefresh} className="bg-white/5 text-gray-400 p-2 hover:bg-white/10 border border-white/10 rounded-sm shadow-lg"><RefreshCw size={16} /></button>
          </div>
        </div>
      </div>

      <DraggableGlassPanel initialX={16} initialY={160} width="380px" height="calc(100% - 176px)">
        <div className="h-full bg-[#1c1c1c]/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
           <div className="flex border-b border-white/5 bg-[#161616] drag-handle">
              {['pending', 'assigned', 'scheduled'].map(tab => (
                 <button 
                   key={tab} onClick={() => setActiveQueueTab(tab)}
                   className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeQueueTab === tab ? 'text-[#0f62fe] bg-white/5 border-b-2 border-[#0f62fe]' : 'text-gray-500 hover:text-white'}`}
                 >
                   {tab}
                 </button>
              ))}
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar">
              {queueTrips.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-600">
                    <History size={48} className="mb-4 opacity-20" />
                    <p className="text-xs uppercase tracking-widest font-bold">No {activeQueueTab} bookings</p>
                 </div>
              ) : (
                 <div className="divide-y divide-white/5">
                    {queueTrips.map(entry => (
                       <div key={entry.id} className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group ${selectedBooking?.id === entry.id ? 'bg-[#0f62fe]/10 border-l-4 border-[#0f62fe]' : ''}`} onClick={() => setSelectedBooking(entry)}>
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-bold text-[#0f62fe] bg-[#0f62fe]/10 px-2 py-0.5">#{entry.id}</span>
                             <span className="text-[9px] text-gray-500">{entry.preferred_time}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">{entry.full_name}</h4>
                          <div className="space-y-1 mb-4 text-[10px] text-gray-400">
                             <div className="flex items-start gap-2"><MapPin size={12} className="text-gray-600" /> <span className="line-clamp-1">{entry.pickup_location}</span></div>
                             <div className="flex items-start gap-2"><ArrowRight size={12} className="text-gray-600" /> <span className="line-clamp-1">{entry.destination_location}</span></div>
                          </div>
                          <div className="flex justify-between items-center">
                             <div className="flex gap-2">
                                <span className="text-[8px] font-bold py-1 px-2 border border-white/10 text-gray-400 uppercase">{entry.service_type || 'STANDARD'}</span>
                                <span className={`text-[8px] font-bold py-1 px-2 uppercase ${entry.rider_id ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{entry.rider_id ? 'Assigned' : 'Unassigned'}</span>
                             </div>
                             <button className="p-2 bg-white/5 hover:bg-[#0f62fe] text-white transition-colors opacity-0 group-hover:opacity-100"><ChevronRight size={14} /></button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </DraggableGlassPanel>

      {selectedBooking && (
         <DraggableGlassPanel initialX={window.innerWidth - 440 - 40} initialY={160} width="400px" height="calc(100% - 176px)">
           <div className="h-full bg-[#161616]/95 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col animate-slideInRight">
              <div className="p-4 bg-[#1c1c1c] border-b border-white/5 flex justify-between items-center drag-handle">
                 <h3 className="text-xs font-bold text-white uppercase tracking-widest">Booking Context</h3>
                 <button onClick={() => setSelectedBooking(null)} className="text-gray-500 hover:text-white"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                 <section>
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-white/5 flex items-center justify-center font-bold text-xl text-white">{selectedBooking.full_name?.charAt(0)}</div>
                       <div><h4 className="text-lg font-bold text-white">{selectedBooking.full_name}</h4><p className="text-xs text-gray-500">{selectedBooking.phone_number}</p></div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10">
                       <div className="flex justify-between mb-2"><span className="text-[9px] text-gray-500 uppercase tracking-widest">Distance</span><span className="text-xs font-bold text-white">4.2 KM</span></div>
                       <div className="flex justify-between"><span className="text-[9px] text-gray-500 uppercase tracking-widest">Estimated Fare</span><span className="text-xs font-bold text-[#E4FE7B]">PHP {selectedBooking.total_amount}</span></div>
                    </div>
                 </section>
                 <section className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                       <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nearby Riders</h4>
                       <button className="text-[10px] text-[#0f62fe] font-bold uppercase hover:underline">Auto Dispatch</button>
                    </div>
                    <div className="space-y-3">
                       {riders.filter(r => r.status === 'available').length === 0 ? (
                          <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold text-center">No riders available</div>
                       ) : (
                          riders.filter(r => r.status === 'available').slice(0, 3).map(rider => (
                             <div key={rider.id} className="p-3 bg-white/5 border border-white/10 hover:border-[#24a148] transition-all flex justify-between items-center group">
                                <div className="flex gap-3 items-center">
                                   <div className="w-8 h-8 rounded-full bg-[#24a148]/20 flex items-center justify-center text-[#24a148]"><User size={14} /></div>
                                   <div><p className="text-xs font-bold text-white">{rider.name}</p><p className="text-[9px] text-gray-500">{rider.vehicle_type}</p></div>
                                </div>
                                <button onClick={() => handleAssignRider(selectedBooking.id, rider.id)} className="px-3 py-1.5 bg-[#24a148] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#1e8a3d]">Assign</button>
                             </div>
                          ))
                       )}
                    </div>
                 </section>
                 <section className="space-y-2 pt-4">
                    <button className="w-full py-3 border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-white/5 flex items-center justify-center gap-2"><Edit size={12} /> Edit Booking</button>
                    <button onClick={() => handleCancelBooking(selectedBooking.id)} className="w-full py-3 border border-red-500/50 text-red-500 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all text-center">Cancel Booking</button>
                 </section>
              </div>
           </div>
         </DraggableGlassPanel>
      )}

      <div className="absolute left-4 bottom-8 z-[1000] bg-[#161616]/80 backdrop-blur-md p-4 border border-white/10 shadow-2xl flex flex-col gap-3">
         <h4 className="text-[10px] font-bold text-white uppercase tracking-[2px] border-b border-white/5 pb-2 mb-1">Live Indicators</h4>
         <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase"><div className="w-2.5 h-2.5 rounded-full bg-[#24a148] shadow-[0_0_8px_rgba(36,161,72,0.5)]" /> Available</div>
         <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase"><div className="w-2.5 h-2.5 rounded-full bg-[#f1c21b] shadow-[0_0_8px_rgba(241,194,27,0.5)]" /> Pending</div>
         <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase"><div className="w-2.5 h-2.5 rounded-full bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.5)]" /> Active</div>
      </div>

      {isCreatingBooking && (
         <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl bg-[#1c1c1c] border border-white/10 shadow-2xl overflow-hidden animate-zoomIn">
               <div className="p-6 bg-[#161616] border-b border-white/10 flex justify-between items-center">
                  <div><h3 className="text-lg font-bold text-white uppercase tracking-tighter italic">Manual Dispatch Request</h3><p className="text-xs text-gray-500">Create a new booking</p></div>
                  <button onClick={() => setIsCreatingBooking(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
               </div>
               <form onSubmit={handleCreateBooking} className="p-8 space-y-6 text-white">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-[#0f62fe] uppercase tracking-widest">Passenger</h4>
                        <input name="fullName" required className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none" placeholder="Full Name" />
                        <input name="phoneNumber" required className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none" placeholder="Number" />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-[#0f62fe] uppercase tracking-widest">Trip</h4>
                        <input name="pickupLocation" required className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none" placeholder="Pickup" />
                        <input name="destinationLocation" required className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none" placeholder="Dest" />
                     </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-[#0f62fe] text-white font-bold uppercase tracking-[4px] shadow-xl hover:bg-[#0353e9]">Submit Request</button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}

"""
    final_content = content[:start_idx] + new_ride_dispatch + content[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("RideDispatch fixed and cleaned.")
else:
    print("Could not find RideDispatch markers.")
