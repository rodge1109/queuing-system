import React, { useState } from 'react';

export default function SurveyPage({ setCurrentPage }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    sex: '', age: '', region: '', clientType: '',
    cc1: '', cc2: '', cc3: '',
    sqd0: 0, sqd1: 0, sqd2: 0, sqd3: 0, sqd4: 0, sqd5: 0, sqd6: 0, sqd7: 0, sqd8: 0,
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const submitSurvey = async () => {
    // Basic validation
    if (!formData.sex || !formData.clientType || !formData.cc1 || formData.sqd0 === 0) {
      alert('Please fill in all required fields (Sex, Client Type, CC Awareness, and Overall Satisfaction)');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: 'Anonymous',
          contactNumber: '00000000000',
          suggestions: formData.comments,
          serviceAvailed: 'Queuing Service'
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
      } else {
        alert(data.message || 'Submission failed');
      }
    } catch (err) {
      alert('Error submitting survey');
    } finally {
      setIsSubmitting(false);
    }
  };

  const likertScale = [
    { v: 5, l: 'Strongly Agree' },
    { v: 4, l: 'Agree' },
    { v: 3, l: 'Neither' },
    { v: 2, l: 'Disagree' },
    { v: 1, l: 'Strongly Disagree' }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white pt-[148px] px-8 flex justify-center text-center">
        <div className="max-w-xl w-full bg-[#f4f4f4] p-16 border-t-8 border-[#24a148]">
          <h2 className="text-5xl font-light text-[#161616] mb-8">Thank You!</h2>
          <p className="text-xl text-[#525252] mb-12">Your feedback helps us provide better service for everyone.</p>
          <button onClick={() => setCurrentPage('home')} className="carbon-btn-primary px-12 py-4 font-bold uppercase tracking-widest">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[148px] px-8 pb-32">
      <div className="max-w-3xl mx-auto bg-[#f4f4f4] border-t-4 border-[#0f62fe] p-12">

        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-light text-[#161616] mb-2 uppercase tracking-tight">Client Satisfaction Measurement</h2>
          <p className="text-xs text-[#525252] uppercase font-bold tracking-[0.2em] border-b pb-4 border-[#e0e0e0]">Harmonized ARTA CSM 2024 Standard</p>
        </div>

        <div className="space-y-16">
          {/* Step 1: Client Profile */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold uppercase text-[#161616] border-l-4 border-[#0f62fe] pl-4">I. Client Profile</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[#525252]">Sex</label>
                <select value={formData.sex} onChange={e => handleRating('sex', e.target.value)} className="carbon-input w-full p-4">
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[#525252]">Age</label>
                <input type="number" value={formData.age} onChange={e => handleRating('age', e.target.value)} className="carbon-input w-full p-4" placeholder="Enter age" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#525252]">Region</label>
              <input value={formData.region} onChange={e => handleRating('region', e.target.value)} className="carbon-input w-full p-4" placeholder="Ex. Region IV-A" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#525252]">Client Type</label>
              <select value={formData.clientType} onChange={e => handleRating('clientType', e.target.value)} className="carbon-input w-full p-4">
                <option value="">Select...</option>
                <option value="Citizen">Citizen</option>
                <option value="Business">Business</option>
                <option value="Government">Government (Employee or other Agency)</option>
              </select>
            </div>
          </div>

          {/* Step 2: Citizen's Charter (CC) */}
          <div className="space-y-12">
            <h3 className="text-xl font-bold uppercase text-[#161616] border-l-4 border-[#0f62fe] pl-4">II. Citizen's Charter (CC)</h3>

            <div className="space-y-4">
              <p className="text-sm font-bold text-[#161616]">CC1: Which of the following best describes your awareness of a CC?</p>
              {[
                "I know what a CC is and I saw this office's CC.",
                "I know what a CC is but I did NOT see this office's CC.",
                "I learned of the CC only when I saw this office's CC.",
                "I do not know what a CC is and I did not see one in this office."
              ].map((opt, i) => (
                <button key={i} onClick={() => handleRating('cc1', opt)} className={`w-full text-left p-4 text-xs transition-all ${formData.cc1 === opt ? 'bg-[#0f62fe] text-white' : 'bg-white border hover:bg-[#e8e8e8]'}`}>{opt}</button>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-[#161616]">CC2: If aware of CC, would you say that the CC of this office was...?</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["Easy to see", "Somewhat easy to see", "Difficult to see", "Not visible at all", "N/A"].map(opt => (
                  <button key={opt} onClick={() => handleRating('cc2', opt)} className={`p-4 text-xs transition-all ${formData.cc2 === opt ? 'bg-[#161616] text-white' : 'bg-white border hover:bg-[#e8e8e8]'}`}>{opt}</button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-[#161616]">CC3: How much did the CC help you in your transaction?</p>
              <div className="grid grid-cols-2 gap-2">
                {["Helped very much", "Somewhat helped", "Did not help", "N/A"].map(opt => (
                  <button key={opt} onClick={() => handleRating('cc3', opt)} className={`p-4 text-xs transition-all ${formData.cc3 === opt ? 'bg-[#161616] text-white' : 'bg-white border hover:bg-[#e8e8e8]'}`}>{opt}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Service Quality */}
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2">
              <h3 className="text-xl font-bold uppercase text-[#161616] border-l-4 border-[#0f62fe] pl-4">III. Service Quality</h3>
              <p className="text-[10px] text-[#525252] font-mono">1 = Strongly Disagree | 5 = Strongly Agree</p>
            </div>

            <div className="space-y-8">
              {[
                { id: '0', q: 'I am satisfied with the service that I availed.', d: 'Overall' },
                { id: '1', q: 'I spent a reasonable amount of time for my transaction.', d: 'Responsiveness' },
                { id: '2', q: 'The office followed the transaction requirements and steps based on the transaction.', d: 'Reliability' },
                { id: '3', q: 'The steps (including payment) were easy and simple.', d: 'Access' },
                { id: '4', q: 'I easily found information about my transaction from the office or its website.', d: 'Communication' },
                { id: '5', q: 'I paid an acceptable amount of fees for my transaction.', d: 'Costs' },
                { id: '6', q: 'I felt the office was secure.', d: 'Integrity' },
                { id: '7', q: 'I was treated courteously by the staff, and (if asked for help) the staff was helpful.', d: 'Assurance' },
                { id: '8', q: 'I got what I needed from the government office.', d: 'Outcome' }
              ].map(sqd => (
                <div key={sqd.id} className="space-y-4 border-b border-[#e0e0e0] pb-8">
                  <p className="text-sm font-bold">{sqd.q}</p>
                  <div className="flex gap-1">
                    {likertScale.map(l => (
                      <button
                        key={l.v}
                        onClick={() => handleRating(`sqd${sqd.id}`, l.v)}
                        className={`flex-1 flex flex-col items-center p-2 border transition-all ${formData[`sqd${sqd.id}`] === l.v ? 'bg-[#0f62fe] text-white border-[#0f62fe]' : 'bg-white border-[#e0e0e0] hover:bg-[#f4f4f4]'}`}
                      >
                        <span className="text-lg font-bold">{l.v}</span>
                        <span className="text-[8px] uppercase font-bold text-center mt-1 hidden md:block">{l.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Comments */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold uppercase text-[#161616] border-l-4 border-[#0f62fe] pl-4">IV. Comments</h3>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#525252]">Suggestions on how we can further improve our services (Optional)</label>
              <textarea
                value={formData.comments}
                onChange={e => handleRating('comments', e.target.value)}
                className="carbon-input w-full p-6 min-h-[150px]"
                placeholder="Type your feedback here..."
              ></textarea>
            </div>

            <button onClick={submitSurvey} disabled={isSubmitting} className="carbon-btn-primary w-full p-6 font-bold uppercase tracking-widest text-lg disabled:opacity-30 mt-12 shadow-xl hover:-translate-y-1 transition-all">
              {isSubmitting ? 'Submitting...' : 'Submit Final Feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
