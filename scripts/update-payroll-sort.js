const fs = require('fs');

const payrollPath = 'C:/hr-system/src/components/common/common_admin_payroll.js';
let content = fs.readFileSync(payrollPath, 'utf8');

// 급여 정렬을 세부부서 + 직급 기준으로 변경
const oldSort = `      return true;
    }).sort((a, b) => {
      // 정렬 우선순위 배열
      const subDeptOrder = ['대표', '임원', '관리', '영업', '출하', '품질', '생산관리', '열', '표면', '구부', '인발', '교정·절단', '검사', '금형', '공무', '가공'];
      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '팀원'];

      // 급여 테이블은 세부부서 정보가 없을 수 있으므로 성명 기준으로 직원 찾기 필요
      // 여기서는 직급만으로 정렬 (세부부서 정보는 row에 없음)
      const posA = positionOrder.indexOf(a.직급);
      const posB = positionOrder.indexOf(b.직급);
      return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
    });`;

const newSort = `      return true;
    }).sort((a, b) => {
      // 정렬 우선순위 배열
      const subDeptOrder = ['대표', '임원', '관리', '영업', '출하', '품질', '생산관리', '열', '표면', '구부', '인발', '교정·절단', '검사', '금형', '공무', '가공'];
      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '팀원'];

      // 1순위: 세부부서명
      const subDeptA = subDeptOrder.indexOf(a.세부부서);
      const subDeptB = subDeptOrder.indexOf(b.세부부서);
      const subDeptCompare = (subDeptA === -1 ? 999 : subDeptA) - (subDeptB === -1 ? 999 : subDeptB);

      if (subDeptCompare !== 0) return subDeptCompare;

      // 2순위: 직책
      const posA = positionOrder.indexOf(a.직급);
      const posB = positionOrder.indexOf(b.직급);
      return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
    });`;

if (content.includes(oldSort)) {
  content = content.replace(oldSort, newSort);
  fs.writeFileSync(payrollPath, content, 'utf8');
  console.log('✅ 급여 관리 정렬을 세부부서 + 직급 기준으로 업데이트 완료!');
} else {
  console.log('❌ 급여 정렬 코드를 찾을 수 없음');
}
