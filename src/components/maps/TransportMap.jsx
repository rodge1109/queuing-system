
import React from 'react';

const TransportMapBase = ({ onLocationSelect, mapAction }) => {
  const mapRef = React.useRef(null);
  const leafletMap = React.useRef(null);
  const pickupMarker = React.useRef(null);
  const destMarker = React.useRef(null);
  const routeLine = React.useRef(null);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.display_name || `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (e) {
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const forwardGeocode = async (address) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const distanceMarker = React.useRef(null);

  const updateRoute = async () => {
    if (!pickupMarker.current || !destMarker.current) return;
    const p1 = pickupMarker.current.getLatLng();
    const p2 = destMarker.current.getLatLng();
    const L = window.L;

    try {
      // Use OSRM for real-road routing
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${p1.lng},${p1.lat};${p2.lng},${p2.lat}?overview=full&geometries=geojson`);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(c => [c[1], c[0]]);
        const dist = route.distance / 1000; // Meters to KM

        if (routeLine.current) {
          routeLine.current.setLatLngs(coordinates);
        } else {
          routeLine.current = L.polyline(coordinates, {
            color: '#24a148',
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round'
          }).addTo(leafletMap.current);
        }

        // Add distance bean button in the middle
        const midPoint = coordinates[Math.floor(coordinates.length / 2)];
        const badgeHtml = `
          <div style="background: #24a148; color: white; padding: 6px 18px; border-radius: 100px; font-size: 12px; font-weight: 900; white-space: nowrap; box-shadow: 0 8px 24px rgba(36, 161, 72, 0.4); border: 2px solid white; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; letter-spacing: 0.5px; animation: bounceIn 0.5s ease-out;">
            <span style="margin-right: 6px; font-size: 14px;">🛣️</span>
            ${dist.toFixed(1)} KM
          </div>
        `;

        if (distanceMarker.current) {
          distanceMarker.current.setLatLng(midPoint).setIcon(L.divIcon({ html: badgeHtml, className: 'distance-badge', iconSize: [0, 0] }));
        } else {
          distanceMarker.current = L.marker(midPoint, {
            icon: L.divIcon({ html: badgeHtml, className: 'distance-badge', iconSize: [0, 0] })
          }).addTo(leafletMap.current);
        }

        leafletMap.current.fitBounds(L.latLngBounds(p1, p2), { padding: [80, 80] });
        onLocationSelect(null, null, dist);
      } else {
        // Fallback to straight line if OSRM fails
        const dist = p1.distanceTo(p2) / 1000;
        if (routeLine.current) routeLine.current.setLatLngs([p1, p2]);
        else routeLine.current = L.polyline([p1, p2], { color: '#24a148', weight: 4, dashArray: '10, 10' }).addTo(leafletMap.current);
        onLocationSelect(null, null, dist);
      }
    } catch (err) {
      console.error('Routing error:', err);
    }
  };

  React.useEffect(() => {
    if (mapAction && leafletMap.current) {
      const L = window.L;
      handleGeocodeAction(mapAction);
    }

    async function handleGeocodeAction(action) {
      const coords = await forwardGeocode(action.address);
      if (!coords) return;
      const { lat, lng } = coords;
      const L = window.L;

      if (action.type === 'pickup') {
        if (pickupMarker.current) pickupMarker.current.setLatLng([lat, lng]);
        else pickupMarker.current = L.marker([lat, lng], {
          draggable: true, icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41]
          })
        }).addTo(leafletMap.current).bindPopup('Pickup');
        
        pickupMarker.current.on('dragend', async () => {
          const pos = pickupMarker.current.getLatLng();
          const address = await reverseGeocode(pos.lat, pos.lng);
          onLocationSelect({ address, coords: { lat: pos.lat, lng: pos.lng } }, null);
          updateRoute();
        });
      } else {
        if (destMarker.current) destMarker.current.setLatLng([lat, lng]);
        else destMarker.current = L.marker([lat, lng], {
          draggable: true, icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41]
          })
        }).addTo(leafletMap.current).bindPopup('Destination');
        
        destMarker.current.on('dragend', async () => {
          const pos = destMarker.current.getLatLng();
          const address = await reverseGeocode(pos.lat, pos.lng);
          onLocationSelect(null, { address, coords: { lat: pos.lat, lng: pos.lng } });
          updateRoute();
        });
      }
      leafletMap.current.setView([lat, lng], 15);
      updateRoute();
    }
  }, [mapAction]);

  React.useEffect(() => {
    if (!mapRef.current || leafletMap.current || mapRef.current._leaflet_id) return;
    const L = window.L;
    if (!L) return;

    leafletMap.current = L.map(mapRef.current).setView([11.0500, 124.0000], 10);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(leafletMap.current);

    setTimeout(() => {
      if (leafletMap.current) leafletMap.current.invalidateSize();
    }, 200);

    leafletMap.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);

      if (!pickupMarker.current) {
        pickupMarker.current = L.marker([lat, lng], {
          draggable: true, icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41]
          })
        }).addTo(leafletMap.current).bindPopup('<b>Pickup</b>').openPopup();
        pickupMarker.current.on('dragend', async () => {
          const pos = pickupMarker.current.getLatLng();
          const adr = await reverseGeocode(pos.lat, pos.lng);
          onLocationSelect({ address: adr, coords: { lat: pos.lat, lng: pos.lng } }, null);
          updateRoute();
        });
        onLocationSelect({ address, coords: { lat, lng } }, null);
      } else if (!destMarker.current) {
        destMarker.current = L.marker([lat, lng], {
          draggable: true, icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41]
          })
        }).addTo(leafletMap.current).bindPopup('<b>Destination</b>').openPopup();
        destMarker.current.on('dragend', async () => {
          const pos = destMarker.current.getLatLng();
          const adr = await reverseGeocode(pos.lat, pos.lng);
          onLocationSelect(null, { address: adr, coords: { lat: pos.lat, lng: pos.lng } });
          updateRoute();
        });
        onLocationSelect(null, { address, coords: { lat, lng } });
      }
      updateRoute();
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className="h-96 md:h-[450px] w-full border border-[#e0e0e0] z-0" />;
};

const TransportMap = React.memo(TransportMapBase);
export default TransportMap;
