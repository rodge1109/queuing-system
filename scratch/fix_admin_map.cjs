const fs = require('fs');
const path = 'c:/website/queuing-system/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');
// Replace the AdminDashboard usage of PassengerMap with a stable reference
content = content.replace(/PassengerMap pickupCoords=\{\[14\.5995, 120\.9842\]\}/, "PassengerMap center={PASSENGER_MAP_DEFAULT_CENTER} pickupCoords={PASSENGER_MAP_DEFAULT_CENTER}");
fs.writeFileSync(path, content);
console.log('Admin map stabilization fix applied');
