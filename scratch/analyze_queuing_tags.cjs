const fs = require('fs');
const content = fs.readFileSync('c:/website/queuing-system/src/App.jsx', 'utf8');

const lines = content.split('\n');
let depth = 0;
let stack = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tags = line.match(/<\/?(\w+)(?![^>]*\/>)/g) || [];
    for (let tag of tags) {
        if (tag.startsWith('</')) {
            const tagName = tag.substring(2);
            if (stack.length > 0 && stack[stack.length - 1] === tagName) {
                stack.pop();
            } else {
                // Ignore mismatch if it's a common multi-line tag issue in my script
            }
        } else {
            const tagName = tag.substring(1);
            if (!['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName)) {
              stack.push(tagName);
            }
        }
    }
}
console.log("Final stack size:", stack.length);
if (stack.length > 0) {
  console.log("Remaining stack (top 5):", stack.slice(-5));
}
