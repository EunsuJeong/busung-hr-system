const fs = require('fs');

// StaffAnnualLeave.js 수정
const annualFile = 'C:/hr-system/src/components/staff/StaffAnnualLeave.js';
let annualContent = fs.readFileSync(annualFile, 'utf8');

const annualOld = `                rows={2}`;
const annualNew = `                rows={1}`;

if (annualContent.includes(annualOld)) {
  annualContent = annualContent.replace(annualOld, annualNew);
  fs.writeFileSync(annualFile, annualContent, 'utf8');
  console.log('✅ StaffAnnualLeave.js rows를 1로 변경 완료');
} else {
  console.log('⚠️ StaffAnnualLeave.js에서 rows={2}를 찾을 수 없습니다');
}

// StaffSuggestion.js 수정
const suggestionFile = 'C:/hr-system/src/components/staff/StaffSuggestion.js';
let suggestionContent = fs.readFileSync(suggestionFile, 'utf8');

const suggestionOld = `              rows={3}`;
const suggestionNew = `              rows={1}`;

if (suggestionContent.includes(suggestionOld)) {
  suggestionContent = suggestionContent.replace(suggestionOld, suggestionNew);
  fs.writeFileSync(suggestionFile, suggestionContent, 'utf8');
  console.log('✅ StaffSuggestion.js rows를 1로 변경 완료');
} else {
  console.log('⚠️ StaffSuggestion.js에서 rows={3}를 찾을 수 없습니다');
}
