const http = require('http');

http.get('http://localhost:5000/api/corporate-accounts', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('GET Response:', res.statusCode, data.substring(0, 100)));
}).on('error', err => console.error('GET Error:', err.message));
