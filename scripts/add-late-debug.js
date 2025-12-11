const fs = require('fs');

const commonPath = 'C:/hr-system/src/components/common/common_admin_attendance.js';
let content = fs.readFileSync(commonPath, 'utf8');

// 지각 판정 부분에 디버그 로그 추가
const oldLateCheck = `          if (!isHolidayOrWeekend) {
            if (workType === '야간') {
              // 야간 근무자: 19:01 이후 출근이 지각 (기본 근무 시작: 19:00)
              if (attendance.checkIn > '19:00') {
                late++;
              }`;

const newLateCheck = `          if (!isHolidayOrWeekend) {
            if (workType === '야간') {
              // 야간 근무자: 19:01 이후 출근이 지각 (기본 근무 시작: 19:00)
              if (attendance.checkIn > '19:00') {
                late++;
                console.log(\`[지각] \${employee?.name} | \${attendanceSheetYear}-\${attendanceSheetMonth}-\${day} | 출근:\${attendance.checkIn} | 판정:야간 | shiftType:\${attendance.shiftType} | auto:\${autoShiftType}\`);
              }`;

if (content.includes(oldLateCheck)) {
  content = content.replace(oldLateCheck, newLateCheck);
  console.log('1. 야간 지각 로그 추가');
} else {
  console.log('1. 야간 지각 로직을 찾을 수 없음');
}

// 주간 지각 로그 추가
const oldDayLate = `            } else {
              // 주간 근무자: 08:31 이후 출근이 지각 (기본 근무 시작: 08:30)
              if (attendance.checkIn > '08:30') {
                late++;
              }`;

const newDayLate = `            } else {
              // 주간 근무자: 08:31 이후 출근이 지각 (기본 근무 시작: 08:30)
              if (attendance.checkIn > '08:30') {
                late++;
                console.log(\`[지각] \${employee?.name} | \${attendanceSheetYear}-\${attendanceSheetMonth}-\${day} | 출근:\${attendance.checkIn} | 판정:주간 | shiftType:\${attendance.shiftType} | auto:\${autoShiftType}\`);
              }`;

if (content.includes(oldDayLate)) {
  content = content.replace(oldDayLate, newDayLate);
  console.log('2. 주간 지각 로그 추가');
} else {
  console.log('2. 주간 지각 로직을 찾을 수 없음');
}

// 지각 총합 로그 추가
const oldReturn = `      const result = {
        totalWorkDays,
        annualLeave,
        absence,
        late,`;

const newReturn = `      console.log(\`[통계] \${employee?.name} | 지각:\${late}건\`);

      const result = {
        totalWorkDays,
        annualLeave,
        absence,
        late,`;

if (content.includes(oldReturn)) {
  content = content.replace(oldReturn, newReturn);
  console.log('3. 통계 로그 추가');
} else {
  console.log('3. 통계 로직을 찾을 수 없음');
}

fs.writeFileSync(commonPath, content, 'utf8');
console.log('저장 완료!');
