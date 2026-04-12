const fs = require('fs');
const path = 'c:/website/queuing-system/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

const marker = "setCurrentPage('queue-teller')";
const btnEnd = "</button>";

let startPos = c.indexOf(marker);
if (startPos !== -1) {
    let insertPos = c.indexOf(btnEnd, startPos);
    if (insertPos !== -1) {
        insertPos += btnEnd.length;
        const feedbackBtn = `
                <button
                  onClick={() => setCurrentPage('survey')}
                  className={\`nav-link font-semibold transition-all py-2 text-sm tracking-wide \${currentPage === 'survey' ? 'text-[#576CA8]' : 'text-slate-600 hover:text-slate-900'}\`}
                >
                  Feedback
                </button>`;
        c = c.substring(0, insertPos) + feedbackBtn + c.substring(insertPos);
        fs.writeFileSync(path, c, 'utf8');
        console.log('Successfully added Feedback menu via marker');
    }
} else {
    console.log('Marker not found');
}
