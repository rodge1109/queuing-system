const fs = require('fs');
const path = 'c:/website/queuing-system/src/App.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// The clean code for the entire Passenger App section
const cleanCode = `// Static defaults to prevent re-renders
const PASSENGER_MAP_DEFAULT_CENTER = [14.5995, 120.9842];

function PassengerMap({ 
  center = PASSENGER_MAP_DEFAULT_CENTER, 
  zoom = 14, 
  showRoute = false, 
  pickupCoords = null, 
  destinationCoords = null, 
  trackingPos = null, 
  trackingHistory = [],
  onRouteFound = () => {} 
}) {
  const mapContainer = React.useRef(null);
  const mapInstance = React.useRef(null);
  const lastAnimatedRoute = React.useRef(null);
  const routeLayer = React.useRef(null);
  const markerLayer = React.useRef(null);
  const trackingLayer = React.useRef(null);
  const [roadRoute, setRoadRoute] = React.useState(null);

  const markerStyles = \`
    .grab-marker-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .grab-sonar {
      position: absolute;
      background: #00B14F;
      border-radius: 50%;
      opacity: 0.3;
      animation: sonar 2s infinite;
    }
    @keyframes sonar {
      0% { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    .animate-fadeInUp {
      animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .custom-leaflet-marker {
      background: transparent;
      border: none;
    }
  \`;

  // Initialize Map
  React.useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapContainer.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(center, zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    markerLayer.current = L.layerGroup().addTo(map);
    routeLayer.current = L.layerGroup().addTo(map);
    trackingLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    setTimeout(() => map.invalidateSize(), 300);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);
  
  // Update Layers & View (Incremental)
  React.useEffect(() => {
    const L = window.L;
    const map = mapInstance.current;
    if (!L || !map) return;

    // Clear previous dynamic layers
    markerLayer.current.clearLayers();
    routeLayer.current.clearLayers();
    if (!trackingLayer.current) trackingLayer.current = L.layerGroup().addTo(map);
    trackingLayer.current.clearLayers();

    // 3. Live Tracking Mode
    if (trackingPos) {
       const vehicleIcon = L.divIcon({
         html: \`
           <div class="relative flex items-center justify-center" style="width: 40px; height: 40px;">
             <div class="absolute inset-0 bg-[#00B14F]/20 rounded-full animate-ping"></div>
             <div class="w-8 h-8 bg-[#00B14F] border-2 border-white rounded-xl shadow-xl flex items-center justify-center text-white transform rotate-45">
                <div class="transform -rotate-45"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
             </div>
           </div>
         \`,
         iconSize: [40, 40],
         iconAnchor: [20, 20]
       });

       L.marker(trackingPos, { icon: vehicleIcon }).addTo(trackingLayer.current);
       
       if (trackingHistory.length > 1) {
         L.polyline(trackingHistory, { color: '#00B14F', weight: 3, opacity: 0.4, dashArray: '5, 10' }).addTo(trackingLayer.current);
       }

       // Auto-follow
       map.panTo(trackingPos, { animate: true, duration: 1.5 });
       return; // Exit early if in tracking mode to avoid conflict with booking markers
    }

    // 1. User/Origin Marker (Clean Pin)
    const pickupPin = L.divIcon({
      html: \`
        <div class="flex items-center justify-center" style="width: 40px; height: 40px;">
          <div class="absolute inset-0 bg-[#00B14F]/10 rounded-full animate-ping"></div>
          <div class="text-[#00B14F] drop-shadow-lg relative z-10">
             <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
          </div>
        </div>
      \`,
      className: 'custom-leaflet-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 36]
    });

    const currentPos = pickupCoords || center;
    L.marker(currentPos, { icon: pickupPin }).addTo(markerLayer.current);

    // 2. Route & Destination Pin
    if (showRoute && pickupCoords && destinationCoords) {
       const destIcon = L.divIcon({
         html: \`
           <div class="flex items-center justify-center" style="width: 40px; height: 40px;">
             <div class="text-red-500 drop-shadow-lg relative z-10">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
             </div>
           </div>
         \`,
         className: 'custom-leaflet-marker',
         iconSize: [40, 40],
         iconAnchor: [20, 36]
       });

       L.marker(destinationCoords, { icon: destIcon }).addTo(markerLayer.current);

       // Fetch and draw route if changed
       const routeStr = \`\${pickupCoords[1]},\${pickupCoords[0]};\${destinationCoords[1]},\${destinationCoords[0]}\`;
       if (!roadRoute || roadRoute.id !== routeStr) {
         fetch(\`https://router.project-osrm.org/route/v1/driving/\${routeStr}?overview=full&geometries=geojson\`)
           .then(r => r.json())
           .then(data => {
             if (data.routes && data.routes[0]) {
               const distanceKm = data.routes[0].distance / 1000;
               const durationMin = Math.round(data.routes[0].duration / 60);
               const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
               const routeMeta = { 
                 id: routeStr, 
                 coords, 
                 distance: distanceKm.toFixed(1),
                 duration: durationMin 
               };
               setRoadRoute(routeMeta);
               onRouteFound(distanceKm);
             }
           });
       }

       if (roadRoute && roadRoute.id === routeStr) {
         L.polyline(roadRoute.coords, { color: '#111827', weight: 5, opacity: 0.8 }).addTo(routeLayer.current);
         L.polyline(roadRoute.coords, { color: '#00B14F', weight: 3, opacity: 1 }).addTo(routeLayer.current);
         
         // Add Info Badge at midpoint for high-fidelity feel
         if (roadRoute.coords.length > 2) {
            const midIdx = Math.floor(roadRoute.coords.length / 2);
            const midPoint = roadRoute.coords[midIdx];
            
            const badgeIcon = L.divIcon({
              html: \`
                <div class="bg-[#00B14F] shadow-lg px-2.5 py-1 rounded-full flex items-center gap-2 animate-fadeInUp whitespace-nowrap border border-white/20">
                  <div class="flex items-center gap-1">
                     <span class="text-[11px] font-black text-white">\${roadRoute.duration}</span>
                     <span class="text-[8px] font-bold text-white/80 uppercase tracking-tighter">min</span>
                  </div>
                  <div class="w-[1px] h-2.5 bg-white/20"></div>
                  <div class="flex items-center gap-1">
                     <span class="text-[11px] font-black text-white">\${roadRoute.distance}</span>
                     <span class="text-[8px] font-bold text-white/80 uppercase tracking-tighter">km</span>
                  </div>
                </div>
              \`,
              className: 'custom-leaflet-marker !overflow-visible',
              iconSize: null,
              iconAnchor: [60, 15]
            });
            L.marker(midPoint, { icon: badgeIcon }).addTo(routeLayer.current);
         }

         // ONLY fitBounds if it's a new route to prevent "trembling"
         if (lastAnimatedRoute.current !== roadRoute.id) {
           const bounds = L.latLngBounds([pickupCoords, destinationCoords]);
           map.fitBounds(bounds, { padding: [100, 100], animate: true });
           lastAnimatedRoute.current = roadRoute.id;
         }
       }
    } else {
      // Clear last route tracking when route is gone
      if (lastAnimatedRoute.current !== 'default') {
        map.flyTo(currentPos, destinationCoords ? 16 : 14, { duration: 1.5 });
        lastAnimatedRoute.current = 'default';
      }
    }

  }, [showRoute, pickupCoords, destinationCoords, roadRoute, center, trackingPos, trackingHistory]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <style>{markerStyles}</style>
      <div ref={mapContainer} className="absolute inset-0 z-0" />
    </div>
  );
}

// Sub-components
const GButton = ({ children, onClick, disabled, className = '' }) => (
  <button onClick={onClick} disabled={disabled} className={\`h-[56px] px-6 bg-[#00B14F] text-white text-[17px] font-bold rounded-[24px] flex items-center justify-center active:scale-[0.96] transition-all disabled:opacity-50 shadow-lg shadow-[#00B14F]/20 \${className}\`}>{children}</button>
);

const GCard = ({ children, className = '' }) => (
  <div className={\`bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.06)] \${className}\`}>{children}</div>
);

function MatchingView({ navigate, onDriverFound }) {
  React.useEffect(() => {
    const t = setTimeout(onDriverFound, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-[32px] bg-white space-y-[48px] animate-fadeIn min-h-screen">
       <div className="relative">
          <div className="absolute inset-0 bg-[#00B14F]/10 rounded-full animate-ping scale-[3]"></div>
          <div className="w-[160px] h-[160px] bg-[#00B14F] rounded-full flex items-center justify-center text-white shadow-2xl relative z-10 border-8 border-white">
             <Car className="w-20 h-20 animate-bounce" />
          </div>
       </div>
       <div className="text-center space-y-4">
          <h2 className="text-[32px] font-black text-[#111827] tracking-tighter leading-none">Finding your <br/>perfect ride</h2>
          <p className="text-[14px] text-gray-400 font-bold uppercase tracking-[2px]">Connecting to 12 nearby drivers...</p>
       </div>
       <button onClick={() => navigate('home')} className="h-[56px] w-full max-w-[280px] bg-gray-50 text-gray-400 text-[12px] font-black uppercase tracking-[3px] rounded-full">Cancel Booking</button>
    </div>
  );
}

function TrackingView({ navigate, onArrived }) {
  const [eta, setEta] = React.useState(3);
  
  React.useEffect(() => {
    const timer = setTimeout(onArrived, 12000); // Simulate arrival
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-[8000] flex flex-col overflow-hidden animate-fadeIn">
       {/* Map Layer */}
       <div className="flex-1 relative">
          <PassengerMap showRoute={true} />
          
          {/* Top Status Badge */}
          <div className="absolute top-14 left-0 right-0 px-6 z-[1000]">
             <div className="bg-[#111827] text-white p-6 rounded-[24px] shadow-2xl flex items-center justify-between animate-fadeInDown">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-[#00B14F] rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-white" />
                   </div>
                   <div>
                      <h4 className="text-[17px] font-black leading-none mb-1">Driver arriving in {eta} mins</h4>
                      <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Plate: GAS-8292</p>
                   </div>
                </div>
                <div className="w-1.5 h-10 bg-white/10 rounded-full"></div>
                <div className="text-right">
                   <p className="text-[20px] font-black text-[#00B14F]">3 <span className="text-[10px] text-white">min</span></p>
                </div>
             </div>
          </div>

          <button onClick={() => navigate('home')} className="absolute top-36 left-6 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-600 z-[1000] active:scale-95 transition-all"><ArrowLeft/></button>
       </div>

       {/* Driver Info Card */}
       <div className="relative z-10 px-6 pb-12 -mt-10 animate-slideUp">
          <div className="backdrop-blur-3xl bg-white/90 p-8 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-white/60">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                   <div className="w-[72px] h-[72px] bg-gray-100 rounded-[28px] flex items-center justify-center text-[28px] font-black text-[#00B14F] border-4 border-white shadow-lg overflow-hidden">
                      <img src="https://ui-avatars.com/api/?name=Juan+Dela+Cruz&background=00B14F&color=fff" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <h3 className="text-[24px] font-black text-[#111827] leading-tight">Juan Dela Cruz</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                         <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                         <span className="text-[14px] font-bold text-[#111827]">4.9</span>
                         <span className="text-[14px] text-gray-300 mx-1">•</span>
                         <span className="text-[14px] text-gray-400 font-medium">920+ Trips</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="w-14 h-14 bg-blue-50 text-[#0f62fe] rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-blue-100"><Phone className="w-6 h-6" /></button>
                   <button className="w-14 h-14 bg-green-50 text-[#00B14F] rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-green-100"><MessagesSquare className="w-6 h-6" /></button>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 pb-8 border-b border-gray-100">
                <div className="p-5 bg-gray-50/50 rounded-[24px] border border-gray-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Estimated Time</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-[22px] font-black text-[#111827]">12</span>
                      <span className="text-[12px] font-bold text-gray-500 uppercase">Mins</span>
                   </div>
                </div>
                <div className="p-5 bg-gray-50/50 rounded-[24px] border border-gray-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Route Info</p>
                   <div className="flex items-center gap-2">
                      <span className="text-[14px] font-black text-[#111827]">Live Nav</span>
                      <Navigation className="w-4 h-4 text-[#00B14F]" />
                   </div>
                </div>
             </div>

             <div className="pt-8 flex items-center justify-between">
                <button className="flex items-center gap-3 text-red-500 font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all">
                   <ShieldAlert className="w-6 h-6" /> SOS
                </button>
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 bg-[#00B14F] rounded-full animate-ping"></span>
                   <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">On Trip</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function PaymentView({ navigate, onPaid }) {
  return (
    <div className="fixed inset-0 bg-[#00B14F] z-[8000] flex flex-col p-8 overflow-y-auto no-scrollbar animate-fadeIn">
       <div className="flex-1 flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#00B14F] shadow-[0_15px_40px_rgba(0,0,0,0.15)] mb-10 animate-bounce">
             <Check className="w-12 h-12 stroke-[4px]" />
          </div>
          <h1 className="text-[36px] font-black text-white text-center tracking-tighter leading-none mb-4 animate-fadeIn">Trip <br/>Completed!</h1>
          <p className="text-white/70 font-bold uppercase tracking-widest text-[11px] mb-12">Thank you for riding with King Transport</p>

          <div className="w-full backdrop-blur-xl bg-white/20 p-8 rounded-[36px] border border-white/30 text-white animate-slideUp">
             <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center opacity-80">
                   <span className="font-bold text-[15px]">Fare</span>
                   <span className="font-black">₱150.00</span>
                </div>
                <div className="flex justify-between items-center text-white">
                   <span className="font-bold text-[15px]">Discount</span>
                   <span className="font-black">-₱50.00</span>
                </div>
                <div className="h-[1px] bg-white/20 my-4"></div>
                <div className="flex justify-between items-center">
                   <span className="font-bold text-[18px]">Total Amount</span>
                   <span className="text-[28px] font-black">₱100.00</span>
                </div>
             </div>

             <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">Select Payment Method</p>
             <div className="space-y-3 mb-10">
                {[
                  { id: 'wallet', label: 'Grab Wallet', icon: <Wallet className="w-5 h-5" />, active: true },
                  { id: 'cash', label: 'Cash Payment', icon: <DollarSign className="w-5 h-5" /> },
                  { id: 'gcash', label: 'GCash', icon: <Smartphone className="w-5 h-5" /> }
                ].map(method => (
                  <div key={method.id} className={\`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer \${method.active ? 'border-white bg-white text-[#00B14F]' : 'border-white/10 hover:border-white/30'}\`}>
                     <div className="flex items-center gap-3">
                        {method.icon}
                        <span className="font-black text-[14px] uppercase tracking-tight">{method.label}</span>
                     </div>
                     <div className={\`w-5 h-5 rounded-full border-2 border-current flex items-center justify-center p-1\`}>
                        {method.active && <div className="w-full h-full bg-current rounded-full"></div>}
                     </div>
                  </div>
                ))}
             </div>

             <button 
               onClick={onPaid}
               className="w-full py-6 bg-white text-[#00B14F] rounded-[24px] font-black text-[14px] uppercase tracking-[3px] shadow-2xl active:scale-95 transition-all"
             >
                Confirm Payment
             </button>
          </div>
       </div>
    </div>
  );
}

function RatingView({ navigate, onFinish }) {
  const [rating, setRating] = React.useState(5);
  return (
    <div className="fixed inset-0 bg-white z-[8000] flex flex-col p-8 overflow-y-auto no-scrollbar animate-fadeIn">
       <div className="pt-20 pb-12 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-100 rounded-[28px] mb-8 overflow-hidden border-4 border-white shadow-xl">
             <img src="https://ui-avatars.com/api/?name=Juan+Dela+Cruz&background=00B14F&color=fff" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-[28px] font-black text-[#111827] text-center mb-2 tracking-tighter">Rate your <br/>driver</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-10">How was your trip with Juan?</p>

          <div className="flex gap-2 mb-12">
             {[1,2,3,4,5].map(s => (
               <button 
                 key={s} 
                 onClick={() => setRating(s)}
                 className={\`transition-all active:scale-75 \${s <= rating ? 'text-orange-400' : 'text-gray-200'}\`}
               >
                  <Star className={\`w-12 h-12 \${s <= rating ? 'fill-orange-400' : ''}\`} />
               </button>
             ))}
          </div>

          <div className="w-full space-y-6 mb-12">
             <textarea 
               className="w-full bg-gray-50 border-2 border-gray-100 rounded-[30px] p-6 text-[14px] font-medium focus:border-[#00B14F] outline-none transition-all placeholder:text-gray-300"
               placeholder="Add a comment (Optional)..."
               rows="3"
             ></textarea>
             
             <div className="grid grid-cols-2 gap-3">
                {['Clean car', 'Polite', 'Safe Driver', 'Good Music'].map(tag => (
                   <div key={tag} className="group cursor-pointer">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-[#00B14F] transition-all">
                         <div className="w-5 h-5 rounded-md border-2 border-gray-200 flex items-center justify-center group-hover:border-[#00B14F]">
                            <Check className="w-3 h-3 text-[#00B14F] opacity-0 group-hover:opacity-100" />
                         </div>
                         <span className="text-[12px] font-bold text-gray-500 group-hover:text-[#111827] transition-colors">{tag}</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <button 
            onClick={onFinish}
            className="w-full py-6 bg-[#111827] text-white rounded-[24px] font-black text-[14px] uppercase tracking-[3px] shadow-2xl active:scale-95 transition-all"
          >
             Submit Feedback
          </button>
       </div>
    </div>
  );
}

function PassengerApp() {
  const [view, setView] = React.useState('home'); // 'home', 'booking', 'tracking', 'matching', 'payment', 'rating', 'activity', 'wallet', 'account'
  const [service, setService] = React.useState('Transport');
  const [showServiceList, setShowServiceList] = React.useState(false);
  const [pickup, setPickup] = React.useState('Bogo City Hall, Cebu');
  const [pickupCoords, setPickupCoords] = React.useState([11.0500, 124.0000]);
  const [destination, setDestination] = React.useState('');
  const [destCoords, setDestCoords] = React.useState(null);
  const [searchTarget, setSearchTarget] = React.useState('destination'); 
  const [isDestinationConfirmed, setIsDestinationConfirmed] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = React.useState(false);

  // Tracking Simulation State
  const [trackingPos, setTrackingPos] = React.useState([11.0500, 124.0000]);
  const [trackingHistory, setTrackingHistory] = React.useState([]);
  const [isTrackingAutoFollow, setIsTrackingAutoFollow] = React.useState(true);

  // Fetch Current Location on Mount
  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setPickupCoords([latitude, longitude]);
        
        // Reverse geocode to get city name
        try {
          const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?lat=\${latitude}&lon=\${longitude}&format=json\`);
          const data = await res.json();
          if (data.display_name) {
            setPickup(data.display_name.split(',')[0] + ', ' + (data.address.city || data.address.town || 'Current Location'));
          }
        } catch (e) {
          setPickup('Current Location');
        }
      }, (error) => {
        console.log("Geolocation error:", error);
        // Stick with Bogo default
      });
    }
  }, []);

  // Simulation: Move the GPS device
  React.useEffect(() => {
    if (view !== 'tracking') return;
    
    const interval = setInterval(() => {
      setTrackingPos(prev => {
        const next = [prev[0] + (Math.random() - 0.5) * 0.001, prev[1] + (Math.random() - 0.5) * 0.001];
        setTrackingHistory(h => [...h.slice(-20), next]);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [view]);

  // Robust selection handler to avoid state races
  const handleSelect = (loc) => {
    if (!loc) return;
    
    // Safety check for coordinates
    let coords = loc.coords;
    if (!coords && loc.lat && loc.lon) {
      coords = [parseFloat(loc.lat), parseFloat(loc.lon)];
    }
    
    // Absolute fallback if parsing fails
    if (!coords || isNaN(coords[0]) || isNaN(coords[1])) {
      coords = pickupCoords || [14.5995, 120.9842];
    }
    
    setSuggestions([]);
    
    if (searchTarget === 'pickup') {
      setPickup(loc.fullName || loc.name);
      setPickupCoords(coords);
      setTimeout(() => setSearchTarget('destination'), 10);
    } else {
      setDestination(loc.fullName || loc.name);
      setDestCoords(coords);
      setIsDestinationConfirmed(true);
    }
    setShowOptionsSheet(false);
  };

  // Real-time Geocoding Search Effect
  React.useEffect(() => {
    // Don't search if we are already viewing options or if query is too short
    if (isDestinationConfirmed) {
      setSuggestions([]);
      return;
    }

    const query = searchTarget === 'pickup' ? pickup : destination;
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query)}&countrycodes=ph&limit=5\`);
        const data = await res.json();
        // Final guard: check if user confirmed while we were fetching
        if (!isDestinationConfirmed) {
          setSuggestions(data.map(item => ({
            name: item.display_name.split(',')[0],
            fullName: item.display_name,
            address: item.display_name.split(',').slice(1).join(',').trim(),
            lat: item.lat,
            lon: item.lon
          })));
        }
      } catch (e) {
        console.error('Geocoding error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [pickup, destination, searchTarget, isDestinationConfirmed]);
  
  // Dynamic Transport Services State
  const [bookingServices, setBookingServices] = React.useState([]);
  const [routeDistance, setRouteDistance] = React.useState(0);
  const [isLoadingServices, setIsLoadingServices] = React.useState(true);

  // Fetch Services from Admin Config
  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/booking-services');
        const data = await res.json();
        if (data.success && data.services && data.services.some(s => s.category?.toUpperCase() === 'TRANSPORT')) {
          setBookingServices(data.services.filter(s => s.category?.toUpperCase() === 'TRANSPORT'));
        } else {
          // Fallback if no transport services are configured in Admin yet
          setBookingServices([
            { id: 'f-1', name: 'GrabCar', base_fare: 50, per_km_rate: 15, icon: '🚗', duration: 'Standard 4-seater' },
            { id: 'f-2', name: 'GrabBike', base_fare: 30, per_km_rate: 8, icon: '🏍️', duration: 'Beat the traffic' },
            { id: 'f-3', name: 'GrabPremium', base_fare: 100, per_km_rate: 25, icon: '✨', duration: 'Premium Sedan' }
          ]);
        }
      } catch (e) {
        console.error("Failed to fetch transport services:", e);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // DERIVED: Transport Options with Dynamic Pricing
  const transportOptions = React.useMemo(() => {
    if (bookingServices.length === 0) return [];
    
    return bookingServices.map(s => {
      const baseFee = parseFloat(s.base_fare || 0);
      const kmRate = parseFloat(s.per_km_rate || 0);
      const calculatedPrice = baseFee + (routeDistance * kmRate);
      
      return {
        id: s.id,
        label: s.name,
        price: calculatedPrice > 0 ? Math.round(calculatedPrice) : 0,
        eta: 'Calculating...', // Can be connected to real ETA logic
        icon: s.icon ? <span className="text-2xl">{s.icon}</span> : <Car />,
        desc: s.duration || 'Standard Transport'
      };
    });
  }, [bookingServices, routeDistance]);

  const [selectedRide, setSelectedRide] = React.useState(null);

  // Auto-select first ride when options are loaded
  React.useEffect(() => {
    if (transportOptions.length > 0 && !selectedRide) {
      setSelectedRide(transportOptions[0]);
    }
  }, [transportOptions]);

  const services = [
    { label: 'Transport', icon: <Car className="w-7 h-7" />, id: 'transport' },
    { label: 'Delivery', icon: <Package className="w-7 h-7" />, id: 'delivery' },
    { label: 'Mart', icon: <ShoppingCart className="w-7 h-7" />, id: 'mart' },
    { label: 'Food', icon: <Truck className="w-7 h-7" />, id: 'food' },
    { label: 'Rentals', icon: <Clock className="w-7 h-7" />, id: 'rentals' },
    { label: 'Hotels', icon: <Building2 className="w-7 h-7" />, id: 'hotels' },
    { label: 'Insurance', icon: <ShieldCheck className="w-7 h-7" />, id: 'insurance' },
    { label: 'More', icon: <PlusSquare className="w-7 h-7" />, id: 'more' }
  ];

  const navigate = React.useCallback((newView) => { 
    if (newView === 'home') {
      setIsDestinationConfirmed(false);
      setShowOptionsSheet(false);
      setDestination('');
      setDestCoords(null);
      setSuggestions([]);
    }
    setView(newView);
  }, []);

  return (
    <div className="bg-[#F7F7F7] h-screen w-full relative flex flex-col font-sans overflow-hidden selection:bg-[#00B14F] selection:text-white">
       {view === 'home' ? (
          /* HOME HUB VIEW */
          <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-10">
             {/* Header with Search */}
             <div className="bg-[#00B14F] p-[20px] pt-[30px] rounded-b-[32px] shadow-lg relative z-20">
                <div className="flex items-center justify-between mb-8">
                   <button className="p-2 text-white"><Menu className="w-6 h-6" /></button>
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-black text-white">G</div>
                      <span className="text-white font-black text-[19px] tracking-tight">Grab</span>
                   </div>
                   <button className="p-2 text-white"><Bell className="w-6 h-6" /></button>
                </div>

                {/* Where to? Search Bar */}
                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-2 ml-1">Pick up Location</p>
                <div 
                  onClick={() => setView('booking')}
                  className="bg-white p-3.5 pr-5 rounded-[12px] shadow-2xl flex items-center gap-4 cursor-pointer active:scale-[0.95] transition-all border border-black/5"
                >
                   <div className="shrink-0 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#111827]" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[13px] font-bold text-gray-400">Where to?</p>
                   </div>
                   <div className="h-5 w-[1px] bg-gray-100"></div>
                   <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-[8px]">
                      <Clock className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-[9px] font-black text-[#111827]">Now</span>
                   </div>
                </div>
             </div>

             {/* Service Grid */}
             <div className="grid grid-cols-4 gap-y-8 px-[24px] py-[32px] mx-[20px] relative -mt-6 z-20">
                {services.map(svc => (
                   <button 
                     key={svc.id} 
                     onClick={() => { setService(svc.label); setView('booking'); }}
                     className="flex flex-col items-center gap-1 active:scale-90 transition-all text-[#111827]"
                   >
                      <div className="w-[64px] h-[64px] flex items-center justify-center transition-colors">
                         {svc.icon}
                      </div>
                      <span className="text-[10px] font-medium tracking-wider uppercase opacity-70">{svc.label}</span>
                   </button>
                ))}
             </div>

             {/* Promo Banner */}
             <div className="px-[20px] mt-6">
                <div className="backdrop-blur-3xl bg-gradient-to-br from-[#00B14F]/90 to-[#008A3D]/90 p-[28px] rounded-[36px] text-white relative overflow-hidden shadow-[0_20px_50px_rgba(0,138,61,0.3)] border border-white/20">
                   <div className="relative z-10 w-2/3">
                      <h3 className="text-[19px] font-black leading-tight mb-2">50% Off First Ride!</h3>
                      <p className="text-[11px] text-white/90 font-bold mb-4 uppercase tracking-widest opacity-80">Grab Exclusive Offer</p>
                      <button className="bg-white text-[#00B14F] px-8 py-3 rounded-full text-[14px] font-black shadow-xl active:scale-95 transition-all">Claim Now</button>
                   </div>
                   <Zap className="absolute -right-8 -top-8 w-56 h-56 text-white/10 rotate-12" />
                </div>
             </div>

             {/* GPS Tracking Entry */}
             <div className="px-[20px] mt-6 mb-24">
                <button 
                  onClick={() => setView('tracking')}
                  className="w-full backdrop-blur-xl bg-white/80 p-6 rounded-[36px] border border-[#00B14F]/20 shadow-xl flex items-center justify-between group active:scale-95 transition-all"
                >
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-[#00B14F] rounded-[24px] shadow-lg flex items-center justify-center text-white relative overflow-hidden">
                         <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                         <MapPin className="w-8 h-8 relative z-10" />
                      </div>
                      <div className="text-left">
                         <h4 className="text-[18px] font-black text-[#111827]">Track My Devices</h4>
                         <p className="text-[12px] font-bold text-gray-400">1 Device Online Now</p>
                      </div>
                   </div>
                   <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-[#00B14F] group-hover:text-white transition-all">
                      <ChevronRight className="w-6 h-6" />
                   </div>
                </button>
             </div>
          </div>
       ) : (
          /* BOOKING / MAP VIEW */
          <div className="flex-1 relative flex flex-col overflow-hidden">
             {/* Integrated Modern Header */}
             <div className="absolute top-[35px] left-[16px] right-[16px] z-[4000] flex items-start gap-3 pointer-events-none">
                <button 
                  onClick={() => navigate('home')} 
                  className="w-12 h-12 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#111827] active:scale-90 transition-all border border-white pointer-events-auto shrink-0"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                
                {service === 'Transport' && (
                  <GCard className="flex-1 p-[8px] flex flex-col gap-[6px] pointer-events-auto border border-white/50 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.12)] backdrop-blur-xl bg-white/85 rounded-[24px] relative origin-left animate-slideRight">
                     {/* Decorative vertical dashed line */}
                     <div className="absolute left-[24px] top-[40px] bottom-[40px] w-0 border-l-[1.5px] border-dashed border-gray-300/40 z-0"></div>
                     <div 
                       onClick={() => setSearchTarget('pickup')}
                       className={\`flex items-center gap-[10px] px-2 py-1.5 rounded-xl transition-all duration-300 cursor-text \${searchTarget === 'pickup' ? 'bg-blue-50/70 border border-blue-100' : 'hover:bg-gray-50/40'}\`}
                     >
                        <div className={\`transition-transform duration-300 \${searchTarget === 'pickup' ? 'scale-110 text-[#00B14F]' : 'text-gray-300'}\`}>
                            <MapPin className="w-[16px] h-[16px]" fill={searchTarget === 'pickup' ? 'currentColor' : 'none'} />
                         </div>
                        <input 
                          className="flex-1 text-[12px] font-medium text-[#111827] focus:outline-none bg-transparent" 
                          value={pickup} 
                          placeholder="Pick-up location"
                          onFocus={() => setSearchTarget('pickup')}
                          onChange={e => {
                            setPickup(e.target.value);
                            setIsDestinationConfirmed(false);
                          }} 
                        />
                        {pickup && searchTarget === 'pickup' && (
                          <button onClick={(e) => { e.stopPropagation(); setPickup(''); }} className="p-1 text-gray-300 hover:text-gray-500"><X className="w-3 h-3" /></button>
                        )}
                     </div>
                     <div className="h-[1px] bg-gray-100/50 ml-[22px]"></div>
                     <div 
                       onClick={() => setSearchTarget('destination')}
                       className={\`flex items-center gap-[10px] px-2 py-1.5 rounded-xl transition-all duration-300 cursor-text \${searchTarget === 'destination' ? 'bg-green-50/70 border border-green-100' : 'hover:bg-gray-50/40'}\`}
                     >
                        <div className={\`transition-transform duration-300 \${searchTarget === 'destination' ? 'scale-110 text-red-500' : 'text-gray-300'}\`}>
                            <MapPin className="w-[16px] h-[16px]" fill={searchTarget === 'destination' ? 'currentColor' : 'none'} />
                         </div>
                        <input 
                          className="flex-1 text-[12px] font-bold text-[#111827] focus:outline-none bg-transparent placeholder:text-gray-300" 
                          placeholder="Where to?"
                          onFocus={() => setSearchTarget('destination')}
                          value={destination} 
                          onChange={e => {
                            setDestination(e.target.value);
                            setIsDestinationConfirmed(false);
                          }} 
                        />
                        {destination && searchTarget === 'destination' && (
                          <button onClick={(e) => { e.stopPropagation(); setDestination(''); }} className="p-1 text-gray-300 hover:text-gray-500"><X className="w-3 h-3" /></button>
                        )}
                     </div>
                  </GCard>
                )}
             </div>

             <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <PassengerMap 
                    pickupCoords={pickupCoords} 
                    destinationCoords={destCoords} 
                    showRoute={isDestinationConfirmed}
                    onRouteFound={React.useCallback((dist) => setRouteDistance(dist), [])} 
                  />
                </div>

                <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
                   <div className="flex-1 p-[16px] pt-[155px] space-y-4 overflow-y-auto no-scrollbar pb-40">
                      {service === 'Transport' ? (
                        <>
                          {/* Search Suggestions List */}
                          {!isSearching && (searchTarget === 'pickup' ? pickup : destination) && suggestions.length > 0 && (
                            <div className="space-y-2 pointer-events-auto animate-fadeInUp relative z-[5000]">
                               {suggestions.map((loc, i) => (
                                 <button 
                                   key={i}
                                   type="button"
                                   onPointerDown={(e) => {
                                     e.preventDefault();
                                     handleSelect(loc);
                                   }}
                                   className={\`w-full flex items-center gap-4 p-4 backdrop-blur-xl rounded-[24px] active:bg-gray-100/50 transition-all text-left shadow-lg border border-white/60 \${searchTarget === 'pickup' ? 'bg-white/85 border-blue-100' : 'bg-white/85 border-red-100'}\`}
                                 >
                                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${searchTarget === 'pickup' ? 'bg-blue-50/80 text-blue-500' : 'bg-red-50/80 text-red-500'}\`}>
                                       <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 overflow-hidden pointer-events-none">
                                       <p className="text-[15px] font-bold text-[#111827] truncate">{loc.name}</p>
                                       <p className="text-[11px] text-gray-500 font-medium truncate">{loc.address}</p>
                                    </div>
                                 </button>
                               ))}
                            </div>
                          )}

                          {isSearching && (
                            <div className="flex items-center justify-center py-10 pointer-events-auto">
                               <div className="w-6 h-6 border-2 border-[#00B14F] border-t-transparent rounded-full animate-spin"></div>
                               <span className="ml-3 text-[14px] font-bold text-gray-400">Searching...</span>
                            </div>
                          )}

                          {/* Quick Options (Hidden until confirmed) */}
                          {isDestinationConfirmed && !isSearching && (
                            <div className="grid grid-cols-3 gap-2 pointer-events-auto animate-fadeIn">
                               {[{ l: 'Personal', i: <User className="w-4 h-4" /> }, { l: 'Cash', i: <Wallet className="w-4 h-4" /> }, { l: 'Now', i: <Clock className="w-4 h-4" /> }].map(o => (
                                 <div key={o.l} className="p-2.5 flex flex-col items-center gap-1 active:bg-gray-50 transition-colors">
                                    <div className="text-gray-400">{o.i}</div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{o.l}</span>
                                 </div>
                               ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="pointer-events-auto">
                           <GCard className="p-8 text-center bg-white/95 backdrop-blur-sm shadow-xl">
                              <h3 className="text-[18px] font-black">{service} Service</h3>
                              <p className="text-[13px] text-gray-500">Coming soon to your area.</p>
                           </GCard>
                        </div>
                      )}
                   </div>

                   {service === 'Transport' && isDestinationConfirmed && !showOptionsSheet && !isSearching && (
                      <div className="pointer-events-auto mt-auto px-6 pb-6 animate-fadeInUp">
                         <div className="backdrop-blur-2xl bg-white/80 p-3 rounded-[20px] shadow-[0_8px_30px_-5px_rgba(0,0,0,0.1)] border border-white/60 flex flex-col gap-2.5">
                            <div className="flex items-center gap-2.5">
                               <div className="w-7 h-7 flex items-center justify-center text-[#111827]">
                                  <Car className="w-4 h-4" />
                                </div>
                               <div>
                                  <p className="text-[8px] font-bold text-[#00B14F] uppercase tracking-[0.1em] leading-none mb-0.5 font-black">Ready to go</p>
                                  <p className="text-[12px] font-bold text-[#111827]">Tap to see personalized rides</p>
                               </div>
                            </div>
                            <GButton 
                              className="w-full !rounded-[24px] tracking-[1px] font-black text-[12px] h-[40px] shadow-sm border-none bg-gradient-to-r from-[#00B14F] to-[#008A3D]" 
                              onClick={() => {
                                 setShowOptionsSheet(true);
                                 setIsCalculating(true);
                                 setTimeout(() => setIsCalculating(false), 1200);
                              }}
                            >
                               Discover Rides
                            </GButton>
                         </div>
                      </div>
                   )}

                   {service === 'Transport' && showOptionsSheet && (
                      <div className="pointer-events-auto mt-auto flex flex-col backdrop-blur-3xl bg-white/85 rounded-t-[40px] shadow-[0_-15px_50px_-10px_rgba(0,0,0,0.2)] overflow-hidden max-h-[70%] animate-slideUp relative border-t border-white/50">
                         {/* Close Button & Handle */}
                         <div className="flex items-center justify-between px-6 pt-3 pb-2 sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                            <div className="w-10"></div> {/* Spacer for symmetry */}
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full"></div>
                            <button 
                              onClick={() => setShowOptionsSheet(false)}
                              className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center active:scale-90 transition-all"
                            >
                               <X className="w-5 h-5" />
                            </button>
                         </div>

                        <div className="flex-1 overflow-y-auto px-[16px] space-y-2 py-2 no-scrollbar">
                           {transportOptions.map(opt => (
                             <div 
                               key={opt.id}
                               onClick={() => setSelectedRide(opt)}
                               className={\`flex items-center justify-between p-4 rounded-[22px] transition-all \${selectedRide?.id === opt.id ? 'bg-[#E8F5E9] border-2 border-[#00B14F]' : 'border-2 border-transparent hover:bg-gray-50'}\`}
                             >
                                <div className="flex items-center gap-4">
                                   <div className="w-[48px] h-[48px] flex items-center justify-center text-gray-600">{opt.icon}</div>
                                   <div>
                                      <h4 className="text-[15px] font-bold text-[#111827] leading-tight">{opt.label}</h4>
                                      <p className="text-[11px] text-[#6B7280] font-medium leading-none mt-1">{opt.eta} away • {opt.desc}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   {isCalculating ? (
                                      <div className="w-12 h-3 bg-gray-100 rounded animate-pulse ml-auto"></div>
                                   ) : (
                                      <>
                                         <span className="text-[10px] text-[#00B14F] font-bold">₱</span>
                                         <span className="text-[16px] font-black text-[#111827]">{opt.price}</span>
                                      </>
                                   )}
                                </div>
                             </div>
                           ))}
                        </div>
                        <div className="px-5 pb-8 pt-4 border-t border-gray-50">
                           <GButton 
                             disabled={isCalculating}
                             className={\`w-full !rounded-2xl tracking-[2px] font-black text-[16px] h-14 transition-all \${isCalculating ? 'bg-gray-100 text-gray-400 border-none' : ''}\`} 
                             onClick={() => navigate('matching')}
                           >
                              {isCalculating ? 'Calculating...' : \`Book \${selectedRide?.label || 'Ride'}\`}
                           </GButton>
                        </div>
                      </div>
                   )}
                </div>
             </div>
          </div>
       )}

       {/* ACTIVITY VIEW */}
       {view === 'activity' && (
         <div className="flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar pb-32">
            <div className="p-8 pt-20">
               <h2 className="text-[32px] font-black text-[#111827] mb-8">Activity</h2>
               <div className="space-y-6">
                  {[
                    { from: 'SM Cebu', to: 'Home', price: 150, date: 'May 12', time: '14:30' },
                    { from: 'Ayala Center', to: 'IT Park', price: 120, date: 'May 10', time: '09:15' },
                    { from: 'Cebu Port', to: 'Parkmall', price: 180, date: 'May 08', time: '18:45' }
                  ].map((trip, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-[24px] border border-gray-100 active:scale-[0.98] transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><Car className="w-6 h-6" /></div>
                          <div>
                             <h4 className="font-bold text-[15px]">{trip.from} → {trip.to}</h4>
                             <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{trip.date} • {trip.time}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-[#111827]">₱{trip.price}</p>
                          <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-10 py-5 border-2 border-gray-100 rounded-[24px] font-black text-[12px] uppercase tracking-widest text-gray-400">View Older History</button>
            </div>
         </div>
       )}

       {/* WALLET VIEW */}
       {view === 'wallet' && (
         <div className="flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar pb-32">
            <div className="bg-[#00B14F] p-8 pt-20 rounded-b-[40px] shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">Available Balance</p>
                  <h1 className="text-[48px] font-black text-white leading-tight mb-8">₱1,200.00</h1>
                  <div className="flex gap-4">
                     <button className="flex-1 bg-white text-[#00B14F] py-4 rounded-[16px] font-black text-[12px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Top Up
                     </button>
                     <button className="flex-1 bg-white/20 backdrop-blur-md text-white py-4 rounded-[16px] font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <ArrowUpRight className="w-4 h-4" /> Transfer
                     </button>
                  </div>
               </div>
               <Zap className="absolute -right-16 -bottom-16 w-64 h-64 text-white/5 rotate-12" />
            </div>
            
            <div className="p-8">
               <h3 className="text-[16px] font-black text-[#111827] mb-6 uppercase tracking-tight">Recent Transactions</h3>
               <div className="space-y-4">
                  {[
                    { type: 'topup', label: 'Top-up from GCash', amount: 500, date: 'Today' },
                    { type: 'ride', label: 'Ride Payment (to IT Park)', amount: -150, date: 'Yesterday' },
                    { type: 'ride', label: 'Ride Payment (to SM)', amount: -210, date: 'Yesterday' }
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50">
                       <div className="flex items-center gap-4">
                          <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${tx.type === 'topup' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}\`}>
                             {tx.type === 'topup' ? <Plus className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                          </div>
                          <div>
                             <p className="font-bold text-[14px] text-[#111827]">{tx.label}</p>
                             <p className="text-[11px] text-gray-400">{tx.date}</p>
                          </div>
                       </div>
                       <p className={\`font-black \${tx.amount > 0 ? 'text-[#00B14F]' : 'text-[#111827]'}\`}>
                          {tx.amount > 0 ? '+' : ''}₱{Math.abs(tx.amount)}
                       </p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
       )}

       {/* ACCOUNT VIEW */}
       {view === 'account' && (
         <div className="flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar pb-32">
            <div className="p-8 pt-20">
               <div className="flex items-center gap-6 mb-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-[32px] flex items-center justify-center text-[32px] font-black text-[#00B14F] border-4 border-white shadow-xl">JD</div>
                  <div>
                     <h2 className="text-[28px] font-black text-[#111827] leading-tight">John Doe</h2>
                     <p className="text-[14px] text-gray-400 font-medium">john.doe@email.com</p>
                  </div>
               </div>
               
               <div className="space-y-2">
                  {[
                    { label: 'Profile Settings', icon: <User className="w-6 h-6" /> },
                    { label: 'Grab Rewards', icon: <Star className="w-6 h-6" /> },
                    { label: 'Payment Methods', icon: <CreditCard className="w-6 h-6" /> },
                    { label: 'Emergency Contacts', icon: <ShieldAlert className="w-6 h-6" /> },
                    { label: 'Help Center', icon: <LifeBuoy className="w-6 h-6" /> },
                    { label: 'About Grab', icon: <Info className="w-6 h-6" />, type: 'about' }
                  ].map((item, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 active:bg-gray-100 rounded-[24px] transition-all group">
                       <div className="flex items-center gap-5">
                          <div className="text-gray-400 group-hover:text-[#00B14F] transition-colors">{item.icon}</div>
                          <span className="font-bold text-[16px] text-[#111827]">{item.label}</span>
                       </div>
                       <ChevronRight className="w-5 h-5 text-gray-200" />
                    </button>
                  ))}
               </div>
               
               <button onClick={() => setCurrentPage('home')} className="w-full mt-10 py-5 bg-red-50 text-red-600 rounded-[24px] font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all">Sign Out</button>
            </div>
         </div>
       )}

       {/* Bottom Navigation */}
       {['home', 'activity', 'wallet', 'account'].includes(view) && (
         <div className="absolute bottom-0 left-0 right-0 h-28 bg-white/90 backdrop-blur-2xl border-t border-gray-100 flex items-center justify-around px-4 pb-6 z-[6000]">
            {[
               { id: 'home', label: 'Explore', icon: <Navigation className="w-6 h-6" /> },
               { id: 'activity', label: 'Activity', icon: <History className="w-6 h-6" /> },
               { id: 'wallet', label: 'Payment', icon: <Wallet className="w-6 h-6" /> },
               { id: 'account', label: 'Account', icon: <User className="w-6 h-6" /> }
            ].map(nav => (
               <button 
                 key={nav.id} 
                 onClick={() => setView(nav.id)}
                 className={\`flex flex-col items-center gap-1.5 px-6 pt-2 transition-all \${view === nav.id ? 'text-[#00B14F]' : 'text-gray-300'}\`}
               >
                  <div className={\`transition-transform duration-300 \${view === nav.id ? 'scale-110' : ''}\`}>
                    {nav.icon}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest\">\${nav.label}</span>
                  {view === nav.id && <div className="w-1.5 h-1.5 bg-[#00B14F] rounded-full absolute bottom-2 shadow-[0_0_10px_#00B14F]"></div>}
               </button>
            ))}
         </div>
       )}

       {/* Overlays */}
       {['matching', 'tracking', 'payment', 'rating'].includes(view) && (
          <div className="fixed inset-0 z-[7000] bg-white animate-fadeIn">
             {view === 'matching' && <MatchingView navigate={navigate} onDriverFound={() => setView('tracking')} />}
             {view === 'tracking' && <TrackingView navigate={navigate} onArrived={() => setView('payment')} />}
             {view === 'payment' && <PaymentView navigate={navigate} onPaid={() => setView('rating')} />}
             {view === 'rating' && <RatingView navigate={navigate} onFinish={() => setView('home')} />}
          </div>
       )}
    </div>
  );
}
`;

// Insert the code
const startIndex = lines.findIndex(l => l.includes('// Static defaults to prevent re-renders'));
const endIndex = lines.findIndex(l => l.includes('function HomeIcon(props) {'));

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex, cleanCode);
  fs.writeFileSync(path, lines.join('\n'));
  console.log('Recovery complete');
} else {
  console.log('Failed to find markers: ' + startIndex + ', ' + endIndex);
}
