import fs from 'fs';

const content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

const stack = [];
let inString = false;
let stringChar = '';
let inComment = false;
let inLineComment = false;

const lines = content.split('\n');

for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
  const line = lines[lineIndex];
  const lineNum = lineIndex + 1;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const prevChar = i > 0 ? line[i-1] : '';
    const nextChar = i < line.length - 1 ? line[i+1] : '';

    // Comment handlers
    if (!inString && !inComment && !inLineComment && char === '/' && nextChar === '*') {
      inComment = true;
      i++; // skip next char
      continue;
    }
    if (inComment && char === '*' && nextChar === '/') {
      inComment = false;
      i++; // skip next char
      continue;
    }
    if (!inString && !inComment && !inLineComment && char === '/' && nextChar === '/') {
      inLineComment = true;
      i++;
      continue;
    }

    if (inLineComment) {
      // line comments end at EOL, so handled by outer loop
      continue;
    }

    if (inComment) {
      continue;
    }

    // String handlers
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
        console.log(`String started: ${char} at Line ${lineNum}, Col ${i + 1}`);
      } else if (stringChar === char) {
        inString = false;
        console.log(`String ended: ${char} at Line ${lineNum}, Col ${i + 1}`);
      }
      continue;
    }

    if (inString) {
      continue;
    }

    // Brackets
    if (char === '{' || char === '(' || char === '[') {
      stack.push({ char, lineNum, col: i + 1 });
    } else if (char === '}' || char === ')' || char === ']') {
      if (stack.length === 0) {
        console.warn(`Unmatched close character ${char} at Line ${lineNum}, Col ${i + 1}`);
        continue;
      }
      const last = stack[stack.length - 1];
      const match = (last.char === '{' && char === '}') ||
                    (last.char === '(' && char === ')') ||
                    (last.char === '[' && char === ']');
      if (match) {
        stack.pop();
      } else {
        console.warn(`Mismatch! Expected closer for ${last.char} from Line ${last.lineNum}, Col ${last.col}, but got ${char} at Line ${lineNum}, Col ${i + 1}`);
      }
    }
  }

  // End of line resets line comment
  inLineComment = false;
}

console.log(`\nStack size at end: ${stack.length}`);
console.log('inString:', inString, 'stringChar:', stringChar, 'inComment:', inComment);
if (stack.length > 0) {
  console.log('Unclosed brackets:');
  stack.forEach((item) => {
    console.log(`- ${item.char} opened at Line ${item.lineNum}, Col ${item.col}`);
  });
}
