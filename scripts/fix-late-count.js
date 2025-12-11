const fs = require('fs');

const commonPath = 'C:/hr-system/src/components/common/common_admin_attendance.js';
let content = fs.readFileSync(commonPath, 'utf8');

// 1. 직접 지각 계산 로직 제거하고 preCalculatedStats에서 가져오도록 수정
const oldCode = `      // 개인별 총 근무일 누적
      totalEmployeeWorkDays += employeeWorkDays;

      // 개인별 총 근무시간 계산 (preCalculatedStats 우선 사용)
      const stats = preCalculatedStats?.get(emp.id) || calculateMonthlyStats(emp.id);
      totalWorkHours += stats.totalHours || 0;`;

const newCode = `      // 개인별 총 근무일 누적
      totalEmployeeWorkDays += employeeWorkDays;

      // 개인별 총 근무시간 및 지각 계산 (preCalculatedStats 우선 사용)
      const stats = preCalculatedStats?.get(emp.id) || calculateMonthlyStats(emp.id);
      totalWorkHours += stats.totalHours || 0;
      totalLate += stats.late || 0;`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  console.log('1. preCalculatedStats에서 지각 건수 가져오기 추가');
} else {
  console.log('1. 대상 코드를 찾을 수 없음');
}

// 2. 직접 지각 계산하는 로직 제거
const oldLateCalc = `        const dateWorkType = getWorkTypeForDate(
          attendanceSheetYear,
          attendanceSheetMonth,
          day
        );
        const isWeekday = dateWorkType === 'weekday';

        // 출근시간이 있고, 연차가 아니고, 실제 시간 형식(HH:MM)이고, 평일인 경우만 체크
        if (
          isWeekday &&
          attendance.checkIn &&
          attendance.checkIn !== '연차' &&
          attendance.checkIn.trim() !== '' &&
          attendance.checkIn.includes(':')
        ) {
          const workType =
            emp.workType || emp.workShift || emp.근무형태 || '주간';
          const checkInTime = attendance.checkIn.replace(':', '');

          if (workType === '야간') {
            // 야간 근무자: 19:01 이후 출근이 지각 (기본 근무 시작: 19:00)
            if (checkInTime > '1900') {
              totalLate += 1;
            }
          } else {
            // 주간 근무자: 08:31 이후 출근이 지각 (기본 근무 시작: 08:30)
            if (checkInTime > '0830') {
              totalLate += 1;
            }
          }
        }`;

const newLateCalc = `        // 지각 계산은 preCalculatedStats/calculateMonthlyStats에서 처리
        // (시프터 자동판정, 주말/휴일 제외 등 모든 로직 적용됨)`;

if (content.includes(oldLateCalc)) {
  content = content.replace(oldLateCalc, newLateCalc);
  console.log('2. 중복 지각 계산 로직 제거 완료');
} else {
  console.log('2. 중복 지각 계산 로직을 찾을 수 없음');
}

fs.writeFileSync(commonPath, content, 'utf8');
console.log('저장 완료!');
