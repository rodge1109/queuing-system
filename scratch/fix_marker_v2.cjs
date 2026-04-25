const fs = require('fs');
const path = 'c:/website/queuing-system/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// The malformed line
content = content.replace(
  /<div class="text-red-500" drop-shadow-lg relative z-10">/g,
  '<div class="text-red-500 drop-shadow-lg relative z-10">'
);

fs.writeFileSync(path, content);
console.log('Update complete');
