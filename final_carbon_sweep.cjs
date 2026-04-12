const fs = require('fs');
const appPath = 'c:/website/queuing-system/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// 1. HELPERS FOR BUTTONS AND INPUTS
// SurveyPage update
const surveySearch = "function SurveyPage";
const surveyEnd = "function QueuePage";
const surveyCode = `
function SurveyPage({ setCurrentPage }) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      name: '', age: '', sex: '', region: '', contactNumber: '', serviceAvailed: '', clientType: 'Citizen',
      cc1: '', cc2: '', cc3: '', cc3Reason: '',
      sqd0: 5, sqd1: 5, sqd2: 5, sqd3: 5, sqd4: 5, sqd5: 5, sqd6: 5, sqd7: 5, sqd8: 5,
      suggestions: ''
    });

    const handleRating = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const sqdQuestions = [
      { key: 'sqd0', label: 'Overall Satisfaction', desc: 'How satisfied are you with the service overall?' },
      { key: 'sqd1', label: 'Responsiveness', desc: 'The service was provided in a timely manner.' },
      { key: 'sqd2', label: 'Reliability', desc: 'The staff followed the requirements and procedures.' },
      { key: 'sqd3', label: 'Access & Facilities', desc: 'The location and office were accessible and comfortable.' },
      { key: 'sqd4', label: 'Communication', desc: 'I was informed of the requirements and status clearly.' },
      { key: 'sqd5', label: 'Costs', desc: 'The costs were reasonable and the payment process was easy.' },
      { key: 'sqd6', label: 'Integrity', desc: 'The office was fair and there was no corruption.' },
      { key: 'sqd7', label: 'Assurance', desc: 'I felt safe and secure during my transaction.' },
      { key: 'sqd8', label: 'Outcome', desc: 'The office delivered what was promised.' }
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const res = await fetch('http://localhost:5000/api/survey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) { alert('Thank you!'); setCurrentPage('home'); }
      } catch (err) { alert('Failed'); }
      finally { setSubmitting(false); }
    };

    return (
      <div className="min-h-screen bg-white pt-[148px] px-8 pb-24">
        <div className="max-w-4xl mx-auto bg-[#f4f4f4] border-t-4 border-[#0f62fe] p-12">
          <div className="mb-12">
             <h2 className="text-4xl font-light text-[#161616] mb-2">Service Feedback</h2>
             <p className="text-[#525252] uppercase text-xs tracking-[0.32px]">ARTA-Compliant Satisfaction Measurement</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {step === 1 && (
              <div className="space-y-8">
                <h3 className="text-xl font-normal text-[#161616] border-b border-[#e0e0e0] pb-2">I. Client Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-normal text-[#525252] uppercase tracking-[0.32px]">Name (Optional)</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="carbon-input w-full p-4 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-normal text-[#525252] uppercase tracking-[0.32px]">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="carbon-input w-full p-4 text-sm" />
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="carbon-btn-primary px-12 py-4 font-semibold">NEXT SECTION</button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-12">
                 <h3 className="text-xl font-normal text-[#161616] border-b border-[#e0e0e0] pb-2">II. Service Quality</h3>
                 {sqdQuestions.map(q => (
                   <div key={q.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border-l-4 border-[#e0e0e0] hover:border-[#0f62fe] transition-all">
                      <div>
                        <p className="text-xs font-bold text-[#0f62fe] uppercase mb-1">{q.label}</p>
                        <p className="text-sm text-[#161616]">{q.desc}</p>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(v => (
                          <button key={v} type="button" onClick={() => handleRating(q.key,v)} className={\`w-10 h-10 text-sm font-bold \${formData[q.key] === v ? 'bg-[#0f62fe] text-white' : 'bg-[#e0e0e0] text-[#525252]'}\`}>{v}</button>
                        ))}
                      </div>
                   </div>
                 ))}
                 <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="px-8 py-4 text-[#525252] hover:underline">Back</button>
                    <button type="submit" disabled={submitting} className="carbon-btn-primary flex-1 p-4 font-semibold uppercase">{submitting ? '...' : 'Submit Feedback'}</button>
                 </div>
              </div>
            )}
          </form>
        </div>
      </div>
    );
}\n\n`;

// QueuePage re-design
const queueSearch = "function QueuePage";
const queueEnd = "function Header";
const queueCode = `
function QueuePage({ setCurrentPage }) {
    const [formData, setFormData] = useState({ name: '', transactionType: '' });
    const [ticket, setTicket] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const res = await fetch('http://localhost:5000/api/queue/ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) setTicket(data.ticket);
      } catch (err) { alert('Failed'); }
      finally { setSubmitting(false); }
    };

    if (ticket) {
      return (
        <div className="min-h-screen bg-white pt-[148px] px-8 flex justify-center">
           <div className="w-full max-w-sm bg-[#f4f4f4] p-12 text-center border-t-4 border-[#0f62fe]">
              <p className="text-xs uppercase text-[#525252] tracking-[0.32px] mb-8">Queue Number</p>
              <h2 className="text-7xl font-light text-[#161616] mb-8">{ticket.ticket_number}</h2>
              <div className="space-y-2 mb-12 border-y border-[#e0e0e0] py-6">
                 <p className="text-lg font-light">{ticket.customer_name}</p>
                 <p className="text-xs text-[#6f6f6f] uppercase tracking-widest">{ticket.transaction_type}</p>
              </div>
              <button 
                onClick={() => setCurrentPage('survey')}
                className="carbon-btn-primary w-full p-4 font-semibold"
              >
                FINISH & GIVE FEEDBACK
              </button>
           </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white pt-[148px] px-8 flex justify-center">
        <div className="w-full max-w-lg bg-[#f4f4f4] p-12 border-t-4 border-[#0f62fe]">
          <h2 className="text-3xl font-light text-[#161616] mb-10">Electronic Queue</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-normal text-[#525252] uppercase tracking-[0.32px]">Full Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="carbon-input w-full p-4 text-sm" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-normal text-[#525252] uppercase tracking-[0.32px]">Transaction Type</label>
              <select value={formData.transactionType} onChange={e => setFormData({...formData, transactionType: e.target.value})} className="carbon-input w-full p-4 text-sm appearance-none" required>
                 <option value="">Select Service...</option>
                 <option value="Consultation">Consultation</option>
                 <option value="Laboratory">Laboratory</option>
                 <option value="Pharmacy">Pharmacy</option>
              </select>
            </div>
            <button type="submit" disabled={submitting} className="carbon-btn-primary w-full p-5 font-semibold text-lg flex items-center justify-between group">
               <span>{submitting ? 'GENERATING...' : 'GET QUEUE NUMBER'}</span>
               <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    );
}\n\n`;

app = app.replace(new RegExp(surveySearch + ".*?(" + surveyEnd + ")", "s"), surveyCode + "$1");
app = app.replace(new RegExp(queueSearch + ".*?(" + queueEnd + ")", "s"), queueCode + "$1");

fs.writeFileSync(appPath, app, 'utf8');
console.log('Final Global Carbonization Complete.');
