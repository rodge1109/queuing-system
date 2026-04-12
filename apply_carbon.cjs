const fs = require('fs');
const appPath = 'c:/website/queuing-system/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

const carbonInput = "carbon-input w-full p-4 text-sm text-[#161616]";
const carbonBtn = "carbon-btn-primary w-full p-5 font-semibold text-lg flex items-center justify-between group";

// 1. RE-DESIGN HOMEPAGE
const homeMarker = "function HomePage({ setCurrentPage }) {";
const homeEnd = "// Footer Section"; // Use footer start as end marker
const carbonHome = `
function HomePage({ setCurrentPage }) {
  return (
    <div className="pt-[100px] bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#f4f4f4] py-24 px-8 border-b border-[#e0e0e0]">
        <div className="max-w-[1584px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#0f62fe] font-semibold text-sm mb-4 uppercase tracking-[0.16px]">Innovative Solutions</p>
            <h2 className="text-6xl md:text-7xl font-light text-[#161616] leading-[1.1] mb-8">
              Engineered for <br/>
              <span className="text-[#0f62fe]">Efficiency</span>
            </h2>
            <p className="text-xl text-[#525252] mb-12 max-w-lg leading-relaxed font-light">
              Streamline your clinic operations with our enterprise-grade queuing system. Methodical, precise, and built for scale.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setCurrentPage('queue')}
                className="px-8 py-4 bg-[#0f62fe] hover:bg-[#0353e9] text-white font-medium text-lg flex items-center space-x-4 group"
              >
                <span>Get a Ticket</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setCurrentPage('survey')}
                className="px-8 py-4 border border-[#0f62fe] text-[#0f62fe] hover:bg-[#edf5ff] font-medium text-lg"
              >
                Feedback
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
             <div className="bg-[#e0e0e0] aspect-video w-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f62fe]/10 to-transparent"></div>
                <div className="text-[#161616] font-mono text-9xl opacity-5 select-none">DATA</div>
                <div className="w-3/4 h-3/4 bg-white shadow-2xl p-8 z-10 flex flex-col justify-between">
                   <div className="flex space-x-2">
                      <div className="w-12 h-2 bg-[#0f62fe]"></div>
                      <div className="w-12 h-2 bg-[#e0e0e0]"></div>
                   </div>
                   <div className="space-y-4 text-xs font-mono text-[#525252]">
                      <div className="w-full h-8 bg-[#f4f4f4] flex items-center px-4">TICKET_ID: B-102</div>
                      <div className="w-2/3 h-8 bg-[#f4f4f4] flex items-center px-4">STATUS: SERVING</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Appointment Form Section - White Band */}
      <section className="bg-white py-24 px-8">
         <div className="max-w-xl mx-auto">
            <div className="mb-12 text-center">
               <h3 className="text-3xl font-light mb-4 text-[#161616]">Book an Appointment</h3>
               <p className="text-[#525252]">Secure your priority slot in our system.</p>
            </div>
            <AppointmentForm />
         </div>
      </section>\n\n`;

const homeStartIdx = app.indexOf(homeMarker);
const homeEndIdx = app.indexOf(homeEnd);
if (homeStartIdx !== -1 && homeEndIdx !== -1) {
    app = app.substring(0, homeStartIdx) + carbonHome + app.substring(homeEndIdx);
}

// 2. RE-DESIGN APPOINTMENTFORM
const formMarker = "function AppointmentForm() {";
const formReturnMarker = "return (";
// We'll replace just the return part to keep handlers
const formStartPos = app.indexOf(formMarker);
const returnPos = app.indexOf(formReturnMarker, formStartPos);
const nextFuncPos = app.indexOf("function AdminDashboard", returnPos);

const carbonFormReturn = `return (
    <div className="bg-[#f4f4f4] p-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#0f62fe]"></div>
      
      <div className="mb-10">
        <h4 className="text-3xl font-light text-[#161616]">New Appointment</h4>
      </div>

      {submitStatus.message && (
        <div className={\`mb-6 p-4 text-sm flex items-center space-x-3 \${
          submitStatus.type === 'success'
            ? 'bg-[#defbe6] text-[#198038] border-l-4 border-[#198038]'
            : 'bg-[#fff1f1] text-[#da1e28] border-l-4 border-[#da1e28]'
        }\`}>
          <span>{submitStatus.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[12px] font-normal text-[#525252] tracking-[0.32px]">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              required
              className="carbon-input w-full p-4 text-sm text-[#161616]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[12px] font-normal text-[#525252] tracking-[0.32px]">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="09xx xxx xxxx"
              required
              className="carbon-input w-full p-4 text-sm text-[#161616]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[12px] font-normal text-[#525252] tracking-[0.32px]">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
            className="carbon-input w-full p-4 text-sm text-[#161616] appearance-none"
          >
            <option value="">Choose service...</option>
            <option value="Consultation">Consultation</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Lab Results">Lab Results</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[12px] font-normal text-[#525252] tracking-[0.32px]">Preferred Date</label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              required
              className="carbon-input w-full p-4 text-sm text-[#161616]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[12px] font-normal text-[#525252] tracking-[0.32px]">Time Slot</label>
            <select
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              required
              disabled={loadingSlots || !formData.preferredDate}
              className="carbon-input w-full p-4 text-sm text-[#161616] disabled:opacity-50"
            >
              <option value="">{loadingSlots ? 'Loading...' : 'Select time...'}</option>
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="carbon-btn-primary w-full p-5 font-semibold text-lg flex items-center justify-between group"
          >
            <span>{isSubmitting ? 'PROCESSING...' : 'SCHEDULE APPOINTMENT'}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}\n\n`;

if (returnPos !== -1 && nextFuncPos !== -1) {
    app = app.substring(0, returnPos) + carbonFormReturn + app.substring(nextFuncPos);
}

fs.writeFileSync(appPath, app, 'utf8');
console.log('Carbon Design Applied to Home and Form.');
