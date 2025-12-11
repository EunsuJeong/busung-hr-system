const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  Fixing useAIChat Hook Dependencies');
console.log('========================================\n');

const appPath = path.join(__dirname, '../src/App.js');
const backupPath = path.join(__dirname, '../src/App.js.backup.' + Date.now());

// Create backup
console.log('💾 Creating backup...');
fs.copyFileSync(appPath, backupPath);
console.log('✓ Backup saved: ' + backupPath + '\n');

// Read file
const content = fs.readFileSync(appPath, 'utf8');
const lines = content.split('\n');
console.log('📄 Total lines: ' + lines.length + '\n');

// Define what we need to extract and move
// We'll move logSystemEvent and getCompanyData before useAIChat

console.log('📍 Finding key locations...');

// Find useAIChat hook location
let useAIChatLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('} = useAIChat({')) {
    useAIChatLine = i;
    console.log('  - useAIChat at line: ' + (i + 1));
    break;
  }
}

// Extract functions
console.log('\n📦 Extracting functions...');

// logSystemEvent: lines 6671-6739 (0-indexed: 6670-6738)
const logSystemEventStart = 6670;
const logSystemEventEnd = 6739;
const logSystemEvent = lines.slice(logSystemEventStart, logSystemEventEnd);
console.log('  - logSystemEvent: ' + logSystemEvent.length + ' lines');

// getCompanyData: lines 8923-9217 (0-indexed: 8922-9216)
const getCompanyDataStart = 8922;
const getCompanyDataEnd = 9217;
const getCompanyData = lines.slice(getCompanyDataStart, getCompanyDataEnd);
console.log('  - getCompanyData: ' + getCompanyData.length + ' lines');

// Build new content
console.log('\n🔨 Rebuilding file...');

// Find insertion point - search backwards from useAIChat for the line with just '});'
let insertPoint = useAIChatLine;
for (let i = useAIChatLine - 1; i >= 0; i--) {
  if (lines[i].trim() === '});') {
    insertPoint = i + 1; // Insert right after the '});'
    console.log('  - Insertion point at line: ' + (insertPoint + 1));
    break;
  }
}

const newLines = [
  // Everything before insertion point
  ...lines.slice(0, insertPoint),
  '',
  '  /* ========== FUNCTIONS FOR useAIChat ========== */',
  '  // These functions must be defined before useAIChat hook',
  '',
  // Insert logSystemEvent
  ...logSystemEvent,
  '',
  // Insert getCompanyData
  ...getCompanyData,
  '',
  // Continue from insertion point to logSystemEvent (skip logSystemEvent original)
  ...lines.slice(insertPoint, logSystemEventStart),
  // Skip original logSystemEvent, continue after it to getCompanyData
  ...lines.slice(logSystemEventEnd, getCompanyDataStart),
  // Skip original getCompanyData, continue with rest
  ...lines.slice(getCompanyDataEnd)
];

// Write new file
console.log('💾 Writing updated file...');
const newContent = newLines.join('\n');
fs.writeFileSync(appPath, newContent, 'utf8');

console.log('✓ File updated\n');
console.log('📊 Summary:');
console.log('  - Original lines: ' + lines.length);
console.log('  - New lines: ' + newLines.length);
console.log('  - Moved 2 functions before useAIChat');
console.log('\n✅ Fix complete! Server should auto-reload.');
