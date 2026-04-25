const fs = require('fs');
const content = fs.readFileSync('c:/website/queuing-system/src/App.jsx', 'utf8');

const lines = content.split('\n');
let stack = [];
let depth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    depth += opens - closes;
    if (depth < 0) {
        console.log(`Mismatch found at line ${i + 1}: depth became ${depth}`);
        // Reset depth to 0 to find next mismatch
        depth = 0;
    }
}
console.log("Final depth:", depth);
