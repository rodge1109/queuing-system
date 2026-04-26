const fs = require('fs');
const filePath = 'c:/website/queuing-system/src/App.jsx';
let buffer = fs.readFileSync(filePath);

if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    console.log('BOM detected. Stripping...');
    buffer = buffer.slice(3);
    fs.writeFileSync(filePath, buffer);
    console.log('BOM stripped successfully.');
} else {
    console.log('No BOM detected.');
}
