async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/corporate-accounts/dashboard-stats');
    const data = await res.json();
    console.log('Stats Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Fetch failed:', e.message);
  }
}

test();
