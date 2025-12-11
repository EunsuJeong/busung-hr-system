const fs = require('fs');

// 1. 근태 관리 정렬 수정
const attendancePath = 'C:/hr-system/src/components/common/common_admin_attendance.js';
let attendanceContent = fs.readFileSync(attendancePath, 'utf8');

const attendanceOld = `      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '팀원'];`;
const attendanceNew = `      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '사원'];`;

if (attendanceContent.includes(attendanceOld)) {
  attendanceContent = attendanceContent.replace(attendanceOld, attendanceNew);
  fs.writeFileSync(attendancePath, attendanceContent, 'utf8');
  console.log('✅ 1. 근태 관리: 팀원 → 사원 수정');
} else {
  console.log('❌ 1. 근태 관리 코드를 찾을 수 없음');
}

// 2. 급여 관리 정렬 수정
const payrollPath = 'C:/hr-system/src/components/common/common_admin_payroll.js';
let payrollContent = fs.readFileSync(payrollPath, 'utf8');

const payrollOld = `      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '팀원'];`;
const payrollNew = `      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '사원'];`;

if (payrollContent.includes(payrollOld)) {
  payrollContent = payrollContent.replace(payrollOld, payrollNew);
  fs.writeFileSync(payrollPath, payrollContent, 'utf8');
  console.log('✅ 2. 급여 관리: 팀원 → 사원 수정');
} else {
  console.log('❌ 2. 급여 관리 코드를 찾을 수 없음');
}

console.log('\n완료! 이제 정렬이 제대로 됩니다.');
console.log('정렬 순서: 대표 > 임원 > 팀장 > 반장 > 조장 > 사원');
