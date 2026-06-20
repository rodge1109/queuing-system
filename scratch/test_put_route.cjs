async function run() {
  const serverUrl = 'http://localhost:5000';
  const payload = {
    route_name: 'Test Route Updated',
    pickup_name: 'Test Pickup Updated',
    pickup_lat: 10.12345,
    pickup_lng: 123.12345,
    destination_name: 'Test Dest Updated',
    destination_lat: 10.56785,
    destination_lng: 123.56785,
    prices: [
      { service_type: 'Car', price: 600 },
      { service_type: 'Luxury Van', price: 1600 }
    ],
    is_active: true
  };

  try {
    const res = await fetch(`${serverUrl}/api/admin/predefined-routes/2`, {
      method: 'PUT',
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
