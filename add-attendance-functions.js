const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

const searchStr = `  const [isStressCalculationExpanded, setIsStressCalculationExpanded] =
    useState(true);

  //---[2_관리자 모드] 2.3_공지 관리 STATE---//`;

const replaceStr = `  const [isStressCalculationExpanded, setIsStressCalculationExpanded] =
    useState(true);

  // *[2_관리자 모드] 2.8_근태 데이터 관리 함수들*
  const getAttendanceForEmployee = useCallback(
    (employeeId, year, month, day) => {
      const dateKey = getDateKey(year, month, day);
      const employeeKey = \`\${employeeId}_\${dateKey}\`;
      return attendanceSheetData[employeeKey] || { checkIn: '', checkOut: '' };
    },
    [attendanceSheetData]
  );

  const setAttendanceForEmployee = useCallback(
    (employeeId, year, month, day, data) => {
      const dateKey = getDateKey(year, month, day);
      const employeeKey = \`\${employeeId}_\${dateKey}\`;
      setAttendanceSheetData((prev) => ({
        ...prev,
        [employeeKey]: { ...prev[employeeKey], ...data },
      }));
    },
    [setAttendanceSheetData]
  );

  const setCheckInTime = useCallback(
    (employeeId, year, month, day, time) => {
      setAttendanceForEmployee(employeeId, year, month, day, { checkIn: time });
    },
    [setAttendanceForEmployee]
  );

  const setCheckOutTime = useCallback(
    (employeeId, year, month, day, time) => {
      setAttendanceForEmployee(employeeId, year, month, day, { checkOut: time });
    },
    [setAttendanceForEmployee]
  );

  //---[2_관리자 모드] 2.3_공지 관리 STATE---//`;

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(path, content, 'utf8');
console.log('✅ Added attendance management functions');
