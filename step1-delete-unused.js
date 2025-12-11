const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// 미사용 함수 updateEmployeesWithAttendanceData 삭제 (3918-3976)
const functionToDelete = `
  // *2.8_근태 데이터 동기화*
  const updateEmployeesWithAttendanceData = (year, month) => {
    devLog(\`🔄 employees 배열 attendance 데이터 동기화: \${year}년 \${month}월\`);

    setEmployees((prevEmployees) => {
      return prevEmployees.map((emp) => {
        const updatedAttendance = [...(emp.attendance || [])];

        const daysInMonth = getDaysInMonth(year, month);
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = \`\${year}-\${String(month).padStart(2, '0')}-\${String(
            day
          ).padStart(2, '0')}\`;
          const attendanceData = getAttendanceForEmployee(
            emp.id,
            year,
            month,
            day
          );

          if (
            attendanceData &&
            (attendanceData.checkIn || attendanceData.checkOut)
          ) {
            const status = analyzeAttendanceStatusForDashboard(
              attendanceData,
              year,
              month,
              day,
              emp.workType || '주간'
            );

            const existingIndex = updatedAttendance.findIndex(
              (att) => att.date === dateStr
            );
            const newAttendanceRecord = {
              date: dateStr,
              checkIn: attendanceData.checkIn || '',
              checkOut: attendanceData.checkOut || '',
              status: status,
            };

            if (existingIndex >= 0) {
              updatedAttendance[existingIndex] = newAttendanceRecord;
            } else {
              updatedAttendance.push(newAttendanceRecord);
            }
          }
        }

        return {
          ...emp,
          attendance: updatedAttendance,
        };
      });
    });

    devLog('✅ employees 배열 동기화 완료');
  };
`;

if (content.includes(functionToDelete)) {
  content = content.replace(functionToDelete, '');
  console.log('✅ updateEmployeesWithAttendanceData 함수 삭제 완료 (59줄)');
} else {
  console.log('⚠️  함수를 찾을 수 없습니다. 줄바꿈 차이가 있을 수 있습니다.');
}

fs.writeFileSync(path, content, 'utf8');
console.log('📄 App.js 저장 완료');
