const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/common/common_admin_dashboard.js');

// 파일 읽기
let content = fs.readFileSync(filePath, 'utf8');

// 기존 로직 찾기
const oldLogic = `    devLog('🔍 대상 날짜:', { targetDate, targetYesterday });
    devLog('🔍 총 직원 수:', employees.length);

    employees.forEach((emp) => {
      const workType = emp.workType || '주간';
      const leaveType = emp.leaveType || null;

      if (leaveType === '휴직') {
        return;
      }

      if (workType === '주간' || !workType) {
        stats.totalDayShift++;
        const targetDateObj = new Date(targetDate);
        const attendanceData = getAttendanceForEmployee(
          emp.id,
          targetDateObj.getFullYear(),
          targetDateObj.getMonth() + 1,
          targetDateObj.getDate()
        );

        let status = '결근';
        status = analyzeAttendanceStatusForDashboard(
          attendanceData,
          targetDateObj.getFullYear(),
          targetDateObj.getMonth() + 1,
          targetDateObj.getDate(),
          workType,
          leaveType,
          emp.id
        );

        if (status === null) {
          stats.totalDayShift--;
          return;
        }

        if (status === '결근') {
          const attendanceTarget = emp.attendance
            ? emp.attendance.find((att) => att.date === targetDate)
            : null;
          if (attendanceTarget) {
            status = attendanceTarget.status;
          }
        }

        devLog(\`🔍 \${emp.name}: \${status}\`);

        switch (status) {
          case '출근':
          case '근무중':
          case '조퇴':
          case '지각/조퇴':
            stats.present++;
            break;
          case '지각':
            stats.late++;
            break;
          case '결근':
            stats.absent++;
            break;
          case '연차':
            stats.leave++;
            break;
          case '휴일':
            break;
          default:
            // 알 수 없는 상태는 결근으로 처리하지 않음
            devLog(\`⚠️ 알 수 없는 상태: \${emp.name} - \${status}\`);
            break;
        }
      }

      if (workType === '야간') {
        stats.totalNightShift++;
        const yesterdayDateObj = new Date(targetYesterday);
        const attendanceData = getAttendanceForEmployee(
          emp.id,
          yesterdayDateObj.getFullYear(),
          yesterdayDateObj.getMonth() + 1,
          yesterdayDateObj.getDate()
        );

        let status = '결근';
        status = analyzeAttendanceStatusForDashboard(
          attendanceData,
          yesterdayDateObj.getFullYear(),
          yesterdayDateObj.getMonth() + 1,
          yesterdayDateObj.getDate(),
          workType,
          leaveType,
          emp.id
        );

        if (status === null) {
          stats.totalNightShift--;
          return;
        }

        if (status === '결근') {
          const attendanceTarget = emp.attendance
            ? emp.attendance.find((att) => att.date === targetYesterday)
            : null;
          if (attendanceTarget) {
            status = attendanceTarget.status;
          }
        }

        devLog(\`🔍 야간 \${emp.name}: \${status}\`);

        switch (status) {
          case '출근':
          case '근무중':
          case '조퇴':
          case '지각/조퇴':
            stats.nightPresent++;
            break;
          case '지각':
            stats.nightLate++;
            break;
          case '결근':
            stats.nightAbsent++;
            break;
          case '연차':
            stats.nightLeave++;
            break;
          case '휴일':
            break;
          default:
            // 알 수 없는 상태는 결근으로 처리하지 않음
            devLog(\`⚠️ 야간 알 수 없는 상태: \${emp.name} - \${status}\`);
            break;
        }
      }
    });`;

// 새로운 로직
const newLogic = `    devLog('🔍 대상 날짜:', { targetDate, targetYesterday });
    devLog('🔍 총 직원 수:', employees.length);

    // 출근 시간 기준으로 주간/야간 판단하는 헬퍼 함수
    const determineShiftByCheckIn = (checkIn) => {
      if (!checkIn) return null; // checkIn이 없으면 null 반환

      // checkIn 형식: "HH:MM" 또는 "HH:MM:SS"
      const timeParts = checkIn.split(':');
      if (timeParts.length < 2) return null;

      const hour = parseInt(timeParts[0], 10);

      // 주간: 06:00 ~ 18:00 (6시 ~ 18시)
      // 야간: 18:00 ~ 06:00 (18시 ~ 익일 6시)
      if (hour >= 6 && hour < 18) {
        return '주간';
      } else {
        return '야간';
      }
    };

    employees.forEach((emp) => {
      const workType = emp.workType || '주간';
      const leaveType = emp.leaveType || null;

      if (leaveType === '휴직') {
        return;
      }

      // 오늘 날짜의 출근 기록 조회 (주간 근무자 확인용)
      const targetDateObj = new Date(targetDate);
      const todayAttendanceData = getAttendanceForEmployee(
        emp.id,
        targetDateObj.getFullYear(),
        targetDateObj.getMonth() + 1,
        targetDateObj.getDate()
      );

      // 어제 날짜의 출근 기록 조회 (야간 근무자 확인용)
      const yesterdayDateObj = new Date(targetYesterday);
      const yesterdayAttendanceData = getAttendanceForEmployee(
        emp.id,
        yesterdayDateObj.getFullYear(),
        yesterdayDateObj.getMonth() + 1,
        yesterdayDateObj.getDate()
      );

      // 1순위: 실제 출근 시간으로 주간/야간 판단
      // 2순위: 출근 기록이 없으면 workType으로 판단
      let actualShiftToday = determineShiftByCheckIn(todayAttendanceData?.checkIn);
      let actualShiftYesterday = determineShiftByCheckIn(yesterdayAttendanceData?.checkIn);

      // 주간 근무 처리
      let isDayShiftEmployee = false;
      if (actualShiftToday === '주간') {
        // 오늘 출근 기록이 주간 시간대
        isDayShiftEmployee = true;
      } else if (actualShiftYesterday === '야간') {
        // 어제 출근 기록이 야간 시간대 → 야간 근무자
        isDayShiftEmployee = false;
      } else if (!actualShiftToday && !actualShiftYesterday) {
        // 출근 기록이 없으면 workType으로 판단
        isDayShiftEmployee = (workType === '주간' || !workType);
      } else if (actualShiftToday === '야간') {
        // 오늘 출근이 야간 시간대 → 야간 근무자
        isDayShiftEmployee = false;
      } else if (actualShiftYesterday === '주간') {
        // 어제 출근이 주간 → 주간 근무자
        isDayShiftEmployee = true;
      } else {
        // 기타 경우는 workType으로 판단
        isDayShiftEmployee = (workType === '주간' || !workType);
      }

      if (isDayShiftEmployee) {
        stats.totalDayShift++;

        let status = '결근';
        status = analyzeAttendanceStatusForDashboard(
          todayAttendanceData,
          targetDateObj.getFullYear(),
          targetDateObj.getMonth() + 1,
          targetDateObj.getDate(),
          workType,
          leaveType,
          emp.id
        );

        if (status === null) {
          stats.totalDayShift--;
          return;
        }

        if (status === '결근') {
          const attendanceTarget = emp.attendance
            ? emp.attendance.find((att) => att.date === targetDate)
            : null;
          if (attendanceTarget) {
            status = attendanceTarget.status;
          }
        }

        devLog(\`🔍 \${emp.name} (주간): \${status}\`);

        switch (status) {
          case '출근':
          case '근무중':
          case '조퇴':
          case '지각/조퇴':
            stats.present++;
            break;
          case '지각':
            stats.late++;
            break;
          case '결근':
            stats.absent++;
            break;
          case '연차':
            stats.leave++;
            break;
          case '휴일':
            break;
          default:
            devLog(\`⚠️ 알 수 없는 상태: \${emp.name} - \${status}\`);
            break;
        }
      } else {
        // 야간 근무 처리
        stats.totalNightShift++;

        let status = '결근';
        status = analyzeAttendanceStatusForDashboard(
          yesterdayAttendanceData,
          yesterdayDateObj.getFullYear(),
          yesterdayDateObj.getMonth() + 1,
          yesterdayDateObj.getDate(),
          workType,
          leaveType,
          emp.id
        );

        if (status === null) {
          stats.totalNightShift--;
          return;
        }

        if (status === '결근') {
          const attendanceTarget = emp.attendance
            ? emp.attendance.find((att) => att.date === targetYesterday)
            : null;
          if (attendanceTarget) {
            status = attendanceTarget.status;
          }
        }

        devLog(\`🔍 \${emp.name} (야간): \${status}\`);

        switch (status) {
          case '출근':
          case '근무중':
          case '조퇴':
          case '지각/조퇴':
            stats.nightPresent++;
            break;
          case '지각':
            stats.nightLate++;
            break;
          case '결근':
            stats.nightAbsent++;
            break;
          case '연차':
            stats.nightLeave++;
            break;
          case '휴일':
            break;
          default:
            devLog(\`⚠️ 야간 알 수 없는 상태: \${emp.name} - \${status}\`);
            break;
        }
      }
    });`;

// 로직 교체
content = content.replace(oldLogic, newLogic);

// 파일 쓰기
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 주간/야간 시프트 판단 로직 수정 완료!');
console.log('📌 변경사항:');
console.log('  - 1순위: 실제 출근시간(checkIn)으로 주간/야간 판단');
console.log('  - 2순위: 출근 기록 없으면 workType으로 판단');
console.log('  - 주간: 06:00 ~ 18:00');
console.log('  - 야간: 18:00 ~ 06:00');
