const fs = require('fs');
const path = require('path');

console.log('Fixing function declaration order...\n');

const appPath = path.join(__dirname, '../src/App.js');
const backupPath = path.join(__dirname, '../src/App.js.backup.' + Date.now());

// Create backup
console.log('Creating backup...');
fs.copyFileSync(appPath, backupPath);
console.log('✓ Backup: ' + backupPath + '\n');

// Read file
const content = fs.readFileSync(appPath, 'utf8');
const lines = content.split('\n');
console.log('Total lines: ' + lines.length + '\n');

// Extract logSystemEvent function (lines 6671-6739, but arrays are 0-indexed)
console.log('Extracting logSystemEvent (lines 6671-6739)...');
const logSystemEventLines = lines.slice(6670, 6739);

// Extract getCompanyData function (lines 8923-9217)
console.log('Extracting getCompanyData (lines 8923-9217)...');
const getCompanyDataLines = lines.slice(8922, 9217);

// Find insertion point (before useAIChat hook around line 3140)
console.log('Finding insertion point before useAIChat...\n');
const insertionPoint = 3140; // Before the AI chatbot state section

// Build new file:
// 1. Lines before insertion point
// 2. Insert the two functions
// 3. Lines from insertion to before logSystemEvent
// 4. Skip logSystemEvent lines
// 5. Lines after logSystemEvent to before getCompanyData
// 6. Skip getCompanyData lines
// 7. Remaining lines

const newLines = [
  ...lines.slice(0, insertionPoint - 1),
  '',
  '  // ========== FUNCTIONS NEEDED BY useAIChat ==========',
  '',
  ...logSystemEventLines,
  '',
  ...getCompanyDataLines,
  '',
  ...lines.slice(insertionPoint - 1, 6670),
  ...lines.slice(6739, 8922),
  ...lines.slice(9217)
];

// Write new file
console.log('Writing updated file...');
const newContent = newLines.join('\n');
fs.writeFileSync(appPath, newContent, 'utf8');

console.log('✓ File updated\n');
console.log('Summary:');
console.log('  - Original lines: ' + lines.length);
console.log('  - New lines: ' + newLines.length);
console.log('  - logSystemEvent moved from 6671 to ~' + (insertionPoint + 2));
console.log('  - getCompanyData moved from 8923 to ~' + (insertionPoint + 72));
console.log('\n✅ Fix complete!');
