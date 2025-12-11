const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// Add calculateMonthlyStats after analyzeAttendanceStatusForDashboard
const searchStr = `    [leaveRequests]
  );

  const [attendanceSearchFilter, setAttendanceSearchFilter] = useState({`;

const replaceStr = `    [leaveRequests]
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
  );

  const [attendanceSearchFilter, setAttendanceSearchFilter] = useState({`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Added calculateMonthlyStats function');
