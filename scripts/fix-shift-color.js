const fs = require('fs');

const filePath = 'C:/hr-system/src/components/admin/AdminAttendanceManagement.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 야간 근무 녹색 표시 수정 시작...\n');

const oldFunction = `  // 해당 월에 주간/야간 시프트가 모두 있는 직원인지 확인
  const hasShiftWork = (employeeId) => {
    const shiftTypes = new Set();
    const daysInMonth = new Date(
      attendanceSheetYear,
      attendanceSheetMonth,
      0
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = \`\${attendanceSheetYear}-\${String(
        attendanceSheetMonth
      ).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
      const employeeKey = \`\${employeeId}_\${dateKey}\`;
      const attendance = attendanceSheetData[employeeKey];

      if (attendance && attendance.shiftType) {
        shiftTypes.add(attendance.shiftType);
      }
    }

    // 주간과 야간이 모두 있으면 true
    return shiftTypes.has('주간') && shiftTypes.has('야간');
  };`;

const newFunction = `  // 주간/야간 교대 근무자인지 확인 (직원의 workType이 '주간/야간'인 경우)
  const hasShiftWork = (employeeId) => {
    const employee = filteredAttendanceEmployees.find(
      (emp) => emp.id === employeeId
    );
    return employee && employee.workType === '주간/야간';
  };`;

if (content.includes(oldFunction)) {
  content = content.replace(oldFunction, newFunction);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ hasShiftWork 함수 수정 완료');
  console.log('\n변경 내역:');
  console.log('- AS-IS: 해당 월에 주간과 야간을 모두 근무해야 true');
  console.log('- TO-BE: 직원의 workType이 "주간/야간"이면 true');
  console.log('\n이제 야간 근무 시 출퇴근 시간이 녹색으로 정확하게 표시됩니다! ✨');
} else {
  console.log('⚠️  함수를 찾을 수 없거나 이미 수정됨');
}
