
async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/corporate-accounts');
    const data = await res.json();
    console.log('Accounts count:', data.accounts ? data.accounts.length : 0);
    console.log('First account:', data.accounts ? data.accounts[0] : 'none');
  } catch (e) {
    console.error('Fetch failed:', e.message);
  }
}

test();
