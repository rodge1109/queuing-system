/* ==========================================================================
   TRIP MONITORING MODULE
   ========================================================================== */

function TripMonitoring({ trips, stats, incidents, onRefresh }) {
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // all, ongoing, completed, sos

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  const filteredTrips = trips.filter(t => {
    if (viewMode === 'all') return true;
    if (viewMode === 'ongoing') return ['en_route', 'picked_up'].includes(t.transport_status);
    if (viewMode === 'completed') return t.transport_status === 'completed';
    if (viewMode === 'sos') return t.transport_status === 'sos';
    return true;
  });

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="Total Trips" value={stats?.total || 0} icon={<Activity />} color="blue" />
        <MetricCard label="Ongoing" value={stats?.ongoing || 0} icon={<Navigation />} color="cyan" />
        <MetricCard label="Completed" value={stats?.completed || 0} icon={<Check />} color="green" />
        <MetricCard label="Cancelled" value={stats?.cancelled || 0} icon={<X />} color="gray" />
        <MetricCard 
          label="SOS Alerts" 
          value={stats?.sos || 0} 
          icon={<AlertTriangle />} 
          color="red" 
          active={stats?.sos > 0} 
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left Panel: Live Map */}
        <div className="flex-[2] bg-white border border-gray-100 shadow-sm relative overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#525252]">Live Operations Map</h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Available</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Ongoing</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> SOS</span>
            </div>
          </div>
          <div className="flex-1 relative">
             <MonitoringMap trips={filteredTrips} selectedTrip={selectedTrip} />
          </div>
        </div>

        {/* Right Panel: Trip List */}
        <div className="flex-1 bg-white border border-gray-100 shadow-sm flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex gap-2">
              {['all', 'ongoing', 'sos'].map(m => (
                <button 
                  key={m} 
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border transition-all ${viewMode === m ? 'bg-[#0f62fe] text-white border-[#0f62fe]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button onClick={onRefresh} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Refresh data">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredTrips.map(trip => (
              <div 
                key={trip.id} 
                onClick={() => setSelectedTripId(trip.id)}
                className={`p-4 cursor-pointer transition-colors ${selectedTripId === trip.id ? 'bg-blue-50 border-l-2 border-[#0f62fe]' : 'hover:bg-gray-50 border-l-2 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[10px] font-mono text-[#8d8d8d]">#{trip.id}</p>
                    <p className="text-sm font-bold text-[#161616]">{trip.full_name}</p>
                  </div>
                  <TripStatusBadge status={trip.transport_status} />
                </div>
                <div className="flex justify-between items-end">
                   <div className="text-[10px] text-[#525252]">
                      <p className="truncate w-32">Rider: <span className="font-bold">{trip.rider_name || 'Unassigned'}</span></p>
                      <p>{new Date(trip.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                   </div>
                   <button className="text-[#0f62fe] text-[10px] font-bold uppercase tracking-widest hover:underline">Details</button>
                </div>
              </div>
            ))}
            {filteredTrips.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm italic">No trips found</div>
            )}
          </div>
        </div>
      </div>

      {/* Incident / Detail Overlay (Conditional) */}
      {selectedTrip && (
        <TripDetailOverlay trip={selectedTrip} onClose={() => setSelectedTripId(null)} />
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, color, active }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    gray: 'bg-gray-50 text-gray-600'
  };
  return (
    <div className={`p-4 bg-white border ${active ? 'border-red-500 animate-pulse ring-2 ring-red-100' : 'border-gray-100'} shadow-sm`}>
      <div className="flex justify-between items-start">
        <div className={`p-2 ${colors[color] || colors.gray}`}>{React.cloneElement(icon, {size: 16})}</div>
        <p className="text-2xl font-bold text-[#161616]">{value}</p>
      </div>
      <p className="text-[10px] font-bold text-[#525252] uppercase tracking-widest mt-4">{label}</p>
    </div>
  );
}

function TripStatusBadge({ status }) {
  const cfg = {
    'unassigned': 'bg-gray-50 text-gray-400 border-gray-200',
    'en_route': 'bg-blue-50 text-blue-600 border-blue-200',
    'picked_up': 'bg-cyan-50 text-cyan-600 border-cyan-200',
    'completed': 'bg-green-50 text-green-600 border-green-200',
    'cancelled': 'bg-red-50 text-red-600 border-red-200',
    'sos': 'bg-red-600 text-white border-red-700 animate-pulse'
  };
  return (
    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${cfg[status] || cfg.unassigned}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

function MonitoringMap({ trips, selectedTrip }) {
  const mapRef = React.useRef(null);
  const leafletMap = React.useRef(null);
  const markersRef = React.useRef(new Map());

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    
    if (!leafletMap.current) {
      leafletMap.current = window.L.map(mapRef.current, { zoomControl: false }).setView([11.0500, 124.0000], 10);
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
      }).addTo(leafletMap.current);
    }

    // Update Markers
    trips.forEach(trip => {
      const lat = trip.transport_status === 'unassigned' ? trip.pickup_lat : (trip.current_lat || trip.pickup_lat);
      const lng = trip.transport_status === 'unassigned' ? trip.pickup_lng : (trip.current_lng || trip.pickup_lng);
      
      if (!lat || !lng) return;

      const color = trip.transport_status === 'sos' ? '#da1e28' : 
                    trip.transport_status === 'unassigned' ? '#8d8d8d' : 
                    ['en_route', 'picked_up'].includes(trip.transport_status) ? '#0f62fe' : '#42be65';

      if (markersRef.current.has(trip.id)) {
        markersRef.current.get(trip.id).setLatLng([lat, lng]);
      } else {
        const marker = window.L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(leafletMap.current);
        marker.bindPopup(`<b>${trip.full_name}</b><br>${trip.transport_status}`);
        markersRef.current.set(trip.id, marker);
      }
    });

    // Handle Selection
    if (selectedTrip) {
      const lat = selectedTrip.current_lat || selectedTrip.pickup_lat;
      const lng = selectedTrip.current_lng || selectedTrip.pickup_lng;
      if (lat && lng) {
        leafletMap.current.setView([lat, lng], 15);
        if (markersRef.current.has(selectedTrip.id)) {
          markersRef.current.get(selectedTrip.id).openPopup();
        }
      }
    }
  }, [trips, selectedTrip]);

  return (
    <div ref={mapRef} className="w-full h-full bg-gray-50 flex items-center justify-center">
      {!window.L && <p className="text-xs text-gray-400 animate-pulse">Initializing map engine...</p>}
    </div>
  );
}

function TripDetailOverlay({ trip, onClose }) {
  return (
    <div className="fixed inset-0 z-[2000] flex justify-end pointer-events-none">
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-auto" 
        onClick={onClose}
      />
      <div className="w-full max-w-md bg-white h-full shadow-2xl relative z-10 pointer-events-auto flex flex-col animate-slideLeft">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-mono text-[#8d8d8d] uppercase">Trip ID: #{trip.id}</p>
            <h3 className="text-lg font-bold text-[#161616]">Operation Details</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100"><X /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           {/* SOS Status Warning */}
           {trip.transport_status === 'sos' && (
             <div className="bg-red-50 border border-red-600 p-4 flex gap-4 items-center animate-pulse">
                <AlertTriangle className="text-red-600 w-8 h-8" />
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-widest">CRITICAL ALERT: SOS TRIGGERED</p>
                  <p className="text-xs text-red-600">Rider has requested emergency assistance.</p>
                </div>
             </div>
           )}

           <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-[#525252] uppercase tracking-widest border-b pb-2">Passenger Information</h4>
              <div className="flex justify-between items-center">
                 <div>
                    <p className="text-sm font-bold text-[#161616]">{trip.full_name}</p>
                    <p className="text-xs text-[#8d8d8d]">{trip.phone_number}</p>
                 </div>
                 <button className="p-2 bg-blue-50 text-[#0f62fe]"><Phone size={14} /></button>
              </div>
           </section>

           <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-[#525252] uppercase tracking-widest border-b pb-2">Rider & Vehicle</h4>
              <div className="flex justify-between items-center">
                 <div>
                    <p className="text-sm font-bold text-[#161616]">{trip.rider_name || 'No Rider Assigned'}</p>
                    <p className="text-[10px] font-mono text-[#8d8d8d]">{trip.vehicle_type} | {trip.plate_number}</p>
                 </div>
                 <button className="p-2 bg-blue-50 text-[#0f62fe]"><Phone size={14} /></button>
              </div>
           </section>

           <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-[#525252] uppercase tracking-widest border-b pb-2">Route Information</h4>
              <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 mt-1">
                       <div className="w-2 h-2 rounded-full border-2 border-[#0f62fe]"></div>
                       <div className="w-[1px] h-8 bg-gray-200"></div>
                       <div className="w-2 h-2 bg-[#da1e28]"></div>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Pickup</p>
                       <p className="text-xs font-medium text-gray-700 mb-2">{trip.pickup_location}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Destination</p>
                       <p className="text-xs font-medium text-gray-700">{trip.destination_location}</p>
                    </div>
                 </div>
              </div>
           </section>

           <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-[#525252] uppercase tracking-widest border-b pb-2">Fare Breakdown</h4>
              <div className="space-y-2">
                 <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Trip Total</span>
                    <span className="font-bold text-[#161616]">₱{trip.total_amount || '0.00'}</span>
                 </div>
                 <p className="text-[8px] text-gray-400 font-medium">*Calculated based on ₱{trip.base_fare || '0'} base + distance rates.</p>
              </div>
           </section>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
           <div className="grid grid-cols-2 gap-4">
              <button className="py-3 px-4 border border-[#0f62fe] text-[#0f62fe] text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-all">Force Complete</button>
              <button className="py-3 px-4 bg-[#da1e28] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#750e13] transition-all">SOS Response</button>
           </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   END TRIP MONITORING MODULE
   ========================================================================== */
