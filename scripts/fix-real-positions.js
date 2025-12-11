const fs = require('fs');

// 1. 근태 관리 정렬 수정
const attendancePath = 'C:/hr-system/src/components/common/common_admin_attendance.js';
let attendanceContent = fs.readFileSync(attendancePath, 'utf8');

const attendanceOld = `      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '사원'];`;
const attendanceNew = `      const positionOrder = ['대표', '상무', '전무', '이사', '부장', '차장', '과장', '대리', '주임', '반장', '조장', '사원'];`;

if (attendanceContent.includes(attendanceOld)) {
  attendanceContent = attendanceContent.replace(attendanceOld, attendanceNew);
  fs.writeFileSync(attendancePath, attendanceContent, 'utf8');
  console.log('✅ 1. 근태 관리: 실제 직책으로 수정');
} else {
  console.log('❌ 1. 근태 관리 코드를 찾을 수 없음');
}

// 2. 급여 관리 정렬 수정
const payrollPath = 'C:/hr-system/src/components/common/common_admin_payroll.js';
let payrollContent = fs.readFileSync(payrollPath, 'utf8');

const payrollOld = `      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '사원'];`;
const payrollNew = `      const positionOrder = ['대표', '상무', '전무', '이사', '부장', '차장', '과장', '대리', '주임', '반장', '조장', '사원'];`;

if (payrollContent.includes(payrollOld)) {
  payrollContent = payrollContent.replace(payrollOld, payrollNew);
  fs.writeFileSync(payrollPath, payrollContent, 'utf8');
  console.log('✅ 2. 급여 관리: 실제 직책으로 수정');
} else {
  console.log('❌ 2. 급여 관리 코드를 찾을 수 없음');
}

console.log('\n✅ 완료!');
console.log('정렬 순서: 대표 > 상무 > 전무 > 이사 > 부장 > 차장 > 과장 > 대리 > 주임 > 반장 > 조장 > 사원');
