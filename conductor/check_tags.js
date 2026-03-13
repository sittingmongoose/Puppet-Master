const fs = require('fs');

const html = fs.readFileSync('Concepts/PuppetMasterDashComp.html', 'utf8');
const tagsToTrack = ['div', 'main', 'span', 'section', 'nav', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'button', 'p', 'h1', 'h2', 'h3', 'a', 'select', 'option', 'ul', 'li', 'svg', 'details', 'summary', 'aside'];
const regex = /<\/?([a-zA-Z0-9\-]+)[^>]*>/g;

let stack = [];
let match;
let line = 1;

while ((match = regex.exec(html)) !== null) {
  const fullMatch = match[0];
  const tagName = match[1].toLowerCase();
  
  if (!tagsToTrack.includes(tagName)) continue;

  const preMatch = html.substring(0, match.index);
  line = preMatch.split('\n').length;

  const isClosing = fullMatch.startsWith('</');
  const isSelfClosing = fullMatch.endsWith('/>');

  if (isSelfClosing) continue;

  if (!isClosing) {
    const classMatch = fullMatch.match(/class="([^"]+)"/);
    const idMatch = fullMatch.match(/id="([^"]+)"/);
    stack.push({
      tag: tagName,
      line,
      class: classMatch ? classMatch[1] : '',
      id: idMatch ? idMatch[1] : '',
      full: fullMatch.slice(0, 50)
    });
  } else {
    if (stack.length === 0) {
      console.log(`Line ${line}: Unexpected closing tag </${tagName}>`);
    } else {
      let top = stack[stack.length - 1];
      if (top.tag === tagName) {
        stack.pop();
      } else {
        // Try to find the matching tag to recover
        let found = false;
        for (let i = stack.length - 1; i >= Math.max(0, stack.length - 10); i--) {
          if (stack[i].tag === tagName) {
            found = true;
            console.log(`Line ${line}: Mismatched closing tag </${tagName}>. Closed <${stack[i].tag}> from line ${stack[i].line}, but skipped ${stack.length - 1 - i} unclosed tags.`);
            for(let j = stack.length - 1; j > i; j--) {
                console.log(`  Unclosed: <${stack[j].tag} class="${stack[j].class}" id="${stack[j].id}"> from line ${stack[j].line}`);
            }
            stack.splice(i, stack.length - i);
            break;
          }
        }
        if (!found) {
           console.log(`Line ${line}: Unexpected closing tag </${tagName}>`);
        }
      }
    }
  }
}

console.log(`\nFinal stack size: ${stack.length}`);
for (const item of stack) {
  console.log(`Line ${item.line}: <${item.tag} class="${item.class}" id="${item.id}">`);
}
