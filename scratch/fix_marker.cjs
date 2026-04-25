const fs = require('fs');
const path = 'c:/website/queuing-system/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// The marker in PassengerMap
content = content.replace(
  /html: `\s+<div class="flex items-center justify-center" style="width: 40px; height: 40px;">\s+<div class="text-\[#111827\]/g,
  'html: `\n            <div class="flex items-center justify-center" style="width: 40px; height: 40px;">\n              <div class="text-red-500"'
);

// Fallback regex if the above is too strict
content = content.replace(
  /<div class="text-\[#111827\] drop-shadow-lg relative z-10">/g,
  '<div class="text-red-500 drop-shadow-lg relative z-10">'
);

fs.writeFileSync(path, content);
console.log('Update complete');
