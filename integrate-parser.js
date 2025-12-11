const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// Step 1: Add import statement after holidayService
const importSearch = `import holidayService from './services/holidayService';`;
const importReplace = `import holidayService from './services/holidayService';
import { AttendanceExcelParser } from './services/AttendanceExcelParser';`;

if (content.includes(`import { AttendanceExcelParser }`)) {
  console.log('⏭️  Import already exists, skipping...');
} else {
  content = content.replace(importSearch, importReplace);
  console.log('✅ Added AttendanceExcelParser import');
}

// Step 2: Replace the entire parseAttendanceFromExcel function body
// Read the function from lines 3879-4378
const functionStart = `  // [2_관리자 모드] 2.8_근태 관리 - 엑셀 데이터 파싱
  const parseAttendanceFromExcel = (data) => {`;

// Find the start of the function
const startIdx = content.indexOf(functionStart);
if (startIdx === -1) {
  console.error('❌ Could not find function start');
  process.exit(1);
}

// Find the closing brace - it should be at line 4378 which is "  };"
// We need to find the matching closing brace
let braceCount = 0;
let inFunction = false;
let endIdx = -1;

for (let i = startIdx; i < content.length; i++) {
  if (content[i] === '{') {
    braceCount++;
    inFunction = true;
  } else if (content[i] === '}') {
    braceCount--;
    if (inFunction && braceCount === 0) {
      // Found the closing brace, include it and the semicolon
      endIdx = i + 2; // +1 for '}', +1 for ';'
      break;
    }
  }
}

if (endIdx === -1) {
  console.error('❌ Could not find function end');
  process.exit(1);
}

const oldFunction = content.substring(startIdx, endIdx);

const newFunction = `  // [2_관리자 모드] 2.8_근태 관리 - 엑셀 데이터 파싱
  const parseAttendanceFromExcel = (data) => {
    const parser = new AttendanceExcelParser({
      attendanceSheetYear,
      attendanceSheetMonth,
      setAttendanceSheetYear,
      setAttendanceSheetMonth,
      employees,
      setCheckInTime,
      setCheckOutTime,
      devLog
    });

    parser.parse(data);
  };`;

content = content.substring(0, startIdx) + newFunction + content.substring(endIdx);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Replaced parseAttendanceFromExcel with service integration');
console.log(`📏 Reduced function from ${oldFunction.split('\n').length} lines to ${newFunction.split('\n').length} lines`);
