const fs = require('fs');
const content = fs.readFileSync('c:/website/pos-system/src/App.jsx', 'utf8');

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
                console.log(`Mismatch at line ${i+1}: closing ${tagName} but expected ${stack[stack.length-1]}`);
            }
        } else {
            const tagName = tag.substring(1);
            if (tagName !== 'br' && tagName !== 'hr' && tagName !== 'img' && tagName !== 'input') {
              stack.push(tagName);
            }
        }
    }
}
console.log("Final stack:", stack);
