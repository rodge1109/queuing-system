async function runTests() {
  const serverUrl = 'http://localhost:5000';
  console.log(`Sending verification requests to ${serverUrl}...`);

  try {
    // 1. Test GET predefined routes
    const routesRes = await fetch(`${serverUrl}/api/predefined-routes`);
    const routesData = await routesRes.json();
    console.log('\n--- GET /api/predefined-routes ---');
    console.log('Status:', routesRes.status);
    console.log('Response:', JSON.stringify(routesData, null, 2));

    // 2. Test Pricing Calculation via routeId
    const calcRouteRes = await fetch(`${serverUrl}/api/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routeId: 1,
        serviceType: 'Luxury Van'
      })
    });
    const calcRouteData = await calcRouteRes.json();
    console.log('\n--- POST /api/pricing/calculate (by routeId) ---');
    console.log('Request: { routeId: 1, serviceType: "Luxury Van" }');
    console.log('Response:', JSON.stringify(calcRouteData, null, 2));

    // 3. Test Pricing Calculation via matching coords (Geofence)
    const calcCoordsRes = await fetch(`${serverUrl}/api/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupLat: 11.266100,
        pickupLng: 124.061300,
        destLat: 10.315700,
        destLng: 123.885400,
        serviceType: 'Car'
      })
    });
    const calcCoordsData = await calcCoordsRes.json();
    console.log('\n--- POST /api/pricing/calculate (by matching geofence coords) ---');
    console.log('Request: { pickup: Maya Port, dest: Cebu City, service: "Car" }');
    console.log('Response:', JSON.stringify(calcCoordsData, null, 2));

    // 4. Test Pricing Calculation fallback (non-matching coords)
    const fallbackRes = await fetch(`${serverUrl}/api/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupLat: 11.000000,
        pickupLng: 124.000000,
        destLat: 10.900000,
        destLng: 123.900000,
        serviceType: 'Car',
        distanceKm: 25
      })
    });
    const fallbackData = await fallbackRes.json();
    console.log('\n--- POST /api/pricing/calculate (fallback distance-based pricing) ---');
    console.log('Request: { non-matching coordinates, service: "Car", distance: 25km }');
    console.log('Response:', JSON.stringify(fallbackData, null, 2));

  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

// Wait a second for the server to bind before running
setTimeout(runTests, 1500);
