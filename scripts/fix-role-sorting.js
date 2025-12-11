const fs = require('fs');

// 1. 근태 관리 정렬 수정 (position → role)
const attendancePath = 'C:/hr-system/src/components/common/common_admin_attendance.js';
let attendanceContent = fs.readFileSync(attendancePath, 'utf8');

const attendanceOld = `    }).sort((a, b) => {
      // 정렬 우선순위 배열
      const subDeptOrder = ['대표', '임원', '관리', '영업', '출하', '품질', '생산관리', '열', '표면', '구부', '인발', '교정·절단', '검사', '금형', '공무', '가공'];
      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '사원'];

      // 1순위: 세부부서명
      const subDeptA = subDeptOrder.indexOf(a.subDepartment);
      const subDeptB = subDeptOrder.indexOf(b.subDepartment);
      const subDeptCompare = (subDeptA === -1 ? 999 : subDeptA) - (subDeptB === -1 ? 999 : subDeptB);

      if (subDeptCompare !== 0) return subDeptCompare;

      // 2순위: 직책
      const posA = positionOrder.indexOf(a.position);
      const posB = positionOrder.indexOf(b.position);
      return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
    });`;

const attendanceNew = `    }).sort((a, b) => {
      // 정렬 우선순위 배열
      const subDeptOrder = ['대표', '임원', '관리', '영업', '출하', '품질', '생산관리', '열', '표면', '구부', '인발', '교정·절단', '검사', '금형', '공무', '가공'];
      const roleOrder = ['대표', '임원', '팀장', '반장', '조장', '팀원'];

      // 1순위: 세부부서명
      const subDeptA = subDeptOrder.indexOf(a.subDepartment);
      const subDeptB = subDeptOrder.indexOf(b.subDepartment);
      const subDeptCompare = (subDeptA === -1 ? 999 : subDeptA) - (subDeptB === -1 ? 999 : subDeptB);

      if (subDeptCompare !== 0) return subDeptCompare;

      // 2순위: 직책(role)
      const roleA = roleOrder.indexOf(a.role);
      const roleB = roleOrder.indexOf(b.role);
      return (roleA === -1 ? 999 : roleA) - (roleB === -1 ? 999 : roleB);
    });`;

if (attendanceContent.includes(attendanceOld)) {
  attendanceContent = attendanceContent.replace(attendanceOld, attendanceNew);
  fs.writeFileSync(attendancePath, attendanceContent, 'utf8');
  console.log('✅ 1. 근태 관리: position → role 수정');
} else {
  console.log('❌ 1. 근태 관리 코드를 찾을 수 없음');
}

// 2. 급여 관리는 직급(position) 데이터가 있는지 확인 필요
// 일단 role로 수정
const payrollPath = 'C:/hr-system/src/components/common/common_admin_payroll.js';
let payrollContent = fs.readFileSync(payrollPath, 'utf8');

// 급여 테이블에 role 필드도 추가해야 함
console.log('\n⚠️  급여 관리는 role 필드가 없을 수 있습니다. 확인이 필요합니다.');

console.log('\n✅ 완료!');
console.log('근태 관리 정렬: 세부부서 > 직책(role: 대표>임원>팀장>반장>조장>팀원)');
