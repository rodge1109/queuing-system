import os

file_path = r'c:\\website\\queuing-system\\src\\App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def replace_function(lines, func_name, new_code):
    start_line = -1
    end_line = -1
    brace_count = 0
    found_start = False
    
    new_lines = []
    
    for i, line in enumerate(lines):
        if not found_start and f'function {func_name}' in line:
            start_line = i
            found_start = True
            brace_count += line.count('{') - line.count('}')
            continue
            
        if found_start:
            brace_count += line.count('{') - line.count('}')
            if brace_count == 0:
                end_line = i
                break
    
    if start_line != -1 and end_line != -1:
        return lines[:start_line] + [new_code + '\n'] + lines[end_line+1:]
    return lines

new_metric_card = """function MetricCard({ label, value, max = 240, icon, color, active, size = 'md' }) {
  const canvasRef = useRef(null);
  const isSm = size === 'sm';
  const dim = isSm ? 'w-28 h-28' : 'w-56 h-56';
  const speedRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    const targetSpeed = parseFloat(value) || 0;
    const MAX_SPEED = max;
    const W = 300, H = 300, CX = 150, CY = 160, R = 120;
    const START_ANGLE = Math.PI * 0.75;
    const END_ANGLE   = Math.PI * 2.25;
    const TOTAL_ARC   = END_ANGLE - START_ANGLE;

    const getColor = (speed) => {
      const p = speed / MAX_SPEED;
      if (p < 0.33) return '#10b981';
      if (p < 0.66) return '#f59e0b';
      return '#ef4444';
    };

    const isDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

    const draw = (speed) => {
      ctx.clearRect(0, 0, W, H);
      const dark = isDark();
      const bgTrack = dark ? '#374151' : '#e5e7eb';
      const textPrimary = dark ? '#f9fafb' : '#111827';
      const textSecondary = dark ? '#9ca3af' : '#6b7280';

      ctx.beginPath();
      ctx.arc(CX, CY, R, START_ANGLE, END_ANGLE);
      ctx.strokeStyle = bgTrack;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.stroke();

      const prog = Math.min(speed / MAX_SPEED, 1);
      if (prog > 0) {
        ctx.beginPath();
        ctx.arc(CX, CY, R, START_ANGLE, START_ANGLE + TOTAL_ARC * prog);
        ctx.strokeStyle = getColor(speed);
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      const tickCount = 24;
      for (let i = 0; i <= tickCount; i++) {
        const angle = START_ANGLE + (TOTAL_ARC * i) / tickCount;
        const isMajor = i % 4 === 0;
        const x1 = CX + Math.cos(angle) * (R + 8);
        const y1 = CY + Math.sin(angle) * (R + 8);
        const x2 = CX + Math.cos(angle) * (R + 20);
        const y2 = CY + Math.sin(angle) * (R + 20);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isMajor ? textSecondary : (dark ? '#4b5563' : '#d1d5db');
        ctx.lineWidth = isMajor ? 2 : 1;
        ctx.stroke();
        if (isMajor) {
          const tickLabel = Math.round((i / tickCount) * MAX_SPEED);
          const lx = CX + Math.cos(angle) * (R + 34);
          const ly = CY + Math.sin(angle) * (R + 34);
          ctx.font = '500 11px system-ui, sans-serif';
          ctx.fillStyle = textSecondary;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tickLabel, lx, ly);
        }
      }

      const needleAngle = START_ANGLE + (TOTAL_ARC * prog);
      const nx = CX + Math.cos(needleAngle) * (R - 18);
      const ny = CY + Math.sin(needleAngle) * (R - 18);
      const bx = CX + Math.cos(needleAngle + Math.PI) * 18;
      const by = CY + Math.sin(needleAngle + Math.PI) * 18;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = getColor(speed);
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(CX, CY, 10, 0, Math.PI * 2);
      ctx.fillStyle = getColor(speed);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(CX, CY, 5, 0, Math.PI * 2);
      ctx.fillStyle = dark ? '#1f2937' : '#ffffff';
      ctx.fill();

      ctx.font = '600 36px system-ui, sans-serif';
      ctx.fillStyle = textPrimary;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(speed), CX, CY + 42);

      ctx.font = '500 11px system-ui, sans-serif';
      ctx.fillStyle = textSecondary;
      ctx.fillText(label?.toUpperCase() || 'KM/H', CX, CY + 62);
    };

    const animate = () => {
      const diff = targetSpeed - speedRef.current;
      if (Math.abs(diff) < 0.1) {
        speedRef.current = targetSpeed;
        draw(speedRef.current);
        return;
      }
      speedRef.current += diff * 0.1;
      draw(speedRef.current);
      animFrame = requestAnimationFrame(animate);
    };
    animate();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => draw(speedRef.current);
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => {
      cancelAnimationFrame(animFrame);
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [value, max, label]);

  return (
    <div className={`relative flex flex-col items-center group transition-all ${active ? 'animate-pulse' : ''}`}>
      <div className={`relative ${dim} flex items-center justify-center`}>
        <canvas ref={canvasRef} width={300} height={300} className="w-full h-full drop-shadow-2xl" />
        {icon && (
          <div className="absolute top-[35%] opacity-20 text-gray-500 group-hover:opacity-40 transition-opacity">
            {React.cloneElement(icon, { size: isSm ? 16 : 24 })}
          </div>
        )}
      </div>
    </div>
  );
}"""

new_appointment_form = """function AppointmentForm() {
  const [formData, setFormData] = useState({
    fullName: '', phoneNumber: '', email: '', serviceType: '', preferredDate: '', preferredTime: '', notes: '', agentCode: '',
    pickupLocation: '', destinationLocation: '', pickupCoords: null, destCoords: null
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      const d1 = await r1.json(); const d2 = await r2.json();
      if (d1.success) setStaffMembers([{ id: 'any', name: 'Any Staff' }, ...d1.specialists]);
      if (d2.success) setLiveServices(d2.services);
    });
  }, []);

  const steps = [{ id: 'service', label: 'Services' }, { id: 'staff', label: 'Staff' }, { id: 'datetime', label: 'Schedule' }, { id: 'details', label: 'Details' }, { id: 'summary', label: 'Confirm' }];
  const categories = ['All', ...new Set(liveServices.map(s => (s.category || '').trim().toUpperCase()).filter(Boolean))];
  const filteredServices = activeCategory === 'All' ? liveServices : liveServices.filter(s => (s.category || '').trim().toUpperCase() === activeCategory.toUpperCase());

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-12 px-4">
      <div className="paymongo-onboarding bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        {confirmedAppointment ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10" /></div>
            <h3 className="pm-title text-2xl mb-2">Booking Confirmed!</h3>
            <p className="pm-subtitle mb-8">Reference ID: #{confirmedAppointment.id}</p>
            <button onClick={() => window.location.reload()} className="pm-btn-next w-full">Book Another</button>
          </div>
        ) : (
          <>
            <div className="px-8 pt-8 pb-4 border-b border-gray-50 flex items-center justify-between">
              {steps.map((s, i) => (
                <div key={s.id} className="flex flex-col items-center">
                  <div className={`pm-stepper-circle ${step === s.id ? 'active' : 'inactive'}`}>{i+1}</div>
                  <span className="pm-stepper-label">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="p-8">
              {step === 'service' && (
                <div>
                  <h3 className="pm-title mb-1">Select Service</h3>
                  <div className="flex gap-2 mb-8">{categories.map(c => <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-2 rounded-full text-xs ${activeCategory === c ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>{c}</button>)}</div>
                  <div className="grid grid-cols-2 gap-4">{filteredServices.map(s => <div key={s.id} onClick={() => { setSelectedService(s); setStep('staff'); }} className="pm-radio-option"><h4 className="pm-radio-title">{s.name}</h4><p className="pm-radio-desc">PHP {s.price}</p></div>)}</div>
                </div>
              )}
              {step === 'staff' && (
                <div>
                  <h3 className="pm-title mb-1">Choose Specialist</h3>
                  <div className="grid grid-cols-2 gap-4">{staffMembers.map(m => <div key={m.id} onClick={() => { setSelectedStaff(m); setStep('datetime'); }} className="pm-radio-option"><h4 className="pm-radio-title">{m.name}</h4></div>)}</div>
                </div>
              )}
              {step === 'datetime' && (
                <div>
                  <h3 className="pm-title mb-1">Select Schedule</h3>
                  <input type="date" onChange={e => setFormData({...formData, preferredDate: e.target.value})} className="pm-input mb-4" />
                  <div className="grid grid-cols-2 gap-2">{availableSlots.map(s => <button key={s} onClick={() => setFormData({...formData, preferredTime: s})} className="pm-input">{s}</button>)}</div>
                  <button onClick={() => setStep('details')} className="pm-btn-next mt-4">Continue</button>
                </div>
              )}
              {step === 'details' && (
                <div className="space-y-4">
                  <h3 className="pm-title">Your Details</h3>
                  <input placeholder="Full Name" onChange={e => setFormData({...formData, fullName: e.target.value})} className="pm-input" />
                  <input placeholder="Phone" onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="pm-input" />
                  <input placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} className="pm-input" />
                  <button onClick={() => setStep('summary')} className="pm-btn-next">Review</button>
                </div>
              )}
              {step === 'summary' && (
                <div>
                  <h3 className="pm-title">Confirm Booking</h3>
                  <div className="pm-card-tax p-6 mb-6">
                    <p className="pm-radio-title">{selectedService?.name}</p>
                    <p className="text-2xl font-bold text-indigo-600">Total: PHP {calculateFees().total.toFixed(2)}</p>
                  </div>
                  <button onClick={handleSubmit} className="pm-btn-next w-full">Confirm & Book</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}"""

lines = replace_function(lines, 'MetricCard', new_metric_card)
lines = replace_function(lines, 'AppointmentForm', new_appointment_form)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Redesign complete.")
