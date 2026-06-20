async function run() {
  const serverUrl = 'http://localhost:5000';
  const payload = {
    route_name: 'Test Route',
    pickup_name: 'Test Pickup',
    pickup_lat: 10.1234,
    pickup_lng: 123.1234,
    destination_name: 'Test Dest',
    destination_lat: 10.5678,
    destination_lng: 123.5678,
    prices: [
      { service_type: 'Car', price: 500 },
      { service_type: 'Luxury Van', price: 1500 }
    ],
    is_active: true
  };

  try {
    const res = await fetch(`${serverUrl}/api/admin/predefined-routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Error during test:', err);
  }
}

run();
