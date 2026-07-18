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
  X,
  Play,
  Mic,
  Flag
} from 'lucide-react';
import LiveTrackingMap from '../maps/LiveTrackingMap';

const PassengerTracking = ({ appointmentId, token, onClose }) => {
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [driverPos, setDriverPos] = useState(null);
  const ws = useRef(null);
  const tripRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSafetyCenterOpen, setIsSafetyCenterOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const isChatOpenRef = useRef(false);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
    if (isChatOpen) setHasUnreadMessages(false);
  }, [isChatOpen]);

  useEffect(() => {
    if (!appointmentId) return;
    
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

  const fetchMessages = async () => {
    if (!trip || !isChatOpen) return;
    try {
      const res = await fetch(`/api/rider/messages/${trip.id}`);
      const data = await res.json();
      if (data.success) setChatMessages(data.messages);
    } catch (e) { }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !trip) return;
    const msg = chatInput;
    setChatInput('');
    try {
      const res = await fetch('/api/rider/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          senderType: 'passenger',
          senderId: trip.id, // Anonymous passengers just use trip id
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
    if (isChatOpen && trip) {
      fetchMessages();
      interval = setInterval(fetchMessages, 5000);
    }
    return () => clearInterval(interval);
  }, [isChatOpen, trip]);

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
        if (data.type === 'chat_message' && tripRef.current && String(data.message.trip_id) === String(tripRef.current.id)) {
          if (data.message.sender_type === 'rider' && !isChatOpenRef.current) {
            setHasUnreadMessages(true);
          }
        }
      } catch (err) {}
    };

    return () => ws.current?.close();
  }, [appointmentId]);
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
        <LiveTrackingMap 
          riderPos={driverPos}
          pickupPos={trip.pickup_lat ? { lat: parseFloat(trip.pickup_lat), lng: parseFloat(trip.pickup_lng) } : null}
          destPos={trip.dest_lat ? { lat: parseFloat(trip.dest_lat), lng: parseFloat(trip.dest_lng) } : null}
          status={trip.transport_status}
        />
      </div>





      {/* Bottom Content Area */}
      <div 
        className="fixed bottom-0 left-0 right-0 w-full z-30 bg-white/95 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-white/40 pointer-events-auto flex flex-col"
      >
        {/* Safety Center Floating Badge & Popup */}
        {isMatched && !isCompleted && (
          <div className="absolute -top-12 left-4 z-50 flex flex-col items-start">
            {isSafetyCenterOpen && (
              <div className="absolute bottom-full mb-3 left-0 w-[calc(100vw-32px)] max-w-[416px] bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <h4 className="text-[17px] font-bold text-gray-900 mb-4 tracking-tight">Tools to keep you safe</h4>
                <div className="flex flex-col gap-4 mb-4">
                  <button className="flex items-center gap-3 text-[15px] font-bold text-gray-800 hover:text-black text-left w-full">
                    <Mic size={20} className="text-gray-900" /> Record ride audio
                  </button>
                  <button className="flex items-center gap-3 text-[15px] font-bold text-gray-800 hover:text-black text-left w-full">
                    <Share2 size={20} className="text-gray-900" /> Share live location
                  </button>
                  <button className="flex items-center gap-3 text-[15px] font-bold text-gray-800 hover:text-black text-left w-full">
                    <Flag size={20} className="text-gray-900" /> Report incident
                  </button>
                  <button className="flex items-center gap-3 text-[15px] font-bold text-red-500 hover:text-red-600 text-left w-full">
                    <Phone size={20} className="fill-red-500" /> SOS call to Police
                  </button>
                </div>
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setIsSafetyCenterOpen(false)}
                    className="bg-[#00B14F] text-white px-5 py-2 rounded-full text-[14px] font-bold active:scale-95 transition-all"
                  >
                    Got it
                  </button>
                </div>
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45"></div>
              </div>
            )}
            
            <button 
              onClick={() => setIsSafetyCenterOpen(!isSafetyCenterOpen)}
              className="bg-white px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-md border border-gray-100 text-[#085041] hover:bg-gray-50 active:scale-95 transition-all"
            >
              <Shield size={16} />
              <span className="text-sm font-bold text-[#085041]">Safety Centre</span>
            </button>
          </div>
        )}
        {/* Drag Handle Area */}
        <div 
          className="pt-3 pb-2 px-6 flex justify-center cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Content Wrapper */}
        <div className={`transition-all duration-500 ease-in-out ${isMinimized ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[30vh] overflow-y-auto opacity-100'}`}>
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
          <div className="text-center pt-2 pb-8">
            <div className="relative w-20 h-20 mx-auto mb-[19px]">
              <div className="absolute inset-0 border-4 border-[#00B14F]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#00B14F] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search size={24} className="text-[#00B14F]" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-[3px]">Finding your driver</h2>
            <p className="text-gray-500 text-sm mb-2">We're connecting you with the nearest available rider.</p>
            <button 
              onClick={handleCancelRequest}
              className="px-8 py-2.5 bg-[#00B14F] text-white rounded-full font-bold active:scale-95 transition-all shadow-lg shadow-green-100"
            >
              Cancel Request
            </button>
          </div>
        ) : (

          /* Active Trip Screen (Matched or On Trip) */
          <>
            <div className="bg-[#E1F5EE] rounded-3xl p-4 flex justify-between items-center mb-4">
              <div>
                <p className="text-xl font-black text-black mb-0.5">
                  {isOnTrip ? 'ETA to destination' : 'Driver is arriving'}
                </p>
                <div className="flex flex-col mt-1">
                  <p className="text-[9px] text-black font-black uppercase tracking-widest">{isOnTrip ? 'Dropoff' : 'Pickup'}</p>
                  <p className="text-[11px] font-bold text-black truncate max-w-[220px]">{isOnTrip ? trip.destination_location : trip.pickup_location}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end justify-center">
                <p className="text-base font-black text-black tracking-wider mb-0.5">3 mins</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center relative shrink-0">
                  <img src={trip.rider_photo || "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=150&h=150&fit=crop"} alt="Driver" className="w-full h-full rounded-full object-cover shadow-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-black leading-tight mb-1">{trip.rider_name || 'Assigned Driver'}</p>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-black">4.9</span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end">
                  <span className="inline-block text-[22px] font-black text-black tracking-tighter mb-0.5">
                    {trip.plate_number || 'ABC-1235'}
                  </span>
                  <p className="text-[10px] font-bold text-black uppercase tracking-wider text-right">{trip.vehicle_details || 'Silver Toyota Vios'}</p>
                </div>
              </div>
              
              <div className="flex gap-3 w-full">
                {trip.rider_phone ? (
                  <a 
                    href={`tel:${trip.rider_phone}`}
                    className="flex-1 py-3 bg-gray-50 text-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#E1F5EE] transition-colors font-bold text-[10px] uppercase tracking-widest"
                  >
                    <Phone size={14} /> Call Driver
                  </a>
                ) : (
                  <button 
                    onClick={() => alert("Driver's phone number is not available.")}
                    className="flex-1 py-3 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed font-bold text-[10px] uppercase tracking-widest"
                  >
                    <Phone size={14} /> No Phone
                  </button>
                )}
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="flex-1 py-3 bg-gray-50 text-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#E1F5EE] transition-colors font-bold text-[10px] uppercase tracking-widest relative"
                >
                  <MessageSquare size={14} /> Message Driver
                  {hasUnreadMessages && (
                    <span className="absolute top-2.5 right-4 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  )}
                </button>
              </div>
            </div>



            <div className="mt-4">
              <button className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">Share Trip</button>
            </div>
          </>
        )}
          </div>
        </div>
      </div>

      {/* Chat Window Overlay */}
      {isChatOpen && trip && (
        <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-300 pointer-events-auto">
          <div className="bg-white rounded-t-2xl h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-500 pointer-events-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#00B14F]"><User className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-base font-black text-gray-900 tracking-tight">{trip.rider_name || 'Assigned Driver'}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Driver • Trip #{trip.id}</p>
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
                  <div key={msg.id} className={`flex ${msg.sender_type === 'passenger' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                      msg.sender_type === 'passenger' 
                        ? 'bg-[#00B14F] text-white rounded-tr-none shadow-lg shadow-green-100' 
                        : 'bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200'
                    }`}>
                      {msg.message}
                      <p className={`text-[8px] mt-1.5 font-bold uppercase opacity-60 ${msg.sender_type === 'passenger' ? 'text-right' : 'text-left'}`}>
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
                  placeholder="Message driver..."
                  className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] outline-none transition-all shadow-sm"
                />
                <button 
                  type="submit"
                  className="w-14 h-14 bg-[#00B14F] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 active:scale-90 transition-all"
                >
                  <Play className="w-5 h-5 fill-white" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
