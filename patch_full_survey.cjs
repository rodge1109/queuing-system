const fs = require('fs');
const appPath = 'c:/website/queuing-system/src/App.jsx';
const fullSurveyCode = fs.readFileSync('c:/website/queuing-system/full_survey_code.txt', 'utf8');

let appCode = fs.readFileSync(appPath, 'utf8');

// Replace SurveyPage component
const startIdx = appCode.indexOf('function SurveyPage');
if (startIdx !== -1) {
    const nextFuncIdx = appCode.indexOf('function QueuePage', startIdx);
    if (nextFuncIdx !== -1) {
        appCode = appCode.substring(0, startIdx) + fullSurveyCode + "\n\n" + appCode.substring(nextFuncIdx);
        console.log('Successfully replaced SurveyPage with full version');
    }
} else {
    console.log('Could not find SurveyPage to replace');
}

fs.writeFileSync(appPath, appCode, 'utf8');
