import React, { useEffect, useRef, useState } from 'react';

const RideBookingMap = ({ pickupPos, destPos, onMapClick }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const L = window.L;
    if (!L) return;

    leafletMap.current = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: true
    }).setView([11.0500, 124.0000], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMap.current);

    leafletMap.current.on('click', (e) => {
      onMapClick && onMapClick(e.latlng);
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update Markers and Route
  useEffect(() => {
    const L = window.L;
    if (!leafletMap.current || !L) return;

    // Clear existing markers/lines
    leafletMap.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        leafletMap.current.removeLayer(layer);
      }
    });

    const markers = [];

    if (pickupPos) {
      L.marker([pickupPos.lat, pickupPos.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
        })
      }).addTo(leafletMap.current).bindPopup('Pickup');
      markers.push([pickupPos.lat, pickupPos.lng]);
    }

    if (destPos) {
      L.marker([destPos.lat, destPos.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
        })
      }).addTo(leafletMap.current).bindPopup('Drop-off');
      markers.push([destPos.lat, destPos.lng]);
    }

    // Fetch and Draw Route
    if (pickupPos && destPos) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${pickupPos.lng},${pickupPos.lat};${destPos.lng},${destPos.lat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (data.routes?.[0]?.geometry?.coordinates) {
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            L.polyline(coords, { color: '#00B14F', weight: 5, opacity: 0.8 }).addTo(leafletMap.current);
          }
        }).catch(() => {
          // Fallback straight line
          L.polyline([[pickupPos.lat, pickupPos.lng], [destPos.lat, destPos.lng]], { 
            color: '#00B14F', weight: 5, opacity: 0.8, dashArray: '10, 10' 
          }).addTo(leafletMap.current);
        });
    }

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      leafletMap.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pickupPos, destPos]);

  return (
    <div className="relative w-full h-full min-h-[200px] rounded-2xl overflow-hidden shadow-inner border border-gray-100">
      <div ref={mapRef} className="w-full h-full z-0" />
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white flex items-center gap-2">
        <div className="w-2 h-2 bg-[#00B14F] rounded-full animate-pulse"></div>
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Interactive Map</span>
      </div>
    </div>
  );
};

export default RideBookingMap;
