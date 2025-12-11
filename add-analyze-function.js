const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// setCheckOutTime 함수 다음에 analyzeAttendanceStatusForDashboard 추가
const searchStr = `  const setCheckOutTime = useCallback(
    (employeeId, year, month, day, time) => {
      setAttendanceForEmployee(employeeId, year, month, day, { checkOut: time });
    },
    [setAttendanceForEmployee]
  );

  const [attendanceSearchFilter, setAttendanceSearchFilter] = useState({`;

const replaceStr = `  const setCheckOutTime = useCallback(
    (employeeId, year, month, day, time) => {
      setAttendanceForEmployee(employeeId, year, month, day, { checkOut: time });
    },
    [setAttendanceForEmployee]
  );

  const analyzeAttendanceStatusForDashboard = useCallback(
    (attendance, year, month, day, employeeWorkType = '주간', employeeLeaveType = null) => {
      const dateStr = \`\${year}-\${String(month).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;

      const dayOfWeek = new Date(year, month - 1, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPublicHoliday = isHolidayDate(year, month, day);

      if (employeeLeaveType === '휴직') {
        return null;
      }

      if (employeeLeaveType === '반차(오전)' || employeeLeaveType === '반차(오후)') {
        return '연차';
      }

      const leaveRecord = leaveRequests.find(
        (leave) =>
          leave.startDate <= dateStr &&
          leave.endDate >= dateStr &&
          leave.status === '승인'
      );

      if (leaveRecord) {
        return '연차';
      }

      if (attendance?.type === '외출' || attendance?.type === '조퇴') {
        return '출근';
      }

      if (isWeekend || isPublicHoliday) {
        if (attendance?.checkIn) {
          return '출근';
        }
        return null;
      }

      if (!attendance || (!attendance.checkIn && !attendance.checkOut)) {
        return '결근';
      }

      if (attendance.checkIn && !attendance.checkOut) {
        return '근무중';
      }

      if (attendance.checkIn && attendance.checkOut) {
        const checkInTime = parseTime(attendance.checkIn);
        const checkOutTime = parseTime(attendance.checkOut);

        let status = '출근';

        if (isWeekend || isPublicHoliday) {
          status = '출근';
        } else {
          let lateThreshold, earlyLeaveThreshold;

          if (employeeWorkType === '야간') {
            lateThreshold = parseTime('19:00') + 1;
            earlyLeaveThreshold = parseTime('03:50');
          } else {
            lateThreshold = parseTime('08:30') + 1;
            earlyLeaveThreshold = parseTime('17:20');
          }

          if (checkInTime >= lateThreshold) {
            status = '지각';
          }

          if (checkOutTime < earlyLeaveThreshold) {
            status = status === '지각' ? '지각/조퇴' : '조퇴';
          }
        }

        return status;
      }

      return '기타';
    },
    [leaveRequests]
  );

  const [attendanceSearchFilter, setAttendanceSearchFilter] = useState({`;

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(path, content, 'utf8');
console.log('✅ Added analyzeAttendanceStatusForDashboard function');
