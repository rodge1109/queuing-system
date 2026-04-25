const fs = require('fs');
const content = fs.readFileSync('c:/website/pos-system/src/App.jsx', 'utf8');

const lines = content.split('\n');
let currentFunction = "";
let depth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const funcMatch = line.match(/function\s+(\w+)/) || line.match(/const\s+(\w+)\s*=\s*(?:\(\)\s*=>|function)/);
    if (funcMatch) {
        if (depth !== 0) {
            console.log(`Potential imbalance in function ${currentFunction} before starting ${funcMatch[1]} at line ${i+1}. Remaining depth: ${depth}`);
        }
        currentFunction = funcMatch[1];
        depth = 0;
    }
    
    const opens = (line.match(/<div(?![^>]*\/>)/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    depth += opens - closes;
}
console.log("Final depth:", depth);
