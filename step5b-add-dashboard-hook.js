const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// useDashboardStats 훅 호출 추가 (useStaffLeave 앞에)
const search = `  const remainAnnualLeave = totalAnnualLeave - usedAnnualLeave;

  // *[3_일반직원 모드] 3.5_연차 신청/내역 - 연차 관리 훅*`;

const replace = `  const remainAnnualLeave = totalAnnualLeave - usedAnnualLeave;

  // *[2_관리자 모드] 2.1_대시보드 - 통계 관리 훅*
  const { dashboardStatsReal } = useDashboardStats({
    employees,
    dashboardDateFilter,
    dashboardSelectedDate,
    attendanceSheetData,
    getAttendanceForEmployee,
    analyzeAttendanceStatusForDashboard,
    devLog,
  });

  // *[3_일반직원 모드] 3.5_연차 신청/내역 - 연차 관리 훅*`;

if (content.includes(search) && !content.includes('useDashboardStats({')) {
  content = content.replace(search, replace);
  console.log('✅ useDashboardStats 훅 호출 추가 완료');
} else if (content.includes('useDashboardStats({')) {
  console.log('⏭️  useDashboardStats 훅 호출이 이미 추가되어 있습니다');
} else {
  console.log('❌ 훅 호출 추가 위치를 찾을 수 없습니다');
}

fs.writeFileSync(path, content, 'utf8');
console.log('📄 App.js 저장 완료');
