import React, { useState, useEffect } from 'react';

export default function QueueDisplayPage() {
  const [serving, setServing] = useState([]);
  const [waiting, setWaiting] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marqueeText, setMarqueeText] = useState('');

  useEffect(() => {
    const fetchDisplay = () => {
      fetch('/api/queue/display')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setServing(data.serving);
            setWaiting(data.waiting);
          }
        })
        .catch(err => console.error(err));
    };
    const fetchMarquee = () => {
      fetch('/api/queue/marquee')
        .then(res => res.json())
        .then(data => { if (data.success) setMarqueeText(data.text); });
    };
    fetchDisplay();
    fetchMarquee();
    const interval = setInterval(fetchDisplay, 3000);
    const marqueeInt = setInterval(fetchMarquee, 10000);
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(marqueeInt); clearInterval(clock); };
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="bg-[#161616] text-white px-12 py-6 flex justify-between items-center border-b border-[#393939]">
        <div>
          <h1 className="text-4xl font-light uppercase tracking-[0.2em]">Live <span className="font-bold text-[#0f62fe]">Queue</span></h1>
        </div>
        <div className="text-4xl font-mono font-light text-[#c6c6c6]">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Now Serving (Big) */}
        <div className="flex-[2] bg-[#f4f4f4] p-12 border-r border-[#e0e0e0] flex flex-col">
          <h2 className="text-xs font-bold uppercase text-[#525252] mb-12 tracking-[0.3em]">Now Serving</h2>
          <div className="flex-1 grid grid-cols-2 gap-8 content-start">
            {serving.map((ticket, i) => (
              <div key={ticket.id} className={`bg-white p-8 border-t-8 border-[#0f62fe] shadow-sm transform transition-all ${i === 0 ? 'scale-105 ring-4 ring-[#0f62fe]/10' : ''}`}>
                <p className="text-xs uppercase font-bold text-[#525252] mb-2">{ticket.teller_window}</p>
                <p className="text-8xl font-light text-[#161616] tracking-tighter">{ticket.ticket_number}</p>
                <p className="text-sm text-[#525252] mt-4 font-medium uppercase truncate">{ticket.customer_name}</p>
              </div>
            ))}
            {serving.length === 0 && (
              <div className="col-span-2 h-[400px] flex items-center justify-center border-2 border-dashed border-[#e0e0e0]">
                <p className="text-[#c6c6c6] text-2xl uppercase tracking-widest font-light">Waiting for Next Customer</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Waiting List */}
        <div className="flex-1 bg-white p-12 flex flex-col overflow-hidden">
          <h2 className="text-xs font-bold uppercase text-[#525252] mb-12 tracking-[0.3em]">Waiting List</h2>
          <div className="flex-1 space-y-4 overflow-y-auto pr-4">
            {waiting.slice(0, 10).map((ticket) => (
              <div key={ticket.id} className="p-6 bg-[#f4f4f4] flex justify-between items-center border-l-4 border-[#393939]">
                <span className="text-4xl font-light text-[#161616]">{ticket.ticket_number}</span>
                <span className="text-xs font-mono text-[#525252] uppercase">{ticket.transaction_type}</span>
              </div>
            ))}
            {waiting.length === 0 && <p className="text-[#c6c6c6] italic">No pending tickets</p>}
          </div>
        </div>
      </div>

      {/* Marquee Footer */}
      {marqueeText && (
        <div className="h-[60px] bg-[#0f62fe] text-white flex items-center overflow-hidden border-t border-[#0353e9]">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-xl font-medium mx-12 uppercase tracking-wide">{marqueeText}</span>
            <span className="text-xl font-medium mx-12 uppercase tracking-wide">{marqueeText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
