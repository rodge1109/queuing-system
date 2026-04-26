import React, { useState, useEffect } from 'react';

export default function QueuePage({ setCurrentPage }) {
  const [view, setView] = useState('initial');
  const [formData, setFormData] = useState({ customerName: '', cellphoneNumber: '', transactionType: '', isPriority: false, priorityType: '' });
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    fetch('/api/queue/transaction-types')
      .then(res => res.json())
      .then(data => { if (data.success) setTransactionTypes(data.types); })
      .catch(err => console.error('Error fetching types:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/queue/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
        setView('receipt');
      } else {
        alert(data.message || 'Failed to create ticket');
      }
    } catch (err) { alert('Server error'); }
    finally { setIsSubmitting(false); }
  };

  if (view === 'receipt' && ticket) {
    return (
      <div className="min-h-screen bg-white pt-[148px] px-8 flex justify-center">
        <div className="w-full max-w-sm bg-[#f4f4f4] p-12 text-center border-t-4 border-[#0f62fe]">
          <p className="text-xs uppercase text-[#525252] mb-8 font-bold tracking-widest">Queue Number</p>
          <h2 className="text-8xl font-light text-[#161616] mb-4">{ticket.ticket_number}</h2>
          <p className="text-[#525252] text-sm mb-12 uppercase tracking-wide">{ticket.customer_name}</p>
          <button
            onClick={() => {
              localStorage.setItem('lastTicketId', ticket.id);
              setCurrentPage('survey');
            }}
            className="carbon-btn-primary w-full p-4 font-bold uppercase tracking-wider"
          >
            Go to Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[148px] px-8 flex justify-center pb-24">
      <div className="w-full max-w-lg bg-[#f4f4f4] p-12 border-t-4 border-[#0f62fe]">
        <h2 className="text-3xl font-light text-[#161616] mb-10 uppercase tracking-tight">Generate Ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-xs uppercase text-[#525252] font-bold">Full Name</label>
            <input
              value={formData.customerName}
              onChange={e => setFormData({ ...formData, customerName: e.target.value })}
              className="carbon-input w-full p-4"
              placeholder="Ex. Juan Dela Cruz"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-[#525252] font-bold">Phone Number</label>
            <input
              value={formData.cellphoneNumber}
              onChange={e => setFormData({ ...formData, cellphoneNumber: e.target.value })}
              className="carbon-input w-full p-4"
              placeholder="09XXXXXXXXX"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-[#525252] font-bold">Transaction Type</label>
            <select
              value={formData.transactionType}
              onChange={e => setFormData({ ...formData, transactionType: e.target.value })}
              className="carbon-input w-full p-4"
              required
            >
              <option value="">Select Service...</option>
              {transactionTypes.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-white border border-[#e0e0e0]">
            <input
              type="checkbox"
              checked={formData.isPriority}
              onChange={e => setFormData({ ...formData, isPriority: e.target.checked })}
              className="w-5 h-5 accent-[#0f62fe]"
            />
            <label className="text-xs uppercase font-bold text-[#525252]">Priority Lane (Senior/PWD/Pregnant)</label>
          </div>

          <button type="submit" disabled={isSubmitting} className="carbon-btn-primary w-full p-5 font-bold uppercase tracking-widest text-lg disabled:opacity-50">
            {isSubmitting ? 'Processing...' : 'Generate Number'}
          </button>
        </form>
      </div>
    </div>
  );
}
