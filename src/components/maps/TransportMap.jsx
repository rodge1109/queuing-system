import React from 'react';

const TransportMapBase = ({ onLocationSelect, mapAction, isPicking, pickupCoords, destCoords, className }) => {
  const mapRef = React.useRef(null);
  const leafletMap = React.useRef(null);
  const pickupMarker = React.useRef(null);
  const destMarker = React.useRef(null);
  const routeLine = React.useRef(null);
  const distanceMarker = React.useRef(null);
  const [isLoadingAddress, setIsLoadingAddress] = React.useState(false);
  
  const isPickingRef = React.useRef(isPicking);
  React.useEffect(() => {
    isPickingRef.current = isPicking;
  }, [isPicking]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data.display_name) {
        return data.display_name;
      }
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
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

  const updateRoute = async (preventPan = false) => {
    const L = window.L;
    if (!L || !pickupCoords || !destCoords) return;
    const p1 = L.latLng(pickupCoords.lat, pickupCoords.lng);
    const p2 = L.latLng(destCoords.lat, destCoords.lng);

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

        if (!preventPan) {
          leafletMap.current.fitBounds(L.latLngBounds(p1, p2), { padding: [80, 80] });
        }
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

  // Center pan view on mapAction change
  React.useEffect(() => {
    if (!leafletMap.current || !mapAction) return;

    async function handleAction() {
      let coords = mapAction.coords;
      if (!coords && mapAction.address) {
        coords = await forwardGeocode(mapAction.address);
      }
      if (!coords) return;
      
      leafletMap.current.setView([coords.lat, coords.lng], 15);
    }
    
    handleAction();
  }, [mapAction]);

  // Synchronize Markers and route
  React.useEffect(() => {
    if (!leafletMap.current) return;
    const L = window.L;
    if (!L) return;

    // If picking, hide standard markers and route path
    if (isPicking) {
      if (pickupMarker.current) {
        pickupMarker.current.remove();
        pickupMarker.current = null;
      }
      if (destMarker.current) {
        destMarker.current.remove();
        destMarker.current = null;
      }
      if (routeLine.current) {
        routeLine.current.remove();
        routeLine.current = null;
      }
      if (distanceMarker.current) {
        distanceMarker.current.remove();
        distanceMarker.current = null;
      }
      return;
    }

    // Sync pickupMarker
    if (pickupCoords && pickupCoords.lat && pickupCoords.lng) {
      if (pickupMarker.current) {
        pickupMarker.current.setLatLng([pickupCoords.lat, pickupCoords.lng]);
      } else {
        pickupMarker.current = L.marker([pickupCoords.lat, pickupCoords.lng], {
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
        });
      }
    } else {
      if (pickupMarker.current) {
        pickupMarker.current.remove();
        pickupMarker.current = null;
      }
    }

    // Sync destMarker
    if (destCoords && destCoords.lat && destCoords.lng) {
      if (destMarker.current) {
        destMarker.current.setLatLng([destCoords.lat, destCoords.lng]);
      } else {
        destMarker.current = L.marker([destCoords.lat, destCoords.lng], {
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
        });
      }
    } else {
      if (destMarker.current) {
        destMarker.current.remove();
        destMarker.current = null;
      }
    }

    // Route updates
    if (pickupCoords && destCoords) {
      updateRoute(false);
    } else {
      if (routeLine.current) {
        routeLine.current.remove();
        routeLine.current = null;
      }
      if (distanceMarker.current) {
        distanceMarker.current.remove();
        distanceMarker.current = null;
      }
    }
  }, [pickupCoords, destCoords, isPicking]);

  // Center-pin tracking moveend
  React.useEffect(() => {
    if (!leafletMap.current) return;

    const handleMapMoveEnd = async () => {
      if (!isPicking || !leafletMap.current) return;
      const center = leafletMap.current.getCenter();
      setIsLoadingAddress(true);
      const address = await reverseGeocode(center.lat, center.lng);
      setIsLoadingAddress(false);
      
      if (mapAction?.type === 'pickup') {
        onLocationSelect({ address, coords: { lat: center.lat, lng: center.lng } }, null);
      } else if (mapAction?.type === 'dest') {
        onLocationSelect(null, { address, coords: { lat: center.lat, lng: center.lng } });
      }
    };

    if (isPicking) {
      leafletMap.current.on('moveend', handleMapMoveEnd);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.off('moveend', handleMapMoveEnd);
      }
    };
  }, [isPicking, mapAction, onLocationSelect]);

  // Initialize Map
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

    // Standard click listener for simple clicking
    leafletMap.current.on('click', async (e) => {
      if (isPickingRef.current) return;
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
        });
        onLocationSelect(null, { address, coords: { lat, lng } });
      }
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className={className || "h-96 md:h-[450px] w-full border border-[#e0e0e0] z-0"} />
      
      {isPicking && mapAction && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[1000] flex flex-col items-center animate-[bounceIn_0.3s_ease-out]">
          <div className="bg-black/85 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg mb-2 max-w-[220px] truncate text-center flex items-center gap-1.5 border border-white/10 uppercase tracking-wider">
            {isLoadingAddress ? (
              <>
                <svg className="animate-spin h-3 w-3 text-white shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Searching address...</span>
              </>
            ) : (
              <span>Move map to select</span>
            )}
          </div>

          <div className="relative">
            <div className="w-4 h-2 bg-black/25 rounded-full blur-[1px] absolute -bottom-1 left-1/2 -translate-x-1/2 scale-x-150"></div>
            <div className="transform -translate-y-2 transition-transform duration-200">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
                      fill={mapAction.type === 'pickup' ? '#00B14F' : '#3b82f6'} 
                      stroke="white" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"/>
                <circle cx="12" cy="9" r="3.5" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TransportMap = React.memo(TransportMapBase);
export default TransportMap;
