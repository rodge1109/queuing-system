const fs = require('fs');
const appPath = 'c:/website/queuing-system/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

const tHeader = fs.readFileSync('carbon_header.txt', 'utf8');
const tTeller = fs.readFileSync('carbon_teller.txt', 'utf8');
const tSurvey = fs.readFileSync('part_carbon_survey.txt', 'utf8');

// 1. Header
const hIdx = app.indexOf("function Header");
const hEndIdx = app.indexOf("function HomePage");
if (hIdx !== -1 && hEndIdx !== -1) {
    app = app.substring(0, hIdx) + tHeader + "\n" + app.substring(hEndIdx);
}

// 2. Teller
const tIdx = app.indexOf("function QueueTellerPage");
const tEndIdx = app.indexOf("function QueueDisplayPage");
if (tIdx !== -1 && tEndIdx !== -1) {
    app = app.substring(0, tIdx) + tTeller + "\n" + app.substring(tEndIdx);
}

// 3. Survey (Insert if not present)
if (!app.includes("function SurveyPage")) {
    const qIdx = app.indexOf("function QueuePage");
    app = app.substring(0, qIdx) + tSurvey + "\n\n" + app.substring(qIdx);
}

// 5. Ensure button classes are used in common sub-components by regex finding old classes
// This is a "global button check"
app = app.replace(/rounded-lg/g, ''); // index.css already has !important 0px, but cleaning up tailwind classes helps
app = app.replace(/rounded-full/g, '');
app = app.replace(/shadow-lg/g, '');
app = app.replace(/shadow-xl/g, '');
app = app.replace(/rounded-2xl/g, '');
app = app.replace(/rounded-3xl/g, '');

fs.writeFileSync(appPath, app, 'utf8');
console.log('Final All-Button Carbon Overhaul Complete.');
