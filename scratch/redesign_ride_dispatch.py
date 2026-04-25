import os

file_path = r'c:\website\queuing-system\src\App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_return_block = """  return (
    <div className="h-full relative flex flex-col min-h-0 overflow-hidden bg-[#161616] rounded-0">
      {/* LAYER 0: Full Screen Background Map */}
      <div className="absolute inset-0 z-0">
         <DispatchMap trips={trips} riders={riders} selectedBooking={selectedBooking} />
      </div>

      {/* LAYER 1: Top Metrics & Global Controls (Floating) */}
      <div className="relative z-20 p-4 pointer-events-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-auto">
          {/* Metrics Row */}
          <div className="flex gap-4 max-w-full overflow-x-auto scrollbar-hide py-2 px-1">
             {[
               { label: 'Pending', value: trips.filter(t => !t.rider_id && t.transport_status !== 'cancelled').length, color: 'cyan', icon: <Clock />, max: 50 },
               { label: 'Ongoing', value: trips.filter(t => t.rider_id && t.transport_status !== 'completed' && t.transport_status !== 'cancelled').length, color: 'blue', icon: <Navigation />, max: 50 },
               { label: 'Drivers', value: riders.filter(r => r.status === 'available').length, color: 'green', icon: <User />, max: 50 }
             ].map((stat, i) => (
               <MetricCard 
                 key={i}
                 label={stat.label}
                 value={stat.value}
                 max={stat.max}
                 color={stat.color}
                 icon={stat.icon}
                 size="sm"
               />
             ))}
          </div>

          {/* Search & Actions Row */}
          <div className="flex gap-2 bg-[#161616]/60 backdrop-blur-md p-2 border border-white/10 shadow-xl rounded-sm">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Search ID / Passenger..." 
                  className="bg-white/5 border border-white/10 rounded-sm pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#0f62fe] w-48 md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
               onClick={() => setIsCreatingBooking(true)}
               className="bg-[#0f62fe] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0353e9] flex items-center gap-2 shadow-lg"
             >
               <Plus size={14} /> Create
             </button>
             <button onClick={onRefresh} className="bg-white/5 text-gray-400 p-2 hover:bg-white/10 border border-white/10 rounded-sm shadow-lg"><RefreshCw size={16} /></button>
          </div>
        </div>
      </div>

      {/* LAYER 2: Queue Sidebar (Draggable) */}
      <DraggableGlassPanel initialX={16} initialY={160} width="380px" height="calc(100% - 176px)">
        <div className="h-full bg-[#1c1c1c]/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
           <div className="flex border-b border-white/5 bg-[#161616] drag-handle">
              {['pending', 'assigned', 'scheduled'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveQueueTab(tab)}
                   className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeQueueTab === tab ? 'text-[#0f62fe] bg-white/5 border-b-2 border-[#0f62fe]' : 'text-gray-500 hover:text-white'}`}
                 >
                   {tab}
                 </button>
              ))}
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar">
              {queueTrips.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-600">
                    <History size={48} className="mb-4 opacity-20" />
                    <p className="text-xs uppercase tracking-widest font-bold">No {activeQueueTab} bookings</p>
                 </div>
              ) : (
                 <div className="divide-y divide-white/5">
                    {queueTrips.map(entry => (
                       <div 
                         key={entry.id} 
                         className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group ${selectedBooking?.id === entry.id ? 'bg-[#0f62fe]/10 border-l-4 border-[#0f62fe]' : ''}`}
                         onClick={() => setSelectedBooking(entry)}
                       >
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-bold text-[#0f62fe] bg-[#0f62fe]/10 px-2 py-0.5">#{entry.id}</span>
                             <span className="text-[9px] text-gray-500">{entry.preferred_time}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">{entry.full_name}</h4>
                          <div className="space-y-1 mb-4">
                             <div className="flex items-start gap-2">
                                <MapPin size={12} className="text-gray-600 mt-0.5" />
                                <p className="text-[10px] text-gray-400 line-clamp-1">{entry.pickup_location}</p>
                             </div>
                             <div className="flex items-start gap-2">
                                <ArrowRight size={12} className="text-gray-600 mt-0.5" />
                                <p className="text-[10px] text-gray-400 line-clamp-1">{entry.destination_location}</p>
                             </div>
                          </div>

                          <div className="flex justify-between items-center">
                             <div className="flex gap-2">
                                <span className="text-[8px] font-bold py-1 px-2 border border-white/10 text-gray-400 uppercase">{entry.service_type || 'STANDARD'}</span>
                                <span className={`text-[8px] font-bold py-1 px-2 uppercase ${entry.rider_id ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                   {entry.rider_id ? 'Assigned' : 'Unassigned'}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-white/5 hover:bg-[#0f62fe] text-white transition-colors"><ChevronRight size={14} /></button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </DraggableGlassPanel>

      {/* LAYER 3: Detail Overlay (Draggable) */}
      {selectedBooking && (
         <DraggableGlassPanel initialX={window.innerWidth - 440 - 40} initialY={160} width="400px" height="calc(100% - 176px)">
           <div className="h-full bg-[#161616]/95 backdrop-blur-2xl border border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] flex flex-col animate-slideInRight">
              <div className="p-4 bg-[#1c1c1c] border-b border-white/5 flex justify-between items-center drag-handle">
                 <h3 className="text-xs font-bold text-white uppercase tracking-widest">Booking Context</h3>
                 <button onClick={() => setSelectedBooking(null)} className="text-gray-500 hover:text-white"><X size={18} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                 {/* Passenger details */}
                 <section>
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-white/5 flex items-center justify-center font-bold text-xl text-white">
                          {selectedBooking.full_name?.charAt(0)}
                       </div>
                       <div>
                          <h4 className="text-lg font-bold text-white">{selectedBooking.full_name}</h4>
                          <p className="text-xs text-gray-500">{selectedBooking.phone_number}</p>
                       </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10">
                       <div className="flex justify-between mb-2">
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest">Distance</span>
                          <span className="text-xs font-bold text-white">4.2 KM</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest">Estimated Fare</span>
                          <span className="text-xs font-bold text-[#E4FE7B]">PHP {selectedBooking.total_amount}</span>
                       </div>
                    </div>
                 </section>

                 {/* Manual Dispatch Area */}
                 <section className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                       <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nearby Available Riders</h4>
                       <button className="text-[10px] text-[#0f62fe] font-bold uppercase hover:underline">Auto Dispatch</button>
                    </div>
                    <div className="space-y-3">
                       {riders.filter(r => r.status === 'available').length === 0 ? (
                          <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold text-center">
                             No riders available in radius
                          </div>
                       ) : (
                          riders.filter(r => r.status === 'available').slice(0, 3).map(rider => (
                             <div key={rider.id} className="p-3 bg-white/5 border border-white/10 hover:border-[#24a148] transition-all flex justify-between items-center group">
                                <div className="flex gap-3 items-center">
                                   <div className="w-8 h-8 rounded-full bg-[#24a148]/20 flex items-center justify-center text-[#24a148]"><User size={14} /></div>
                                   <div>
                                      <p className="text-xs font-bold text-white">{rider.name}</p>
                                      <p className="text-[9px] text-gray-500">{rider.vehicle_type} • 0.8 KM away</p>
                                   </div>
                                </div>
                                <button 
                                  onClick={() => handleAssignRider(selectedBooking.id, rider.id)}
                                  className="px-3 py-1.5 bg-[#24a148] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#1e8a3d] transition-colors"
                                >
                                   Assign
                                </button>
                             </div>
                          ))
                       )}
                    </div>
                 </section>

                 {/* Booking Control Actions */}
                 <section className="space-y-2 pt-4">
                    <button className="w-full py-3 border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-center flex items-center justify-center gap-2">
                       <Edit size={12} /> Edit Booking
                    </button>
                    <button 
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      className="w-full py-3 border border-red-500/50 text-red-500 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all text-center"
                    >
                      Cancel Booking
                    </button>
                 </section>
              </div>
           </div>
         </DraggableGlassPanel>
      )}

      {/* Legend Float (Bottom Left) */}
      <div className="absolute left-4 bottom-8 z-[1000] bg-[#161616]/80 backdrop-blur-md p-4 border border-white/10 shadow-2xl flex flex-col gap-3">
         <h4 className="text-[10px] font-bold text-white uppercase tracking-[2px] border-b border-white/5 pb-2 mb-1">Live Indicators</h4>
         <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase">
            <div className="w-2.5 h-2.5 rounded-full bg-[#24a148] shadow-[0_0_8px_rgba(36,161,72,0.5)]" /> Available Riders
         </div>
         <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1c21b] shadow-[0_0_8px_rgba(241,194,27,0.5)]" /> Pending Requests
         </div>
         <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.5)]" /> Active Trips
         </div>
      </div>

      {/* LAYER 4: Create Booking Modal */}
      {isCreatingBooking && (
         <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl bg-[#1c1c1c] border border-white/10 shadow-2xl overflow-hidden animate-zoomIn">
               <div className="p-6 bg-[#161616] border-b border-white/10 flex justify-between items-center">
                  <div>
                     <h3 className="text-lg font-bold text-white uppercase tracking-tighter italic">Manual Dispatch Request</h3>
                     <p className="text-xs text-gray-500">Create a new booking directly in the system</p>
                  </div>
                  <button onClick={() => setIsCreatingBooking(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
               </div>
               <form onSubmit={handleCreateBooking} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-[#0f62fe] uppercase tracking-widest">Passenger Information</h4>
                        <input name="fullName" required className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-[#0f62fe]" placeholder="Full Name" />
                        <input name="phoneNumber" required className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-[#0f62fe]" placeholder="Contact Number" />
                        <input name="email" className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-[#0f62fe]" placeholder="Email (Optional)" />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-[#0f62fe] uppercase tracking-widest">Trip Details</h4>
                        <input name="pickupLocation" required className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-[#0f62fe]" placeholder="Pickup Address" />
                        <input name="destinationLocation" required className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-[#0f62fe]" placeholder="Destination Address" />
                     </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Schedule Type</label>
                        <select name="scheduleType" className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white focus:outline-none">
                           <option>Immediate</option>
                           <option>Scheduled</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Vehicle Preference</label>
                        <select name="vehiclePreference" className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white focus:outline-none">
                           <option value="Standard">No Preference</option>
                           <option value="Car">Car</option>
                           <option value="Van">Van / SUV</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Payment Method</label>
                        <select name="paymentMethod" className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white focus:outline-none">
                           <option>Cash</option>
                           <option>Wallet</option>
                        </select>
                     </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                     <button type="submit" className="w-full py-4 bg-[#0f62fe] text-white font-bold uppercase tracking-[4px] shadow-xl hover:bg-[#0353e9] transition-all">Submit Dispatch Request</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );"""

# Replace the block from 7570 to 7840 approx
import re
# Find by start and end lines roughly, then find exact brace match
lines = content.splitlines()
start_line = 7570
end_line = 7840

# Join and replace
# Actually, I'll use index based replacement for precision
start_marker = "  return ("
# We need the start_marker AFTER function RideDispatch
rd_idx = content.find("function RideDispatch")
start_idx = content.find(start_marker, rd_idx)

if start_idx != -1:
    # Find the matching closing brace for the return (
    brace_count = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '(':
            brace_count += 1
        elif content[i] == ')':
            brace_count -= 1
            if brace_count == 0:
                # Found the closing ) for return (
                # Now find the trailing ;
                semi_idx = content.find(';', i)
                end_idx = semi_idx + 1
                break
    
    if end_idx != -1:
        new_content = content[:start_idx] + new_return_block + content[end_idx:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("RideDispatch layout updated to floating map style.")
    else:
        print("Could not find end of return block.")
else:
    print("Could not find start of return block.")
