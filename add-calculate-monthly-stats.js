const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// Step 1: Add attendanceStatsCache ref after other useState declarations
// Find a good place to add it - after attendanceSheetData
const searchStr1 = `  const [attendanceSheetData, setAttendanceSheetData] = useState({});`;

const replaceStr1 = `  const [attendanceSheetData, setAttendanceSheetData] = useState({});
  const attendanceStatsCache = useRef(new Map());`;

content = content.replace(searchStr1, replaceStr1);

// Step 2: Add calculateMonthlyStats function after analyzeAttendanceStatusForDashboard
const searchStr2 = `  const analyzeAttendanceStatusForDashboard = useCallback(
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
  );`;

const replaceStr2 = `  const analyzeAttendanceStatusForDashboard = useCallback(
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

  const calculateMonthlyStats = useCallback(
    (employeeId) => {
      const cacheKey = \`\${employeeId}-\${attendanceSheetYear}-\${attendanceSheetMonth}\`;
      if (attendanceStatsCache.current.has(cacheKey)) {
        return attendanceStatsCache.current.get(cacheKey);
      }

      const daysInMonth = getDaysInMonth(
        attendanceSheetYear,
        attendanceSheetMonth
      );
      let totalWorkDays = 0;
      let annualLeave = 0;
      let absence = 0;
      let late = 0;
      let earlyLeave = 0;
      let outing = 0;

      let totalHours = 0;
      let regularHours = 0;
      let earlyHours = 0;
      let overtimeHours = 0;
      let holidayHours = 0;
      let nightHours = 0;
      let overtimeNightHours = 0;
      let earlyHolidayHours = 0;
      let holidayOvertimeHours = 0;

      const employee = employees.find((emp) => emp.id === employeeId);

      for (let day = 1; day <= daysInMonth; day++) {
        const attendance = getAttendanceForEmployee(
          employeeId,
          attendanceSheetYear,
          attendanceSheetMonth,
          day
        );
        const dateStr = \`\${attendanceSheetYear}-\${String(
          attendanceSheetMonth
        ).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;

        if (attendance.checkIn && attendance.checkOut) {
          totalWorkDays++;

          const categorized = categorizeWorkTime(
            attendance.checkIn,
            attendance.checkOut,
            employee,
            dateStr
          );

          regularHours += categorized.기본 || 0;
          earlyHours += categorized.조출 || 0;
          overtimeHours += categorized.연장 || 0;
          holidayHours += categorized.특근 || 0;
          nightHours += categorized.심야 || 0;
          overtimeNightHours += categorized['연장+심야'] || 0;
          earlyHolidayHours += categorized['조출+특근'] || 0;
          holidayOvertimeHours += categorized['특근+연장'] || 0;

          holidayHours += categorized['특근+심야'] || 0;
          holidayOvertimeHours += categorized['특근+연장+심야'] || 0;
          earlyHolidayHours += categorized['특근+조출'] || 0;

          const dailyTotal = Object.values(categorized).reduce(
            (sum, hours) => sum + (hours || 0),
            0
          );
          totalHours += dailyTotal;

          const workType =
            employee.workType ||
            employee.workShift ||
            employee.근무형태 ||
            '주간';

          if (workType === '야간') {
            if (attendance.checkIn > '19:00') {
              late++;
            }

            const checkOutTime = attendance.checkOut;
            if (checkOutTime >= '00:00' && checkOutTime < '04:00') {
              earlyLeave++;
            }
          } else {
            if (attendance.checkIn > '09:00') {
              late++;
            }
            if (attendance.checkOut < '17:00') {
              earlyLeave++;
            }
          }
        } else if (attendance.type === 'annual') {
          annualLeave++;
        } else if (attendance.type === 'absence') {
          absence++;
        } else if (attendance.type === 'outing') {
          outing++;
        }
      }

      const result = {
        totalWorkDays,
        annualLeave,
        absence,
        late,
        earlyLeave,
        outing,
        totalHours,
        regularHours,
        earlyHours,
        overtimeHours,
        holidayHours,
        nightHours,
        overtimeNightHours,
        earlyHolidayHours,
        holidayOvertimeHours,
      };

      attendanceStatsCache.current.set(cacheKey, result);
      return result;
    },
    [
      attendanceSheetYear,
      attendanceSheetMonth,
      employees,
      getAttendanceForEmployee,
      categorizeWorkTime,
    ]
  );`;

content = content.replace(searchStr2, replaceStr2);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Added calculateMonthlyStats function and attendanceStatsCache ref');
