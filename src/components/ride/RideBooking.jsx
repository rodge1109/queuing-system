import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  ChevronRight, 
  Clock, 
  CreditCard, 
  Car, 
  Truck, 
  Activity,
  ArrowRight,
  Gift,
  Map as MapIcon,
  Navigation,
  Home,
  Briefcase,
  Calendar,
  ChevronDown,
  Plus
} from 'lucide-react';
import RideBookingMap from './RideBookingMap';

const RideBooking = ({ 
  onBook, 
  isSubmitting,
  pickup,
  setPickup,
  destination,
  setDestination,
  pickupCoords,
  setPickupCoords,
  destCoords,
  setDestCoords,
  activeField,
  setActiveField
}) => {
  const [bookingTime, setBookingTime] = useState('now'); // 'now' or 'later'
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const detectLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setPickupCoords(latlng);
          setPickup('Your current location');
          setActiveField('destination');
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsDetectingLocation(false);
          alert('Could not detect location. Please select on map.');
        }
      );
    } else {
      setIsDetectingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/booking-services');
        const data = await res.json();
        if (data.success) {
          const transport = data.services.filter(s => 
            (s.category || '').trim().toUpperCase() === 'TRANSPORT'
          );
          setServices(transport);
          if (transport.length > 0) setSelectedService(transport[0]);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  // handleMapClick logic is now in the parent (HomePage)
  // handleMapClick removed here

  const handleBookClick = () => {
    onBook({ 
      pickup, 
      destination, 
      pickupCoords,
      destCoords,
      bookingTime,
      scheduledDate,
      scheduledTime,
      service: selectedService 
    });
  };

  const setSavedPlace = (type) => {
    // Mock coordinates for demo
    const places = {
      home: { name: 'Home (San Vicente)', coords: { lat: 11.0520, lng: 124.0050 } },
      work: { name: 'Work (Bogo Proper)', coords: { lat: 11.0450, lng: 124.0120 } }
    };
    const place = places[type];
    if (activeField === 'pickup') {
      setPickup(place.name);
      setPickupCoords(place.coords);
    } else {
      setDestination(place.name);
      setDestCoords(place.coords);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 font-['DM_Sans',_sans-serif]">
      {/* Search Header */}
      <div className="p-5 bg-white border-b border-gray-50">
        <div className="flex flex-col gap-4">
          {/* Pickup Input */}
          <div className="relative">
            <div 
              onClick={() => setActiveField('pickup')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${activeField === 'pickup' ? 'border-[#00B14F] bg-[#E1F5EE]/10' : 'bg-gray-50 border-gray-100'}`}
            >
              <div className="w-2.5 h-2.5 bg-[#00B14F] rounded-full shadow-[0_0_8px_rgba(0,177,79,0.4)]"></div>
              <input 
                type="text" 
                value={pickup} 
                onChange={(e) => setPickup(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold w-full text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
                placeholder="Pickup location"
              />
              <button 
                onClick={(e) => { e.stopPropagation(); detectLocation(); }}
                disabled={isDetectingLocation}
                className={`p-2 rounded-xl transition-all ${isDetectingLocation ? 'bg-gray-100 text-gray-400' : 'bg-white text-[#00B14F] hover:bg-[#E1F5EE] shadow-sm border border-gray-100'}`}
                title="Use current location"
              >
                <Navigation size={14} className={isDetectingLocation ? 'animate-spin' : ''} />
              </button>
            </div>
            {activeField === 'pickup' && (
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full hidden lg:block">
                <div className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap animate-bounce-horizontal">
                  Select on Map →
                </div>
              </div>
            )}
          </div>

          {/* Destination Input */}
          <div className="relative">
            <div 
              onClick={() => setActiveField('destination')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${activeField === 'destination' ? 'border-[#E24B4A] bg-red-50/20' : 'bg-gray-50 border-gray-100'}`}
            >
              <div className="w-2.5 h-2.5 bg-[#E24B4A] rounded-full shadow-[0_0_8px_rgba(226,75,74,0.4)]"></div>
              <input 
                type="text" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold w-full text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
                placeholder="Where to?"
                autoFocus
              />
            </div>
            {activeField === 'destination' && (
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full hidden lg:block">
                <div className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap animate-bounce-horizontal">
                  Select on Map →
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Places Quick Access */}
      <div className="px-4 py-2 flex gap-3 overflow-x-auto scrollbar-hide bg-white">
        <button 
          onClick={() => setSavedPlace('home')}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 hover:border-[#00B14F] hover:bg-[#E1F5EE] transition-all whitespace-nowrap"
        >
          <Home size={12} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-600">Home</span>
        </button>
        <button 
          onClick={() => setSavedPlace('work')}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 hover:border-[#00B14F] hover:bg-[#E1F5EE] transition-all whitespace-nowrap"
        >
          <Briefcase size={12} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-600">Work</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all whitespace-nowrap">
          <Plus size={12} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-600">Add Place</span>
        </button>
      </div>

      {/* Map Hint for Mobile */}
      <div className="px-4 py-2 lg:hidden">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapIcon size={14} className="text-[#00B14F]" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Tap map above to set points</span>
          </div>
          <ChevronDown size={14} className="text-gray-300" />
        </div>
      </div>

      {/* Booking Mode Selector */}
      <div className="px-4 py-3 flex gap-4 border-b border-gray-50">
        <button 
          onClick={() => setBookingTime('now')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${bookingTime === 'now' ? 'bg-[#111] text-white border-[#111]' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
        >
          Ride Now
        </button>
        <button 
          onClick={() => setBookingTime('later')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${bookingTime === 'later' ? 'bg-[#00B14F] text-white border-[#00B14F]' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
        >
          <Calendar size={12} />
          Later
        </button>
      </div>

      {/* Scheduler Expandable */}
      {bookingTime === 'later' && (
        <div className="px-4 py-4 bg-gray-50 border-b border-gray-100 animate-fadeIn">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Schedule your trip</p>
          <div className="flex gap-3">
            <input 
              type="date" 
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#00B14F]"
            />
            <input 
              type="time" 
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#00B14F]"
            />
          </div>
        </div>
      )}

      {/* Service Selection */}
      <div className="p-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Choose a ride</h3>
        
        <div className="space-y-2 mb-6">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl"></div>)}
            </div>
          ) : (
            services.map((service) => (
              <div 
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedService?.id === service.id 
                  ? 'border-[#00B14F] bg-[#E1F5EE]/30 shadow-sm' 
                  : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-[68px] h-[68px] rounded-full force-circle flex items-center justify-center shadow-md border ${
                  selectedService?.id === service.id ? 'bg-[#00B14F] border-[#00B14F] text-white' : 'bg-white border-gray-100 text-gray-400'
                }`}>
                  {service.name.toLowerCase().includes('bike') ? <Activity size={24} /> : <Car size={24} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{service.name}</p>
                  <p className="text-[10px] text-gray-500">{service.description || 'Quick and reliable'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {(() => {
                      const val = service.price || service.base_fare || '0';
                      const str = String(val);
                      if (str.includes('PHP') || str.includes('₱')) return str;
                      return `₱${val}`;
                    })()}
                  </p>
                  <p className="text-[9px] text-[#00B14F] font-bold">Promo available</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#E1F5EE]">
              <CreditCard size={14} className="text-gray-400 group-hover:text-[#00B14F]" />
            </div>
            <span className="text-[11px] font-bold text-gray-600">Cash</span>
            <ChevronRight size={12} className="text-gray-300" />
          </div>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#E1F5EE]">
              <Gift size={14} className="text-gray-400 group-hover:text-[#00B14F]" />
            </div>
            <span className="text-[11px] font-bold text-gray-600">Offers</span>
          </div>
        </div>

        <button 
          disabled={!destination || !selectedService || isSubmitting}
          onClick={handleBookClick}
          className={`w-full py-4 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            !destination || !selectedService || isSubmitting
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
            : 'bg-[#00B14F] text-white hover:bg-[#009e46]'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              Confirm {selectedService?.name || 'Ride'}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>
    </div>
  );
};

export default RideBooking;
