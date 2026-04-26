import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Share2, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Shield, 
  Star,
  Activity,
  User,
  ArrowRight,
  Car,
  X
} from 'lucide-react';

const PassengerTracking = ({ appointmentId, token, onClose }) => {
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [driverPos, setDriverPos] = useState(null);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        const data = await res.json();
        if (data.success) {
          setTrip(data.appointment);
        }
      } catch (err) {
        console.error('Failed to fetch trip:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
    const interval = setInterval(fetchTrip, 4000); // Poll status every 4s
    return () => clearInterval(interval);
  }, [appointmentId]);

  // WebSocket for Live Location
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:5000/ws/staff-chat`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location_update' && data.appointmentId === parseInt(appointmentId)) {
          setDriverPos({ lat: data.lat, lng: data.lng });
        }
      } catch (err) {}
    };

    return () => ws.current?.close();
  }, [appointmentId]);

  // Map Initialization
  useEffect(() => {
    if (!mapRef.current || leafletMap.current || !window.L || !trip) return;

    const L = window.L;
    leafletMap.current = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: false
    }).setView([trip.pickup_lat || 11.0500, trip.pickup_lng || 124.0000], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO'
    }).addTo(leafletMap.current);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [trip]);

  // Update Markers on Map
  useEffect(() => {
    const L = window.L;
    if (!leafletMap.current || !L || !trip) return;

    // Clear existing
    leafletMap.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        leafletMap.current.removeLayer(layer);
      }
    });

    // Pickup Marker
    L.marker([trip.pickup_lat, trip.pickup_lng], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [20, 32], iconAnchor: [10, 32]
      })
    }).addTo(leafletMap.current);

    // Destination Marker
    if (trip.dest_lat) {
      L.marker([trip.dest_lat, trip.dest_lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          iconSize: [20, 32], iconAnchor: [10, 32]
        })
      }).addTo(leafletMap.current);
    }

    // Driver Marker
    if (driverPos) {
      L.marker([driverPos.lat, driverPos.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
          iconSize: [25, 41], iconAnchor: [12, 41]
        })
      }).addTo(leafletMap.current).bindPopup('<b>Driver</b>').openPopup();

      // Pan to driver if they move
      leafletMap.current.panTo([driverPos.lat, driverPos.lng]);
    }
  }, [trip, driverPos]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white p-8">
        <div className="w-12 h-12 border-4 border-[#00B14F] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Connecting to system...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white p-8 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Clock size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Trip Not Found</h3>
        <p className="text-gray-500 text-sm">We couldn't locate your trip details. Please check your link.</p>
      </div>
    );
  }

  const isMatched = ['accepted', 'on_way_to_pickup', 'arrived_at_pickup', 'picked_up'].includes(trip.transport_status);
  const isOnTrip = trip.transport_status === 'picked_up';
  const isCompleted = trip.transport_status === 'completed';

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen font-['DM_Sans',_sans-serif] flex flex-col">
      {/* Status Header */}
      <div className="p-4 bg-white border-b border-gray-50 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X size={18} className="text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${trip.transport_status === 'sos' ? 'bg-red-500 animate-pulse' : 'bg-[#00B14F]'}`}></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {trip.transport_status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-gray-400">ID: #{trip.id}</span>
      </div>

      {/* Map Area */}
      <div className="h-[300px] bg-gray-100 relative">
        <div ref={mapRef} className="absolute inset-0 z-0" />
        
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-white shadow-lg flex items-center gap-3">
            <Shield size={16} className="text-[#00B14F]" />
            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tight">Your trip is protected by King's Safety Insurance</span>
          </div>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="flex-1 p-4 -mt-4 bg-white rounded-t-3xl border-t border-gray-100 shadow-2xl z-10">
        <div className="w-8 h-1 bg-gray-100 rounded-full mx-auto mb-6"></div>

        {!isMatched ? (
          /* Searching Screen */
          <div className="text-center py-8">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-[#00B14F]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#00B14F] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search size={24} className="text-[#00B14F]" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Finding your driver</h2>
            <p className="text-gray-500 text-sm">We're connecting you with the nearest available rider.</p>
          </div>
        ) : isCompleted ? (
          /* Completed Screen */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#E1F5EE] text-[#00B14F] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Trip Completed</h2>
            <p className="text-gray-500 text-sm mb-6">You've arrived at your destination.</p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Total Fare</span>
                <span className="font-bold text-gray-900">₱{trip.total_amount}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Paid via Cash</span>
                <span>{new Date(trip.updated_at).toLocaleTimeString()}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-[#00B14F] text-white rounded-2xl font-bold hover:bg-[#009241] transition-all"
            >
              Back to Home
            </button>
          </div>
        ) : (
          /* Active Trip Screen (Matched or On Trip) */
          <>
            <div className="bg-[#E1F5EE] rounded-2xl p-4 flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] text-[#0F6E56] font-bold uppercase tracking-wider mb-1">
                  {isOnTrip ? 'ETA to destination' : 'Driver is arriving'}
                </p>
                <p className="text-3xl font-black text-[#085041] tracking-tighter italic">3 mins</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#1D9E75] font-bold uppercase">{trip.service_type}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-white border border-[#5DCAA5] rounded-lg text-xs font-black text-[#085041]">
                  {trip.plate_number || 'ABC 1234'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center relative">
                <User size={32} className="text-gray-300" />
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-gray-50 flex items-center gap-0.5">
                  <Star size={10} className="text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-bold">4.9</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">{trip.rider_name || 'Assigned Driver'}</p>
                <p className="text-xs text-gray-400">Silver Toyota Vios</p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center hover:bg-[#E1F5EE] transition-colors">
                  <Phone size={18} />
                </button>
                <button className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center hover:bg-[#E1F5EE] transition-colors">
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#00B14F] rounded-full"></div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Pickup</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{trip.pickup_location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#E24B4A] rounded-full"></div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Drop-off</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{trip.destination_location}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl text-xs font-bold uppercase tracking-widest">Share Trip</button>
              <button className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold uppercase tracking-widest">Emergency</button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap');
      `}</style>
    </div>
  );
};

const Search = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const Check = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default PassengerTracking;
