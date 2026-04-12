const fs = require('fs');
const path = 'c:/website/queuing-system/src/App.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const seenFunctions = new Set();
const resultLines = [];
let currentFunction = null;
let functionBuffer = [];

// We process from bottom to top to keep the LATEST (Carbon) versions.
for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('function ')) {
        const match = line.match(/function\s+(\w+)/);
        if (match) {
            const funcName = match[1];
            if (seenFunctions.has(funcName)) {
                // Skip this entire function buffer
                functionBuffer = [];
                continue;
            } else {
                seenFunctions.add(funcName);
                resultLines.unshift(line, ...functionBuffer);
                functionBuffer = [];
            }
        } else {
            functionBuffer.unshift(line);
        }
    } else {
        if (line.trim() === 'export default function RestaurantApp() {') {
             // Special case for main component - don't treat as chunk
             resultLines.unshift(line, ...functionBuffer);
             functionBuffer = [];
             continue;
        }
        functionBuffer.unshift(line);
    }
}

// Ensure the top part (imports) is included if not caught
if (functionBuffer.length > 0) {
    resultLines.unshift(...functionBuffer);
}

fs.writeFileSync(path, resultLines.join('\n'), 'utf8');
console.log('Reverse de-duplication complete.');
