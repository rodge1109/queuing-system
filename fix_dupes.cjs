const fs = require('fs');
const path = 'c:/website/queuing-system/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Find all function declarations
const regex = /function\s+(\w+)\s*\(/g;
let match;
const lastOccurrences = {};

while ((match = regex.exec(content)) !== null) {
  lastOccurrences[match[1]] = match.index;
}

// Components we know are duplicated
const dupes = ['QueueDisplayPage', 'QueueTellerPage', 'Header', 'SurveyPage', 'AdminDashboard'];

// For each duplicated component, keep ONLY the LAST one.
// But we need to find the START and END of the FIRST ones.

// Custom surgical strike:
// 1. Delete the first QueueDisplayPage
const firstQDP = content.indexOf("function QueueDisplayPage");
const secondQDP = content.indexOf("function QueueDisplayPage", firstQDP + 1);
if (firstQDP !== -1 && secondQDP !== -1) {
    // Delete from first to second
    content = content.substring(0, firstQDP) + content.substring(secondQDP);
}

// 2. Delete the first QueueTellerPage
const firstQTP = content.indexOf("function QueueTellerPage");
const secondQTP = content.indexOf("function QueueTellerPage", firstQTP + 1);
if (firstQTP !== -1 && secondQTP !== -1) {
    content = content.substring(0, firstQTP) + content.substring(secondQTP);
}

// 3. Delete any weird trailing fragments (the file ends with QueueTellerPage's return)
// We need to ensure the file has a clean end.
// Actually, the second occurrence of QueueTellerPage is at the END of the file usually.

fs.writeFileSync(path, content, 'utf8');
console.log('Duplicates removed.');
