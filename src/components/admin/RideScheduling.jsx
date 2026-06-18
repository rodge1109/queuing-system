import React, { useState, useMemo } from 'react';
import { Clock, Calendar, Search, MapPin, ChevronRight, User, Star, CheckCircle2, Navigation, AlertCircle, X, ShieldCheck, Car } from 'lucide-react';

const RideScheduling = ({ trips = [], riders = [], fetchTrips }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter out cancelled and completed trips from the dispatch view
  const activeTrips = useMemo(() => {
    return trips.filter(t =>
      t.status !== 'cancelled' &&
      t.status !== 'completed' &&
      t.transport_status !== 'cancelled' &&
      t.transport_status !== 'completed'
    );
  }, [trips]);

  // Consider trips as pending if they have no rider or their transport_status is unassigned
  const pendingCount = activeTrips.filter(t => !t.rider_id || t.transport_status === 'unassigned').length;
  const completedCount = trips.filter(t => t.transport_status === 'completed').length;
  const inProgressCount = activeTrips.filter(t => t.transport_status && !['unassigned', 'completed', 'cancelled'].includes(t.transport_status)).length;
  const sosCount = activeTrips.filter(t => t.transport_status === 'sos').length;
  const onlineRiders = riders.filter(r => r.status === 'online').length;
  
  // Filter real riders based on selected trip service type and search query
  const filteredRiders = useMemo(() => {
    let result = riders;

    if (selectedTrip && selectedTrip.service_type) {
      const tripServiceType = selectedTrip.service_type.toLowerCase();
      result = result.filter(rider => {
        if (!rider.vehicle_type) return false;
        const vType = rider.vehicle_type.toLowerCase();
        return vType.includes(tripServiceType) || tripServiceType.includes(vType) ||
               (tripServiceType.includes('van') && vType.includes('van')) ||
               (tripServiceType.includes('car') && vType.includes('car')) ||
               (tripServiceType.includes('motor') && vType.includes('motor'));
      });
    }

    if (!searchQuery.trim()) return result;
    const lowerQuery = searchQuery.toLowerCase();
    return result.filter(rider => 
      (rider.name && rider.name.toLowerCase().includes(lowerQuery)) || 
      (rider.plate_number && rider.plate_number.toLowerCase().includes(lowerQuery)) ||
      (rider.vehicle_type && rider.vehicle_type.toLowerCase().includes(lowerQuery)) ||
      (rider.id && String(rider.id).includes(lowerQuery))
    );
  }, [searchQuery, riders, selectedTrip]);

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
    if (!tripSearchQuery.trim()) return activeTrips;
    const lowerQuery = tripSearchQuery.toLowerCase();
    return activeTrips.filter(trip => 
      (trip.full_name && trip.full_name.toLowerCase().includes(lowerQuery)) ||
      (trip.pickup_location && trip.pickup_location.toLowerCase().includes(lowerQuery)) ||
      (trip.destination_location && trip.destination_location.toLowerCase().includes(lowerQuery)) ||
      (String(trip.id).includes(lowerQuery))
    );
  }, [tripSearchQuery, activeTrips]);

  return (
    <div className="h-full bg-[#f8f9fa] text-black flex flex-col font-sans overflow-hidden animate-fadeIn">
      
      {/* KPI Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 border-b border-gray-100 bg-white shrink-0">
        <StatCell
          label="Pending"
          value={pendingCount}
          sub="Unassigned"
          accent={pendingCount > 0 ? 'red' : 'green'}
          icon={<AlertCircle size={13} />}
        />
        <StatCell
          label="Active"
          value={inProgressCount}
          sub="In Progress"
          accent="blue"
          icon={<Navigation size={13} />}
        />
        <StatCell
          label="Total"
          value={activeTrips.length}
          sub="All Bookings"
          accent="gray"
          icon={<Calendar size={13} />}
        />
        <StatCell
          label="Completed"
          value={completedCount}
          sub="Finished Trips"
          accent="green"
          icon={<CheckCircle2 size={13} />}
        />
        <StatCell
          label="Riders Online"
          value={onlineRiders}
          sub={`of ${riders.length} total`}
          accent="green"
          icon={<User size={13} />}
        />
        <StatCell
          label="SOS Alerts"
          value={sosCount}
          sub="Emergency"
          accent={sosCount > 0 ? 'sos' : 'gray'}
          icon={<ShieldCheck size={13} />}
        />
      </div>

      {/* Header Section */}
      <div className="px-6 py-3 flex justify-between items-center bg-white border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-black tracking-tighter uppercase flex items-center gap-2">
            <Navigation className="text-[#24a148]" size={18} />
            Ride Dispatch & Scheduling
          </h2>
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Global Transport Monitoring & Rider Assignment</p>
        </div>
        <div className="flex gap-3">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#24a148] animate-pulse"></span>
            Operational Network Connected
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-2 border-b border-gray-100 flex gap-4 bg-white">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input 
            type="text" 
            placeholder="Search by passenger name, location, or trip ID..."
            value={tripSearchQuery}
            onChange={(e) => setTripSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#f4f4f4] border-0 border-b border-gray-300 text-[12px] focus:outline-none focus:border-[#24a148] transition-all"
          />
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative bg-[#f8f9fa]">
        {/* Main List Column */}
        <div className={`flex-1 overflow-y-auto p-4 transition-all duration-500 ease-in-out ${selectedTrip ? 'pr-[420px]' : ''}`}>
          <div className="bg-white border border-gray-100 shadow-sm max-w-[1584px] mx-auto w-full">
            {filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Car size={48} className="mb-4 opacity-10" />
                <p className="text-sm font-semibold uppercase tracking-widest">No matching trips found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-900 border-b border-gray-900">
                      <th className="px-4 py-2.5 font-bold uppercase tracking-widest text-white text-[9px]">Trip ID</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-widest text-white text-[9px]">Passenger</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-widest text-white text-[9px]">Driver / Vehicle</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-widest text-white text-[9px]">Route (Pickup &rarr; Drop)</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-widest text-white text-[9px]">Fare</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-widest text-white text-[9px]">Status</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-widest text-white text-[9px]">Schedule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((trip) => {
                      const isSelected = selectedTrip?.id === trip.id;
                      const isAssigned = !!trip.rider_id && trip.transport_status !== 'unassigned';
                      
                      return (
                        <tr 
                          key={trip.id} 
                          onClick={() => setSelectedTrip(trip)}
                          className={`border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-green-50/40 hover:bg-green-50/60 font-medium' 
                              : 'hover:bg-gray-50/50'
                          }`}
                        >
                          <td className="px-4 py-2 font-mono font-bold text-gray-900">
                            <span className={isSelected ? 'text-[#24a148]' : 'text-gray-900'}>#{trip.id}</span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="font-bold text-gray-900">{trip.full_name || 'Unknown Passenger'}</div>
                            <div className="text-[10px] text-gray-400">{trip.phone_number || 'No Phone'}</div>
                          </td>
                          <td className="px-4 py-2">
                            {isAssigned && trip.rider_name ? (
                              <>
                                <div className="font-bold text-gray-900">{trip.rider_name}</div>
                                <div className="text-[10px] text-gray-400">
                                  {trip.vehicle_type || 'Vehicle'} • {trip.plate_number || 'No Plate'}
                                </div>
                              </>
                            ) : (
                              <span className="text-red-500 font-semibold uppercase text-[10px] bg-red-50 px-2 py-0.5 border border-red-100 rounded-sm">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-2 max-w-[240px]">
                            <div className="text-gray-900 truncate" title={trip.pickup_location}>
                              <span className="text-green-600 font-bold mr-1">P:</span>{trip.pickup_location || 'Not specified'}
                            </div>
                            <div className="text-gray-500 truncate mt-0.5" title={trip.destination_location}>
                              <span className="text-blue-500 font-bold mr-1">D:</span>{trip.destination_location || 'Not specified'}
                            </div>
                          </td>
                          <td className="px-4 py-2 font-mono font-bold text-gray-900">
                            PHP {parseFloat(trip.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider rounded-sm ${
                              trip.transport_status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                              trip.transport_status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                              trip.transport_status === 'sos' ? 'bg-red-600 text-white font-bold animate-pulse' :
                              !isAssigned ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse' :
                              'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {trip.transport_status || 'unassigned'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-500 font-medium whitespace-nowrap">
                            <div className="font-semibold text-gray-900">{trip.preferred_date ? new Date(trip.preferred_date).toLocaleDateString() : 'N/A'}</div>
                            <div className="text-[10px] text-gray-400">{trip.preferred_time || 'N/A'}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Slide-out Assignment Panel */}
        <div className={`absolute top-0 right-0 h-full w-[400px] bg-white border-l border-gray-200 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col z-10 ${selectedTrip ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedTrip && (
            <>
              {/* Panel Header */}
              <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-black uppercase tracking-tighter">Assign Operator</h3>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Dispatching for Booking #{selectedTrip.id}</p>
                </div>
                <button 
                  onClick={() => { setSelectedTrip(null); setSearchQuery(''); }}
                  className="w-8 h-8 flex items-center justify-center transition-all text-gray-400 hover:text-black hover:bg-gray-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Seamless Database Search */}
              <div className="px-4 py-3 shrink-0 border-b border-gray-50 bg-[#f8f9fa]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="SEARCH RIDER REGISTRY..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-0 border-b-2 border-gray-200 text-black py-2 pl-9 pr-3 focus:outline-none focus:border-[#24a148] transition-all text-[10px] font-semibold uppercase tracking-widest placeholder:text-gray-300"
                  />
                </div>
                <p className="text-[8px] text-gray-400 mt-2 font-semibold uppercase tracking-widest text-center">
                  Search bypasses vicinity rules. {filteredRiders.length} records active.
                </p>
              </div>

              {/* Rider Results - Clean Grid List Style */}
              <div className="flex-1 overflow-y-auto p-3">
                {filteredRiders.length === 0 ? (
                  <div className="text-center py-12 text-gray-300">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-[10px] font-semibold uppercase tracking-widest">No matching operators found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredRiders.map(rider => {
                      const isRiderAssigned = selectedTrip && selectedTrip.rider_id === rider.id;
                      const isOnline = rider.status === 'online';
                      const isOffline = rider.status === 'offline';
                      
                      return (
                        <div 
                          key={rider.id} 
                          className={`relative p-4 bg-white border rounded-xl transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#24a148]/60 hover:-translate-y-0.5 ${
                            isRiderAssigned 
                              ? 'border-[#24a148] bg-green-50/20 ring-1 ring-[#24a148]/20' 
                              : 'border-gray-100'
                          } ${isOffline ? 'opacity-80' : ''}`}
                        >
                          {/* Status Indicator Dot & Label */}
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#f8f9fa] py-0.5 px-2 rounded-full border border-gray-100">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isOnline ? 'bg-[#24a148] animate-pulse' : 
                              isOffline ? 'bg-gray-400' : 'bg-yellow-500'
                            }`} />
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tight">
                              {rider.status || 'offline'}
                            </span>
                          </div>

                          {/* Operator Avatar and Name */}
                          <div className="flex flex-col items-center text-center mt-3 mb-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-300 ${
                              isOnline 
                                ? 'bg-green-50 text-[#24a148] border-green-100 group-hover:bg-[#24a148]/10 group-hover:border-[#24a148]/30' 
                                : 'bg-gray-50 text-gray-600 border-gray-200 group-hover:bg-gray-100'
                            }`}>
                              {rider.name ? rider.name.charAt(0).toUpperCase() : 'R'}
                            </div>
                            
                            <p className="text-[11px] font-bold text-gray-900 group-hover:text-[#24a148] transition-colors uppercase tracking-tight line-clamp-1 w-full mt-1.5" title={rider.name}>
                              {rider.name || `Rider #${rider.id}`}
                            </p>
                            
                            {/* Rating and Vehicle Type Row */}
                            <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-500 mt-1">
                              <span className="font-bold uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 text-[8px]">
                                {rider.vehicle_type || 'Vehicle'}
                              </span>
                              <span className="text-gray-300">|</span>
                              <span className="flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-gray-800">{rider.rating || '4.8'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Plate Details */}
                          <div className="text-[8px] text-gray-500 text-center py-1.5 bg-[#f8f9fa] rounded-lg border border-gray-200/50 font-mono font-bold uppercase tracking-wider mb-3 group-hover:bg-white transition-colors">
                            {rider.plate_number || 'NO PLATE'}
                          </div>

                          {/* Action Button */}
                          <button 
                            disabled={isAssigning || isRiderAssigned}
                            onClick={() => handleAssignRider(rider)}
                            className={`w-full py-2.5 rounded-lg font-semibold text-[9px] uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1 ${
                              isRiderAssigned 
                                ? 'bg-green-100 text-green-800 cursor-default' 
                                : 'bg-black text-white hover:bg-[#24a148] disabled:opacity-40'
                            }`}
                          >
                            {isAssigning 
                              ? 'Assigning...' 
                              : isRiderAssigned 
                                ? 'Assigned' 
                                : 'Assign'}
                            {!isAssigning && !isRiderAssigned && <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
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

// KPI Grid Cell
function StatCell({ label, value, sub, accent, icon }) {
  const accentMap = {
    red:   { num: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100',   icon: 'text-red-400'   },
    green: { num: 'text-[#24a148]',   bg: 'bg-green-50/60',border: 'border-green-100', icon: 'text-[#24a148]' },
    blue:  { num: 'text-blue-600',    bg: 'bg-blue-50/60', border: 'border-blue-100',  icon: 'text-blue-400'  },
    gray:  { num: 'text-gray-800',    bg: 'bg-transparent',border: 'border-transparent',icon: 'text-gray-400' },
    sos:   { num: 'text-red-600 animate-pulse', bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' },
  };
  const c = accentMap[accent] || accentMap.gray;
  return (
    <div className={`flex flex-col justify-between px-4 py-3 border-r border-b border-gray-100 hover:bg-gray-50/70 transition-colors group`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[8px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors`}>{label}</span>
        <span className={`${c.icon} opacity-70`}>{icon}</span>
      </div>
      <div>
        <span className={`text-2xl font-black tracking-tighter leading-none ${c.num}`}>{value}</span>
        <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">{sub}</p>
      </div>
    </div>
  );
}


export default RideScheduling;
