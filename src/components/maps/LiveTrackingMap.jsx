
import React, { useState, useEffect } from 'react';

const LiveTrackingMap = ({ riderPos, pickupPos, destPos, status }) => {
  const mapRef = React.useRef(null);
  const leafletMap = React.useRef(null);
  const [mainRoute, setMainRoute] = useState(null);
  const [driverRoute, setDriverRoute] = useState(null);

  useEffect(() => {
    const L = window.L;
    if (!L) {
      console.error('Leaflet (L) not found on window');
      return;
    }

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

      // Force a resize check
      setTimeout(() => {
        if (leafletMap.current) leafletMap.current.invalidateSize();
      }, 500);
    } catch (err) {
      console.error('Error initializing map:', err);
    }

    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);

  // Fetch Main Trip Route
  useEffect(() => {
    if (pickupPos && destPos) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${pickupPos.lng},${pickupPos.lat};${destPos.lng},${destPos.lat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (data.routes?.[0]?.geometry?.coordinates) {
            setMainRoute(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
          }
        }).catch(() => setMainRoute(null));
    }
  }, [pickupPos?.lat, pickupPos?.lng, destPos?.lat, destPos?.lng]);

  // Fetch Driver Tracking Route
  useEffect(() => {
    if (riderPos && pickupPos) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${riderPos.lng},${riderPos.lat};${pickupPos.lng},${pickupPos.lat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (data.routes?.[0]?.geometry?.coordinates) {
            setDriverRoute(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
          }
        }).catch(() => setDriverRoute(null));
    }
  }, [riderPos?.lat, riderPos?.lng, pickupPos?.lat, pickupPos?.lng]);

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

    // Rider Marker (Pulsing Blue GPS Dot)
    if (riderPos) {
      const pulsingDotHtml = `
        <div class="relative flex h-6 w-6 items-center justify-center">
          <div class="absolute h-full w-full animate-ping rounded-full bg-blue-500 opacity-40"></div>
          <div class="relative h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-lg"></div>
        </div>
      `;
      L.marker([riderPos.lat, riderPos.lng], {
        icon: L.divIcon({
          html: pulsingDotHtml,
          className: 'gps-dot-container',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(leafletMap.current);
      markers.push([riderPos.lat, riderPos.lng]);
    }

    // Pickup Marker
    if (pickupPos) {
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
        color: '#0f62fe', weight: 4, dashArray: '5, 8', opacity: 0.8, lineJoin: 'round'
      }).addTo(leafletMap.current);
    } else if (riderPos && pickupPos) {
      L.polyline([[riderPos.lat, riderPos.lng], [pickupPos.lat, pickupPos.lng]], {
        color: '#0f62fe', weight: 4, dashArray: '5, 8', opacity: 0.8, lineJoin: 'round'
      }).addTo(leafletMap.current);
    }

    if (mainRoute) {
      L.polyline(mainRoute, {
        color: '#161616', weight: 6, opacity: 1, lineJoin: 'round'
      }).addTo(leafletMap.current);
    } else if (pickupPos && destPos) {
      L.polyline([[pickupPos.lat, pickupPos.lng], [destPos.lat, destPos.lng]], {
        color: '#1c1917', weight: 6, opacity: 1, lineJoin: 'round'
      }).addTo(leafletMap.current);
    }

    if (markers.length > 0) {
      setTimeout(() => {
        if (leafletMap.current) {
          leafletMap.current.invalidateSize();
          leafletMap.current.fitBounds(markers, { padding: [50, 50] });
        }
      }, 100);
    }
  }, [riderPos, pickupPos, destPos, status, mainRoute, driverRoute]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default LiveTrackingMap;
