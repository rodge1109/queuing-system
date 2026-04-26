import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  Share2, 
  X, 
  Star, 
  Activity, 
  User, 
  AlertTriangle,
  Clock,
  ChevronRight,
  Shield,
  CreditCard,
  Gift,
  MoreHorizontal,
  Home,
  FileText,
  DollarSign,
  TrendingUp,
  Map as MapIcon
} from 'lucide-react';

const RideHailingWireframe = () => {
  const [stage, setStage] = useState(0);
  const [countdown, setCountdown] = useState(15);
  const [activeBooking, setActiveBooking] = useState(null);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  // Poll for data
  useEffect(() => {
    const poll = async () => {
      // 1. If we have an active booking, check its latest status
      if (activeBooking?.id) {
        try {
          const res = await fetch(`/api/appointments/${activeBooking.id}`);
          const data = await res.json();
          if (data.success) {
            const apt = data.appointment;
            setActiveBooking(apt);
            
            // Map real transport_status to wireframe stages
            if (apt.transport_status === 'completed') setStage(3);
            else if (['picked_up'].includes(apt.transport_status)) setStage(2);
            else if (['accepted', 'on_way_to_pickup', 'arrived_at_pickup'].includes(apt.transport_status)) setStage(1);
            else setStage(0);
          }
        } catch (err) {}
      }

      // 2. For the Driver view, fetch real available requests
      try {
        const res = await fetch('/api/rider/requests');
        const data = await res.json();
        if (data.success) setAvailableRequests(data.requests);
      } catch (err) {}
    };

    poll();
    const interval = setInterval(poll, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [activeBooking]);

  const handleBook = async () => {
    setIsBooking(true);
    try {
      const payload = {
        fullName: 'Juan Reyes (Test)',
        phoneNumber: '09123456789',
        email: 'juan@test.com',
        serviceType: 'Sedan (Economy)',
        preferredDate: new Date().toISOString().split('T')[0],
        preferredTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        pickupLocation: 'Tanjay City Hall',
        destinationLocation: 'SM Seaside City',
        totalAmount: 100
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setActiveBooking(data.appointment);
        setStage(0); // Still in booking stage until matched
      }
    } catch (err) {
      alert('Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      // For demo, we use rider_id 1
      const res = await fetch('/api/rider/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, riderId: 1 })
      });
      const data = await res.json();
      if (data.success) {
        // Find the booking we just accepted to track it in the passenger view too
        const accepted = availableRequests.find(r => r.id === id);
        setActiveBooking(accepted);
        setStage(1);
      }
    } catch (err) {}
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await fetch('/api/rider/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, status })
      });
    } catch (err) {}
  };

  // GPS Tracking Simulation
  useEffect(() => {
    if (!activeBooking || !['accepted', 'on_way_to_pickup', 'arrived_at_pickup', 'picked_up'].includes(activeBooking.transport_status)) return;

    let step = 0;
    const totalSteps = 20;
    
    // Simulate coordinates between two points
    // Pickup: { lat: 14.5995, lng: 120.9842 }, Dropoff: { lat: 14.6045, lng: 121.0042 } (Mock coords for simulation)
    const start = activeBooking.transport_status === 'picked_up' 
      ? { lat: 14.5995, lng: 120.9842 } // Start from pickup
      : { lat: 14.5800, lng: 120.9700 }; // Start from rider's base
      
    const end = activeBooking.transport_status === 'picked_up'
      ? { lat: 14.6045, lng: 121.0042 } // End at destination
      : { lat: 14.5995, lng: 120.9842 }; // End at pickup

    const interval = setInterval(async () => {
      step++;
      if (step > totalSteps) {
        clearInterval(interval);
        return;
      }

      const currentLat = start.lat + (end.lat - start.lat) * (step / totalSteps);
      const currentLng = start.lng + (end.lng - start.lng) * (step / totalSteps);

      try {
        await fetch('/api/rider/update-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            riderId: 1, // Using test rider ID 1
            lat: currentLat,
            lng: currentLng
          })
        });
      } catch (err) {}
    }, 2000); // Update every 2s

    return () => clearInterval(interval);
  }, [activeBooking?.id, activeBooking?.transport_status]);

  // Stage labels and connector text
  const stages = [
    { id: 0, label: 'Booking', connTop: 'booking', connBottom: 'request sent' },
    { id: 1, label: 'Matched', connTop: 'matched', connBottom: 'en route to pickup' },
    { id: 2, label: 'On Trip', connTop: 'on trip', connBottom: 'navigating' },
    { id: 3, label: 'Done', labelDisplay: 'Done', connTop: 'completed', connBottom: 'earnings credited' }
  ];

  // Hardcoded Trip Data
  const tripData = {
    passenger: { name: 'Juan Reyes', rating: '4.6', avatar: 'JR', color: '#5D7BF5' },
    driver: { name: 'Ramon Dela Cruz', rating: '4.9', avatar: 'RD', color: '#00B14F', trips: '1,203', vehicle: 'Toyota Vios · Silver', plate: 'ABC 1234' },
    route: { pickup: 'Tanjay City Hall', dropoff: 'SM Seaside City', distance: '12.4 km', duration: '27 min' },
    fare: { gross: 100, base: 45, distance: 62, promo: 25, promoCode: 'GRAB20', total: 82, platformFee: 15, net: 85 },
    time: 'Sat, Apr 25 · 9:41–10:08 AM',
    stats: { todayTrips: 7, onlineTime: '3h 20m', earnings: 640, acceptance: '92%' }
  };

  // Countdown for Driver Match Screen
  useEffect(() => {
    let timer;
    if (stage === 1) {
      setCountdown(15);
      timer = setInterval(() => {
        setCountdown(prev => (prev <= 1 ? 15 : prev - 1));
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [stage]);

  // --- Common Components ---

  const MapArea = ({ role, stage }) => {
    // Car marker positions based on stage
    const carPos = [
      { top: '70%', left: '20%' }, // Stage 0
      { top: '45%', left: '35%' }, // Stage 1
      { top: '50%', left: '65%' }, // Stage 2
      { top: '56%', left: '70%' }  // Stage 3
    ];

    const showRoute = stage === 1 || stage === 2;

    return (
      <div className="relative w-full h-[130px] bg-[#f5f5f5] overflow-hidden">
        {/* Road Grid */}
        <div className="absolute top-[38%] left-0 w-full h-[1.5px] bg-white"></div>
        <div className="absolute top-[65%] left-0 w-full h-[1.5px] bg-white"></div>
        <div className="absolute top-0 left-[32%] w-[1.5px] h-full bg-white"></div>
        <div className="absolute top-0 left-[62%] w-[1.5px] h-full bg-white"></div>

        {/* Route Line */}
        {showRoute && (
          <div className="absolute top-[45%] left-[35%] w-[45%] h-0 border-t-2 border-dashed border-[#00B14F] rotate-[22deg] origin-left"></div>
        )}

        {/* Pickup Pin */}
        <div className="absolute top-[34%] left-[55%] w-[10px] h-[10px] bg-[#00B14F] border-2 border-white rounded-full z-10"></div>
        
        {/* Drop-off Pin */}
        <div className="absolute top-[56%] left-[70%] w-[10px] h-[10px] bg-[#E24B4A] border-2 border-white rounded-full z-10"></div>

        {/* Car Marker */}
        {stage !== 3 && (
          <div 
            className="absolute w-[14px] h-[14px] bg-[#00B14F] rounded-[3px] flex items-center justify-center transition-all duration-1000 ease-in-out z-20 shadow-sm"
            style={{ top: carPos[stage].top, left: carPos[stage].left }}
          >
            <div className="w-[7px] h-[7px] bg-white/40"></div>
          </div>
        )}

        {/* Other Cars (Stage 0 Passenger only) */}
        {role === 'passenger' && stage === 0 && (
          <>
            <div className="absolute top-[20%] left-[25%] w-[14px] h-[14px] bg-[#00B14F]/40 rounded-[3px] flex items-center justify-center">
              <div className="w-[7px] h-[7px] bg-white/40"></div>
            </div>
            <div className="absolute top-[80%] left-[45%] w-[14px] h-[14px] bg-[#00B14F]/40 rounded-[3px] flex items-center justify-center">
              <div className="w-[7px] h-[7px] bg-white/40"></div>
            </div>
          </>
        )}

        {/* Floating Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-white border border-[rgba(0,0,0,0.12)] rounded-full shadow-sm z-30">
          <span className="text-[9px] font-bold text-[#111] uppercase tracking-tighter">
            {stage === 0 ? (role === 'passenger' ? "2 drivers nearby" : "Waiting for requests") : 
             stage === 1 ? (role === 'passenger' ? "Driver on the way" : "Booking Request") :
             stage === 2 ? (role === 'passenger' ? "Trip in progress" : "Navigating to drop-off") : ""}
          </span>
        </div>
      </div>
    );
  };

  const PhoneStatusBar = () => (
    <div className="flex justify-between items-center px-3.5 pt-2 pb-1 bg-white">
      <span className="text-[11px] font-bold text-[#111]">9:41</span>
      <div className="flex gap-[3px]">
        {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-[#111] rounded-full"></div>)}
      </div>
    </div>
  );

  const BottomSheetHandle = () => (
    <div className="w-7 h-[2.5px] bg-[#f5f5f5] rounded-full mx-auto mb-2"></div>
  );

  const StarRating = ({ count = 5, filled = 5 }) => (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`w-2 h-2 ${i < filled ? 'text-[#EF9F27]' : 'text-gray-300'}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' }}>
            <rect width="24" height="24" />
          </svg>
        </div>
      ))}
    </div>
  );

  // --- Passenger Components ---

  const PassengerHome = () => (
    <div className="flex flex-col h-full">
      <MapArea role="passenger" stage={0} />
      <div className="bg-white rounded-t-2xl border-t border-[rgba(0,0,0,0.12)] p-2 px-3 pb-3.5">
        <BottomSheetHandle />
        <div className="bg-[#f5f5f5] rounded-lg p-2 flex flex-col gap-1 mb-2 border border-[rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00B14F] rounded-full"></div>
            <span className="text-[10px] font-medium text-[#111]">Current location</span>
          </div>
          <div className="ml-1 w-[0.5px] h-3 bg-[rgba(0,0,0,0.12)]"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#E24B4A] rounded-full"></div>
            <span className="text-[10px] font-medium text-[#666]">Where to?</span>
          </div>
        </div>
        
        <div className="flex gap-1.5 mb-2 overflow-x-auto scrollbar-hide py-1">
          {['GrabCar', 'GrabBike', 'GrabXL', 'Deliver'].map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1 min-w-[50px]">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border-0.5 ${i === 0 ? 'bg-[#E1F5EE] border-[#5DCAA5]' : 'bg-[#f5f5f5] border-[rgba(0,0,0,0.12)]'}`}>
                <div className={`w-5 h-5 ${i === 0 ? 'text-[#00B14F]' : 'text-gray-400'}`}>
                  {i === 0 ? <Activity size={18} /> : i === 1 ? <Navigation size={18} /> : i === 2 ? <User size={18} /> : <FileText size={18} />}
                </div>
              </div>
              <span className={`text-[9px] ${i === 0 ? 'text-[#00B14F] font-bold' : 'text-[#666]'}`}>{s}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={handleBook} 
          disabled={isBooking || activeBooking}
          className={`w-full ${isBooking || activeBooking ? 'bg-gray-400' : 'bg-[#00B14F]'} text-white rounded-lg py-2.5 text-[11px] font-bold shadow-sm active:scale-[0.98] transition-all`}
        >
          {isBooking ? 'Booking...' : activeBooking ? 'Awaiting Rider...' : 'Book GrabCar · ₱100'}
        </button>
      </div>
      <div className="mt-auto border-t border-[rgba(0,0,0,0.12)] flex justify-around py-2 bg-white">
        <div className="flex flex-col items-center gap-0.5 text-[#00B14F]">
          <Home size={16} />
          <span className="text-[8px] font-bold">Home</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-[#999]">
          <Activity size={16} />
          <span className="text-[8px]">Activity</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-[#999]">
          <DollarSign size={16} />
          <span className="text-[8px]">Payment</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-[#999]">
          <User size={16} />
          <span className="text-[8px]">Account</span>
        </div>
      </div>
    </div>
  );

  const PassengerMatched = () => (
    <div className="flex flex-col h-full">
      <MapArea role="passenger" stage={1} />
      <div className="bg-white rounded-t-2xl border-t border-[rgba(0,0,0,0.12)] p-2 px-3 pb-3.5">
        <BottomSheetHandle />
        <div className="bg-[#E1F5EE] rounded-lg p-2 flex justify-between items-center mb-2">
          <div>
            <p className="text-[9px] text-[#0F6E56] font-medium">Arriving in</p>
            <p className="text-xl font-bold text-[#085041] tracking-tighter">3 min</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-[#1D9E75]">{tripData.driver.vehicle}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#f5f5f5] border border-[rgba(0,0,0,0.12)] rounded text-[9px] font-bold">{tripData.driver.plate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 py-2 border-b border-[rgba(0,0,0,0.12)] mb-2">
          <div className="w-9 h-9 bg-[#00B14F] rounded-full flex items-center justify-center text-white text-xs font-bold">{tripData.driver.avatar}</div>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-[#111]">{tripData.driver.name}</p>
            <div className="flex items-center gap-1">
              <StarRating filled={5} />
              <span className="text-[9px] text-[#666]">4.9 · {tripData.driver.trips} trips</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 mb-2">
          <button className="flex-1 bg-[#f5f5f5] border border-[rgba(0,0,0,0.12)] rounded py-1.5 text-[9px] font-bold text-[#666] flex items-center justify-center gap-1"><Phone size={10} /> Call</button>
          <button className="flex-1 bg-[#f5f5f5] border border-[rgba(0,0,0,0.12)] rounded py-1.5 text-[9px] font-bold text-[#666] flex items-center justify-center gap-1"><MessageSquare size={10} /> Message</button>
          <button className="flex-1 bg-[#f5f5f5] border border-[rgba(0,0,0,0.12)] rounded py-1.5 text-[9px] font-bold text-[#666] flex items-center justify-center gap-1"><Share2 size={10} /> Share</button>
        </div>

        <button className="w-full bg-[#f5f5f5] border border-[rgba(0,0,0,0.12)] text-[#666] rounded-lg py-2 text-[11px] font-bold">
          Cancel booking
        </button>
      </div>
    </div>
  );

  const PassengerOnTrip = () => (
    <div className="flex flex-col h-full">
      <MapArea role="passenger" stage={2} />
      <div className="bg-white rounded-t-2xl border-t border-[rgba(0,0,0,0.12)] p-2 px-3 pb-3.5">
        <BottomSheetHandle />
        
        <div className="flex justify-between items-center mb-2 mt-1">
          <span className="text-[9px] font-bold text-[#00B14F]">Picked up</span>
          <span className="text-[9px] font-bold text-[#00B14F]">En route</span>
          <span className="text-[9px] text-[#999]">Arriving</span>
        </div>
        <div className="w-full h-1 bg-[#f5f5f5] rounded-full mb-3 overflow-hidden">
          <div className="w-[60%] h-full bg-[#00B14F]"></div>
        </div>

        <div className="bg-[#E1F5EE] rounded-lg p-2 flex justify-between items-center mb-2">
          <div>
            <p className="text-[9px] text-[#0F6E56] font-medium">ETA to destination</p>
            <p className="text-lg font-bold text-[#085041]">8 min</p>
          </div>
          <p className="text-[9px] text-[#1D9E75] font-bold">{tripData.route.dropoff}</p>
        </div>

        <div className="bg-[#f5f5f5] rounded-lg p-2 mb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-[#00B14F] rounded-full"></div>
            <span className="text-[10px] font-bold">{tripData.route.pickup}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#E24B4A] rounded-full"></div>
            <span className="text-[10px] font-bold">{tripData.route.dropoff}</span>
          </div>
        </div>

        <div className="flex gap-1.5">
          <button className="flex-1 bg-[#f5f5f5] border border-[rgba(0,0,0,0.12)] rounded py-2 text-[9px] font-bold text-[#666]">Call driver</button>
          <button className="flex-1 bg-[#f5f5f5] border border-[rgba(0,0,0,0.12)] rounded py-2 text-[9px] font-bold text-[#666]">Share location</button>
        </div>
      </div>
    </div>
  );

  const PassengerDone = () => (
    <div className="flex flex-col h-full p-2 px-3 pb-3.5 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center py-4 border-b border-[rgba(0,0,0,0.12)] mb-3">
        <div className="w-9 h-9 bg-[#E1F5EE] rounded-full flex items-center justify-center mb-2">
          <div className="w-5 h-5 bg-[#00B14F] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>
          </div>
        </div>
        <h3 className="text-[14px] font-bold">Trip complete!</h3>
        <p className="text-[9px] text-[#999]">{tripData.time}</p>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-[10px] text-[#666]">
          <span>Base fare</span>
          <span className="font-medium">₱{tripData.fare.base.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-[#666]">
          <span>Distance (12.4 km)</span>
          <span className="font-medium">₱{tripData.fare.distance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-[#00B14F]">
          <span>Promo {tripData.fare.promoCode}</span>
          <span className="font-medium">−₱{tripData.fare.promo.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[12px] font-bold pt-2 border-t border-[rgba(0,0,0,0.12)]">
          <span>Total paid</span>
          <span>₱{tripData.fare.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-[9px] text-[#666] font-bold uppercase tracking-widest mb-2">Rate your driver</p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`w-6 h-6 rounded-md flex items-center justify-center ${i <= 4 ? 'bg-[#FAEEDA]' : 'bg-[#f5f5f5]'}`}>
              <div className={`w-3.5 h-3.5 ${i <= 4 ? 'text-[#EF9F27]' : 'text-[#666]'}`}>
                <Star size={14} fill={i <= 4 ? "currentColor" : "none"} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full bg-[#00B14F] text-white rounded-lg py-2.5 text-[11px] font-bold mb-2">Submit rating</button>
      <button className="w-full bg-[#f5f5f5] text-[#666] border border-[rgba(0,0,0,0.12)] rounded-lg py-2.5 text-[11px] font-bold">Book another ride</button>
    </div>
  );

  // --- Driver Components ---

  const DriverHome = () => (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-3 py-2 bg-[#E1F5EE] border-b border-[#9FE1CB]">
        <span className="text-[11px] font-bold text-[#085041]">Online · Ready</span>
        <div className="w-9 h-4.5 bg-[#00B14F] rounded-full relative p-0.5 flex justify-end">
          <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
        </div>
      </div>
      <MapArea role="driver" stage={0} />
      <div className="bg-white rounded-t-2xl border-t border-[rgba(0,0,0,0.12)] p-2 px-3 pb-3.5">
        <BottomSheetHandle />
        <div className="flex gap-1.5 mb-3">
          <div className="flex-1 bg-[#f5f5f5] rounded-lg p-2 text-center">
            <p className="text-[9px] text-[#999] uppercase font-bold mb-0.5">Trips</p>
            <p className="text-[13px] font-bold">{tripData.stats.todayTrips}</p>
          </div>
          <div className="flex-1 bg-[#f5f5f5] rounded-lg p-2 text-center">
            <p className="text-[9px] text-[#999] uppercase font-bold mb-0.5">Online</p>
            <p className="text-[13px] font-bold">{tripData.stats.onlineTime}</p>
          </div>
          <div className="flex-1 bg-[#f5f5f5] rounded-lg p-2 text-center">
            <p className="text-[9px] text-[#999] uppercase font-bold mb-0.5">Earnings</p>
            <p className="text-[13px] font-bold text-[#00B14F]">₱{tripData.stats.earnings}</p>
          </div>
        </div>
        <div className="bg-[#f5f5f5] rounded-lg p-2 border border-[rgba(0,0,0,0.05)]">
          <p className="text-[9px] text-[#999] font-bold uppercase">Available Requests</p>
          <p className="text-base font-bold text-[#00B14F]">{availableRequests.length}</p>
          {availableRequests.length > 0 && (
            <p className="text-[8px] text-[#666]">New request from {availableRequests[0].full_name}</p>
          )}
        </div>
      </div>
      <div className="mt-auto border-t border-[rgba(0,0,0,0.12)] flex justify-around py-2 bg-white">
        <div className="flex flex-col items-center gap-0.5 text-[#00B14F]">
          <Home size={16} />
          <span className="text-[8px] font-bold">Home</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-[#999]">
          <TrendingUp size={16} />
          <span className="text-[8px]">Earnings</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-[#999]">
          <Star size={16} />
          <span className="text-[8px]">Ratings</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-[#999]">
          <User size={16} />
          <span className="text-[8px]">Account</span>
        </div>
      </div>
    </div>
  );

  const DriverRequest = () => {
    const currentReq = availableRequests[0] || activeBooking;
    if (!currentReq) return <DriverHome />;

    return (
      <div className="flex flex-col h-full">
        <MapArea role="driver" stage={1} />
        <div className="bg-white rounded-t-2xl border-t border-[rgba(0,0,0,0.12)] p-2 px-3 pb-3.5">
          <BottomSheetHandle />
          <div className="bg-[#E1F5EE] rounded-xl p-3 border border-[#5DCAA5] shadow-sm mb-2">
            <h3 className="text-[11px] font-bold text-[#085041] mb-2 uppercase tracking-wide">New booking request</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px]">
                <span className="text-[#0F6E56]">Passenger</span>
                <span className="font-bold text-[#111]">{currentReq.full_name} ★4.6</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-[#0F6E56]">Pickup</span>
                <span className="font-bold text-[#111] truncate max-w-[100px]">{currentReq.pickup_location}</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-[#0F6E56]">Drop-off</span>
                <span className="font-bold text-[#111] truncate max-w-[100px]">{currentReq.destination_location}</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-[#0F6E56]">Est. fare</span>
                <span className="font-bold text-[#00B14F]">₱{currentReq.total_amount}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleAccept(currentReq.id)} className="flex-1 bg-[#00B14F] text-white rounded-lg py-2 text-[10px] font-bold active:scale-[0.98]">Accept</button>
              <button onClick={() => setStage(0)} className="flex-1 bg-white border border-[#5DCAA5] text-[#0F6E56] rounded-lg py-2 text-[10px] font-bold active:scale-[0.98]">Decline</button>
            </div>
          </div>
          <p className="text-center text-[9px] text-[#999]">Auto-declines in <span className="font-bold text-[#111]">{countdown}s</span></p>
        </div>
      </div>
    );
  };

  const DriverOnTrip = () => (
    <div className="flex flex-col h-full">
      <MapArea role="driver" stage={2} />
      <div className="bg-white rounded-t-2xl border-t border-[rgba(0,0,0,0.12)] p-2 px-3 pb-3.5">
        <BottomSheetHandle />
        <div className="flex justify-between items-center mb-2 mt-1">
          <span className="text-[9px] font-bold text-[#00B14F]">Picked up</span>
          <span className="text-[9px] font-bold text-[#00B14F]">En route</span>
          <span className="text-[9px] text-[#999]">Drop off</span>
        </div>
        <div className="w-full h-1 bg-[#f5f5f5] rounded-full mb-3 overflow-hidden">
          <div className="w-[60%] h-full bg-[#00B14F]"></div>
        </div>

        <div className="bg-[#E1F5EE] rounded-lg p-2 flex justify-between items-center mb-2">
          <div>
            <p className="text-[9px] text-[#0F6E56] font-medium">ETA drop-off</p>
            <p className="text-lg font-bold text-[#085041]">8 min</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-[#1D9E75] font-bold">{tripData.route.dropoff}</p>
            <p className="text-[8px] text-[#1D9E75] uppercase">{tripData.route.distance} total</p>
          </div>
        </div>

        <div className="bg-[#f5f5f5] rounded-lg p-2.5 mb-2 border border-[rgba(0,0,0,0.05)]">
          <p className="text-[9px] text-[#999] font-bold uppercase mb-1">Navigation</p>
          <p className="text-[11px] font-bold text-[#111] mb-0.5">Heading to {activeBooking?.destination_location}</p>
          <p className="text-[9px] text-[#999]">Stay on current route for 2.4 km</p>
        </div>

        <div className="flex gap-1.5">
          {activeBooking?.transport_status !== 'picked_up' ? (
            <button 
              onClick={() => handleStatusUpdate(activeBooking.id, 'picked_up')}
              className="flex-1 bg-[#00B14F] text-white rounded py-2 text-[9px] font-bold"
            >
              Confirm Pick Up
            </button>
          ) : (
            <button 
              onClick={() => handleStatusUpdate(activeBooking.id, 'completed')}
              className="flex-1 bg-[#00B14F] text-white rounded py-2 text-[9px] font-bold"
            >
              Complete Trip
            </button>
          )}
          <button className="flex-1 bg-[#f5f5f5] border border-[rgba(0,0,0,0.12)] rounded py-2 text-[9px] font-bold text-[#666]">Call passenger</button>
        </div>
      </div>
    </div>
  );

  const DriverDone = () => (
    <div className="flex flex-col h-full p-2 px-3 pb-3.5 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center py-4 border-b border-[rgba(0,0,0,0.12)] mb-3 text-center">
        <div className="w-9 h-9 bg-[#FAEEDA] rounded-full flex items-center justify-center mb-2">
          <div className="w-5 h-5 bg-[#EF9F27] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>
          </div>
        </div>
        <h3 className="text-[14px] font-bold">Trip complete!</h3>
        <p className="text-[9px] text-[#999]">{tripData.time}</p>
      </div>

      <div className="text-center py-4 bg-[#E1F5EE]/30 rounded-xl mb-4 border border-[#E1F5EE]">
        <p className="text-3xl font-bold text-[#00B14F] tracking-tighter">₱{tripData.fare.net.toFixed(2)}</p>
        <p className="text-[9px] text-[#999] font-bold uppercase tracking-wider">your earnings for this trip</p>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 p-2 bg-[#f5f5f5] rounded-lg text-center">
          <p className="text-[9px] text-[#999] uppercase">distance</p>
          <p className="text-[12px] font-bold">12.4 km</p>
        </div>
        <div className="flex-1 p-2 bg-[#f5f5f5] rounded-lg text-center">
          <p className="text-[9px] text-[#999] uppercase">duration</p>
          <p className="text-[12px] font-bold">27 min</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-[10px] text-[#666]">
          <span>Gross fare</span>
          <span className="font-medium">₱{tripData.fare.gross.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-[#E24B4A]">
          <span>Platform fee (15%)</span>
          <span className="font-medium">−₱{tripData.fare.platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[13px] font-bold pt-2 border-t border-[rgba(0,0,0,0.12)] text-[#00B14F]">
          <span>Net earnings</span>
          <span>₱{tripData.fare.net.toFixed(2)}</span>
        </div>
      </div>

      <button onClick={() => setStage(0)} className="w-full bg-[#00B14F] text-white rounded-lg py-3 text-[11px] font-bold shadow-md active:scale-[0.98]">Find next ride</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4 bg-white min-h-screen font-['DM_Sans',_sans-serif]">
      {/* Stage Tab Bar */}
      <div className="flex items-center bg-[#f5f5f5] p-1 rounded-full border border-[rgba(0,0,0,0.12)]">
        {stages.map((s, i) => (
          <button 
            key={s.id} 
            onClick={() => setStage(i)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 ${stage === i ? 'bg-white text-[#111] shadow-sm border border-[rgba(0,0,0,0.05)]' : 'text-[#999] hover:text-[#666]'}`}
          >
            {s.labelDisplay || s.label}
          </button>
        ))}
      </div>

      {/* Dual Phone Row */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-3 items-center md:items-start justify-center w-full max-w-4xl">
        
        {/* Passenger Phone */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="px-3 py-1 bg-[#E1F5EE] border border-[#5DCAA5] rounded-full text-[10px] font-bold text-[#0F6E56] uppercase tracking-[0.1em]">Passenger</div>
          <div className="w-[200px] h-[400px] border-2 border-[rgba(0,0,0,0.15)] rounded-[28px] overflow-hidden bg-white shadow-xl relative flex flex-col">
            <PhoneStatusBar />
            <div className="flex-1 relative overflow-hidden">
              {stage === 0 && <PassengerHome />}
              {stage === 1 && <PassengerMatched />}
              {stage === 2 && <PassengerOnTrip />}
              {stage === 3 && <PassengerDone />}
            </div>
          </div>
        </div>

        {/* Connector Column */}
        <div className="hidden md:flex flex-col items-center gap-1 pt-16">
          <div className="w-[1px] h-6 bg-[rgba(0,0,0,0.12)]"></div>
          <div className="px-2 py-0.5 bg-[#f5f5f5] border border-[rgba(0,0,0,0.12)] rounded-full text-[9px] text-[#666] font-medium whitespace-nowrap">{stages[stage].connTop}</div>
          <div className="w-[1px] h-6 bg-[rgba(0,0,0,0.12)]"></div>
          <div className="px-2 py-0.5 bg-[#f5f5f5] border border-[rgba(0,0,0,0.12)] rounded-full text-[9px] text-[#666] font-medium whitespace-nowrap">{stages[stage].connBottom}</div>
        </div>

        {/* Driver Phone */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="px-3 py-1 bg-[#FAEEDA] border border-[#EF9F27] rounded-full text-[10px] font-bold text-[#633806] uppercase tracking-[0.1em]">Driver</div>
          <div className="w-[200px] h-[400px] border-2 border-[rgba(0,0,0,0.15)] rounded-[28px] overflow-hidden bg-white shadow-xl relative flex flex-col">
            <PhoneStatusBar />
            <div className="flex-1 relative overflow-hidden">
              {stage === 0 && <DriverHome />}
              {stage === 1 && <DriverRequest />}
              {stage === 2 && <DriverOnTrip />}
              {stage === 3 && <DriverDone />}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.4; }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        
        .force-circle {
          border-radius: 50% !important;
        }
      `}</style>
    </div>
  );
};

export default RideHailingWireframe;
