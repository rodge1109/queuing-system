
const fs = require('fs');
const path = 'src/App.jsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

// Ranges to remove (1-indexed, inclusive)
const ranges = [
  { start: 308, end: 439 },
  { start: 61, end: 304 }
];

let newLines = lines;
for (const range of ranges) {
  newLines.splice(range.start - 1, range.end - range.start + 1);
}

// Add imports at the top (after other imports)
newLines.splice(14, 0, "import RiderPortal from './components/rider/RiderPortal';", "import LiveTrackingMap from './components/maps/LiveTrackingMap';");

fs.writeFileSync(path, newLines.join('\n'));
console.log('Removed RiderPortal and LiveTrackingMap from App.jsx');
