const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// 현재 위치에서 제거
const toRemove = `  // *[2_관리자 모드] 2.8_근태 데이터 관리 함수들*
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

`;

content = content.replace(toRemove, '');

// attendanceSheetData 이후에 추가
const searchStr = `  const [attendanceSheetData, setAttendanceSheetData] = useState({});`;

const replaceStr = `  const [attendanceSheetData, setAttendanceSheetData] = useState({});

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
  );`;

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(path, content, 'utf8');
console.log('✅ Moved attendance functions to correct position');
