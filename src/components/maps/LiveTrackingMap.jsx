
import React, { useState, useEffect } from 'react';

const LiveTrackingMap = ({ riderPos, pickupPos, destPos, status, pickMode = false, onPick }) => {
  const mapRef = React.useRef(null);
  const leafletMap = React.useRef(null);
  const [mainRoute, setMainRoute] = useState(null);
  const [driverRoute, setDriverRoute] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const userInteractedRef = React.useRef(false);
  const markersRef = React.useRef([]);
  const prevRiderPosRef = React.useRef(null);
  const bearingRef = React.useRef(0);

  useEffect(() => {
    const L = window.L;
    if (!L) {
      console.error('Leaflet (L) not found on window');
      return;
    }

    const container = mapRef.current;
    const handleUserInteraction = () => {
      userInteractedRef.current = true;
      setUserInteracted(true);
    };

    try {
      leafletMap.current = L.map(mapRef.current, { 
        zoomControl: false, 
        scrollWheelZoom: true,
        fadeAnimation: true
      }).setView([11.0500, 124.0000], 13);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(leafletMap.current);

      // Bind interaction listeners
      leafletMap.current.on('dragstart', handleUserInteraction);

      if (container) {
        container.addEventListener('wheel', handleUserInteraction, { passive: true });
        container.addEventListener('touchmove', handleUserInteraction, { passive: true });
        container.addEventListener('dblclick', handleUserInteraction);
      }

      // Force a resize check
      setTimeout(() => {
        if (leafletMap.current) leafletMap.current.invalidateSize();
      }, 500);
    } catch (err) {
      console.error('Error initializing map:', err);
    }

    return () => { 
      if (container) {
        container.removeEventListener('wheel', handleUserInteraction);
        container.removeEventListener('touchmove', handleUserInteraction);
        container.removeEventListener('dblclick', handleUserInteraction);
      }
      if (leafletMap.current) { 
        leafletMap.current.remove(); 
        leafletMap.current = null; 
      } 
    };
  }, []);

  // Fetch Main Trip Route
  useEffect(() => {
    const startLat = status === 'picked_up' ? riderPos?.lat : pickupPos?.lat;
    const startLng = status === 'picked_up' ? riderPos?.lng : pickupPos?.lng;

    if (startLat && startLng && destPos) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destPos.lng},${destPos.lat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (data.routes?.[0]?.geometry?.coordinates) {
            setMainRoute(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
          }
        }).catch(() => setMainRoute(null));
    } else {
      setMainRoute(null);
    }
  }, [pickupPos?.lat, pickupPos?.lng, destPos?.lat, destPos?.lng, status === 'picked_up' ? riderPos?.lat : null, status === 'picked_up' ? riderPos?.lng : null, status]);

  // Fetch Driver Tracking Route
  useEffect(() => {
    if (riderPos && pickupPos && status !== 'picked_up') {
      fetch(`https://router.project-osrm.org/route/v1/driving/${riderPos.lng},${riderPos.lat};${pickupPos.lng},${pickupPos.lat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (data.routes?.[0]?.geometry?.coordinates) {
            setDriverRoute(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
          }
        }).catch(() => setDriverRoute(null));
    } else {
      setDriverRoute(null);
    }
  }, [riderPos?.lat, riderPos?.lng, pickupPos?.lat, pickupPos?.lng, status]);

  useEffect(() => {
    const L = window.L;
    if (!leafletMap.current || !L) return;

    // Clear prev layers
    leafletMap.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        leafletMap.current.removeLayer(layer);
      }
    });

    const markers = [];

    // Rider Marker (Detailed Top-Down Car Icon)
    if (riderPos) {
      if (prevRiderPosRef.current) {
        const p1 = prevRiderPosRef.current;
        const p2 = riderPos;
        if (p1.lat !== p2.lat || p1.lng !== p2.lng) {
          const toRad = (deg) => (deg * Math.PI) / 180;
          const toDeg = (rad) => (rad * 180) / Math.PI;
          const lat1 = toRad(p1.lat);
          const lat2 = toRad(p2.lat);
          const dLng = toRad(p2.lng - p1.lng);
          const y = Math.sin(dLng) * Math.cos(lat2);
          const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
          bearingRef.current = (toDeg(Math.atan2(y, x)) + 360) % 360;
        }
      }
      prevRiderPosRef.current = riderPos;

      const iconColor = '#00B14F';
      const carSvgHtml = `
        <div class="relative flex items-center justify-center transition-all hover:scale-110" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2)); transform: rotate(${bearingRef.current}deg);">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 1.5C8 1.5 6 3 6 5.5v14c0 2.5 2 3 6 3s6-0.5 6-3v-14c0-2.5-2-4-6-4z" fill="${iconColor}" />
            <path d="M6.8 8 Q12 5 17.2 8 Z" fill="#1a1a1a" />
            <rect x="6.5" y="9" width="0.8" height="8" fill="#1a1a1a" />
            <rect x="16.7" y="9" width="0.8" height="8" fill="#1a1a1a" />
            <rect x="7.8" y="8.5" width="8.4" height="8" rx="1.5" fill="black" opacity="0.15" />
            <path d="M8 17.5 Q12 20 16 17.5 Z" fill="#1a1a1a" />
            <circle cx="5" cy="8" r="1.2" fill="${iconColor}" />
            <circle cx="19" cy="8" r="1.2" fill="${iconColor}" />
            <rect x="7" y="20.5" width="3.5" height="1" rx="0.3" fill="#ff3333" />
            <rect x="13.5" y="20.5" width="3.5" height="1" rx="0.3" fill="#ff3333" />
          </svg>
        </div>
      `;
      L.marker([riderPos.lat, riderPos.lng], {
        icon: L.divIcon({
          html: carSvgHtml,
          className: 'rider-car-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(leafletMap.current);
      markers.push([riderPos.lat, riderPos.lng]);
    }

    // Pickup Marker
    if (pickupPos && status !== 'picked_up') {
      L.marker([pickupPos.lat, pickupPos.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          iconSize: [25, 41], iconAnchor: [12, 41]
        })
      }).addTo(leafletMap.current).bindPopup('<b>Pickup Point</b>');
      markers.push([pickupPos.lat, pickupPos.lng]);
    }

    // Destination Marker
    if (destPos) {
      L.marker([destPos.lat, destPos.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          iconSize: [25, 41], iconAnchor: [12, 41]
        })
      }).addTo(leafletMap.current).bindPopup('<b>Destination</b>');
      markers.push([destPos.lat, destPos.lng]);
    }

    // Draw lines
    if (driverRoute) {
      L.polyline(driverRoute, {
        color: '#00B14F', weight: 3, dashArray: '5, 8', opacity: 0.8, lineJoin: 'round'
      }).addTo(leafletMap.current);
    } else if (riderPos && pickupPos && status !== 'picked_up') {
      L.polyline([[riderPos.lat, riderPos.lng], [pickupPos.lat, pickupPos.lng]], {
        color: '#00B14F', weight: 3, dashArray: '5, 8', opacity: 0.8, lineJoin: 'round'
      }).addTo(leafletMap.current);
    }

    if (mainRoute) {
      L.polyline(mainRoute, {
        color: '#00B14F', weight: 4, opacity: 0.9, lineJoin: 'round'
      }).addTo(leafletMap.current);
    } else if (pickupPos && destPos) {
      const start = status === 'picked_up' && riderPos ? [riderPos.lat, riderPos.lng] : [pickupPos.lat, pickupPos.lng];
      L.polyline([start, [destPos.lat, destPos.lng]], {
        color: '#00B14F', weight: 4, opacity: 0.9, lineJoin: 'round'
      }).addTo(leafletMap.current);
    }

    markersRef.current = markers;
    if (markers.length > 0 && !userInteractedRef.current) {
      setTimeout(() => {
        if (leafletMap.current) {
          leafletMap.current.invalidateSize();
          leafletMap.current.fitBounds(markers, { padding: [50, 50] });
        }
      }, 100);
    }
  }, [riderPos, pickupPos, destPos, status, mainRoute, driverRoute]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {userInteracted && (
        <button
          onClick={() => {
            userInteractedRef.current = false;
            setUserInteracted(false);
            if (leafletMap.current && markersRef.current.length > 0) {
              leafletMap.current.invalidateSize();
              leafletMap.current.fitBounds(markersRef.current, { padding: [50, 50] });
            }
          }}
          className="absolute bottom-6 right-6 z-[1000] bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 text-[11px] font-black uppercase tracking-wider cursor-pointer"
          title="Recenter Map"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#00B14F]">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Recenter
        </button>
      )}
    </div>
  );
};

export default LiveTrackingMap;
