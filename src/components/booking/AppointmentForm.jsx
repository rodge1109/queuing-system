
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingCart, Search, Settings, Check, ChevronRight, ChevronLeft, 
  MapPin, Clock, Phone, Mail, Star, Store, CreditCard, Lock, ArrowRight, User 
} from 'lucide-react';
import TransportMap from '../maps/TransportMap';

function AppointmentForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
    agentCode: '',
    pickupLocation: '',
    destinationLocation: '',
    pickupCoords: null,
    destCoords: null
  });
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [mapAction, setMapAction] = useState(null);
  const [distance, setDistance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('local');
  const [showMapInForm, setShowMapInForm] = useState(true);

  const [step, setStep] = useState('service');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [liveServices, setLiveServices] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  useEffect(() => {
    const fetchStaffAndServices = async () => {
      try {
        setIsLoadingStaff(true);
        setIsLoadingServices(true);

        const [staffRes, servicesRes] = await Promise.all([
          fetch('/api/specialists'),
          fetch('/api/booking-services')
        ]);

        const staffData = await staffRes.json();
        const servicesData = await servicesRes.json();

        if (staffData.success) {
          setStaffMembers([
            { id: 'any', name: 'Any Staff', email: 'Next available member', image_url: null },
            ...staffData.specialists
          ]);
        }

        if (servicesData.success) {
          setLiveServices(servicesData.services);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoadingStaff(false);
        setIsLoadingServices(false);
      }
    };
    fetchStaffAndServices();
  }, []);

  const calculateFees = () => {
    if (!selectedService) return { subtotal: 0, tax: 0, total: 0 };

    let subtotal = 0;
    const cat = (selectedService.category || '').trim().toUpperCase();

    let base = 0;
    let rate = 0;
    let transportFees = 0;
    let flatPrice = 0;

    if (cat === 'TRANSPORT') {
      base = parseFloat((selectedService.base_fare || '0').toString().replace(/[^\d.]/g, '')) || 0;
      rate = parseFloat((selectedService.per_km_rate || '0').toString().replace(/[^\d.]/g, '')) || 0;
      const dist = parseFloat(distance || 0) || 0;

      if (base > 0 || rate > 0) {
        transportFees = base + (dist * rate);
        subtotal = transportFees;
      } else {
        const priceStr = (selectedService.price || '0').toString();
        flatPrice = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
        subtotal = flatPrice;
      }
    } else {
      const priceStr = (selectedService.price || '0').toString();
      flatPrice = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
      subtotal = flatPrice;
    }

    const tax = subtotal * 0.12;
    const total = subtotal + tax;

    return {
      subtotal: parseFloat(subtotal) || 0,
      tax: parseFloat(tax) || 0,
      total: parseFloat(total) || 0,
      base,
      rate,
      transportFees,
      flatPrice,
      isTransport: cat === 'TRANSPORT' && (base > 0 || rate > 0)
    };
  };

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.preferredDate) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const response = await fetch(`/api/available-slots?date=${formData.preferredDate}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.availableSlots)) {
          setAvailableSlots(data.availableSlots);
          if (formData.preferredTime && !data.availableSlots.includes(formData.preferredTime)) {
            setFormData(prev => ({ ...prev, preferredTime: '' }));
          }
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        const fallbackSlots = [];
        for (let i = 0; i < 24; i++) {
          const h = i % 12 || 12;
          const ampm = i < 12 ? 'AM' : 'PM';
          fallbackSlots.push(`${h}:00 ${ampm}`);
        }
        setAvailableSlots(fallbackSlots);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (isSubmitting || confirmedAppointment) return;
    fetchAvailableSlots();
  }, [formData.preferredDate, confirmedAppointment, isSubmitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = useCallback((pickup, dest, dist) => {
    if (pickup && pickup.address) {
      setFormData(prev => ({
        ...prev,
        pickupLocation: pickup.address,
        pickupCoords: pickup.coords
      }));
    }
    if (dest && dest.address) {
      setFormData(prev => ({
        ...prev,
        destinationLocation: dest.address,
        destCoords: dest.coords
      }));
    }
    if (dist > 0) {
      setDistance(dist);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const fees = calculateFees();
      const payload = {
        ...formData,
        serviceType: selectedService?.name,
        specialistId: selectedStaff?.id,
        totalAmount: fees.total,
        paymentMethod
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setConfirmedAppointment(data.appointment);
        setSubmitStatus({ type: 'success', message: 'Appointment booked successfully!' });
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Failed to book appointment' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'service', label: 'Services', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'staff', label: 'Staff', icon: <Search className="w-4 h-4" /> },
    { id: 'datetime', label: 'Date & Time', icon: <Settings className="w-4 h-4" /> },
    { id: 'details', label: 'Basic Details', icon: <Settings className="w-4 h-4" /> },
    { id: 'summary', label: 'Summary', icon: <Check className="w-4 h-4" /> }
  ];

  if (confirmedAppointment) {
    return (
      <div className="bg-white p-8 border border-gray-200 shadow-sm text-center animate-fadeIn">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2 uppercase tracking-tighter">Booking Confirmed!</h3>
        <p className="text-gray-500 mb-8">Your appointment has been successfully scheduled. A confirmation email has been sent to {formData.email}.</p>
        
        <div className="bg-gray-50 p-6 mb-8 text-left space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Service:</span><span className="font-bold">{selectedService?.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Date:</span><span className="font-bold">{formData.preferredDate}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Time:</span><span className="font-bold text-[#0f62fe]">{formData.preferredTime}</span></div>
          <div className="flex justify-between text-sm border-t border-gray-200 pt-3"><span className="text-gray-500">Order ID:</span><span className="font-mono font-bold">#{confirmedAppointment.id}</span></div>
        </div>

        <button onClick={() => window.location.reload()} className="carbon-btn-primary px-10 py-4 font-bold uppercase tracking-widest text-[12px]">
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e0e0e0] shadow-sm overflow-hidden flex flex-col min-h-[700px]">
      {/* Horizontal Stepper Top */}
      <div className="w-full bg-[#f4f4f4] border-b border-[#e0e0e0] p-8 md:p-12">
        <div className="max-w-4xl mx-auto relative">
          {/* Progress Line Background */}
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-0"></div>
          
          {/* Active Progress Line */}
          <div 
            className="absolute top-5 left-0 h-1 bg-[#24a148] transition-all duration-500 ease-in-out -z-0"
            style={{ 
              width: `${(steps.findIndex(s => s.id === step) / (steps.length - 1)) * 100}%` 
            }}
          ></div>

          <div className="flex justify-between items-start relative z-10">
            {steps.map((s, idx) => {
              const isActive = step === s.id;
              const isCompleted = steps.findIndex(stepObj => stepObj.id === step) > idx;
              
              return (
                <div key={s.id} className="flex flex-col items-center group cursor-pointer" onClick={() => {
                  // Only allow jumping back to completed steps
                  if (isCompleted || isActive) {
                    setStep(s.id);
                  }
                }}>
                  <div className={`w-10 h-10 rounded-full force-circle flex items-center justify-center border-4 transition-all duration-300 ${
                    isActive 
                    ? 'bg-[#24a148] border-[#24a148] shadow-lg scale-110' 
                    : isCompleted 
                    ? 'bg-[#24a148] border-[#24a148] text-white' 
                    : 'bg-white border-gray-200 text-[#525252]'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span className={`text-xs font-black ${isActive ? 'text-white' : 'text-[#525252]'}`}>{idx + 1}</span>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center hidden md:block">
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-[#24a148]' : 'text-gray-400'}`}>
                      Step {idx + 1}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'text-[#161616]' : 'text-[#8d8d8d]'}`}>
                      {s.label}
                    </p>
                  </div>
                  
                  {/* Mobile Label */}
                  {isActive && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:hidden">
                      <p className="text-[10px] font-black text-[#161616] uppercase tracking-widest whitespace-nowrap">
                        {s.label}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {step === 'service' && (
          <div className="animate-fadeIn">
            <h3 className="text-3xl font-light text-[#161616] mb-2 uppercase tracking-tighter">Choose Service</h3>
            <p className="text-gray-500 mb-12 text-sm">Select the clinical or transport service you require.</p>
            
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
              {['All', 'Clinical', 'Transport', 'Home Care'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-[#161616] text-white border-[#161616]' : 'bg-white text-[#525252] border-[#e0e0e0] hover:border-[#8d8d8d]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingServices ? (
                <div className="col-span-full py-20 text-center text-gray-400 italic">Loading services...</div>
              ) : liveServices.filter(s => activeCategory === 'All' || s.category === activeCategory).map(service => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep('staff'); }}
                  className={`relative group flex flex-col bg-white border-2 transition-all duration-500 overflow-hidden ${
                    selectedService?.id === service.id 
                    ? 'border-[#24a148] shadow-2xl shadow-green-100 -translate-y-2' 
                    : 'border-gray-100 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {/* Service Icon/Photo Container */}
                  <div className="h-48 w-full bg-gray-50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-[104px] h-[104px] bg-white rounded-full force-circle shadow-lg border border-gray-100 flex items-center justify-center text-5xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out z-10">
                      {service.icon && (service.icon.startsWith('http') || service.icon.startsWith('/uploads')) ? (
                        <img src={service.icon} alt={service.name} className="w-full h-full object-contain rounded-full force-circle" />
                      ) : (
                        service.icon || '🏥'
                      )}
                    </div>
                    {/* Category Tag */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[8px] font-black uppercase tracking-[2px] text-[#525252] border border-gray-100 shadow-sm">
                      {service.category || 'General'}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-black text-[#161616] uppercase tracking-tighter text-[15px] leading-tight group-hover:text-[#24a148] transition-colors">
                        {service.name}
                      </h4>
                      <div className="text-[#24a148] font-mono font-black text-sm whitespace-nowrap bg-green-50 px-2 py-0.5">
                        {service.price}
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-[#525252] leading-relaxed mb-6 line-clamp-3 font-medium opacity-80 italic">
                      "{service.description || 'Experience our professional and dedicated healthcare service tailored to your specific needs.'}"
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#24a148]" /> {service.duration || '30M'}</span>
                        <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> 4.9</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${selectedService?.id === service.id ? 'bg-[#24a148] text-white scale-125' : 'bg-gray-100 text-gray-400 group-hover:bg-[#161616] group-hover:text-white'}`}>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedService?.id === service.id && (
                    <div className="absolute top-0 right-0 w-12 h-12 bg-[#24a148] flex items-center justify-center translate-x-6 -translate-y-6 rotate-45 shadow-lg">
                      <Check className="w-4 h-4 text-white -rotate-45 translate-y-2" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'staff' && (
          <div className="animate-fadeIn">
            <h3 className="text-3xl font-light text-[#161616] mb-2 uppercase tracking-tighter">Select Staff</h3>
            <p className="text-gray-500 mb-12 text-sm">Choose a preferred specialist or select 'Any Staff' for faster booking.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffMembers.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => { setSelectedStaff(staff); setStep('datetime'); }}
                  className={`p-6 border text-left transition-all flex items-center gap-6 group ${selectedStaff?.id === staff.id ? 'border-[#24a148] bg-green-50/30' : 'border-[#e0e0e0] hover:border-[#8d8d8d] hover:bg-gray-50'}`}
                >
                  <div className="w-20 h-20 bg-[#e0e0e0] flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                    {staff.image_url ? <img src={staff.image_url} alt={staff.name} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#161616] uppercase tracking-tight text-[13px]">{staff.name}</h4>
                    <p className="text-[9px] text-[#24a148] font-bold uppercase tracking-widest mb-4">{staff.title || 'Specialist'}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-1 italic">{staff.email}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#24a148] transition-colors" />
                </button>
              ))}
            </div>
            
            <button onClick={() => setStep('service')} className="mt-12 text-[#24a148] font-bold uppercase text-[11px] flex items-center gap-2 hover:underline tracking-widest">
              <ChevronLeft className="w-3 h-3" /> Back to Services
            </button>
          </div>
        )}

        {step === 'datetime' && (
          <div className="animate-fadeIn">
            <h3 className="text-3xl font-light text-[#161616] mb-8 uppercase tracking-tighter">Date & Time</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="block text-[9px] font-bold text-[#525252] uppercase tracking-widest">Select Date</label>
                <input
                  type="date"
                  name="preferredDate"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[9px] font-bold text-[#525252] uppercase tracking-widest">Available Time Slots</label>
                {!formData.preferredDate ? (
                  <div className="p-12 border border-dashed border-[#e0e0e0] text-center text-gray-400 text-xs italic">
                    Please select a date first
                  </div>
                ) : loadingSlots ? (
                  <div className="p-12 text-center text-gray-400 text-xs italic animate-pulse">
                    Checking availability...
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => setFormData({ ...formData, preferredTime: time })}
                        className={`py-3 text-[11px] font-bold border transition-all uppercase tracking-tight ${formData.preferredTime === time ? 'bg-[#24a148] text-white border-[#24a148]' : 'bg-white text-[#161616] border-[#e0e0e0] hover:border-[#8d8d8d]'}`}
                      >
                        {time}
                      </button>
                    ))}
                    {availableSlots.length === 0 && (
                      <div className="col-span-full py-8 text-center text-red-500 text-xs font-medium">No slots available for this date.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 flex justify-between items-center">
              <button onClick={() => setStep('staff')} className="text-[#24a148] font-bold uppercase text-[11px] flex items-center gap-2 hover:underline tracking-widest">
                <ChevronLeft className="w-3 h-3" /> Back to Staff
              </button>
              <button
                disabled={!formData.preferredDate || !formData.preferredTime}
                onClick={() => setStep('details')}
                className="w-auto py-3 px-10 bg-[#24a148] text-white text-[12px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:bg-[#1e8a3d] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Next: Basic Details
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="animate-fadeIn">
            <h3 className="text-3xl font-light text-[#161616] mb-8 uppercase tracking-tighter">Your Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#525252] uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#525252] uppercase tracking-widest">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+63 900 000 0000"
                  className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#525252] uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#525252] uppercase tracking-widest">Agent / Promo Code</label>
                <input
                  type="text"
                  name="agentCode"
                  value={formData.agentCode}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#525252] uppercase tracking-widest">Pickup Location</label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(e) => {
                    setFormData({ ...formData, pickupLocation: e.target.value });
                    setMapAction({ type: 'pickup', address: e.target.value });
                  }}
                  placeholder="Search pickup..."
                  className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#525252] uppercase tracking-widest">Destination</label>
                <input
                  type="text"
                  name="destinationLocation"
                  value={formData.destinationLocation}
                  onChange={(e) => {
                    setFormData({ ...formData, destinationLocation: e.target.value });
                    setMapAction({ type: 'dest', address: e.target.value });
                  }}
                  placeholder="Search destination..."
                  className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"
                />
              </div>
            </div>

            {selectedService?.category?.toUpperCase() === 'TRANSPORT' && showMapInForm && TransportMap && (
              <div className="mb-8 animate-fadeIn">
                <p className="text-[9px] font-bold text-[#24a148] uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#24a148] rounded-full animate-pulse"></span>
                    Interactive Route Picker
                  </span>
                  {distance > 0 && <span className="text-[#24a148]">Route Computed: {distance.toFixed(2)} km</span>}
                </p>
                <TransportMap
                  mapAction={mapAction}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            )}

            <div className="space-y-1 mb-12">
              <label className="block text-[9px] font-bold text-[#525252] uppercase tracking-widest">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Any specific concerns..."
                className="w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0 mt-1 resize-none h-14"
              ></textarea>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep('datetime')} className="text-[#24a148] font-bold uppercase text-[11px] flex items-center gap-2 hover:underline tracking-widest">
                <ChevronLeft className="w-3 h-3" /> Back to Time
              </button>
              <button
                disabled={!formData.fullName || !formData.phoneNumber || !formData.email}
                onClick={() => setStep('summary')}
                className="w-auto py-3 px-10 bg-[#24a148] text-white text-[12px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:bg-[#1e8a3d] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Next: Review & Payment
              </button>
            </div>
          </div>
        )}

        {step === 'summary' && (
          <div className="animate-fadeIn">
            <h3 className="text-3xl font-light text-[#161616] mb-8 uppercase tracking-tighter">Your Booking Summary</h3>

            <div className="flex flex-col md:flex-row border border-[#e0e0e0] mb-8">
              <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[#e0e0e0]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-bold text-[#525252] uppercase tracking-[2px]">Service</span>
                  <span className="p-2 bg-green-50 text-[#24a148] rounded-full">{selectedService?.icon}</span>
                </div>
                <div className="text-xl font-bold text-[#161616] leading-tight mb-1 uppercase italic tracking-tighter">{selectedService?.name}</div>
                <div className="text-[11px] text-[#525252] font-medium uppercase tracking-widest">By {selectedStaff?.name}</div>
              </div>
              <div className="flex-1 p-6">
                <div className="text-[9px] font-bold text-[#525252] uppercase tracking-[2px] mb-4 text-center md:text-left">Date & Time</div>
                <div className="text-lg font-medium text-[#161616] text-center md:text-left uppercase tracking-tight">
                  {formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '---'}
                </div>
                <div className="text-xl font-bold text-[#24a148] text-center md:text-left mt-1 italic">{formData.preferredTime || '---'}</div>
              </div>
            </div>

            <div className="space-y-4 mb-8 border-b border-[#e0e0e0] pb-8">
              {calculateFees().isTransport ? (
                <>
                  <div className="flex justify-between text-sm text-[#525252]">
                    <span>Base Fare</span>
                    <span className="font-mono">PHP {calculateFees().base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#525252]">
                    <span>Distance Rate (PHP {calculateFees().rate}/km)</span>
                    <span className="font-mono">PHP {(calculateFees().rate * distance).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-[#24a148] italic font-bold px-4 py-2 bg-green-50 uppercase tracking-widest">
                    <span>Calculated distance: {distance.toFixed(2)} KM</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm text-[#525252]">
                  <span>Service Price</span>
                  <span className="font-mono">PHP {calculateFees().subtotal.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 flex justify-between text-sm font-bold text-[#161616]">
                <span>Subtotal</span>
                <span className="font-mono">PHP {calculateFees().subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm text-[#525252]">
                <span>Tax (12%)</span>
                <span className="font-mono text-[#24a148]">PHP {calculateFees().tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-12">
              <span className="text-lg font-bold text-[#161616] uppercase tracking-tighter">Total Amount Payable</span>
              <span className="text-3xl font-bold text-[#fa4d56] font-mono">PHP {calculateFees().total.toFixed(2)}</span>
            </div>

            <div className="mb-12">
              <h4 className="text-[9px] font-bold text-[#525252] uppercase tracking-[1px] mb-6">Select Payment Method</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'local', label: 'Pay Locally', icon: <Store className="w-4 h-4 text-[#24a148]" /> },
                  { id: 'paypal', label: 'PayPal', icon: <CreditCard className="w-4 h-4 text-[#24a148]" /> },
                  { id: 'stripe', label: 'Stripe', icon: <Lock className="w-4 h-4 text-[#24a148]" /> },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 border flex items-center justify-center gap-3 transition-all ${paymentMethod === method.id ? 'border-[#24a148] bg-green-50/50 ring-1 ring-[#24a148]' : 'border-[#e0e0e0] hover:border-[#8d8d8d]'}`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${paymentMethod === method.id ? 'text-[#24a148]' : 'text-[#525252]'}`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep('details')} className="text-[#24a148] font-bold uppercase text-[11px] flex items-center gap-2 hover:underline tracking-widest">
                <ChevronLeft className="w-3 h-3" /> Back to Details
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-auto py-4 px-16 bg-[#24a148] text-white text-[12px] font-bold uppercase tracking-[2px] shadow-lg hover:shadow-xl hover:bg-[#1e8a3d] active:scale-[0.98] transition-all flex items-center gap-4 group"
              >
                {isSubmitting ? 'Processing...' : 'Confirm & Book Appointment'}
                {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
            {submitStatus.message && (
              <div className={`mt-6 p-4 text-center text-sm font-bold uppercase tracking-widest ${submitStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {submitStatus.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentForm;
