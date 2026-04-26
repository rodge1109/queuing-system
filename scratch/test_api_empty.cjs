const http = require('http');

const data = JSON.stringify({
  account_number: 'CORP-9999',
  company_name: 'Test',
  contact_person: 'Tester',
  contact_email: '',
  contact_phone: '',
  credit_limit: ''
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/corporate-accounts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', error => console.error('Error:', error));
req.write(data);
req.end();
