const fs = require('fs');

// StaffAnnualLeave.js 수정 - rows를 1로 변경
const annualFile = 'C:/hr-system/src/components/staff/StaffAnnualLeave.js';
let annualContent = fs.readFileSync(annualFile, 'utf8');

// rows={2}를 rows={1}로 변경
annualContent = annualContent.replace(
  /rows={2}/g,
  'rows={1}'
);

fs.writeFileSync(annualFile, annualContent, 'utf8');
console.log('✅ StaffAnnualLeave.js rows={1}로 수정 완료');

// StaffSuggestion.js 수정 - rows를 1로 변경
const suggestionFile = 'C:/hr-system/src/components/staff/StaffSuggestion.js';
let suggestionContent = fs.readFileSync(suggestionFile, 'utf8');

// rows={3}를 rows={1}로 변경
suggestionContent = suggestionContent.replace(
  /rows={3}/g,
  'rows={1}'
);

fs.writeFileSync(suggestionFile, suggestionContent, 'utf8');
console.log('✅ StaffSuggestion.js rows={1}로 수정 완료');
