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
  const tripRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        const data = await res.json();
        if (data.success) {
          setTrip(data.appointment);
          tripRef.current = data.appointment;
          if (data.appointment.rider_lat && data.appointment.rider_lng) {
            setDriverPos({ lat: parseFloat(data.appointment.rider_lat), lng: parseFloat(data.appointment.rider_lng) });
          }
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

  const handleCancelRequest = async () => {
    if (window.confirm("Are you sure you want to cancel this ride request?")) {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' })
        });
        const data = await res.json();
        if (data.success) {
          onClose();
        } else {
          alert(data.message || 'Failed to cancel request');
        }
      } catch (err) {
        console.error(err);
        alert('Error cancelling request');
      }
    }
  };

  // WebSocket for Live Location
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/staff-chat`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location_update' && tripRef.current && String(data.riderId) === String(tripRef.current.rider_id)) {
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
  }, [trip?.id]);

  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);

  // Update Markers on Map
  useEffect(() => {
    const L = window.L;
    if (!leafletMap.current || !L || !trip) return;

    // Pickup Marker
    if (!pickupMarkerRef.current) {
      pickupMarkerRef.current = L.marker([trip.pickup_lat, trip.pickup_lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          iconSize: [20, 32], iconAnchor: [10, 32]
        })
      }).addTo(leafletMap.current);
    } else {
      pickupMarkerRef.current.setLatLng([trip.pickup_lat, trip.pickup_lng]);
    }

    // Destination Marker
    if (trip.dest_lat) {
      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker([trip.dest_lat, trip.dest_lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            iconSize: [20, 32], iconAnchor: [10, 32]
          })
        }).addTo(leafletMap.current);
      } else {
        destMarkerRef.current.setLatLng([trip.dest_lat, trip.dest_lng]);
      }
    }

    // Driver Marker
    if (driverPos) {
      const isFirstDriverPos = !driverMarkerRef.current;
      if (isFirstDriverPos) {
        driverMarkerRef.current = L.marker([driverPos.lat, driverPos.lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
            iconSize: [25, 41], iconAnchor: [12, 41]
          })
        }).addTo(leafletMap.current).bindPopup('<b>Driver</b>').openPopup();
        leafletMap.current.panTo([driverPos.lat, driverPos.lng]); // Initial pan
      } else {
        driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
        // Optional: you can pan conditionally if they move out of bounds, but for now we won't force pan on every tiny update
      }
    }
  }, [trip?.pickup_lat, trip?.pickup_lng, trip?.dest_lat, trip?.dest_lng, driverPos?.lat, driverPos?.lng]);

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
    <div className="max-w-md mx-auto min-h-screen font-['DM_Sans',_sans-serif] flex flex-col relative bg-transparent overflow-hidden pointer-events-none">
      {/* Map Area */}
      <div className="fixed inset-0 z-0">
        <div ref={mapRef} className="absolute inset-0" />
      </div>

      {/* Status Header */}
      <div className="p-4 bg-white/90 backdrop-blur-md shadow-sm relative z-20 pointer-events-auto border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors bg-white">
              <X size={18} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${trip.transport_status === 'sos' ? 'bg-red-500 animate-pulse' : 'bg-[#00B14F]'}`}></div>
              <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                {trip.transport_status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
      </div>

      <div className="relative z-10 px-4 pt-4 pointer-events-none mt-4">
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-white shadow-lg flex items-center gap-3">
          <Shield size={16} className="text-[#00B14F]" />
          <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tight">Your trip is protected by King's Safety Insurance</span>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div 
        className="fixed bottom-0 left-0 right-0 w-full z-30 bg-white/95 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-white/40 pointer-events-auto flex flex-col"
      >
        {/* Drag Handle Area */}
        <div 
          className="pt-6 pb-4 px-6 flex justify-center cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Content Wrapper */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}>
          <div className="px-6 pb-6">

        {isCompleted ? (
          /* Completed Screen */
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#E1F5EE] text-[#00B14F] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Trip Completed</h2>
            <p className="text-gray-500 text-sm mb-6">You've arrived at your destination.</p>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                  <User size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{trip.rider_name || 'Your Driver'}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{trip.plate_number || 'ABC 1234'}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Total Fare</span>
                <span className="font-bold text-gray-900">₱{trip.total_amount}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Paid via Cash</span>
                <span>{new Date(trip.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {!ratingSubmitted ? (
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-3">Rate your experience</p>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        size={32} 
                        className={`transition-colors duration-200 ${
                          (hoverRating || rating) >= star 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-200 fill-transparent'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <button 
                    onClick={() => {
                      setRatingSubmitted(true);
                      // In a real app, you would send the rating to the backend here
                    }}
                    className="w-full py-4 bg-[#00B14F] text-white rounded-2xl font-bold shadow-lg shadow-green-100 active:scale-95 transition-all animate-in fade-in duration-300"
                  >
                    Submit Rating
                  </button>
                )}
                {rating === 0 && (
                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    Skip
                  </button>
                )}
              </div>
            ) : (
              <div className="mb-6 animate-in zoom-in duration-300">
                <div className="bg-amber-50 p-4 rounded-xl text-amber-600 mb-4">
                  <Star size={24} className="mx-auto mb-2 fill-amber-500 text-amber-500" />
                  <p className="text-sm font-bold">Thanks for your feedback!</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>
        ) : !isMatched ? (
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
            <p className="text-gray-500 text-sm mb-6">We're connecting you with the nearest available rider.</p>
            <button 
              onClick={handleCancelRequest}
              className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold w-full active:scale-95 transition-all"
            >
              Cancel Request
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
        </div>
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
