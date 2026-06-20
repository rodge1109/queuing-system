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
import TransportMap from '../maps/TransportMap';

const LucideIcons = { 
  Menu, MapPin, Search, Navigation, 
  Car, Clock, ChevronRight, User, 
  ArrowLeft, Heart, History, Star,
  Compass, Shield, Phone, MessageSquare,
  CarFront, Bus, Check, Mail, RefreshCw, Play, X, Flag, Plus, Ticket, SlidersHorizontal, CreditCard
};


const PassengerBookingMobile = () => {
  const [currentPos, setCurrentPos] = useState({ lat: 11.0500, lng: 124.0000 });
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [destPos, setDestPos] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [sheetState, setSheetState] = useState('medium');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [step, setStep] = useState('selection');
  const [destinationSelected, setDestinationSelected] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isMapSearching, setIsMapSearching] = useState(false);
  const [mapAction, setMapAction] = useState(null);

  useEffect(() => {
    const savedBookingId = localStorage.getItem('active_booking_id');
    if (savedBookingId) {
      fetch(`/api/appointments/${savedBookingId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.appointment) {
            const status = data.appointment.transport_status || data.appointment.status;
            if (!['completed', 'cancelled'].includes(status)) {
              setBookingResult(savedBookingId);
              setStep('tracking');
            } else {
              localStorage.removeItem('active_booking_id');
            }
          } else {
            localStorage.removeItem('active_booking_id');
          }
        })
        .catch(err => console.error(err));
    }
  }, []);

  const handleUseCurrentLocation = () => {
    console.log('Use current location clicked');
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    const reverseGeocode = async (lat, lng, fallbackName) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        const addressName = data.display_name ? data.display_name.split(',').slice(0, 2).join(',') : fallbackName;
        setPickup(addressName);
        setMapAction({ type: 'pickup', coords: { lat, lng }, address: addressName });
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        setPickup(fallbackName);
        setMapAction({ type: 'pickup', coords: { lat, lng }, address: fallbackName });
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        setPickup("Locating...");
        reverseGeocode(latitude, longitude, `Current (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
      },
      (err) => {
        console.error("Error getting location:", err);
        alert(`GPS Error: ${err.message}. Ensure location services are enabled and you are using HTTPS.`);
        // Fallback to a realistic location without [Mock]
        const fallbackLat = 11.0503;
        const fallbackLng = 124.0049;
        setCurrentPos({ lat: fallbackLat, lng: fallbackLng });
        setPickup("Bogo City Hall, Cebu");
        setMapAction({ type: 'pickup', coords: { lat: fallbackLat, lng: fallbackLng }, address: "Bogo City Hall, Cebu" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Auto‑fetch current location when the component mounts
  useEffect(() => {
    handleUseCurrentLocation();
  }, []);



  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    paymentMethod: 'Cash',
    corporateAccountId: ''
  });
  const [corporateValid, setCorporateValid] = useState(null); // null, 'loading', 'valid', 'invalid'

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, null, { enableHighAccuracy: true });
  }, []);

  const [vehicles, setVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [predefinedRoutes, setPredefinedRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const getCalculatedPrice = (vId) => {
    const v = vehicles.find(v => v.id === vId);
    if (!v) return '0.00';

    if (selectedRoute && selectedRoute.prices) {
      const matched = selectedRoute.prices.find(p => {
        return p.service_type.toLowerCase() === v.name.toLowerCase() ||
               v.name.toLowerCase().includes(p.service_type.toLowerCase()) ||
               p.service_type.toLowerCase().includes(v.name.toLowerCase());
      });
      if (matched) {
        return parseFloat(matched.price).toFixed(2);
      }
    }

    const base = parseFloat(v.base_fare || v.price || 0);
    const perKm = parseFloat(v.per_km_rate || 0);
    const dist = distanceKm > 0 ? distanceKm : 1;
    const total = base + (dist * perKm);
    return total.toFixed(2);
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch('/api/predefined-routes');
        const data = await res.json();
        if (data.success && Array.isArray(data.routes)) {
          setPredefinedRoutes(data.routes);
        }
      } catch (err) {
        console.error('Failed to fetch predefined routes:', err);
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('/api/booking-services');
        const data = await res.json();
        if (data.success) {
          const transportServices = data.services.filter(s => (s.category || '').trim().toUpperCase() === 'TRANSPORT');
          const mappedVehicles = transportServices.map(s => {
            const isVan = s.name.toLowerCase().includes('van');
            const isMotorcycle = s.name.toLowerCase().includes('motor');
            
            let vehicleImg = '/assets/images/services/green_car.png';
            let isLucideIcon = false;
            let isEmojiIcon = null;

            if (s.icon) {
              if (s.icon.startsWith('http') || s.icon.startsWith('/uploads') || s.icon.startsWith('/assets')) {
                vehicleImg = s.icon;
              } else if (LucideIcons[s.icon]) {
                isLucideIcon = true;
              } else {
                isEmojiIcon = s.icon;
              }
            } else if (isVan) {
              vehicleImg = '/assets/images/services/van.png';
            }

            return {
              id: s.id.toString(),
              name: s.name,
              capacity: isVan ? 12 : isMotorcycle ? 1 : 4,
              img: vehicleImg,
              price: s.base_fare || s.price || '0.00',
              base_fare: parseFloat(s.base_fare || s.price || 0),
              per_km_rate: parseFloat(s.per_km_rate || 0),
              desc: s.duration || 'Standard travel',
              isEmojiIcon,
              isLucideIcon,
              iconName: s.icon
            };
          });
          setVehicles(mappedVehicles);
          if (mappedVehicles.length > 0) {
            setSelectedVehicle(mappedVehicles[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
        // Fallback
        setVehicles([
          { id: '4-seater', name: '4-seater', capacity: 4, img: '/assets/images/services/green_car.png', price: '85.00', desc: 'Affordable fares' }
        ]);
      } finally {
        setIsLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  const recentDestinations = [
    { name: "Mactan-Cebu International Airport", code: "CEB", icon: History, lat: 10.3075, lng: 123.9794 },
    { name: "Ayala Center Cebu", code: "ACC", icon: History, lat: 10.3178, lng: 123.9051 },
    { name: "SM City Cebu", code: "SM", icon: History, lat: 10.3117, lng: 123.9183 },
    { name: "SM Seaside", code: "SMS", icon: History, lat: 10.2818, lng: 123.8821 }
  ];

  const allPlaces = [
    ...recentDestinations,
    { name: "Cebu IT Park", code: "ITP", icon: MapPin, lat: 10.3294, lng: 123.9056 },
    { name: "Magellan's Cross", code: "MC", icon: MapPin, lat: 10.2936, lng: 123.9019 },
    { name: "Fuente Osmeña Circle", code: "FOC", icon: MapPin, lat: 10.3115, lng: 123.8966 },
    { name: "Bogo City Hall", code: "BCH", icon: MapPin, lat: 11.0503, lng: 124.0049 },
    { name: "Mandaue City", code: "MAN", icon: MapPin, lat: 10.3340, lng: 123.9350 }
  ];

  useEffect(() => {
    if (!destination || destination.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const term = destination.toLowerCase();
    const staticFiltered = allPlaces.filter(d => d.name.toLowerCase().includes(term));
    
    if (destination.trim().length < 3) {
      setSearchResults(staticFiltered);
      return;
    }

    setSearchResults(staticFiltered);
    setIsMapSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=5&addressdetails=1`);
        const data = await res.json();
        
        const dynamicResults = data.map(item => ({
          name: item.display_name.split(',')[0],
          code: item.display_name,
          icon: MapPin,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        
        const combined = [...staticFiltered];
        dynamicResults.forEach(dyn => {
          if (!combined.find(s => s.name === dyn.name)) {
            combined.push(dyn);
          }
        });
        
        setSearchResults(combined);
      } catch (err) {
        console.error("Map search error:", err);
      } finally {
        setIsMapSearching(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [destination]);



  const handleConfirmBooking = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      alert("Please fill in all details");
      return;
    }

    if (formData.paymentMethod === 'Corporate' && corporateValid !== 'valid') {
      alert("Please enter and validate a valid Corporate Account Code.");
      return;
    }

    setBookingLoading(true);
    try {
      const now = new Date();
      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        serviceType: vehicles.find(v => v.id === selectedVehicle)?.name || 'Sedan (Economy)',
        preferredDate: now.toISOString().split('T')[0],
        preferredTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        pickupLocation: pickup,
        destinationLocation: destination,
        pickupLat: currentPos.lat,
        pickupLng: currentPos.lng,
        destLat: destPos ? destPos.lat : currentPos.lat + 0.05,
        destLng: destPos ? destPos.lng : currentPos.lng + 0.05,
        totalAmount: getCalculatedPrice(selectedVehicle),
        paymentMethod: formData.paymentMethod,
        routeId: selectedRoute?.id || null,
        distanceKm: distanceKm || 0,
        notes: `Mobile Booking - ${vehicles.find(v => v.id === selectedVehicle)?.name || selectedVehicle}${formData.paymentMethod === 'Corporate' ? ' [Corp: ' + formData.corporateAccountId + ']' : ''}`
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('active_booking_id', data.appointment.id);
        setBookingResult(data.appointment.id);
        setStep('tracking');
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (e) {
      alert("Error connecting to server");
    } finally {
      setBookingLoading(false);
    }
  };



  if (step === 'tracking') {
    return <PassengerTracking appointmentId={bookingResult} onClose={() => { 
      localStorage.removeItem('active_booking_id');
      setStep('selection'); 
      setDestinationSelected(false); 
    }} />;
  }

  if (step === 'details') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 animate-in slide-in-from-right duration-500">
        <div className="flex items-center gap-4 mb-10 pt-6">
          <button onClick={() => setStep('selection')} className="p-2 hover:bg-gray-100 rounded-full transition-all"><ArrowLeft className="w-6 h-6 text-gray-900" /></button>
          <h2 className="text-xl font-semibold text-gray-900 uppercase tracking-tight">Passenger Details</h2>
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

          <div className="space-y-1.5 pt-4 border-t border-gray-100">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setFormData({...formData, paymentMethod: 'Cash', corporateAccountId: ''}); setCorporateValid(null); }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'Cash' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.paymentMethod === 'Cash' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${formData.paymentMethod === 'Cash' ? 'text-blue-700' : 'text-gray-500'}`}>Cash</span>
              </button>
              <button 
                onClick={() => setFormData({...formData, paymentMethod: 'Corporate'})}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'Corporate' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.paymentMethod === 'Corporate' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${formData.paymentMethod === 'Corporate' ? 'text-blue-700' : 'text-gray-500'}`}>Corporate</span>
              </button>
            </div>
          </div>

          {formData.paymentMethod === 'Corporate' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-2">Corporate Account Code</label>
              <div className={`bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border transition-all ${
                corporateValid === 'valid' ? 'border-green-500' : corporateValid === 'invalid' ? 'border-red-500' : 'border-gray-100 focus-within:border-blue-500'
              }`}>
                <Shield className={`w-5 h-5 ${corporateValid === 'valid' ? 'text-green-500' : corporateValid === 'invalid' ? 'text-red-500' : 'text-gray-400'}`} />
                <input 
                  type="text" 
                  placeholder="e.g. CORP-1001"
                  className="bg-transparent border-none outline-none text-base font-medium text-gray-900 w-full placeholder:text-gray-300 uppercase"
                  value={formData.corporateAccountId}
                  onChange={(e) => {
                    setFormData({...formData, corporateAccountId: e.target.value.toUpperCase()});
                    setCorporateValid(null);
                  }}
                />
                <button
                  onClick={async () => {
                    if (!formData.corporateAccountId) return;
                    setCorporateValid('loading');
                    try {
                      const res = await fetch(`/api/corporate-accounts/validate/${formData.corporateAccountId}`);
                      const data = await res.json();
                      if (data.valid) {
                        setCorporateValid('valid');
                      } else {
                        setCorporateValid('invalid');
                        alert(data.message || 'Invalid Account Code');
                      }
                    } catch (err) {
                      setCorporateValid('invalid');
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg active:scale-95"
                >
                  {corporateValid === 'loading' ? 'Checking...' : 'Validate'}
                </button>
              </div>
              {corporateValid === 'valid' && (
                <p className="text-xs text-green-600 font-medium ml-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Valid corporate account.
                </p>
              )}
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Estimated Fare</p>
              <p className="text-xl font-semibold text-blue-600">PHP {getCalculatedPrice(selectedVehicle)}</p>
            </div>
            <p className="text-[10px] font-medium text-gray-400 leading-relaxed uppercase tracking-tighter">Fare includes base rate and platform fees. Final amount may vary based on actual distance.</p>
          </div>
        </div>

        <button 
          onClick={handleConfirmBooking}
          disabled={bookingLoading}
          className="w-full bg-[#00B14F] hover:bg-[#009241] text-white py-5 rounded-2xl font-semibold uppercase tracking-widest active:scale-95 transition-all mt-8 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {bookingLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : 'Complete My Booking'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white font-sans text-gray-900">
      {/* 1. Full Screen Interactive Background Map */}
      <div className="fixed inset-0 z-0">
        <TransportMap 
          className="w-full h-full"
          mapAction={mapAction}
          onLocationSelect={(pick, dest, dist) => {
            if (pick && pick.address && (!mapAction || mapAction.type === 'pickup')) {
              setPickup(pick.address);
              setCurrentPos({ lat: pick.coords.lat, lng: pick.coords.lng });
            }
            if (dest && dest.address && (!mapAction || mapAction.type === 'dest')) {
              setDestination(dest.address);
              if (dest.coords) setDestPos({ lat: dest.coords.lat, lng: dest.coords.lng });
            }
            if (dist !== undefined && dist !== null) {
              setDistanceKm(dist);
            }
          }}
        />
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      </div>

      {/* Floating Confirm Button when picking on map */}
      {sheetState === 'minimized' && !destinationSelected && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 animate-in slide-in-from-bottom-10">
          <button 
            onClick={() => {
              setSheetState('medium');
              if (mapAction?.type === 'dest' && destination) {
                setDestinationSelected(true);
              }
            }}
            className="px-6 py-3 bg-[#00B14F] text-white rounded-full font-bold shadow-lg shadow-green-200 flex items-center gap-2 active:scale-95 transition-all pointer-events-auto"
          >
            <Check className="w-5 h-5" /> Confirm Location
          </button>
        </div>
      )}

      {/* 2. Floating Header Area (MATCHES PHOTO) */}
      {!destinationSelected ? (
        <div className="relative z-10 p-4 pt-12 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto active:scale-95 transition-all">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Pickup Card */}
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 w-full self-center pointer-events-auto border border-white/20 animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">Pickup point</p>
              <p className="text-sm font-medium text-gray-900 truncate leading-tight">{pickup}</p>
            </div>
            <div className="flex flex-col gap-2 items-start shrink-0">
              <button onClick={handleUseCurrentLocation} className="text-xs text-[#00B14F] hover:underline pointer-events-auto text-left">Use current location</button>
              <button onClick={() => {
                setMapAction({ type: 'pickup', address: pickup, coords: currentPos });
                setSheetState('minimized');
              }} className="text-xs text-[#00B14F] hover:underline pointer-events-auto">Pick on map</button>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
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
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">{pickup}</p>
                <p className="text-[10px] font-medium text-gray-400 uppercase mt-0.5">Entrance</p>
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
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">{destination}</p>
                <div className="flex items-center gap-2 mt-0.5">
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
            onClick={() => { setDestinationSelected(false); setSheetState('medium'); }}
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
              onClick={() => setSheetState(sheetState === 'minimized' ? 'medium' : 'minimized')}
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
                    {v.isLucideIcon ? (
                      (() => {
                        const IconComponent = LucideIcons[v.iconName];
                        return <IconComponent className={`w-14 h-14 ${selectedVehicle === v.id ? 'text-[#00B14F]' : 'text-gray-400'}`} />;
                      })()
                    ) : v.isEmojiIcon ? (
                      <span className="text-4xl">{v.isEmojiIcon}</span>
                    ) : (
                      <img 
                        src={v.img} 
                        alt={v.name}
                        className={`w-full h-full object-contain ${selectedVehicle === v.id ? 'brightness-100' : 'mix-blend-multiply opacity-80'}`} 
                      />
                    )}
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
        <div 
          className={`fixed left-0 right-0 bottom-0 z-30 transition-all duration-500 ease-in-out ${
            sheetState === 'minimized' ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-2xl rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-white/40 p-6 pt-4 h-[50vh] flex flex-col">
            <div 
              className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 cursor-pointer hover:bg-gray-300 active:bg-gray-400 transition-colors shrink-0" 
              onClick={() => setSheetState(sheetState === 'minimized' ? 'expanded' : 'minimized')}
            />

            {/* Promo Bar */}
            <button className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center justify-between mb-4 active:scale-95 transition-all shrink-0">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 italic">Got promo code? Use it here</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>

            {/* Vertical Vehicle List (MATCHES PHOTO) */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-hide">
              {isLoadingVehicles ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : vehicles.map((v) => (
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
                    {v.isLucideIcon ? (
                      (() => {
                        const IconComponent = LucideIcons[v.iconName];
                        return <IconComponent className={`w-16 h-16 ${selectedVehicle === v.id ? 'text-[#00B14F]' : 'text-gray-400'}`} />;
                      })()
                    ) : v.isEmojiIcon ? (
                      <span className="text-5xl">{v.isEmojiIcon}</span>
                    ) : (
                      <img 
                        src={v.img} 
                        alt={v.name}
                        className={`w-[140px] h-20 object-contain ${selectedVehicle === v.id ? 'brightness-100' : 'mix-blend-multiply opacity-80'}`} 
                      />
                    )}
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
                    <p className="text-lg font-semibold tracking-tight text-gray-900">
                      {String(getCalculatedPrice(v.id)).includes('₱') || String(getCalculatedPrice(v.id)).includes('PHP') ? getCalculatedPrice(v.id) : `₱${getCalculatedPrice(v.id)}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Final Action Bar (MATCHES PHOTO) */}
            <div className="flex items-center gap-4 shrink-0 pb-2">
              <button className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-all">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
              </button>
              
              <button 
                onClick={() => setStep('details')}
                className="flex-1 bg-[#00B14F] hover:bg-[#009241] text-white h-14 rounded-2xl font-semibold text-lg flex items-center justify-center active:scale-95 transition-all"
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
              <button className="p-3" onClick={() => {
                setMapAction({ type: 'dest', address: destination || 'Cebu City', coords: currentPos });
                setIsSearching(false);
                setSheetState('minimized');
              }}>
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
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
                {predefinedRoutes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#00B14F] px-1 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5" /> Popular Fixed-Rate Routes
                    </h4>
                    <div className="grid gap-2">
                      {predefinedRoutes.map((route) => (
                        <button 
                          key={route.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 hover:bg-[#E1F5EE] hover:border-[#00B14F]/20 rounded-2xl transition-all group text-left w-full shadow-sm"
                          onClick={() => {
                            setPickup(route.pickup_name);
                            setDestination(route.destination_name);
                            setCurrentPos({ lat: parseFloat(route.pickup_lat), lng: parseFloat(route.pickup_lng) });
                            setDestPos({ lat: parseFloat(route.destination_lat), lng: parseFloat(route.destination_lng) });
                            setSelectedRoute(route);
                            setIsSearching(false);
                            setDestinationSelected(true);
                            setMapAction({
                              type: 'route',
                              pickup: { coords: { lat: parseFloat(route.pickup_lat), lng: parseFloat(route.pickup_lng) }, address: route.pickup_name },
                              dest: { coords: { lat: parseFloat(route.destination_lat), lng: parseFloat(route.destination_lng) }, address: route.destination_name }
                            });
                          }}
                        >
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 transition-colors">
                            <Navigation className="w-5 h-5 text-[#00B14F]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#00B14F] transition-colors truncate">{route.route_name}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {route.prices.map((p, pIdx) => (
                                <span key={pIdx} className="inline-block text-[9px] font-bold bg-white text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded">
                                  {p.service_type}: ₱{parseFloat(p.price).toLocaleString()}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#00B14F] flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1">Recent Places</h4>
                <div className="grid gap-2">
                  {recentDestinations.map((dest, idx) => (
                    <button 
                      key={idx}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group"
                      onClick={() => {
                        setDestination(dest.name);
                        setMapAction({ type: 'dest', address: dest.name, coords: { lat: dest.lat, lng: dest.lng } });
                        setIsSearching(false);
                        setDestinationSelected(true);
                        setSelectedRoute(null);
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
            ) : searchResults.length > 0 ? (
              <div className="space-y-6">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1">Suggested Matches</h4>
                <div className="grid gap-2">
                  {searchResults.map((dest, idx) => {
                    const IconComponent = dest.icon || MapPin;
                    return (
                      <button 
                        key={idx}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group"
                        onClick={() => {
                          setDestination(dest.name);
                          setMapAction({ type: 'dest', address: dest.name, coords: { lat: dest.lat, lng: dest.lng } });
                          setIsSearching(false);
                          setDestinationSelected(true);
                          setSelectedRoute(null);
                        }}
                      >
                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-[#E1F5EE] rounded-full flex items-center justify-center transition-colors flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-[#00B14F]" />
                        </div>
                        <div className="text-left flex-1 overflow-hidden">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-[#00B14F] transition-colors truncate">{dest.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium tracking-wide truncate w-full">{dest.code}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-green-200 flex-shrink-0" />
                      </button>
                    );
                  })}
                  {isMapSearching && (
                    <div className="flex justify-center p-4">
                      <div className="w-5 h-5 border-2 border-[#00B14F] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 py-20 grayscale">
                <Search className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-sm font-medium text-gray-400 uppercase tracking-widest italic">No results found</p>
                <button 
                  onClick={() => { 
                    setIsSearching(false); 
                    setDestinationSelected(true);
                    setMapAction({ type: 'dest', address: destination, coords: currentPos });
                    setSelectedRoute(null);
                  }}
                  className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-full text-xs font-bold"
                >
                  Use "{destination}" anyway
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerBookingMobile;
