
const fs = require('fs');
const path = 'src/App.jsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

// Ranges to remove (1-indexed, inclusive)
// Note: We remove from bottom to top to avoid line shift issues.
const ranges = [
  { start: 7121, end: 7396 },
  { start: 1034, end: 1908 }
];

let newLines = lines;
for (const range of ranges) {
  newLines.splice(range.start - 1, range.end - range.start + 1);
}

fs.writeFileSync(path, newLines.join('\n'));
console.log('Removed components from App.jsx');
