const fs = require('fs');
const payrollPath = 'C:/hr-system/src/components/common/common_admin_payroll.js';
let content = fs.readFileSync(payrollPath, 'utf8');

// 1. 급여 초기화 시 급여형태 추가
const old1 = `        직책: emp.role || '팀원',
        입사일자: emp.joinDate || emp.hireDate || '미정',`;

const new1 = `        직책: emp.role || '팀원',
        급여형태: emp.payType || '시급',
        입사일자: emp.joinDate || emp.hireDate || '미정',`;

if (content.includes(old1)) {
  content = content.replace(old1, new1);
  console.log('✅ 1. 급여 초기화 시 급여형태 필드 추가');
} else {
  console.log('⚠️  1. 급여 초기화 코드를 찾을 수 없음');
}

// 2. 정렬 수정: 급여형태 → 직급 순
const old2 = `    }).sort((a, b) => {
      // 정렬 우선순위 배열
      const subDeptOrder = ['대표', '임원', '관리', '영업', '출하', '품질', '생산관리', '열', '표면', '구부', '인발', '교정·절단', '검사', '금형', '공무', '가공'];
      const roleOrder = ['대표', '임원', '팀장', '반장', '조장', '팀원'];

      // 1순위: 세부부서명
      const subDeptA = subDeptOrder.indexOf(a.세부부서);
      const subDeptB = subDeptOrder.indexOf(b.세부부서);
      const subDeptCompare = (subDeptA === -1 ? 999 : subDeptA) - (subDeptB === -1 ? 999 : subDeptB);

      if (subDeptCompare !== 0) return subDeptCompare;

      // 2순위: 직책
      const roleA = roleOrder.indexOf(a.직책);
      const roleB = roleOrder.indexOf(b.직책);
      return (roleA === -1 ? 999 : roleA) - (roleB === -1 ? 999 : roleB);
    });`;

const new2 = `    }).sort((a, b) => {
      // 정렬 우선순위 배열
      const payTypeOrder = ['연봉', '시급'];
      const positionOrder = ['대표', '상무', '전무', '이사', '부장', '차장', '과장', '대리', '주임', '반장', '조장', '사원'];

      // 1순위: 급여형태 (연봉 → 시급)
      const payTypeA = payTypeOrder.indexOf(a.급여형태);
      const payTypeB = payTypeOrder.indexOf(b.급여형태);
      const payTypeCompare = (payTypeA === -1 ? 999 : payTypeA) - (payTypeB === -1 ? 999 : payTypeB);

      if (payTypeCompare !== 0) return payTypeCompare;

      // 2순위: 직급
      const posA = positionOrder.indexOf(a.직급);
      const posB = positionOrder.indexOf(b.직급);
      return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
    });`;

if (content.includes(old2)) {
  content = content.replace(old2, new2);
  console.log('✅ 2. 급여 관리 정렬: 급여형태 → 직급 순으로 변경');
} else {
  console.log('⚠️  2. 급여 정렬 코드를 찾을 수 없음');
}

fs.writeFileSync(payrollPath, content, 'utf8');
console.log('\n완료!');
console.log('근태 관리: 세부부서 → 직급');
console.log('급여 관리: 급여형태(연봉→시급) → 직급');
