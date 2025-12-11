const fs = require('fs');

// 1. common_admin_attendance.js 수정
const commonPath = 'C:/hr-system/src/components/common/common_admin_attendance.js';
let commonContent = fs.readFileSync(commonPath, 'utf8');

// 훅 정의 부분 수정
const oldHookDef = `export const useFilteredAttendanceStats = (
  filteredAttendanceEmployees,
  calculateMonthlyStats,
  attendanceSheetYear,
  attendanceSheetMonth,
  getDaysInMonth,
  getAttendanceForEmployee,
  getWorkTypeForDate
) => {`;

const newHookDef = `export const useFilteredAttendanceStats = (
  filteredAttendanceEmployees,
  calculateMonthlyStats,
  attendanceSheetYear,
  attendanceSheetMonth,
  getDaysInMonth,
  getAttendanceForEmployee,
  getWorkTypeForDate,
  preCalculatedStats
) => {`;

if (commonContent.includes(oldHookDef)) {
  commonContent = commonContent.replace(oldHookDef, newHookDef);
  console.log('1. 훅 인자 추가 완료');
} else {
  console.log('1. 훅 정의를 찾을 수 없음');
}

// calculateMonthlyStats(emp.id) 호출 부분 수정
const oldCalcCall = `      // 개인별 총 근무시간 계산
      const stats = calculateMonthlyStats(emp.id);
      totalWorkHours += stats.totalHours || 0;`;

const newCalcCall = `      // 개인별 총 근무시간 계산 (preCalculatedStats 우선 사용)
      const stats = preCalculatedStats?.get(emp.id) || calculateMonthlyStats(emp.id);
      totalWorkHours += stats.totalHours || 0;`;

if (commonContent.includes(oldCalcCall)) {
  commonContent = commonContent.replace(oldCalcCall, newCalcCall);
  console.log('2. calculateMonthlyStats 호출 수정 완료');
} else {
  console.log('2. calculateMonthlyStats 호출을 찾을 수 없음');
}

fs.writeFileSync(commonPath, commonContent, 'utf8');
console.log('common_admin_attendance.js 저장 완료');

// 2. App.js 수정
const appPath = 'C:/hr-system/src/App.js';
let appContent = fs.readFileSync(appPath, 'utf8');

const oldAppCall = `  const filteredAttendanceStats = useFilteredAttendanceStats(
    filteredAttendanceEmployees,
    calculateMonthlyStats,
    attendanceSheetYear,
    attendanceSheetMonth,
    getDaysInMonth,
    getAttendanceForEmployee,
    getWorkTypeForDate
  );`;

const newAppCall = `  const filteredAttendanceStats = useFilteredAttendanceStats(
    filteredAttendanceEmployees,
    calculateMonthlyStats,
    attendanceSheetYear,
    attendanceSheetMonth,
    getDaysInMonth,
    getAttendanceForEmployee,
    getWorkTypeForDate,
    preCalculatedStats
  );`;

if (appContent.includes(oldAppCall)) {
  appContent = appContent.replace(oldAppCall, newAppCall);
  fs.writeFileSync(appPath, appContent, 'utf8');
  console.log('3. App.js 호출 부분 수정 완료');
} else {
  console.log('3. App.js 호출 부분을 찾을 수 없음');
}

console.log('완료!');
