const fs = require('fs');
const content = fs.readFileSync('c:/website/queuing-system/src/App.jsx', 'utf8');
try {
    // This is a very crude check, but better than nothing
    // We can't really parse JSX with native node easily without babel
    console.log("File read successfully. Length:", content.length);
} catch (e) {
    console.error("Error reading file:", e);
}
