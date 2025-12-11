const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/common/common_admin_dashboard.js');

// 파일 읽기
let content = fs.readFileSync(filePath, 'utf8');

// 기존 getEmployeesByStatus 함수 전체 (1724-1873 라인)
const oldFunction = `export const getEmployeesByStatus = ({
  employees,
  status,
  isNightShift = false,
  dashboardDateFilter,
  dashboardSelectedDate,
  getAttendanceForEmployee,
  analyzeAttendanceStatusForDashboard,
  devLog = console.log,
}) => {
  let targetDate;
  if (dashboardDateFilter === 'today') {
    targetDate = new Date().toISOString().split('T')[0];
  } else {
    targetDate = dashboardSelectedDate;
  }

  devLog(
    \`=
 \${
   isNightShift ? '야간' : '주간'
 } \${status} 상태 직원 검색 - 대상날짜: \${targetDate}\`
  );

  return employees
    .filter((emp) => {
      const workType = emp.workType || '주간';
      const leaveType = emp.leaveType || null;

      if (isNightShift && workType !== '야간') return false;
      if (!isNightShift && workType === '야간') return false;

      if (leaveType === '휴직') return false;

      let empStatus = '결근';

      let checkDate = targetDate;
      if (workType === '야간') {
        const yesterday = new Date(targetDate);
        yesterday.setDate(yesterday.getDate() - 1);
        checkDate = yesterday.toISOString().split('T')[0];
      }

      if (typeof getAttendanceForEmployee === 'function') {
        const dateObj = new Date(checkDate);
        const attendanceData = getAttendanceForEmployee(
          emp.id,
          dateObj.getFullYear(),
          dateObj.getMonth() + 1,
          dateObj.getDate()
        );

        if (typeof analyzeAttendanceStatusForDashboard === 'function') {
          empStatus = analyzeAttendanceStatusForDashboard(
            attendanceData,
            dateObj.getFullYear(),
            dateObj.getMonth() + 1,
            dateObj.getDate(),
            workType,
            leaveType,
            emp.id
          );

          if (empStatus === null) {
            return false;
          }
        } else if (
          attendanceData &&
          (attendanceData.checkIn || attendanceData.checkOut)
        ) {
          empStatus = '출근';
        }
      }

      if (empStatus === '결근') {
        const attendanceTarget = emp.attendance
          ? emp.attendance.find((att) => att.date === checkDate)
          : null;
        if (attendanceTarget) {
          empStatus = attendanceTarget.status;
        }
      }

      devLog(
        \`=
 \${emp.name} (\${workType}): \${empStatus} (날짜: \${checkDate})\`
      );

      if (empStatus === '휴일') {
        return false;
      }

      switch (status) {
        case '출근':
          return (
            empStatus === '출근' ||
            empStatus === '근무중' ||
            empStatus === '조퇴' ||
            empStatus === '지각/조퇴'
          );
        case '지각':
          return empStatus === '지각';
        case '연차':
          return empStatus === '연차';
        case '결근':
          return empStatus === '결근';
        default:
          return false;
      }
    })
    .map((emp) => {
      const workType = emp.workType || '주간';
      let checkDate = targetDate;
      if (workType === '야간') {
        const yesterday = new Date(targetDate);
        yesterday.setDate(yesterday.getDate() - 1);
        checkDate = yesterday.toISOString().split('T')[0];
      }

      let checkInTime = '';
      let checkOutTime = '';

      if (typeof getAttendanceForEmployee === 'function') {
        const dateObj = new Date(checkDate);
        const attendanceData = getAttendanceForEmployee(
          emp.id,
          dateObj.getFullYear(),
          dateObj.getMonth() + 1,
          dateObj.getDate()
        );
        if (attendanceData) {
          checkInTime = attendanceData.checkIn || '';
          checkOutTime = attendanceData.checkOut || '';
        }
      }

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        position: emp.position,
        workType: workType,
        leaveType: emp.leaveType || '-',
        time: checkInTime,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status: status,
        date: checkDate,
      };
    });`;

// 새로운 함수
const newFunction = `export const getEmployeesByStatus = ({
  employees,
  status,
  isNightShift = false,
  dashboardDateFilter,
  dashboardSelectedDate,
  getAttendanceForEmployee,
  analyzeAttendanceStatusForDashboard,
  devLog = console.log,
}) => {
  let targetDate, targetYesterday;
  if (dashboardDateFilter === 'today') {
    targetDate = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    targetYesterday = yesterday.toISOString().split('T')[0];
  } else {
    targetDate = dashboardSelectedDate;
    const selectedDate = new Date(dashboardSelectedDate);
    selectedDate.setDate(selectedDate.getDate() - 1);
    targetYesterday = selectedDate.toISOString().split('T')[0];
  }

  devLog(
    \`=
 \${
   isNightShift ? '야간' : '주간'
 } \${status} 상태 직원 검색 - 대상날짜: \${targetDate}\`
  );

  // 출근 시간 기준으로 주간/야간 판단하는 헬퍼 함수
  const determineShiftByCheckIn = (checkIn) => {
    if (!checkIn) return null;
    const timeParts = checkIn.split(':');
    if (timeParts.length < 2) return null;
    const hour = parseInt(timeParts[0], 10);
    if (hour >= 6 && hour < 18) {
      return '주간';
    } else {
      return '야간';
    }
  };

  return employees
    .filter((emp) => {
      const workType = emp.workType || '주간';
      const leaveType = emp.leaveType || null;

      if (leaveType === '휴직') return false;

      // 오늘과 어제의 출근 기록 조회
      const targetDateObj = new Date(targetDate);
      const todayAttendanceData = getAttendanceForEmployee(
        emp.id,
        targetDateObj.getFullYear(),
        targetDateObj.getMonth() + 1,
        targetDateObj.getDate()
      );

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

      let isDayShiftEmployee = false;
      if (actualShiftToday === '주간') {
        isDayShiftEmployee = true;
      } else if (actualShiftYesterday === '야간') {
        isDayShiftEmployee = false;
      } else if (!actualShiftToday && !actualShiftYesterday) {
        isDayShiftEmployee = (workType === '주간' || !workType);
      } else if (actualShiftToday === '야간') {
        isDayShiftEmployee = false;
      } else if (actualShiftYesterday === '주간') {
        isDayShiftEmployee = true;
      } else {
        isDayShiftEmployee = (workType === '주간' || !workType);
      }

      // 요청된 시프트와 직원의 시프트가 일치하는지 확인
      if (isNightShift && isDayShiftEmployee) return false;
      if (!isNightShift && !isDayShiftEmployee) return false;

      // 상태 확인
      let empStatus = '결근';
      let checkDate = isDayShiftEmployee ? targetDate : targetYesterday;
      let attendanceData = isDayShiftEmployee ? todayAttendanceData : yesterdayAttendanceData;

      if (typeof analyzeAttendanceStatusForDashboard === 'function') {
        const dateObj = new Date(checkDate);
        empStatus = analyzeAttendanceStatusForDashboard(
          attendanceData,
          dateObj.getFullYear(),
          dateObj.getMonth() + 1,
          dateObj.getDate(),
          workType,
          leaveType,
          emp.id
        );

        if (empStatus === null) {
          return false;
        }
      } else if (
        attendanceData &&
        (attendanceData.checkIn || attendanceData.checkOut)
      ) {
        empStatus = '출근';
      }

      if (empStatus === '결근') {
        const attendanceTarget = emp.attendance
          ? emp.attendance.find((att) => att.date === checkDate)
          : null;
        if (attendanceTarget) {
          empStatus = attendanceTarget.status;
        }
      }

      devLog(
        \`=
 \${emp.name} (\${isDayShiftEmployee ? '주간' : '야간'}): \${empStatus} (날짜: \${checkDate})\`
      );

      if (empStatus === '휴일') {
        return false;
      }

      switch (status) {
        case '출근':
          return (
            empStatus === '출근' ||
            empStatus === '근무중' ||
            empStatus === '조퇴' ||
            empStatus === '지각/조퇴'
          );
        case '지각':
          return empStatus === '지각';
        case '연차':
          return empStatus === '연차';
        case '결근':
          return empStatus === '결근';
        default:
          return false;
      }
    })
    .map((emp) => {
      const workType = emp.workType || '주간';

      // 오늘과 어제의 출근 기록 조회
      const targetDateObj = new Date(targetDate);
      const todayAttendanceData = getAttendanceForEmployee(
        emp.id,
        targetDateObj.getFullYear(),
        targetDateObj.getMonth() + 1,
        targetDateObj.getDate()
      );

      const yesterdayDateObj = new Date(targetYesterday);
      const yesterdayAttendanceData = getAttendanceForEmployee(
        emp.id,
        yesterdayDateObj.getFullYear(),
        yesterdayDateObj.getMonth() + 1,
        yesterdayDateObj.getDate()
      );

      // 1순위: 실제 출근 시간으로 주간/야간 판단
      const determineShiftByCheckIn = (checkIn) => {
        if (!checkIn) return null;
        const timeParts = checkIn.split(':');
        if (timeParts.length < 2) return null;
        const hour = parseInt(timeParts[0], 10);
        if (hour >= 6 && hour < 18) {
          return '주간';
        } else {
          return '야간';
        }
      };

      let actualShiftToday = determineShiftByCheckIn(todayAttendanceData?.checkIn);
      let actualShiftYesterday = determineShiftByCheckIn(yesterdayAttendanceData?.checkIn);

      let isDayShiftEmployee = false;
      if (actualShiftToday === '주간') {
        isDayShiftEmployee = true;
      } else if (actualShiftYesterday === '야간') {
        isDayShiftEmployee = false;
      } else if (!actualShiftToday && !actualShiftYesterday) {
        isDayShiftEmployee = (workType === '주간' || !workType);
      } else if (actualShiftToday === '야간') {
        isDayShiftEmployee = false;
      } else if (actualShiftYesterday === '주간') {
        isDayShiftEmployee = true;
      } else {
        isDayShiftEmployee = (workType === '주간' || !workType);
      }

      let checkDate = isDayShiftEmployee ? targetDate : targetYesterday;
      let attendanceData = isDayShiftEmployee ? todayAttendanceData : yesterdayAttendanceData;

      let checkInTime = attendanceData?.checkIn || '';
      let checkOutTime = attendanceData?.checkOut || '';

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        position: emp.position,
        workType: workType,
        leaveType: emp.leaveType || '-',
        time: checkInTime,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status: status,
        date: checkDate,
      };
    });`;

// 함수 교체
content = content.replace(oldFunction, newFunction);

// 파일 쓰기
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ getEmployeesByStatus 팝업 필터링 로직 수정 완료!');
console.log('📌 변경사항:');
console.log('  - 1순위: 실제 출근시간(checkIn)으로 주간/야간 판단');
console.log('  - 2순위: 출근 기록 없으면 workType으로 판단');
console.log('  - 팝업창 직원 리스트가 이제 정확하게 필터링됩니다!');
