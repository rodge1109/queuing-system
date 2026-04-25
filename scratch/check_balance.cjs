const fs = require('fs');
const content = fs.readFileSync('c:/website/queuing-system/src/App.jsx', 'utf8');

function count(str, sub) {
    return (str.match(new RegExp(sub, 'g')) || []).length;
}

console.log("Braces: {", count(content, '\\{'), " }", count(content, '\\}'));
console.log("Brackets: [", count(content, '\\['), " ]", count(content, '\\]'));
console.log("Parens: (", count(content, '\\('), " )", count(content, '\\)'));
console.log("JSX open: <div", count(content, '<div'), " close: </div>", count(content, '</div>'));
console.log("JSX open: <section", count(content, '<section'), " close: </section>", count(content, '</section>'));
