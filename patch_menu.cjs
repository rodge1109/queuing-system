const fs = require('fs');
const path = 'c:/website/queuing-system/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

const target = `                <button
                  onClick={() => setCurrentPage('queue-teller')}
                  className={\`nav-link font-semibold transition-all py-2 text-sm tracking-wide \${currentPage === 'queue-teller' ? 'text-[#576CA8]' : 'text-slate-600 hover:text-slate-900'}\`}
                >
                  Teller
                </button>`;

const replacement = target + `
                <button
                  onClick={() => setCurrentPage('survey')}
                  className={\`nav-link font-semibold transition-all py-2 text-sm tracking-wide \${currentPage === 'survey' ? 'text-[#576CA8]' : 'text-slate-600 hover:text-slate-900'}\`}
                >
                  Feedback
                </button>`;

if (c.indexOf(target) !== -1) {
    c = c.replace(target, replacement);
    fs.writeFileSync(path, c, 'utf8');
    console.log('Successfully added Feedback menu');
} else {
    console.log('Target menu button not found');
}
