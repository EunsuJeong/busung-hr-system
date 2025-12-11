const fs = require('fs');

const commonPath = 'C:/hr-system/src/components/common/common_admin_attendance.js';
let content = fs.readFileSync(commonPath, 'utf8');

// calculateMonthlyStats 의존성 배열에 determineShiftType, getWorkTypeForDate 추가
const oldDeps = `    [
      attendanceSheetYear,
      attendanceSheetMonth,
      attendanceStatsCache,
      employees,
      getAttendanceForEmployee,
      categorizeWorkTime,
    ]`;

const newDeps = `    [
      attendanceSheetYear,
      attendanceSheetMonth,
      attendanceStatsCache,
      employees,
      getAttendanceForEmployee,
      categorizeWorkTime,
      determineShiftType,
      getWorkTypeForDate,
    ]`;

if (content.includes(oldDeps)) {
  content = content.replace(oldDeps, newDeps);
  fs.writeFileSync(commonPath, content, 'utf8');
  console.log('수정 완료! calculateMonthlyStats 의존성 배열에 determineShiftType, getWorkTypeForDate 추가');
} else {
  console.log('대상 코드를 찾을 수 없음');
}
