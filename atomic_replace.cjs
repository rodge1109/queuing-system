const fs = require('fs');
const appPath = 'c:/website/queuing-system/src/App.jsx';
let lines = fs.readFileSync(appPath, 'utf8').split('\n');

const startIndex = 4344; // 0-indexed for 4345
const tCombined = fs.readFileSync('combined_carbon.txt', 'utf8');

const result = lines.slice(0, startIndex).join('\n') + '\n\n' + tCombined;

fs.writeFileSync(appPath, result, 'utf8');
console.log('Atomic Replacement Done.');
