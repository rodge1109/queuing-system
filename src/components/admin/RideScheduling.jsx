import React, { useState, useMemo } from 'react';
import { Clock, Calendar, Search, MapPin, ChevronRight, User, Star, CheckCircle2, Navigation, AlertCircle, X, ShieldCheck, Car } from 'lucide-react';

const RideScheduling = ({ trips = [], riders = [], fetchTrips }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Consider trips as pending if they have no rider or their transport_status is unassigned
  const pendingCount = trips.filter(t => !t.rider_id || t.transport_status === 'unassigned').length;
  
  // Filter real riders based on search query
  const filteredRiders = useMemo(() => {
    if (!searchQuery.trim()) return riders;
    const lowerQuery = searchQuery.toLowerCase();
    return riders.filter(rider => 
      (rider.name && rider.name.toLowerCase().includes(lowerQuery)) || 
      (rider.plate_number && rider.plate_number.toLowerCase().includes(lowerQuery)) ||
      (rider.vehicle_type && rider.vehicle_type.toLowerCase().includes(lowerQuery)) ||
      (rider.id && String(rider.id).includes(lowerQuery))
    );
  }, [searchQuery, riders]);

  const handleAssignRider = async (rider) => {
    setIsAssigning(true);
    try {
      const res = await fetch('/api/rider/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: selectedTrip.id, riderId: rider.id })
      });
      
      const data = await res.json();
      if (data.success) {
        if (fetchTrips) fetchTrips();
        setSelectedTrip(null);
        setSearchQuery('');
      } else {
        alert(data.message || 'Failed to assign rider');
      }
    } catch (err) {
      console.error('Assignment error:', err);
      alert('Network error while assigning rider.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter trips based on a new tripSearchQuery
  const [tripSearchQuery, setTripSearchQuery] = useState('');
  
  const filteredTrips = useMemo(() => {
    if (!tripSearchQuery.trim()) return trips;
    const lowerQuery = tripSearchQuery.toLowerCase();
    return trips.filter(trip => 
      (trip.full_name && trip.full_name.toLowerCase().includes(lowerQuery)) ||
      (trip.pickup_location && trip.pickup_location.toLowerCase().includes(lowerQuery)) ||
      (trip.destination_location && trip.destination_location.toLowerCase().includes(lowerQuery)) ||
      (String(trip.id).includes(lowerQuery))
    );
  }, [tripSearchQuery, trips]);

  return (
    <div className="h-full bg-[#f8f9fa] text-black flex flex-col font-sans overflow-hidden animate-fadeIn">
      
      {/* Financial Dashboard Summary (Exact match to Corporate style) */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-b border-gray-100">
        <SummaryCard 
          label="Pending Assignments" 
          value={`${pendingCount} Trips`} 
          icon={<AlertCircle className="text-red-500" />} 
          trend="Action Required"
          warning={pendingCount > 0}
        />
        <SummaryCard 
          label="Total Scheduled" 
          value={`${trips.length} Bookings`} 
          icon={<Calendar className="text-blue-500" />} 
          trend="Total Log"
        />
        <SummaryCard 
          label="Active Dispatch" 
          value="Real-time" 
          icon={<CheckCircle2 className="text-green-500" />} 
          trend="Network Healthy"
        />
      </div>

      {/* Header Section */}
      <div className="p-6 flex justify-between items-center bg-white border-b border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-black tracking-tighter uppercase flex items-center gap-2">
            <Navigation className="text-[#24a148]" size={24} />
            Ride Dispatch & Scheduling
          </h2>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Global Transport Monitoring & Rider Assignment</p>
        </div>
        <div className="flex gap-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#24a148] animate-pulse"></span>
            Operational Network Connected
          </p>
        </div>
      </div>

      {/* Toolbar (Matching Corporate style) */}
      <div className="p-4 border-b border-gray-100 flex gap-4 bg-white">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by passenger name, location, or trip ID..."
            value={tripSearchQuery}
            onChange={(e) => setTripSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f4f4f4] border-0 border-b border-gray-300 text-[13px] focus:outline-none focus:border-[#24a148] transition-all"
          />
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative bg-[#f8f9fa]">
        {/* Main List Column */}
        <div className={`flex-1 overflow-y-auto p-8 transition-all duration-500 ease-in-out ${selectedTrip ? 'pr-[420px]' : ''}`}>
          <div className="grid gap-6 max-w-5xl mx-auto">
            {filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                <Car size={48} className="mb-4 opacity-10" />
                <p className="text-sm font-semibold uppercase tracking-widest">No matching trips found</p>
              </div>
            ) : filteredTrips.map((trip) => {
              const isAssigned = !!trip.rider_id && trip.transport_status !== 'unassigned';
              const displayStatus = isAssigned ? 'Driver Assigned' : 'Pending Assignment';
              
              return (
                <div 
                  key={trip.id} 
                  onClick={() => setSelectedTrip(trip)}
                  className={`group bg-white border shadow-sm transition-all duration-300 cursor-pointer overflow-hidden ${
                    selectedTrip?.id === trip.id 
                      ? 'border-[#24a148] ring-1 ring-[#24a148]/20 scale-[1.01]' 
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 flex items-center justify-center ${isAssigned ? 'bg-green-50 text-[#24a148]' : 'bg-red-50 text-red-500'}`}>
                        {isAssigned ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black uppercase tracking-tighter flex items-center gap-2">
                          {trip.full_name || 'Unknown Passenger'}
                          <span className="text-[10px] font-mono font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 border border-gray-100">#{trip.id}</span>
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> 
                            {trip.preferred_date ? new Date(trip.preferred_date).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 
                            {trip.preferred_time || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest ${
                      isAssigned 
                        ? 'bg-[#24a148] text-white' 
                        : 'bg-red-500 text-white animate-pulse'
                    }`}>
                      {displayStatus}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-0 border-t border-gray-50">
                    <div className="p-4 border-r border-gray-50 bg-gray-50/30">
                      <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#24a148]" /> Pickup
                      </p>
                      <p className="text-[11px] font-semibold text-black truncate uppercase tracking-tighter" title={trip.pickup_location}>
                        {trip.pickup_location || 'Not specified'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50/30">
                      <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-blue-500" /> Destination
                      </p>
                      <p className="text-[11px] font-semibold text-black truncate uppercase tracking-tighter" title={trip.destination_location}>
                        {trip.destination_location || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {isAssigned && trip.rider_name && (
                    <div className="p-4 bg-white border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 flex items-center justify-center text-[#24a148]">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest leading-none mb-0.5">Assigned Professional</p>
                          <p className="text-[11px] font-semibold text-black uppercase tracking-tighter">
                            {trip.rider_name} <span className="text-gray-400 ml-1">[{trip.plate_number || 'No Plate'}]</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-[10px] font-semibold text-[#24a148] uppercase tracking-widest border border-[#24a148]/20 px-2 py-0.5">
                        Verified Rider
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Slide-out Assignment Panel */}
        <div className={`absolute top-0 right-0 h-full w-[400px] bg-white border-l border-gray-200 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col z-10 ${selectedTrip ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedTrip && (
            <>
              {/* Panel Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-black uppercase tracking-tighter">Assign Operator</h3>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Dispatching for Booking #{selectedTrip.id}</p>
                </div>
                <button 
                  onClick={() => { setSelectedTrip(null); setSearchQuery(''); }}
                  className="w-10 h-10 flex items-center justify-center transition-all text-gray-400 hover:text-black hover:bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Seamless Database Search */}
              <div className="p-6 shrink-0 border-b border-gray-50 bg-[#f8f9fa]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="SEARCH RIDER REGISTRY..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-0 border-b-2 border-gray-200 text-black p-3 pl-11 focus:outline-none focus:border-[#24a148] transition-all text-[11px] font-semibold uppercase tracking-widest placeholder:text-gray-300"
                  />
                </div>
                <p className="text-[9px] text-gray-400 mt-4 font-semibold uppercase tracking-widest text-center">
                  Search bypasses vicinity rules. {filteredRiders.length} records active.
                </p>
              </div>

              {/* Rider Results */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {filteredRiders.length === 0 ? (
                  <div className="text-center py-12 text-gray-300">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-[10px] font-semibold uppercase tracking-widest">No matching operators found</p>
                  </div>
                ) : (
                  filteredRiders.map(rider => (
                    <div key={rider.id} className="p-4 bg-white border border-gray-100 hover:border-[#24a148] transition-all group shadow-sm hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#f8f9fa] flex items-center justify-center text-black font-semibold text-sm border border-gray-100 group-hover:border-[#24a148]/30 group-hover:bg-[#24a148]/5 transition-colors">
                            {rider.name ? rider.name.charAt(0) : 'R'}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-black group-hover:text-[#24a148] transition-colors uppercase tracking-tight">{rider.name || `Rider #${rider.id}`}</p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold text-black">{rider.rating || '4.8'}</span>
                              <span className="mx-1 text-gray-200">|</span>
                              <span className="uppercase font-semibold tracking-tighter">{rider.vehicle_type || 'Vehicle'}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-[8px] font-semibold uppercase px-2 py-0.5 tracking-tighter border ${
                          rider.status === 'online' ? 'bg-green-50 text-[#24a148] border-[#24a148]/20' : 
                          rider.status === 'offline' ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                        }`}>
                          {rider.status || 'unknown'}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-gray-500 space-y-1 mb-4 bg-[#f8f9fa] p-3 border-l-2 border-gray-200 font-semibold uppercase tracking-widest">
                        <p className="flex items-center gap-2"><span className="text-gray-400">Plate:</span> {rider.plate_number || 'NO PLATE'}</p>
                      </div>

                      <button 
                        disabled={isAssigning || (selectedTrip && selectedTrip.rider_id === rider.id)}
                        onClick={() => handleAssignRider(rider)}
                        className="w-full py-3 bg-black text-white font-semibold text-[10px] uppercase tracking-widest hover:bg-[#24a148] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isAssigning 
                          ? 'Dispatching...' 
                          : (selectedTrip && selectedTrip.rider_id === rider.id) ? 'Already Assigned' : 'Force Assign Operator'} 
                        {!isAssigning && <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}} />
    </div>
  );
};

// Sub-component (exact match to Corporate style)
function SummaryCard({ label, value, icon, trend, warning }) {
  return (
    <div className={`p-4 border border-gray-100 shadow-sm ${warning ? 'bg-red-50/30' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${warning ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-xl font-semibold text-black tracking-tight">{value}</h4>
    </div>
  );
}


export default RideScheduling;
