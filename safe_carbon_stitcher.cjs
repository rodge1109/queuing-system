const fs = require('fs');
const appPath = 'c:/website/queuing-system/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

const tState = fs.readFileSync('part_carbon_state.txt', 'utf8');
const tHeader = fs.readFileSync('part_carbon_header.txt', 'utf8');
const tSurvey = fs.readFileSync('part_carbon_survey.txt', 'utf8');

// 1. State
const stateMarker = "const [currentPage, setCurrentPage] = useState";
const stateIdx = app.indexOf(stateMarker);
if (stateIdx !== -1) {
    const endLineIdx = app.indexOf(";", stateIdx);
    app = app.substring(0, stateIdx) + tState + app.substring(endLineIdx + 1);
}

// 2. Header
const hIdx = app.indexOf("function Header");
const hEndIdx = app.indexOf("function HomePage");
if (hIdx !== -1 && hEndIdx !== -1) {
    app = app.substring(0, hIdx) + tHeader + "\n" + app.substring(hEndIdx);
}

// 3. Survey
const sIdx = app.indexOf("function QueuePage");
if (sIdx !== -1) {
    app = app.substring(0, sIdx) + tSurvey + "\n\n" + app.substring(sIdx);
}

// 4. Routes
app = app.replace("{currentPage === 'queue' && <QueuePage setCurrentPage={setCurrentPage} />}",
                  "{currentPage === 'queue' && <QueuePage setCurrentPage={setCurrentPage} />}\n          {currentPage === 'survey' && <SurveyPage setCurrentPage={setCurrentPage} />}");

fs.writeFileSync(appPath, app, 'utf8');
console.log('Done!');
