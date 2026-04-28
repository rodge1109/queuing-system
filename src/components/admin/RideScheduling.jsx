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

  return (
    <div className="h-full bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Header Panel */}
      <div className="px-8 py-6 border-b border-white/10 bg-white/5 backdrop-blur-xl flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-white flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[#0f62fe]" />
            Global Dispatch & Scheduling
          </h2>
          <p className="text-[#a8a8a8] text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#24a148] animate-pulse"></span>
            Live Database Connected
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-[#161616] border border-white/10 px-6 py-3 rounded-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-[#8d8d8d] font-bold uppercase tracking-widest">Pending Trips</p>
              <p className="text-xl font-bold text-[#da1e28]">{pendingCount}</p>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="text-right">
              <p className="text-[10px] text-[#8d8d8d] font-bold uppercase tracking-widest">Total Scheduled</p>
              <p className="text-xl font-bold text-white">{trips.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Main List Column */}
        <div className={`flex-1 overflow-y-auto p-8 transition-all duration-500 ease-in-out ${selectedTrip ? 'pr-[420px]' : ''}`}>
          <div className="grid gap-4 max-w-5xl mx-auto">
            {trips.length === 0 ? (
              <div className="text-center py-20 text-[#8d8d8d] border border-dashed border-white/10 rounded-2xl">
                <p>No scheduled trips found in the database.</p>
              </div>
            ) : trips.map((trip) => {
              const isAssigned = !!trip.rider_id && trip.transport_status !== 'unassigned';
              const displayStatus = isAssigned ? 'Driver Assigned' : 'Pending Assignment';
              
              return (
                <div 
                  key={trip.id} 
                  onClick={() => setSelectedTrip(trip)}
                  className={`group p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    selectedTrip?.id === trip.id 
                      ? 'bg-[#161616] border-[#0f62fe] shadow-[0_0_30px_rgba(15,98,254,0.15)] scale-[1.01]' 
                      : 'bg-[#161616]/50 border-white/5 hover:border-white/20 hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isAssigned ? 'bg-[#24a148]/10 text-[#24a148]' : 'bg-[#da1e28]/10 text-[#da1e28]'}`}>
                        {isAssigned ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {trip.full_name || 'Unknown Passenger'}
                          <span className="text-xs font-mono text-[#8d8d8d] px-2 py-0.5 bg-white/5 rounded-md">ID: {trip.id}</span>
                        </h3>
                        <p className="text-sm text-[#8d8d8d] mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> 
                          {trip.preferred_date ? new Date(trip.preferred_date).toLocaleDateString() : 'N/A'} at {trip.preferred_time || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isAssigned 
                        ? 'bg-[#24a148]/10 text-[#24a148] border border-[#24a148]/20' 
                        : 'bg-[#da1e28]/10 text-[#da1e28] border border-[#da1e28]/20 animate-pulse'
                    }`}>
                      {displayStatus}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-black/40 rounded-xl border border-white/5">
                    <div>
                      <p className="text-[10px] text-[#8d8d8d] font-bold uppercase tracking-widest mb-1">Pickup Location</p>
                      <p className="text-sm font-medium text-white flex items-center gap-2 truncate">
                        <MapPin className="w-3 h-3 text-[#0f62fe] shrink-0" /> 
                        <span className="truncate" title={trip.pickup_location}>{trip.pickup_location || 'Not specified'}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8d8d8d] font-bold uppercase tracking-widest mb-1">Dropoff Location</p>
                      <p className="text-sm font-medium text-white flex items-center gap-2 truncate">
                        <Navigation className="w-3 h-3 text-[#f1c21b] shrink-0" /> 
                        <span className="truncate" title={trip.destination_location}>{trip.destination_location || 'Not specified'}</span>
                      </p>
                    </div>
                  </div>

                  {isAssigned && trip.rider_name && (
                    <div className="mt-4 flex items-center gap-3 p-3 bg-[#24a148]/5 rounded-xl border border-[#24a148]/10">
                      <ShieldCheck className="w-5 h-5 text-[#24a148]" />
                      <div>
                        <p className="text-[10px] text-[#24a148] font-bold uppercase tracking-widest">Assigned Rider</p>
                        <p className="text-sm font-bold text-white">{trip.rider_name} <span className="text-[#8d8d8d] font-normal">({trip.plate_number || 'No Plate'})</span></p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Slide-out Assignment Panel */}
        <div className={`absolute top-0 right-0 h-full w-[400px] bg-[#161616] border-l border-white/10 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${selectedTrip ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedTrip && (
            <>
              {/* Panel Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white">Assign Rider</h3>
                  <p className="text-sm text-[#8d8d8d]">Trip ID: {selectedTrip.id}</p>
                </div>
                <button 
                  onClick={() => { setSelectedTrip(null); setSearchQuery(''); }}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-[#8d8d8d] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Seamless Database Search */}
              <div className="p-6 shrink-0 border-b border-white/5 bg-black/20">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d8d8d]" />
                  <input 
                    type="text" 
                    placeholder="Search global database (Name, Plate, Vehicle)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all text-sm"
                  />
                </div>
                <p className="text-[10px] text-[#8d8d8d] mt-3 font-bold uppercase tracking-widest text-center">
                  Search bypasses vicinity rules. {filteredRiders.length} matching records found.
                </p>
              </div>

              {/* Rider Results */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredRiders.length === 0 ? (
                  <div className="text-center py-12 text-[#8d8d8d]">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No riders found in database.</p>
                  </div>
                ) : (
                  filteredRiders.map(rider => (
                    <div key={rider.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f62fe] to-[#8a3ffc] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {rider.name ? rider.name.charAt(0) : 'R'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-[#0f62fe] transition-colors">{rider.name || `Rider #${rider.id}`}</p>
                            <div className="flex items-center gap-1 text-[10px] text-[#8d8d8d] mt-0.5">
                              <Star className="w-3 h-3 text-[#f1c21b] fill-[#f1c21b]" />
                              <span className="font-bold text-white">{rider.rating || '4.8'}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-md ${
                          rider.status === 'online' ? 'bg-[#24a148]/20 text-[#24a148]' : 
                          rider.status === 'offline' ? 'bg-[#da1e28]/20 text-[#da1e28]' : 'bg-[#f1c21b]/20 text-[#f1c21b]'
                        }`}>
                          {rider.status || 'unknown'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-[#a8a8a8] space-y-1 mb-4 bg-black/30 p-3 rounded-lg">
                        <p className="flex items-center gap-2"><Car className="w-3 h-3" /> {rider.vehicle_type || 'Unspecified Vehicle'}</p>
                        <p className="flex items-center gap-2"><span className="font-mono text-[10px] bg-white/10 px-1 rounded">{rider.plate_number || 'NO PLATE'}</span></p>
                      </div>

                      <button 
                        disabled={isAssigning || (selectedTrip && selectedTrip.rider_id === rider.id)}
                        onClick={() => handleAssignRider(rider)}
                        className="w-full py-2.5 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#0f62fe] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isAssigning 
                          ? 'Assigning...' 
                          : (selectedTrip && selectedTrip.rider_id === rider.id) ? 'Already Assigned' : 'Force Assign'} 
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideScheduling;
