const fs = require('fs');
const buffer = fs.readFileSync('c:/website/queuing-system/src/App.jsx');
console.log('File size:', buffer.length);
console.log('First 100 bytes (hex):', buffer.slice(0, 100).toString('hex'));
console.log('First 100 bytes (chars):', JSON.stringify(buffer.slice(0, 100).toString('utf8')));
