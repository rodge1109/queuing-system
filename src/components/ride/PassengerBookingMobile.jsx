import React, { useState, useEffect } from 'react';
import { 
  Menu, MapPin, Search, Navigation, 
  Car, Clock, ChevronRight, User, 
  ArrowLeft, Heart, History, Star,
  Compass, Shield, Phone, MessageSquare,
  CarFront, Bus, Check, Mail, RefreshCw, Play, X, Flag, Plus, Ticket, SlidersHorizontal, CreditCard
} from 'lucide-react';
import LiveTrackingMap from '../maps/LiveTrackingMap';
import PassengerTracking from './PassengerTracking';

const PassengerBookingMobile = () => {
  const [currentPos, setCurrentPos] = useState({ lat: 11.0500, lng: 124.0000 });
  const [pickup, setPickup] = useState("Suba Organic Ecofarm");
  const [destination, setDestination] = useState("");
  const [sheetState, setSheetState] = useState('medium');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [step, setStep] = useState('selection');
  const [destinationSelected, setDestinationSelected] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setCurrentPos({ lat: latitude, lng: longitude });
      // Reverse geocode placeholder – you can replace with a real API
      const placeholderAddress = `Current (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
      setPickup(placeholderAddress);
    });
  }; 


  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: ''
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, null, { enableHighAccuracy: true });
  }, []);

  const vehicles = [
    { id: '4-seater', name: '4-seater', capacity: 4, img: '/assets/images/services/green_car.png', price: '85.00', desc: 'Affordable fares' },
    { id: '6-seater', name: '6-seater', capacity: 6, img: '/assets/images/services/large_sedan.png', price: '120.00', desc: 'For large groups' },
    { id: 'taxi', name: 'Taxi', capacity: 4, img: '/assets/images/services/green_car.png', price: 'Varies', desc: 'Official city taxi' },
    { id: 'luxury', name: 'Luxury Van', capacity: 12, img: '/assets/images/services/van.png', price: '250.00', desc: 'Premium travel' }
  ];

  const recentDestinations = [
    { name: "Mactan-Cebu International Airport", code: "CEB", icon: History, lat: 10.3075, lng: 123.9794 },
    { name: "Ayala Center Cebu", code: "ACC", icon: History, lat: 10.3178, lng: 123.9051 },
    { name: "SM City Cebu", code: "SM", icon: History, lat: 10.3117, lng: 123.9183 },
    { name: "SM Seaside", code: "SMS", icon: History, lat: 10.2818, lng: 123.8821 }
  ];

  const handleConfirmBooking = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      alert("Please fill in all details");
      return;
    }

    setBookingLoading(true);
    try {
      const now = new Date();
      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        serviceType: selectedVehicle === 'luxury' ? 'Luxury Van' : 'Sedan (Economy)',
        preferredDate: now.toISOString().split('T')[0],
        preferredTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        pickupLocation: pickup,
        destinationLocation: destination,
        pickupLat: currentPos.lat,
        pickupLng: currentPos.lng,
        destLat: currentPos.lat + 0.05,
        destLng: currentPos.lng + 0.05,
        totalAmount: vehicles.find(v => v.id === selectedVehicle)?.price || 0,
        paymentMethod: 'cash',
        notes: `Mobile Booking - ${selectedVehicle}`
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setBookingResult(data.appointment.id);
        setStep('success');
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (e) {
      alert("Error connecting to server");
    } finally {
      setBookingLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight uppercase">Booking Confirmed!</h2>
        <p className="text-gray-500 font-medium mb-8">Your ride is being assigned to a driver. Reference ID: <span className="text-blue-600 font-medium">#{bookingResult}</span></p>
        <button 
          onClick={() => setStep('tracking')}
          className="w-full max-w-xs bg-gray-900 text-white py-4 rounded-2xl font-semibold uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Track My Ride
        </button>
      </div>
    );
  }

  if (step === 'tracking') {
    return <PassengerTracking appointmentId={bookingResult} onClose={() => { setStep('selection'); setDestinationSelected(false); }} />;
  }

  if (step === 'details') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 animate-in slide-in-from-right duration-500">
        <div className="flex items-center gap-4 mb-10 pt-6">
          <button onClick={() => setStep('selection')} className="p-2 hover:bg-gray-100 rounded-full transition-all"><ArrowLeft className="w-6 h-6 text-gray-900" /></button>
          <h2 className="text-xl font-semibold text-gray-900 uppercase tracking-tight italic">Passenger Details</h2>
        </div>

        <div className="space-y-6 flex-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-blue-500 transition-all">
              <User className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Juan Dela Cruz"
                className="bg-transparent border-none outline-none text-base font-medium text-gray-900 w-full placeholder:text-gray-300"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-2">Mobile Number</label>
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-blue-500 transition-all">
              <Phone className="w-5 h-5 text-gray-400" />
              <input 
                type="tel" 
                placeholder="+63 912 345 6789"
                className="bg-transparent border-none outline-none text-base font-medium text-gray-900 w-full placeholder:text-gray-300"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-blue-500 transition-all">
              <Mail className="w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="juan@example.com"
                className="bg-transparent border-none outline-none text-base font-medium text-gray-900 w-full placeholder:text-gray-300"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Estimated Fare</p>
              <p className="text-xl font-semibold text-blue-600">PHP {vehicles.find(v => v.id === selectedVehicle)?.price}</p>
            </div>
            <p className="text-[10px] font-medium text-gray-400 leading-relaxed uppercase tracking-tighter">Fare includes base rate and platform fees. Final amount may vary based on actual distance.</p>
          </div>
        </div>

        <button 
          onClick={handleConfirmBooking}
          disabled={bookingLoading}
          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-semibold uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all mt-8 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {bookingLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : 'Complete My Booking'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white font-sans text-gray-900">
      {/* 1. Full Screen Background Map */}
      <div className="fixed inset-0 z-0">
        <LiveTrackingMap 
          riderPos={currentPos} 
          status={destinationSelected ? "tracking" : "booking"}
        />
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      </div>

      {/* 2. Floating Header Area (MATCHES PHOTO) */}
      {!destinationSelected ? (
        <div className="relative z-10 p-4 pt-12 flex flex-col gap-4 pointer-events-none">
          <div className="flex justify-between items-start">
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto active:scale-95 transition-all">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Pickup Card */}
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-[280px] self-center pointer-events-auto border border-white/20 animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">Pickup point</p>
              <p className="text-sm font-medium text-gray-900 truncate">{pickup}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button onClick={handleUseCurrentLocation} className="text-xs text-[#00B14F] hover:underline">Use current location</button>
              <button onClick={() => setShowMapPicker(true)} className="text-xs text-[#00B14F] hover:underline">Pick on map</button>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
          {showMapPicker && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
                <h3 className="text-lg font-bold mb-4">Select Pickup Location</h3>
                <p className="text-sm text-gray-600 mb-4">Tap the map to set your pickup point (placeholder).</p>
                {/* Placeholder map – replace with a real map component if desired */}
                <div className="h-64 bg-gray-100 flex items-center justify-center mb-4">
                  <span className="text-gray-500">Map component goes here</span>
                </div>
                <button onClick={() => setShowMapPicker(false)} className="w-full py-2 bg-[#00B14F] text-white rounded-lg">Close</button>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="relative z-10 p-4 pt-12 flex flex-col gap-4 pointer-events-none">
          {/* Route Summary Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 space-y-4 pointer-events-auto animate-in slide-in-from-top-10 duration-500 border border-gray-100">
            {/* Pickup Row */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-900" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{pickup}</p>
                <p className="text-[10px] font-medium text-gray-400 uppercase">Entrance</p>
              </div>
            </div>
            {/* Divider Line */}
            <div className="absolute left-[34px] top-[60px] w-[2px] h-[30px] bg-gray-100" />
            {/* Destination Row */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center">
                <Flag className="w-4 h-4 text-gray-900" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{destination}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">~3 hr, 13 min</p>
                </div>
              </div>
              <button className="p-2 bg-gray-50 rounded-lg">
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Floating Back Button */}
          <button 
            onClick={() => setDestinationSelected(false)}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto active:scale-95 transition-all mt-4"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      )}

      {/* 3. Floating Action Buttons (Right Side) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all text-gray-600">
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* 4. The Interactive Bottom Sheet */}
      {!destinationSelected ? (
        <div 
          className={`fixed left-0 right-0 bottom-0 z-30 transition-all duration-500 ease-in-out ${
            sheetState === 'minimized' ? 'translate-y-[calc(100%-80px)]' : 
            sheetState === 'medium' ? 'translate-y-[calc(100%-290px)]' : 'translate-y-0'
          }`}
        >
          {/* Handle & Vehicle Tray (HORIZONTAL) */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-t-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-white/40 p-4">
            <div 
              className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 cursor-pointer"
              onClick={() => setSheetState(sheetState === 'expanded' ? 'medium' : 'expanded')}
            />
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-2">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`flex flex-col items-center gap-1 p-3 min-w-[150px] rounded-2xl transition-all duration-300 ${
                    selectedVehicle === v.id 
                      ? 'bg-gray-100 text-gray-900 scale-105' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <div className="relative w-[150px] h-20 flex items-center justify-center">
                    <img 
                      src={v.img} 
                      alt={v.name}
                      className={`w-full h-full object-contain ${selectedVehicle === v.id ? 'brightness-100' : 'mix-blend-multiply opacity-80'}`} 
                    />
                  </div>
                  <div className="text-center">
                    <p className={`text-[11px] font-bold leading-none mb-1 uppercase tracking-tighter text-gray-900`}>{v.name}</p>
                    <div className="flex items-center justify-center gap-1">
                      <User className="w-2.5 h-2.5 text-gray-400" />
                      <span className="text-[10px] font-medium text-gray-400">{v.capacity}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Input Area */}
          <div className="bg-white h-[80vh] px-6 pt-1 pb-20 border-t border-gray-50">
            <div 
              className="bg-gray-100 rounded-2xl p-4 flex items-center gap-4 mb-8 shadow-inner border border-gray-200/50 cursor-pointer active:scale-[0.98] transition-all"
              onClick={() => setIsSearching(true)}
            >
              <Search className="w-5 h-5 text-gray-400" />
              <div className="text-base font-medium text-gray-400">Where to & for how...</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed left-0 right-0 bottom-0 z-30 animate-in slide-in-from-bottom-20 duration-500">
          <div className="bg-white/95 backdrop-blur-2xl rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-white/40 p-6">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

            {/* Promo Bar */}
            <button className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center justify-between mb-6 active:scale-95 transition-all">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 italic">Got promo code? Use it here</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>

            {/* Vertical Vehicle List (MATCHES PHOTO) */}
            <div className="space-y-3 mb-8">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 ${
                    selectedVehicle === v.id 
                      ? 'bg-gray-100 text-gray-900 shadow-sm' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <div className="w-[150px] h-24 flex items-center justify-center overflow-hidden">
                    <img 
                      src={v.img} 
                      alt={v.name}
                      className={`w-[140px] h-20 object-contain ${selectedVehicle === v.id ? 'brightness-100' : 'mix-blend-multiply opacity-80'}`} 
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-gray-900">{v.name}</span>
                      <div className={`w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center`}>
                        <span className="text-[8px] font-bold text-gray-400">i</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-[11px] font-medium text-gray-400">{v.capacity}</span>
                    </div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tighter italic">{v.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tracking-tight text-gray-900">₱{v.price}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Final Action Bar (MATCHES PHOTO) */}
            <div className="flex items-center gap-4">
              <button className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-all">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
              </button>
              
              <button 
                onClick={() => setStep('details')}
                className="flex-1 bg-[#CCFF00] text-gray-900 h-14 rounded-2xl font-semibold text-lg flex items-center justify-center shadow-xl shadow-lime-100 active:scale-95 transition-all"
              >
                Find a driver
              </button>

              <button className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-all">
                <SlidersHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Full Screen Search Overlay */}
      {isSearching && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
          <div className="flex items-center justify-between p-6 pt-12">
            <div className="w-10 h-10" /> 
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Enter your route</h2>
            <button onClick={() => setIsSearching(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center active:scale-90 transition-all">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 opacity-80 border border-gray-100">
              <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">From</p>
                <p className="text-sm font-medium text-gray-600 truncate">{pickup}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-1 flex items-center gap-1 border-2 border-gray-900 shadow-sm focus-within:ring-2 focus-within:ring-gray-100 transition-all">
              <div className="p-3">
                <Search className="w-5 h-5 text-gray-900" />
              </div>
              <div className="flex-1 py-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">To</p>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Enter destination"
                  className="bg-transparent border-none outline-none text-base font-medium text-gray-900 w-full"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              {destination && (
                <button onClick={() => setDestination('')} className="p-3">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <div className="w-[1px] h-8 bg-gray-100 mx-1" />
              <button className="p-3">
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-500" />
                </div>
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="px-5 py-2.5 bg-gray-100 rounded-xl text-[11px] font-semibold text-gray-900 active:scale-95 transition-all">Suggested</button>
              <button className="px-5 py-2.5 bg-gray-50 rounded-xl text-[11px] font-semibold text-gray-400 active:scale-95 transition-all">Saved</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2">
            {!destination ? (
              <div className="space-y-6">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1">Recent Places</h4>
                <div className="grid gap-2">
                  {recentDestinations.map((dest, idx) => (
                    <button 
                      key={idx}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group"
                      onClick={() => {
                        setDestination(dest.name);
                        setIsSearching(false);
                        setDestinationSelected(true);
                      }}
                    >
                      <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-50 rounded-full flex items-center justify-center transition-colors">
                        <History className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{dest.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{dest.code}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-blue-200" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 py-20 grayscale">
                <Search className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-sm font-medium text-gray-400 uppercase tracking-widest italic">No results found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerBookingMobile;
