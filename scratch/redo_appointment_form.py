import os

file_path = r'c:\website\queuing-system\src\App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_appointment_form = """function AppointmentForm() {
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
  const [distance, setDistance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const calculateFees = () => {
    if (!selectedService) return { subtotal: 0, tax: 0, total: 0 };
    let subtotal = 0;
    const cat = (selectedService.category || '').trim().toUpperCase();
    if (cat === 'TRANSPORT') {
      const base = parseFloat((selectedService.base_fare || '0').toString().replace(/[^\\d.]/g, '')) || 0;
      const rate = parseFloat((selectedService.per_km_rate || '0').toString().replace(/[^\\d.]/g, '')) || 0;
      subtotal = base + (distance * rate);
    } else {
      subtotal = parseFloat((selectedService.price || '0').toString().replace(/[^\\d.]/g, '')) || 0;
    }
    const tax = subtotal * 0.12;
    return { subtotal, tax, total: subtotal + tax };
  };

  useEffect(() => {
    if (!formData.preferredDate) return;
    setLoadingSlots(true);
    fetch(`/api/available-slots?date=${formData.preferredDate}`).then(r => r.json()).then(data => {
      if (data.success) setAvailableSlots(data.availableSlots);
    }).finally(() => setLoadingSlots(false));
  }, [formData.preferredDate]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const fees = calculateFees();
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, serviceType: selectedService?.name, totalAmount: fees.total })
      });
      const data = await res.json();
      if (data.success) setConfirmedAppointment(data.appointment);
    } finally { setIsSubmitting(false); }
  };

  const [step, setStep] = useState('service');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [liveServices, setLiveServices] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    Promise.all([fetch('/api/specialists'), fetch('/api/booking-services')]).then(async ([r1, r2]) => {
      const d1 = await r1.json();
      const d2 = await r2.json();
      if (d1.success) setStaffMembers([{ id: 'any', name: 'Any Staff' }, ...d1.specialists]);
      if (d2.success) setLiveServices(d2.services);
    });
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
    <div className="min-h-screen bg-[#f3f4f6] py-12 px-4">
      <div className="paymongo-onboarding bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden max-w-[680px] mx-auto">
        {confirmedAppointment ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="pm-title text-2xl mb-2">Booking Confirmed!</h3>
            <p className="pm-subtitle mb-8 text-lg">Thank you, {confirmedAppointment.full_name}. Reference: #{confirmedAppointment.id}</p>
            <button onClick={() => window.location.reload()} className="pm-btn-next w-full">Book Another Service</button>
          </div>
        ) : (
          <>
            {/* PayMongo Style Stepper */}
            <div className="px-8 pt-8 pb-4 border-b border-gray-50 flex items-center justify-between">
              {steps.map((s, i) => {
                const isActive = step === s.id;
                const stepIdx = steps.findIndex(x => x.id === step);
                const isCompleted = stepIdx > i;
                return (
                  <div key={s.id} className="flex flex-col items-center">
                    <div className={`pm-stepper-circle ${isActive ? 'active' : isCompleted ? 'done' : 'inactive'}`}>
                      {isCompleted ? '✓' : (i + 1)}
                    </div>
                    <span className={`pm-stepper-label ${isActive ? 'active' : 'inactive'}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-8">
              {step === 'service' && (
                <div>
                  <h3 className="pm-title mb-1">Select Service</h3>
                  <p className="pm-subtitle mb-8">Choose the type of service you need.</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredServices.map(s => (
                      <div key={s.id} onClick={() => { setSelectedService(s); setStep('staff'); }} className={`pm-radio-option ${selectedService?.id === s.id ? 'selected' : ''}`}>
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
                <div>
                  <h3 className="pm-title mb-1">Choose Specialist</h3>
                  <p className="pm-subtitle mb-8">Select your preferred professional.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffMembers.map(m => (
                      <div key={m.id} onClick={() => { setSelectedStaff(m); setStep('datetime'); }} className={`pm-radio-option items-center ${selectedStaff?.id === m.id ? 'selected' : ''}`}>
                        <div className="flex-1">
                          <h4 className="pm-radio-title">{m.name}</h4>
                          <p className="pm-radio-desc">{m.title || m.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep('service')} className="mt-8 text-indigo-600 font-medium text-sm flex items-center gap-2">← Back to Services</button>
                </div>
              )}

              {step === 'datetime' && (
                <div>
                  <h3 className="pm-title mb-1">Select Schedule</h3>
                  <p className="pm-subtitle mb-8">Choose your preferred date and time.</p>
                  <div className="space-y-6">
                    <div>
                      <label className="pm-label">Preferred Date</label>
                      <input type="date" value={formData.preferredDate} onChange={(e) => setFormData({...formData, preferredDate: e.target.value})} className="pm-input" />
                    </div>
                    <div>
                      <label className="pm-label">Available Time Slots</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableSlots.map(s => (
                          <button key={s} onClick={() => setFormData({...formData, preferredTime: s})} className={`p-3 text-sm rounded-lg border transition-all ${formData.preferredTime === s ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-700'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    <button onClick={() => setStep('staff')} className="text-indigo-600 font-medium text-sm">← Back</button>
                    <button disabled={!formData.preferredDate || !formData.preferredTime} onClick={() => setStep('details')} className="pm-btn-next">Continue</button>
                  </div>
                </div>
              )}

              {step === 'details' && (
                <div>
                  <h3 className="pm-title mb-1">Your Details</h3>
                  <p className="pm-subtitle mb-8">Please provide your contact information.</p>
                  <div className="space-y-4">
                    <div><label className="pm-label">Full Name</label><input name="fullName" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="John Doe" className="pm-input" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="pm-label">Phone</label><input name="phoneNumber" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="0912..." className="pm-input" /></div>
                      <div><label className="pm-label">Email</label><input name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" className="pm-input" /></div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    <button onClick={() => setStep('datetime')} className="text-indigo-600 font-medium text-sm">← Back</button>
                    <button disabled={!formData.fullName || !formData.phoneNumber || !formData.email} onClick={() => setStep('summary')} className="pm-btn-next">Review Booking</button>
                  </div>
                </div>
              )}

              {step === 'summary' && (
                <div>
                  <h3 className="pm-title mb-1">Review & Confirm</h3>
                  <p className="pm-subtitle mb-8">Double check your details.</p>
                  <div className="pm-card-tax mb-8">
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between">
                        <div><p className="pm-radio-title">{selectedService?.name}</p><p className="pm-radio-desc">with {selectedStaff?.name}</p></div>
                        <p className="font-bold">PHP {calculateFees().subtotal.toFixed(2)}</p>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="pm-title">Total</span>
                        <span className="text-2xl font-bold text-indigo-600">PHP {calculateFees().total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setStep('details')} className="text-indigo-600 font-medium text-sm">← Back</button>
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

start_marker = "function AppointmentForm() {"
start_idx = content.find(start_marker)

if start_idx != -1:
    brace_count = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
    
    if end_idx != -1:
        new_content = content[:start_idx] + new_appointment_form + content[end_idx:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("AppointmentForm replaced successfully.")
    else:
        print("Could not find end of AppointmentForm function.")
else:
    print("Could not find start of AppointmentForm function.")
