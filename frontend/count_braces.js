import fs from 'fs';

const content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

let lineNum = 0;
let scope = 0;
let inString = false;
let stringChar = '';
let output = [];

content.split('\n').forEach((line) => {
  lineNum++;
  let lineOpen = 0;
  let lineClose = 0;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    // Ignore strings simple quote trackers
    if ((char === '"' || char === "'" || char === '`') && line[i-1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (stringChar === char) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '{') {
        scope++;
        lineOpen++;
      } else if (char === '}') {
        scope--;
        lineClose++;
      }
    }
  }

  output.push(`Line ${lineNum}: scope=${scope} (+${lineOpen}, -${lineClose}) | ${line.trim().substring(0, 70)}`);
});

fs.writeFileSync('scope.log', output.join('\n') + `\nFinal scope: ${scope}\n`);
console.log('Counted', lineNum, 'lines. Final scope:', scope);
