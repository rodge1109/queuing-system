import React, { useState, useEffect } from 'react';

export default function QueueTellerPage({ setCurrentPage }) {
  const [tellers, setTellers] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState('');
  const [tellerName, setTellerName] = useState('');
  const [currentTicket, setCurrentTicket] = useState(null);
  const [skippedTickets, setSkippedTickets] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);
  const [waitingTickets, setWaitingTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedTypes, setAssignedTypes] = useState([]);
  const [avgServingTime, setAvgServingTime] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/queue/tellers')
      .then(res => res.json())
      .then(data => { if (data.success) setTellers(data.tellers); });
  }, []);

  const fetchCurrentTicket = async () => {
    if (!selectedWindow) return;
    try {
      const res = await fetch(`/api/queue/teller/${encodeURIComponent(selectedWindow)}/current`);
      const data = await res.json();
      if (data.success) {
        setCurrentTicket(data.current);
        setSkippedTickets(data.skipped);
        setCompletedCount(data.completedCount);
        setWaitingCount(data.waitingCount);
        setWaitingTickets(data.waitingTickets || []);
        setAssignedTypes(data.assignedTypes || []);
        setAvgServingTime(data.avgServingTime || 0);
      }
    } catch (err) { }
  };

  useEffect(() => {
    if (selectedWindow) {
      fetchCurrentTicket();
      const interval = setInterval(fetchCurrentTicket, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedWindow]);

  const callNext = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/queue/teller/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowName: selectedWindow, tellerName })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentTicket(data.ticket);
        fetchCurrentTicket();
      } else alert(data.message);
    } catch (err) { } finally { setIsLoading(false); }
  };

  const completeTicket = async () => {
    if (!currentTicket) return;
    await fetch(`/api/queue/tickets/${currentTicket.id}/complete`, { method: 'PATCH' });
    setCurrentTicket(null);
    fetchCurrentTicket();
  };

  const skipTicket = async () => {
    if (!currentTicket) return;
    await fetch(`/api/queue/tickets/${currentTicket.id}/skip`, { method: 'PATCH' });
    setCurrentTicket(null);
    fetchCurrentTicket();
  };

  const recallTicket = async (id) => {
    try {
      const res = await fetch(`/api/queue/tickets/${id}/recall`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowName: selectedWindow, tellerName })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentTicket(data.ticket);
        fetchCurrentTicket();
      } else {
        alert(data.message);
      }
    } catch (err) { }
  };

  if (!selectedWindow) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-[100px]">
        <div className="w-full max-w-lg bg-[#f4f4f4] p-12 border-t-4 border-[#0f62fe]">
          <h2 className="text-3xl font-light text-[#161616] mb-8 uppercase tracking-tighter">Teller Access</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase text-[#525252] font-bold">Teller Name</label>
              <input value={tellerName} onChange={e => setTellerName(e.target.value)} className="carbon-input w-full p-4" placeholder="Staff Name" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase text-[#525252] font-bold">Active Window</label>
              <div className="grid grid-cols-2 gap-2">
                {tellers.map(t => (
                  <button key={t.id} onClick={() => setSelectedWindow(t.window_name)} disabled={!tellerName} className="carbon-btn-primary p-4 text-sm disabled:opacity-30 uppercase font-bold tracking-widest">{t.window_name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[148px] px-8 pb-24">
      <div className="max-w-[1584px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#161616] p-8 text-white flex justify-between items-center">
            <div>
              <p className="text-xs text-[#c6c6c6] uppercase mb-1 font-mono">{selectedWindow}</p>
              <h3 className="text-2xl font-light">{tellerName}</h3>
            </div>
            <div className="flex space-x-4">
              <div className="text-center px-6 border-r border-[#393939]">
                <p className="text-xs text-[#c6c6c6] uppercase font-bold">Waiting</p>
                <p className="text-2xl font-bold text-[#0f62fe]">{waitingCount}</p>
              </div>
              <button onClick={() => setSelectedWindow('')} className="p-2 border border-[#393939] hover:bg-[#262626] transition-colors font-bold text-white text-lg flex items-center justify-center w-10 h-10">
                X
              </button>
            </div>
          </div>

          <div className="bg-[#f4f4f4] p-12 border-t-4 border-[#0f62fe]">
            {currentTicket ? (
              <div className="text-center">
                <p className="text-xs uppercase text-[#525252] mb-4 font-bold tracking-widest">Serving Now</p>
                <h2 className="text-9xl font-light text-[#161616] mb-8 tracking-tighter">{currentTicket.ticket_number}</h2>
                <div className="space-y-2 mb-12">
                  <p className="text-2xl font-medium">{currentTicket.customer_name}</p>
                  <p className="text-sm font-mono text-[#525252] uppercase">{currentTicket.transaction_type}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <button onClick={completeTicket} className="carbon-btn-primary p-5 font-bold uppercase tracking-widest text-lg">COMPLETE</button>
                  <button onClick={skipTicket} className="p-5 border border-[#da1e28] text-[#da1e28] font-bold hover:bg-[#fff1f1] uppercase tracking-widest text-lg transition-colors">SKIP</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-[#525252] mb-8 uppercase tracking-widest font-bold text-sm">Waiting for next client...</p>
                <button onClick={callNext} disabled={waitingCount === 0} className="carbon-btn-primary px-16 py-6 text-2xl font-bold flex items-center justify-center space-x-6 mx-auto disabled:opacity-30">
                  <span>CALL NEXT</span>
                  <span className="text-3xl">+</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Waiting Queue */}
          <div className="bg-[#f4f4f4] p-8 border-t-4 border-[#0f62fe]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-bold uppercase text-[#525252] tracking-widest">Waiting Queue</h4>
              <span className="bg-[#0f62fe] text-white text-[10px] font-bold px-2 py-0.5">{waitingCount}</span>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[400px]">
              {waitingTickets.map((t, idx) => (
                <div key={t.id} className="bg-white p-4 flex justify-between items-center border-l-2 border-[#0f62fe] shadow-sm">
                  <span className="font-bold text-[#161616] text-lg">{t.ticket_number}</span>
                  <span className="text-[10px] text-[#525252] font-mono">{t.transaction_type}</span>
                </div>
              ))}
              {waitingTickets.length === 0 && <p className="text-[#c6c6c6] text-center italic py-8">No clients waiting</p>}
            </div>
          </div>

          {/* Skipped Tickets */}
          <div className="bg-[#f4f4f4] p-8 border-t-4 border-[#da1e28]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-bold uppercase text-[#525252] tracking-widest">Skipped</h4>
              <span className="bg-[#da1e28] text-white text-[10px] font-bold px-2 py-0.5">{skippedTickets.length}</span>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[300px]">
              {skippedTickets.map((t, idx) => (
                <div key={t.id} className="bg-white p-4 flex flex-col border-l-2 border-[#da1e28] shadow-sm relative group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#161616]">{t.ticket_number}</span>
                    <span className="text-[9px] text-[#525252] font-mono uppercase">{t.transaction_type}</span>
                  </div>
                  <button
                    onClick={() => recallTicket(t.id)}
                    disabled={!!currentTicket}
                    className="w-full py-1.5 text-[10px] bg-[#f4f4f4] hover:bg-[#e0e0e0] font-bold uppercase border border-[#e0e0e0] transition-colors disabled:opacity-30"
                  >
                    Recall Ticket
                  </button>
                </div>
              ))}
              {skippedTickets.length === 0 && <p className="text-[#c6c6c6] text-center italic py-8">None skipped</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
