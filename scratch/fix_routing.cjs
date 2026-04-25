const fs = require('fs');
const path = 'c:/website/queuing-system/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/case 'passenger': return <PassengerApp \/>;/, "case 'passenger': return <PassengerApp setCurrentPage={setCurrentPage} />;");
fs.writeFileSync(path, content);
console.log('Routing fix applied via script');
