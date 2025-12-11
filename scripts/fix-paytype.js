const fs = require('fs');

const commonPath = 'C:/hr-system/src/components/common/common_admin_attendance.js';
let content = fs.readFileSync(commonPath, 'utf8');

// determineShiftType에서 salaryType → payType으로 변경
const oldCode = `      if (
        employee.department !== '생산' ||
        !targetSubdepartments.includes(employee.subDepartment) ||
        employee.salaryType !== '시급'
      ) {
        return null; // 자동 판정 대상 아님
      }`;

const newCode = `      if (
        employee.department !== '생산' ||
        !targetSubdepartments.includes(employee.subDepartment) ||
        employee.payType !== '시급'
      ) {
        return null; // 자동 판정 대상 아님
      }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(commonPath, content, 'utf8');
  console.log('✅ salaryType → payType 수정 완료!');
  console.log('이제 시프터 자동판정이 정상 작동합니다.');
} else {
  console.log('❌ 대상 코드를 찾을 수 없음');
}
