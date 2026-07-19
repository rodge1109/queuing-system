import React, { useState, useEffect } from 'react';
import { 
  Menu, MapPin, Search, Navigation, 
  Car, Clock, ChevronRight, User, 
  ArrowLeft, Heart, History, Star,
  Compass, Shield, Phone, MessageSquare,
  CarFront, Bus, Check, Mail, RefreshCw, Play, X, Flag, Plus, Ticket, SlidersHorizontal, CreditCard,
  Lock, Eye, EyeOff, ClipboardList, Briefcase, Smartphone, Wallet, Banknote, Camera
} from 'lucide-react';
import LiveTrackingMap from '../maps/LiveTrackingMap';
import PassengerTracking from './PassengerTracking';
import TransportMap from '../maps/TransportMap';

const LucideIcons = { 
  Menu, MapPin, Search, Navigation, 
  Car, Clock, ChevronRight, User, 
  ArrowLeft, Heart, History, Star,
  Compass, Shield, Phone, MessageSquare,
  CarFront, Bus, Check, Mail, RefreshCw, Play, X, Flag, Plus, Ticket, SlidersHorizontal, CreditCard, ClipboardList
};


const PassengerBookingMobile = ({ setCurrentPage }) => {
  const [currentPos, setCurrentPos] = useState({ lat: 11.0500, lng: 124.0000 });
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [destPos, setDestPos] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [sheetState, setSheetState] = useState('medium');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [step, setStep] = useState('welcome');
  const [selectedRole, setSelectedRole] = useState('passenger');
  const [destinationSelected, setDestinationSelected] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isMapSearching, setIsMapSearching] = useState(false);
  const [mapAction, setMapAction] = useState(null);

  const [passenger, setPassenger] = useState(() => {
    const saved = localStorage.getItem('passenger_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    phoneNumber: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Liveness Check State
  const [livenessStage, setLivenessStage] = useState(0);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const streamRef = React.useRef(null);

  const [driverForm, setDriverForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    vehicleModel: '',
    plateNumber: '',
    licenseNumber: ''
  });
  const [showDriverPassword, setShowDriverPassword] = useState(false);

  const [operatorForm, setOperatorForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  const [showOperatorPassword, setShowOperatorPassword] = useState(false);

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

  // Liveness Check Side Effects
  useEffect(() => {
    if (step === 'liveness-check') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
          .then(stream => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
            }
          })
          .catch(err => {
            console.error(err);
            alert("Camera access is required for verification");
            setStep('passenger-signup');
          });
      }
      
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [step]);

  useEffect(() => {
    let timer;
    if (step === 'liveness-check') {
      if (livenessStage === 0) {
        timer = setTimeout(() => setLivenessStage(1), 3000);
      } else if (livenessStage === 1) {
        timer = setTimeout(() => setLivenessStage(2), 3000);
      } else if (livenessStage === 2) {
        timer = setTimeout(() => setLivenessStage(3), 3000);
      }
    }
    return () => clearTimeout(timer);
  }, [livenessStage, step]);

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
    fullName: passenger ? passenger.full_name : '',
    phoneNumber: passenger ? passenger.phone_number : '',
    email: passenger ? passenger.email || '' : '',
    paymentMethod: 'Cash',
    corporateAccountId: '',
    driverInstructions: ''
  });
  const [corporateValid, setCorporateValid] = useState(null); // null, 'loading', 'valid', 'invalid'

  useEffect(() => {
    if (passenger) {
      setFormData(prev => ({
        ...prev,
        fullName: passenger.full_name || prev.fullName,
        phoneNumber: passenger.phone_number || prev.phoneNumber,
        email: passenger.email || prev.email
      }));
    }
  }, [passenger]);

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
          const transportServices = data.services;
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
        notes: `Mobile Booking - ${vehicles.find(v => v.id === selectedVehicle)?.name || selectedVehicle}${formData.paymentMethod === 'Corporate' ? ' [Corp: ' + formData.corporateAccountId + ']' : ''}${formData.driverInstructions ? ' | Instruction: ' + formData.driverInstructions : ''}`
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



  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#00B14F] flex flex-col justify-between items-center p-6 text-white text-center font-['DM_Sans',_sans-serif] animate-fadeIn">
        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center -translate-y-8 w-full">
          {/* Byahero Logo wrapper */}
          <div className="mb-6 w-[45%] max-w-[180px] aspect-square mx-auto flex items-center justify-center translate-y-[30px]">
            <img 
              src="/uploads/byahero2.png" 
              alt="Byahero Logo" 
              className="w-full h-full object-contain mx-auto" 
            />
          </div>

          <p className="text-white/90 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
            Your safe, affordable ride — anywhere, anytime.
          </p>
        </div>

        {/* Bottom content */}
        <div className="w-full max-w-xs flex flex-col items-center gap-4 pb-8 animate-in slide-in-from-bottom duration-500">
          <button 
            onClick={() => setStep('role-select')}
            className="w-full bg-white text-[#00B14F] hover:bg-gray-50 py-[18px] rounded-2xl font-bold text-base shadow-lg shadow-black/10 active:scale-95 transition-all"
          >
            Get Started
          </button>

          {setCurrentPage && (
            <button 
              onClick={() => setCurrentPage('home')}
              className="text-white/80 hover:text-white hover:underline text-xs font-medium cursor-pointer bg-transparent border-none outline-none mt-2"
            >
              Already have an account? Choose your role below.
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'role-select') {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between p-6 font-['DM_Sans',_sans-serif] animate-fadeIn text-gray-900">
        {/* Header */}
        <div className="w-full flex items-center gap-4 pt-6 select-none shrink-0">
          <button 
            onClick={() => setStep('welcome')}
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">I am a...</h2>
        </div>

        {/* Roles List */}
        <div className="flex-1 flex flex-col justify-center gap-4 max-w-sm w-full mx-auto my-auto py-4">
          {/* Passenger Card */}
          <button
            onClick={() => setSelectedRole('passenger')}
            className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 relative flex flex-col gap-3 shadow-sm active:scale-[0.99] ${
              selectedRole === 'passenger' 
                ? 'border-[#00B14F] bg-[#E1F5EE]/20 shadow-[#00B14F]/5' 
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            {/* Checked badge */}
            {selectedRole === 'passenger' && (
              <div className="absolute top-4 right-4 w-5 h-5 bg-[#00B14F] text-white rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              selectedRole === 'passenger' ? 'bg-[#00B14F] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              <User className="w-6 h-6" />
            </div>

            <div>
              <h3 className={`text-lg font-bold transition-colors ${
                selectedRole === 'passenger' ? 'text-[#00B14F]' : 'text-gray-800'
              }`}>Passenger</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1">
                Book rides to your destination easily and safely.
              </p>
            </div>
          </button>

          {/* Driver Card */}
          <button
            onClick={() => setSelectedRole('driver')}
            className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 relative flex flex-col gap-3 shadow-sm active:scale-[0.99] ${
              selectedRole === 'driver' 
                ? 'border-[#00B14F] bg-[#E1F5EE]/20 shadow-[#00B14F]/5' 
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            {/* Checked badge */}
            {selectedRole === 'driver' && (
              <div className="absolute top-4 right-4 w-5 h-5 bg-[#00B14F] text-white rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              selectedRole === 'driver' ? 'bg-[#00B14F] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              <Car className="w-6 h-6" />
            </div>

            <div>
              <h3 className={`text-lg font-bold transition-colors ${
                selectedRole === 'driver' ? 'text-[#00B14F]' : 'text-gray-800'
              }`}>Driver</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1">
                Earn money by driving passengers to their destinations.
              </p>
            </div>
          </button>

          {/* Operator Card */}
          <button
            onClick={() => setSelectedRole('operator')}
            className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 relative flex flex-col gap-3 shadow-sm active:scale-[0.99] ${
              selectedRole === 'operator' 
                ? 'border-[#00B14F] bg-[#E1F5EE]/20 shadow-[#00B14F]/5' 
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            {/* Checked badge */}
            {selectedRole === 'operator' && (
              <div className="absolute top-4 right-4 w-5 h-5 bg-[#00B14F] text-white rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              selectedRole === 'operator' ? 'bg-[#00B14F] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              <ClipboardList className="w-6 h-6" />
            </div>

            <div>
              <h3 className={`text-lg font-bold transition-colors ${
                selectedRole === 'operator' ? 'text-[#00B14F]' : 'text-gray-800'
              }`}>Operator</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1">
                Manage fleet operations and oversee bookings and schedules.
              </p>
            </div>
          </button>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm mx-auto flex gap-4 pb-8 shrink-0">
          <button 
            onClick={() => {
              if (selectedRole === 'passenger') {
                setStep('passenger-login');
              } else if (selectedRole === 'operator') {
                setCurrentPage?.('operator');
              } else {
                setCurrentPage?.('rider');
              }
            }}
            className="flex-1 border-2 border-[#00B14F] text-[#00B14F] hover:bg-[#E1F5EE]/10 py-[18px] rounded-2xl font-bold text-sm uppercase tracking-wider active:scale-95 transition-all text-center"
          >
            Sign In
          </button>
          
          <button 
            onClick={() => {
              if (selectedRole === 'passenger') {
                setStep('passenger-signup');
              } else if (selectedRole === 'operator') {
                setStep('operator-signup');
              } else {
                setStep('driver-signup');
              }
            }}
            className="flex-1 bg-[#00B14F] hover:bg-[#009241] text-white py-[18px] rounded-2xl font-bold text-sm uppercase tracking-wider active:scale-95 transition-all text-center"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  if (step === 'driver-signup') {
    const handleDriverSignup = async (e) => {
      e.preventDefault();
      if (driverForm.password !== driverForm.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (driverForm.password.length < 6) {
        alert("Password must be at least 6 characters!");
        return;
      }

      setAuthLoading(true);
      try {
        const res = await fetch('/api/driver/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: driverForm.fullName,
            email: driverForm.email,
            phoneNumber: driverForm.phoneNumber,
            password: driverForm.password,
            vehicleModel: driverForm.vehicleModel,
            plateNumber: driverForm.plateNumber,
            licenseNumber: driverForm.licenseNumber
          })
        });
        const data = await res.json();
        if (data.success) {
          alert(data.message || "Driver account created successfully!");
          localStorage.setItem('rider_user', JSON.stringify(data.driver));
          setCurrentPage?.('rider'); // Redirect to Rider Portal dashboard
        } else {
          alert(data.message || "Driver registration failed");
        }
      } catch (err) {
        console.error(err);
        alert("Error connecting to server");
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-white flex flex-col justify-between p-6 font-['DM_Sans',_sans-serif] animate-fadeIn text-gray-900 overflow-y-auto">
        {/* Header */}
        <div className="w-full pt-6 select-none shrink-0 mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setStep('role-select')}
              className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Driver Sign Up</h2>
          </div>
          <p className="text-xs text-gray-400 font-medium ml-12 mt-1">Register as a RideGo driver</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleDriverSignup} className="flex-1 flex flex-col gap-5 max-w-sm w-full mx-auto pb-10">
          
          {/* Section 1: PERSONAL INFO */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Personal Info</h3>
            
            {/* Full Name */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <User className="w-5 h-5 text-gray-400" />
              <input 
                required
                type="text" 
                placeholder="Full name"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={driverForm.fullName}
                onChange={(e) => setDriverForm({...driverForm, fullName: e.target.value})}
              />
            </div>

            {/* Email Address */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <Mail className="w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="Email address"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={driverForm.email}
                onChange={(e) => setDriverForm({...driverForm, email: e.target.value})}
              />
            </div>

            {/* Mobile Number */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <Phone className="w-5 h-5 text-gray-400" />
              <input 
                required
                type="tel" 
                placeholder="Mobile number"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={driverForm.phoneNumber}
                onChange={(e) => setDriverForm({...driverForm, phoneNumber: e.target.value})}
              />
            </div>

            {/* Password */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all relative">
              <Lock className="w-5 h-5 text-gray-400" />
              <input 
                required
                type={showDriverPassword ? "text" : "password"} 
                placeholder="Password (min. 6 characters)"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400 pr-10"
                value={driverForm.password}
                onChange={(e) => setDriverForm({...driverForm, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowDriverPassword(!showDriverPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showDriverPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <Lock className="w-5 h-5 text-gray-400" />
              <input 
                required
                type="password" 
                placeholder="Confirm password"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={driverForm.confirmPassword}
                onChange={(e) => setDriverForm({...driverForm, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          {/* Section 2: VEHICLE & LICENSE */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Vehicle & License</h3>

            {/* Vehicle make & model */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <Car className="w-5 h-5 text-gray-400" />
              <input 
                required
                type="text" 
                placeholder="Vehicle make & model (e.g. Toyota Vios)"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={driverForm.vehicleModel}
                onChange={(e) => setDriverForm({...driverForm, vehicleModel: e.target.value})}
              />
            </div>

            {/* Plate number */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <ClipboardList className="w-5 h-5 text-gray-400" />
              <input 
                required
                type="text" 
                placeholder="Plate number (e.g. ABC 1234)"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={driverForm.plateNumber}
                onChange={(e) => setDriverForm({...driverForm, plateNumber: e.target.value})}
              />
            </div>

            {/* License number */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <Shield className="w-5 h-5 text-gray-400" />
              <input 
                required
                type="text" 
                placeholder="Driver's license number"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={driverForm.licenseNumber}
                onChange={(e) => setDriverForm({...driverForm, licenseNumber: e.target.value})}
              />
            </div>
          </div>

          {/* Button */}
          <button 
            type="submit"
            disabled={authLoading}
            className="w-full bg-[#00B14F] hover:bg-[#009241] text-white py-[18px] rounded-2xl font-bold text-base shadow-lg shadow-green-100 active:scale-95 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Create Driver Account'}
          </button>

          {/* Sign In Link */}
          <div className="w-full text-center mt-2 shrink-0">
            <button 
              type="button"
              onClick={() => setCurrentPage?.('rider')}
              className="text-xs font-semibold text-gray-400 cursor-pointer bg-transparent border-none outline-none"
            >
              Already registered? <span className="text-[#00B14F] hover:underline">Sign In</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 'operator-signup') {
    const handleOperatorSignup = async (e) => {
      e.preventDefault();
      if (operatorForm.password !== operatorForm.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (operatorForm.password.length < 6) {
        alert("Password must be at least 6 characters!");
        return;
      }

      setAuthLoading(true);
      try {
        // Mock server interaction for Operator registration
        setTimeout(() => {
          setAuthLoading(false);
          const mockOperatorUser = {
            id: 'OP-' + Math.floor(Math.random() * 10000),
            full_name: operatorForm.fullName,
            phone_number: operatorForm.phoneNumber,
            company_name: operatorForm.companyName,
            email: operatorForm.email
          };
          localStorage.setItem('operator_user', JSON.stringify(mockOperatorUser));
          alert("Operator account created successfully! You can add your vehicles inside the portal.");
          setCurrentPage?.('operator');
        }, 1500);
      } catch (err) {
        console.error(err);
        alert("Error connecting to server");
        setAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-white flex flex-col justify-between p-6 font-['DM_Sans',_sans-serif] animate-fadeIn text-gray-900 overflow-y-auto">
        {/* Header */}
        <div className="w-full pt-6 select-none shrink-0 mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setStep('role-select')}
              className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Operator Sign Up</h2>
          </div>
          <p className="text-xs text-gray-400 font-medium ml-12 mt-1">Register your fleet management account</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleOperatorSignup} className="flex-1 flex flex-col gap-5 max-w-sm w-full mx-auto pb-10">
          
          {/* Section 1: PERSONAL INFO */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Info</h3>
            
            {/* Full Name */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <User className="w-5 h-5 text-gray-400" />
              <input 
                required
                type="text" 
                placeholder="Full name"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={operatorForm.fullName}
                onChange={(e) => setOperatorForm({...operatorForm, fullName: e.target.value})}
              />
            </div>

            {/* Email Address */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <Mail className="w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="Email address"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={operatorForm.email}
                onChange={(e) => setOperatorForm({...operatorForm, email: e.target.value})}
              />
            </div>

            {/* Mobile Number */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <Phone className="w-5 h-5 text-gray-400" />
              <input 
                required
                type="tel" 
                placeholder="Mobile number"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={operatorForm.phoneNumber}
                onChange={(e) => setOperatorForm({...operatorForm, phoneNumber: e.target.value})}
              />
            </div>

            {/* Password */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all relative">
              <Lock className="w-5 h-5 text-gray-400" />
              <input 
                required
                type={showOperatorPassword ? "text" : "password"} 
                placeholder="Password (min. 6 characters)"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400 pr-10"
                value={operatorForm.password}
                onChange={(e) => setOperatorForm({...operatorForm, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowOperatorPassword(!showOperatorPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showOperatorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <Lock className="w-5 h-5 text-gray-400" />
              <input 
                required
                type="password" 
                placeholder="Confirm password"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={operatorForm.confirmPassword}
                onChange={(e) => setOperatorForm({...operatorForm, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          {/* Section 2: FLEET INFO */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fleet Info</h3>

            {/* Company Name */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Company / Fleet Name (Optional)"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full placeholder:text-gray-400"
                value={operatorForm.companyName}
                onChange={(e) => setOperatorForm({...operatorForm, companyName: e.target.value})}
              />
            </div>
            
            <div className="bg-[#E1F5EE] rounded-2xl p-4 flex gap-3 text-sm">
              <Car className="w-5 h-5 text-[#00B14F] shrink-0" />
              <p className="text-[#009241] font-medium leading-relaxed">You will be able to add and manage multiple vehicles and drivers from your Operator Portal after registration.</p>
            </div>
          </div>

          {/* Button */}
          <button 
            type="submit"
            disabled={authLoading}
            className="w-full bg-[#00B14F] hover:bg-[#009241] text-white py-[18px] rounded-2xl font-bold text-base shadow-lg shadow-green-100 active:scale-95 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Create Operator Account'}
          </button>

          {/* Sign In Link */}
          <div className="w-full text-center mt-2 shrink-0">
            <button 
              type="button"
              onClick={() => setCurrentPage?.('operator')}
              className="text-xs font-semibold text-gray-400 cursor-pointer bg-transparent border-none outline-none"
            >
              Already registered? <span className="text-[#00B14F] hover:underline">Sign In</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 'passenger-signup') {
    const handleSignup = async (e) => {
      e.preventDefault();
      if (signupForm.password !== signupForm.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (signupForm.password.length < 6) {
        alert("Password must be at least 6 characters!");
        return;
      }
      
      setStep('liveness-check');
      setLivenessStage(0);
    };

    return (
      <div className="min-h-screen bg-white flex flex-col justify-between p-6 font-['DM_Sans',_sans-serif] animate-fadeIn text-gray-900">
        {/* Header */}
        <div className="w-full pt-6 select-none shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setStep('role-select')}
              className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-850" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Passenger Sign Up</h2>
          </div>
          <p className="text-xs text-gray-400 font-medium ml-12 mt-1">Create your passenger account</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="flex-1 flex flex-col justify-center gap-4 max-w-sm w-full mx-auto my-auto py-8">
          {/* Full Name */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
            <User className="w-5 h-5 text-gray-400" />
            <input 
              required
              type="text" 
              placeholder="Full name"
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-905 w-full placeholder:text-gray-400"
              value={signupForm.fullName}
              onChange={(e) => setSignupForm({...signupForm, fullName: e.target.value})}
            />
          </div>

          {/* Email Address */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
            <Mail className="w-5 h-5 text-gray-400" />
            <input 
              type="email" 
              placeholder="Email address"
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-905 w-full placeholder:text-gray-400"
              value={signupForm.email}
              onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
            />
          </div>

          {/* Mobile Number */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
            <Phone className="w-5 h-5 text-gray-400" />
            <input 
              required
              type="tel" 
              placeholder="Mobile number"
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-905 w-full placeholder:text-gray-400"
              value={signupForm.phoneNumber}
              onChange={(e) => setSignupForm({...signupForm, phoneNumber: e.target.value})}
            />
          </div>

          {/* Password */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all relative">
            <Lock className="w-5 h-5 text-gray-400" />
            <input 
              required
              type={showPassword ? "text" : "password"} 
              placeholder="Password (min. 6 characters)"
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-905 w-full placeholder:text-gray-400 pr-10"
              value={signupForm.password}
              onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
            <Lock className="w-5 h-5 text-gray-400" />
            <input 
              required
              type="password" 
              placeholder="Confirm password"
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-905 w-full placeholder:text-gray-400"
              value={signupForm.confirmPassword}
              onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
            />
          </div>

          {/* Button */}
          <button 
            type="submit"
            disabled={authLoading}
            className="w-full bg-[#00B14F] hover:bg-[#009241] text-white py-[18px] rounded-2xl font-bold text-base shadow-lg shadow-green-100 active:scale-95 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Create Passenger Account'}
          </button>
        </form>

        {/* Link */}
        <div className="w-full text-center pb-8 shrink-0">
          <button 
            onClick={() => setStep('passenger-login')}
            className="text-xs font-semibold text-gray-400 cursor-pointer bg-transparent border-none outline-none"
          >
            Already registered? <span className="text-[#00B14F] hover:underline">Sign In</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'liveness-check') {
    const capturePhotoAndSubmit = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoDataUrl(dataUrl);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        setAuthLoading(true);
        try {
          const res = await fetch('/api/passenger/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: signupForm.fullName,
              email: signupForm.email,
              phoneNumber: signupForm.phoneNumber,
              password: signupForm.password,
              photoBase64: dataUrl
            })
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('passenger_user', JSON.stringify(data.passenger));
            setPassenger(data.passenger);
            alert(data.message || "Account created successfully!");
            setStep('selection');
          } else {
            alert(data.message || "Failed to create account");
            setStep('passenger-signup');
          }
        } catch (err) {
          console.error(err);
          alert("Error connecting to server");
          setStep('passenger-signup');
        } finally {
          setAuthLoading(false);
        }
      }
    };

    return (
      <div className="min-h-screen bg-[#161616] flex flex-col items-center justify-center p-6 text-white text-center animate-fadeIn">
        <h2 className="text-2xl font-bold mb-2">Verify it's you</h2>
        <p className="text-sm text-gray-400 mb-10 h-10 flex items-center justify-center">
          {livenessStage === 0 && "Please look straight at the camera."}
          {livenessStage === 1 && "Turn your head slowly to the left."}
          {livenessStage === 2 && "Turn your head slowly to the right."}
          {livenessStage === 3 && "Great! Now smile for your profile photo."}
        </p>

        <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-[#00B14F] mb-10 shadow-[0_0_40px_rgba(0,177,79,0.2)]">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover transform scale-x-[-1]" 
            playsInline 
            muted 
          />
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="h-20 flex items-center justify-center w-full">
          {livenessStage === 3 ? (
            <button 
              onClick={capturePhotoAndSubmit}
              disabled={authLoading}
              className="bg-[#00B14F] text-white py-4 px-8 rounded-full font-bold shadow-lg shadow-green-900/50 flex items-center gap-3 active:scale-95 transition-transform disabled:opacity-50 text-base"
            >
              {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Camera size={20} /> Capture & Finish</>}
            </button>
          ) : (
            <div className="flex gap-3">
              <div className={`h-2.5 rounded-full transition-all duration-500 ${livenessStage >= 0 ? 'w-10 bg-[#00B14F]' : 'w-3 bg-gray-700'}`}></div>
              <div className={`h-2.5 rounded-full transition-all duration-500 ${livenessStage >= 1 ? 'w-10 bg-[#00B14F]' : 'w-3 bg-gray-700'}`}></div>
              <div className={`h-2.5 rounded-full transition-all duration-500 ${livenessStage >= 2 ? 'w-10 bg-[#00B14F]' : 'w-3 bg-gray-700'}`}></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'passenger-login') {
    const handleLogin = async (e) => {
      e.preventDefault();
      setAuthLoading(true);
      try {
        const res = await fetch('/api/passenger/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: loginForm.phoneNumber,
            password: loginForm.password
          })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('passenger_user', JSON.stringify(data.passenger));
          setPassenger(data.passenger);
          alert("Login successful!");
          setStep('selection');
        } else {
          alert(data.message || "Failed to log in");
        }
      } catch (err) {
        console.error(err);
        alert("Error connecting to server");
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-white flex flex-col justify-between p-6 font-['DM_Sans',_sans-serif] animate-fadeIn text-gray-900">
        {/* Header */}
        <div className="w-full pt-6 select-none shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setStep('role-select')}
              className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-850" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Passenger Sign In</h2>
          </div>
          <p className="text-xs text-gray-400 font-medium ml-12 mt-1">Access your passenger account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex-1 flex flex-col justify-center gap-4 max-w-sm w-full mx-auto my-auto py-8">
          {/* Mobile Number */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all">
            <Phone className="w-5 h-5 text-gray-400" />
            <input 
              required
              type="tel" 
              placeholder="Mobile number"
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-905 w-full placeholder:text-gray-400"
              value={loginForm.phoneNumber}
              onChange={(e) => setLoginForm({...loginForm, phoneNumber: e.target.value})}
            />
          </div>

          {/* Password */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 focus-within:border-[#00B14F] focus-within:bg-white transition-all relative">
            <Lock className="w-5 h-5 text-gray-400" />
            <input 
              required
              type={showLoginPassword ? "text" : "password"} 
              placeholder="Password"
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-905 w-full placeholder:text-gray-400 pr-10"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
            />
            <button 
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Button */}
          <button 
            type="submit"
            disabled={authLoading}
            className="w-full bg-[#00B14F] hover:bg-[#009241] text-white py-[18px] rounded-2xl font-bold text-base shadow-lg shadow-green-100 active:scale-95 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Link */}
        <div className="w-full text-center pb-8 shrink-0">
          <button 
            onClick={() => setStep('passenger-signup')}
            className="text-xs font-semibold text-gray-400 cursor-pointer bg-transparent border-none outline-none"
          >
            Don't have an account? <span className="text-[#00B14F] hover:underline">Sign Up</span>
          </button>
        </div>
      </div>
    );
  }

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

          <div className="space-y-1.5 pt-4">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-2">Notes to Driver</label>
            <div className="bg-gray-50 rounded-2xl p-4 flex gap-4 border border-gray-100 focus-within:border-blue-500 transition-all">
              <MessageSquare className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
              <textarea 
                placeholder="E.g., Wait near the entrance..."
                className="bg-transparent border-none outline-none text-base font-medium text-gray-900 w-full placeholder:text-gray-300 resize-none h-20"
                value={formData.driverInstructions}
                onChange={(e) => setFormData({...formData, driverInstructions: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-gray-100">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setFormData({...formData, paymentMethod: 'Cash', corporateAccountId: ''}); setCorporateValid(null); }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'Cash' ? 'border-[#00B14F] bg-[#E1F5EE]/50' : 'border-gray-100 bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.paymentMethod === 'Cash' ? 'bg-[#00B14F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <Banknote className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${formData.paymentMethod === 'Cash' ? 'text-[#00B14F]' : 'text-gray-500'}`}>Cash</span>
              </button>
              <button 
                onClick={() => setFormData({...formData, paymentMethod: 'Corporate'})}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'Corporate' ? 'border-[#00B14F] bg-[#E1F5EE]/50' : 'border-gray-100 bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.paymentMethod === 'Corporate' ? 'bg-[#00B14F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${formData.paymentMethod === 'Corporate' ? 'text-[#00B14F]' : 'text-gray-500'}`}>Corporate</span>
              </button>
              <button 
                onClick={() => { setFormData({...formData, paymentMethod: 'GCash', corporateAccountId: ''}); setCorporateValid(null); }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'GCash' ? 'border-[#00B14F] bg-[#E1F5EE]/50' : 'border-gray-100 bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.paymentMethod === 'GCash' ? 'bg-[#00B14F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${formData.paymentMethod === 'GCash' ? 'text-[#00B14F]' : 'text-gray-500'}`}>GCash</span>
              </button>
              <button 
                onClick={() => { setFormData({...formData, paymentMethod: 'Maya Account', corporateAccountId: ''}); setCorporateValid(null); }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'Maya Account' ? 'border-[#00B14F] bg-[#E1F5EE]/50' : 'border-gray-100 bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.paymentMethod === 'Maya Account' ? 'bg-[#00B14F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <Wallet className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${formData.paymentMethod === 'Maya Account' ? 'text-[#00B14F]' : 'text-gray-500'}`}>Maya</span>
              </button>
              <button 
                onClick={() => { setFormData({...formData, paymentMethod: 'Credit Card', corporateAccountId: ''}); setCorporateValid(null); }}
                className={`col-span-2 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'Credit Card' ? 'border-[#00B14F] bg-[#E1F5EE]/50' : 'border-gray-100 bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.paymentMethod === 'Credit Card' ? 'bg-[#00B14F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${formData.paymentMethod === 'Credit Card' ? 'text-[#00B14F]' : 'text-gray-500'}`}>Credit Card</span>
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

          {formData.paymentMethod === 'GCash' && (
            <div className="bg-blue-50 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300 border border-blue-100 mt-4">
              <p className="text-xs font-bold text-blue-800 mb-1">GCash Payment Instructions</p>
              <p className="text-xs text-blue-600 leading-relaxed">Please send the exact amount to the driver's GCash number. The driver will provide their QR code or number upon pickup or drop-off.</p>
            </div>
          )}

          {formData.paymentMethod === 'Maya Account' && (
            <div className="bg-blue-50 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300 border border-blue-100 mt-4">
              <p className="text-xs font-bold text-blue-800 mb-1">Maya Account Instructions</p>
              <p className="text-xs text-blue-600 leading-relaxed">Please scan the driver's Maya QR code or transfer the amount to their mobile number during the ride.</p>
            </div>
          )}

          {formData.paymentMethod === 'Credit Card' && (
            <div className="bg-blue-50 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300 border border-blue-100 mt-4">
              <p className="text-xs font-bold text-blue-800 mb-1">Credit Card Instructions</p>
              <p className="text-xs text-blue-600 leading-relaxed">Our driver carries a mobile POS terminal. You can tap or swipe your card safely at the end of your trip.</p>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Estimated Fare</p>
              <p className="text-xl font-semibold text-black">PHP {getCalculatedPrice(selectedVehicle)}</p>
            </div>
            <p className="text-[10px] font-medium text-gray-400 leading-relaxed uppercase tracking-tighter">Fare includes base rate and platform fees. Final amount may vary based on actual distance.</p>
          </div>
        </div>

        <button 
          onClick={handleConfirmBooking}
          disabled={bookingLoading}
          className="w-full bg-[#00B14F] hover:bg-[#009241] text-white py-5 rounded-full font-semibold uppercase tracking-widest active:scale-95 transition-all mt-8 disabled:opacity-50 flex items-center justify-center gap-3"
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
          isPicking={sheetState === 'minimized' && !destinationSelected}
          pickupCoords={currentPos}
          destCoords={destPos}
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
        <div className="relative z-10 p-4 pt-6 flex flex-col gap-3 pointer-events-none">
          {/* Route Summary Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-3 space-y-2 pointer-events-auto animate-in slide-in-from-top-10 duration-500 border border-gray-100">
            {/* Pickup Row */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-black/5 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-gray-900" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">{pickup}</p>
                <p className="text-[10px] font-medium text-gray-400 uppercase mt-0.5">Entrance</p>
              </div>
            </div>
            {/* Divider Line */}
            <div className="absolute left-[23px] top-[48px] w-[1.5px] h-[20px] bg-gray-100" />
            {/* Destination Row */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-black/5 rounded-full flex items-center justify-center">
                <Flag className="w-3 h-3 text-gray-900" />
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
            sheetState === 'minimized' ? 'translate-y-[calc(100%-80px)]' : 'translate-y-0'
          }`}
        >
          {/* Handle & Vehicle Tray (HORIZONTAL) */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-t-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-white/40 p-4">
            <div 
              className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2 cursor-pointer"
              onClick={() => setSheetState(sheetState === 'minimized' ? 'medium' : 'minimized')}
            />
            <p className="text-center text-sm font-bold text-gray-800 mb-4">
              Tap to get a ride to your destination
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2 px-2 max-h-[40vh] overflow-y-auto">
              {[...vehicles].sort((a, b) => a.id === selectedVehicle ? -1 : b.id === selectedVehicle ? 1 : 0).map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    if (selectedVehicle === v.id) {
                      setSelectedVehicle(null);
                      setIsSearching(false);
                    } else {
                      setSelectedVehicle(v.id);
                      setIsSearching(true);
                    }
                  }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 border-2 ${
                    selectedVehicle === v.id 
                      ? 'border-[#00B14F] bg-[#E1F5EE]/20 shadow-sm' 
                      : 'border-transparent bg-white shadow-sm hover:border-gray-100'
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
                        className={`w-full h-full object-contain ${selectedVehicle === v.id ? 'brightness-100' : 'opacity-80 grayscale-[0.3]'}`} 
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
              ) : [...vehicles].sort((a, b) => a.id === selectedVehicle ? -1 : b.id === selectedVehicle ? 1 : 0).map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    if (selectedVehicle === v.id) {
                      setSelectedVehicle(null);
                      setIsSearching(false);
                    } else {
                      setSelectedVehicle(v.id);
                      setIsSearching(true);
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 border-2 ${
                    selectedVehicle === v.id 
                      ? 'bg-gray-100 border-[#00B14F] text-gray-900 shadow-sm' 
                      : 'bg-white border-transparent text-gray-900'
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
                        className={`w-[140px] h-20 object-contain ${selectedVehicle === v.id ? 'brightness-100' : 'opacity-80 grayscale-[0.3]'}`} 
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
                className="flex-1 bg-[#00B14F] hover:bg-[#009241] text-white h-14 rounded-full font-semibold text-lg flex items-center justify-center active:scale-95 transition-all"
              >
                Continue
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
                          onClick={async () => {
                            setPickup(route.pickup_name);
                            setDestination(route.destination_name);
                            setSelectedRoute(route);
                            setIsSearching(false);
                            setDestinationSelected(true);

                            let pLat = parseFloat(route.pickup_lat);
                            let pLng = parseFloat(route.pickup_lng);
                            let dLat = parseFloat(route.destination_lat);
                            let dLng = parseFloat(route.destination_lng);

                            const geocode = async (address) => {
                              try {
                                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
                                const data = await res.json();
                                if (data && data.length > 0) {
                                  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                                }
                              } catch (e) {
                                console.error("Geocoding error:", e);
                              }
                              return null;
                            };

                            if (isNaN(pLat) || isNaN(pLng)) {
                              const coords = await geocode(route.pickup_name);
                              if (coords) {
                                pLat = coords.lat;
                                pLng = coords.lng;
                              }
                            }

                            if (isNaN(dLat) || isNaN(dLng)) {
                              const coords = await geocode(route.destination_name);
                              if (coords) {
                                dLat = coords.lat;
                                dLng = coords.lng;
                              }
                            }

                            setCurrentPos({ lat: pLat, lng: pLng });
                            setDestPos({ lat: dLat, lng: dLng });

                            setMapAction({
                              type: 'route',
                              pickup: { coords: { lat: pLat, lng: pLng }, address: route.pickup_name },
                              dest: { coords: { lat: dLat, lng: dLng }, address: route.destination_name }
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
                        setDestPos({ lat: dest.lat, lng: dest.lng });
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
                          setDestPos({ lat: dest.lat, lng: dest.lng });
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
                  onClick={async () => { 
                    setIsSearching(false); 
                    setDestinationSelected(true);
                    setSelectedRoute(null);
                    
                    let lat = currentPos.lat + 0.03;
                    let lng = currentPos.lng + 0.03;
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`);
                      const data = await res.json();
                      if (data && data.length > 0) {
                        lat = parseFloat(data[0].lat);
                        lng = parseFloat(data[0].lon);
                      }
                    } catch (e) {}
                    
                    setDestPos({ lat, lng });
                    setMapAction({ type: 'dest', address: destination, coords: { lat, lng } });
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
