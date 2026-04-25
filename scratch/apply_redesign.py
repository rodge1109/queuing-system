import os
import re

file_path = r'c:\website\queuing-system\src\App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The entire new AppointmentForm content
new_form_content = """function AppointmentForm() {
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

  const calculateFees = () => {
    if (!selectedService) return { subtotal: 0, tax: 0, total: 0 };
    let subtotal = 0;
    const cat = (selectedService.category || '').trim().toUpperCase();
    let base = 0, rate = 0, transportFees = 0, flatPrice = 0;

    if (cat === 'TRANSPORT') {
      base = parseFloat((selectedService.base_fare || '0').toString().replace(/[^\\d.]/g, '')) || 0;
      rate = parseFloat((selectedService.per_km_rate || '0').toString().replace(/[^\\d.]/g, '')) || 0;
      const dist = parseFloat(distance || 0) || 0;
      if (base > 0 || rate > 0) {
        transportFees = base + (dist * rate);
        subtotal = transportFees;
      } else {
        flatPrice = parseFloat((selectedService.price || '0').toString().replace(/[^\\d.]/g, '')) || 0;
        subtotal = flatPrice;
      }
    } else {
      flatPrice = parseFloat((selectedService.price || '0').toString().replace(/[^\\d.]/g, '')) || 0;
      subtotal = flatPrice;
    }
    const tax = subtotal * 0.12;
    const total = subtotal + tax;
    return { subtotal, tax, total, base, rate, transportFees, flatPrice, isTransport: cat === 'TRANSPORT' && (base > 0 || rate > 0) };
  };

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.preferredDate) { setAvailableSlots([]); return; }
      setLoadingSlots(true);
      try {
        const response = await fetch(`/api/available-slots?date=${formData.preferredDate}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.availableSlots)) {
          setAvailableSlots(data.availableSlots);
          if (formData.preferredTime && !data.availableSlots.includes(formData.preferredTime)) {
            setFormData(prev => ({ ...prev, preferredTime: '' }));
          }
        }
      } catch (e) {
        const fallback = [];
        for (let i = 8; i < 18; i++) {
          const h = i % 12 || 12;
          fallback.push(`${h}:00 ${i < 12 ? 'AM' : 'PM'}`);
        }
        setAvailableSlots(fallback);
      } finally { setLoadingSlots(false); }
    };
    if (!isSubmitting && !confirmedAppointment) fetchAvailableSlots();
  }, [formData.preferredDate, confirmedAppointment, isSubmitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = useCallback((pickup, dest, dist) => {
    if (pickup?.address) setFormData(prev => ({ ...prev, pickupLocation: pickup.address, pickupCoords: pickup.coords || prev.pickupCoords }));
    if (dest?.address) setFormData(prev => ({ ...prev, destinationLocation: dest.address, destCoords: dest.coords || prev.destCoords }));
    if (dist !== undefined) setDistance(dist);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowMapInForm(false);
    try {
      const currentFees = calculateFees();
      const finalData = { ...formData, serviceType: selectedService?.name, specialistId: selectedStaff?.id, totalAmount: currentFees.total };
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      const data = await res.json();
      if (data.success) {
        setConfirmedAppointment(data.appointment);
        setFormData({ fullName: '', phoneNumber: '', email: '', serviceType: '', preferredDate: '', preferredTime: '', notes: '', pickupLocation: '', destinationLocation: '', pickupCoords: null, destCoords: null });
      }
    } catch (e) { console.error(e); }
    finally { setTimeout(() => setIsSubmitting(false), 500); }
  };

  const [step, setStep] = useState('service');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [liveServices, setLiveServices] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, servicesRes] = await Promise.all([fetch('/api/specialists'), fetch('/api/booking-services')]);
        const staffData = await staffRes.json();
        const servicesData = await servicesRes.json();
        if (staffData.success) setStaffMembers([{ id: 'any', name: 'Any Staff', email: 'Next available', image_url: null }, ...staffData.specialists]);
        if (servicesData.success) setLiveServices(servicesData.services);
      } catch (e) {}
    };
    fetchData();
  }, []);

  const steps = [
    { id: 'service', label: 'Services' },
    { id: 'staff', label: 'Staff' },
    { id: 'datetime', label: 'Schedule' },
    { id: 'details', label: 'Details' },
    { id: 'summary', label: 'Confirm' }
  ];

  const categories = ['All', ...new Set(liveServices.map(s => (s.category || '').trim().toUpperCase()).filter(Boolean))];
  const filteredServices = activeCategory === 'All' ? liveServices : liveServices.filter(s => (s.category || '').trim().toUpperCase() === activeCategory.toUpperCase());

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-12 px-4 sm:px-6">
      <div className="paymongo-onboarding bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        {confirmedAppointment ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="pm-title text-2xl mb-2">Booking Confirmed!</h3>
            <p className="pm-subtitle mb-8 text-lg">Thank you, {confirmedAppointment.full_name}. Your reference ID is #{confirmedAppointment.id}</p>
            <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-100">
               <div className="flex justify-between mb-2">
                 <span className="pm-label">Service</span>
                 <span className="font-medium">{confirmedAppointment.service_type}</span>
               </div>
               <div className="flex justify-between">
                 <span className="pm-label">Amount Paid</span>
                 <span className="font-bold text-indigo-600">PHP {parseFloat(confirmedAppointment.total_amount).toFixed(2)}</span>
               </div>
            </div>
            <button 
              onClick={() => { setConfirmedAppointment(null); setStep('service'); setSelectedService(null); }}
              className="pm-btn-next w-full"
            >
              Book Another Service
            </button>
          </div>
        ) : (
          <>
            {/* PayMongo Style Stepper */}
            <div className="px-8 pt-8 pb-4 border-b border-gray-50">
              <div className="flex items-center justify-between">
                {steps.map((s, i) => {
                  const isActive = step === s.id;
                  const isCompleted = steps.findIndex(x => x.id === step) > i;
                  return (
                    <React.Fragment key={s.id}>
                      <div className="flex flex-col items-center">
                        <div className={`pm-stepper-circle ${isActive ? 'active' : isCompleted ? 'done' : 'inactive'}`}>
                          {isCompleted ? <Check className="w-5 h-5" /> : (i + 1)}
                        </div>
                        <span className={`pm-stepper-label ${isActive ? 'active' : 'inactive'}`}>{s.label}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`pm-connector ${isCompleted ? 'active' : ''}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="p-8">
              {step === 'service' && (
                <div className="animate-fadeIn">
                  <h3 className="pm-title mb-1">Select Service</h3>
                  <p className="pm-subtitle mb-8">Choose the type of service you need.</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredServices.map(s => (
                      <div key={s.id} onClick={() => { setSelectedService(s); setStep('staff'); }} className={`pm-radio-option ${selectedService?.id === s.id ? 'selected' : ''}`}>
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><ServiceIconRender iconName={s.icon} className="w-6 h-6" /></div>
                        <div className="flex-1">
                          <h4 className="pm-radio-title">{s.name}</h4>
                          <p className="pm-radio-desc">PHP {s.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 'staff' && (
                <div className="animate-fadeIn">
                  <h3 className="pm-title mb-1">Choose Specialist</h3>
                  <p className="pm-subtitle mb-8">Select your preferred professional.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffMembers.map(m => (
                      <div key={m.id} onClick={() => { setSelectedStaff(m); setStep('datetime'); }} className={`pm-radio-option items-center ${selectedStaff?.id === m.id ? 'selected' : ''}`}>
                        <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-sm">
                          {m.image_url ? <img src={m.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><User className="w-6 h-6" /></div>}
                        </div>
                        <div className="flex-1">
                          <h4 className="pm-radio-title">{m.name}</h4>
                          <p className="pm-radio-desc">{m.title || m.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep('service')} className="mt-8 text-indigo-600 font-medium text-sm flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
                </div>
              )}

              {step === 'datetime' && (
                <div className="animate-fadeIn">
                  <h3 className="pm-title mb-1">Select Schedule</h3>
                  <p className="pm-subtitle mb-8">Choose your preferred date and time.</p>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <input type="date" value={formData.preferredDate} onChange={(e) => setFormData({...formData, preferredDate: e.target.value})} className="pm-input" />
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {availableSlots.map(s => (
                        <button key={s} onClick={() => setFormData({...formData, preferredTime: s})} className={`w-full p-3 text-sm rounded-lg border transition-all ${formData.preferredTime === s ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    <button onClick={() => setStep('staff')} className="text-indigo-600 font-medium text-sm flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
                    <button disabled={!formData.preferredDate || !formData.preferredTime} onClick={() => setStep('details')} className="pm-btn-next">Continue</button>
                  </div>
                </div>
              )}

              {step === 'details' && (
                <div className="animate-fadeIn">
                  <h3 className="pm-title mb-1">Your Details</h3>
                  <p className="pm-subtitle mb-8">Please provide your contact information.</p>
                  <div className="space-y-4">
                    <div><label className="pm-label">Full Name</label><input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="pm-input" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="pm-label">Phone Number</label><input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="09123456789" className="pm-input" /></div>
                      <div><label className="pm-label">Email Address</label><input name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="pm-input" /></div>
                    </div>
                    {selectedService?.category?.toUpperCase() === 'TRANSPORT' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="pm-label">Pickup</label><LocationAutocomplete value={formData.pickupLocation} onSelect={(p) => handleLocationSelect(p, null, 0)} className="pm-input" /></div>
                        <div><label className="pm-label">Destination</label><LocationAutocomplete value={formData.destinationLocation} onSelect={(p) => handleLocationSelect(null, p, 0)} className="pm-input" /></div>
                      </div>
                    )}
                    <div><label className="pm-label">Notes (Optional)</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="pm-input h-auto py-2" /></div>
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    <button onClick={() => setStep('datetime')} className="text-indigo-600 font-medium text-sm flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
                    <button disabled={!formData.fullName || !formData.phoneNumber || !formData.email} onClick={() => setStep('summary')} className="pm-btn-next">Review Booking</button>
                  </div>
                </div>
              )}

              {step === 'summary' && (
                <div className="animate-fadeIn">
                  <h3 className="pm-title mb-1">Review & Confirm</h3>
                  <p className="pm-subtitle mb-8">Double check your details before proceeding.</p>
                  <div className="pm-card-tax">
                    <div className="pm-card-tax-header"><ClipboardList className="w-4 h-4" /> Booking Summary</div>
                    <div className="pm-card-tax-body space-y-4">
                      <div className="flex justify-between"><div><p className="pm-radio-title">{selectedService?.name}</p><p className="pm-radio-desc">with {selectedStaff?.name}</p></div><p className="font-bold">PHP {calculateFees().subtotal.toFixed(2)}</p></div>
                      <div className="flex justify-between text-sm text-gray-500"><span>Service Fee (Tax 12%)</span><span>PHP {calculateFees().tax.toFixed(2)}</span></div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center"><span className="pm-title">Total</span><span className="text-2xl font-bold text-indigo-600">PHP {calculateFees().total.toFixed(2)}</span></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setStep('details')} className="text-indigo-600 font-medium text-sm flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="pm-btn-next px-12">{isSubmitting ? 'Processing...' : 'Confirm & Book'}</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}"""

# Use re.DOTALL to match across multiple lines
# We need to escape backslashes in the new_form_content for the regex replacement
escaped_form_content = new_form_content.replace('\\', '\\\\')

pattern = re.compile(r'function AppointmentForm\(\) \{.*?^\}', re.DOTALL | re.MULTILINE)
if pattern.search(content):
    new_content = pattern.sub(escaped_form_content, content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_content)
    print("Successfully redesigned AppointmentForm.")
else:
    print("Could not find AppointmentForm function to replace.")
