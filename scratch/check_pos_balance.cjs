const fs = require('fs');
const content = fs.readFileSync('c:/website/pos-system/src/App.jsx', 'utf8');

const lines = content.split('\n');
let depth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<div(?![^>]*\/>)/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    depth += opens - closes;
    if (depth < 0) {
        console.log(`Mismatch found at line ${i + 1}: depth became ${depth}`);
        depth = 0;
    }
}
console.log("Final depth:", depth);
