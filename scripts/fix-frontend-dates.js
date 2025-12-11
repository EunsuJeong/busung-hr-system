const fs = require('fs');

const appPath = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(appPath, 'utf8');

console.log('🔧 프론트엔드 날짜 파싱 수정 시작...\n');

// 1. formatDateByLang import 추가
const oldImport = `  formatDateWithDay,
  getDatePlaceholder,
  analyzeAttendanceStatus as analyzeAttendanceStatusBase,`;

const newImport = `  formatDateWithDay,
  formatDateByLang,
  getDatePlaceholder,
  analyzeAttendanceStatus as analyzeAttendanceStatusBase,`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
  console.log('✅ 1. formatDateByLang import 추가');
} else {
  console.log('⚠️  1. import를 찾을 수 없거나 이미 수정됨');
}

// 2. startDate, endDate 파싱 수정
const oldLeaveData = `            startDate: leave.startDate?.split('T')[0],
            endDate: leave.endDate?.split('T')[0],`;

const newLeaveData = `            startDate: formatDateByLang(leave.startDate),
            endDate: formatDateByLang(leave.endDate),`;

if (content.includes(oldLeaveData)) {
  content = content.replace(oldLeaveData, newLeaveData);
  console.log('✅ 2. 연차 startDate/endDate 파싱 수정');
} else {
  console.log('⚠️  2. 연차 날짜 파싱 코드를 찾을 수 없음');
}

// 3. requestDate 파싱 수정
const oldRequestDate = `            requestDate:
              leave.requestDate?.split('T')[0] ||
              leave.createdAt?.split('T')[0],`;

const newRequestDate = `            requestDate: formatDateByLang(leave.requestDate || leave.createdAt),`;

if (content.includes(oldRequestDate)) {
  content = content.replace(oldRequestDate, newRequestDate);
  console.log('✅ 3. requestDate 파싱 수정');
} else {
  console.log('⚠️  3. requestDate 파싱 코드를 찾을 수 없음');
}

// 4. approvalDate 파싱 수정
const oldApprovalDate = `            approvalDate: suggestion.approvalDate
              ? new Date(suggestion.approvalDate).toISOString().split('T')[0]
              : '',`;

const newApprovalDate = `            approvalDate: formatDateByLang(suggestion.approvalDate),`;

if (content.includes(oldApprovalDate)) {
  content = content.replace(oldApprovalDate, newApprovalDate);
  console.log('✅ 4. 건의사항 approvalDate 파싱 수정');
} else {
  console.log('⚠️  4. approvalDate 파싱 코드를 찾을 수 없음');
}

fs.writeFileSync(appPath, content, 'utf8');
console.log('\n✅ 프론트엔드 날짜 파싱 수정 완료!');
console.log('이제 모든 날짜가 정확한 KST로 표시됩니다.');
