const fs = require('fs');

const commonPath = 'C:/hr-system/src/components/common/common_admin_attendance.js';
let content = fs.readFileSync(commonPath, 'utf8');

// shiftType이 없을 때 실시간으로 determineShiftType 호출하도록 수정
const oldCode = `          // attendance.shiftType이 있으면 그것을 우선 사용 (출근시간 기반 주간/야간 자동 판정)
          const workType =
            attendance.shiftType ||
            employee.workType ||
            employee.workShift ||
            employee.근무형태 ||
            '주간';`;

const newCode = `          // attendance.shiftType이 없으면 determineShiftType으로 실시간 판정
          const autoShiftType = !attendance.shiftType
            ? determineShiftType(employeeId, attendance.checkIn)
            : null;
          const workType =
            attendance.shiftType ||
            autoShiftType ||
            employee.workType ||
            employee.workShift ||
            employee.근무형태 ||
            '주간';`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(commonPath, content, 'utf8');
  console.log('수정 완료! shiftType 없을 때 determineShiftType 실시간 호출 추가');
} else {
  console.log('대상 코드를 찾을 수 없음');
}
