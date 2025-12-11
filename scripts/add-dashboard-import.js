const fs = require('fs');
const path = require('path');

console.log('🔧 App.js에 Dashboard import 추가 시작...\n');

const appPath = path.join(__dirname, '../src/App.js');
let content = fs.readFileSync(appPath, 'utf-8');

// useEmployeeManagement import 찾기
const employeeImportLine = "import { useEmployeeManagement } from './components/common/common_admin_employee';";

if (content.includes(employeeImportLine)) {
  console.log('✓ useEmployeeManagement import 발견');

  // Dashboard import 구문
  const dashboardImport = `import { useEmployeeManagement } from './components/common/common_admin_employee';
import {
  useDashboardActions,
  useDashboardStats,
  useDashboardCalculations,
  useDashboardAttendance,
  calculateMonthlyAttendanceRate as calculateMonthlyAttendanceRateService,
  calculateCompanyStats as calculateCompanyStatsService,
} from './components/common/common_admin_dashboard';`;

  // 교체
  content = content.replace(employeeImportLine, dashboardImport);

  // 파일 저장
  fs.writeFileSync(appPath, content, 'utf-8');

  console.log('✅ Dashboard import 추가 완료!\n');
  console.log('📝 추가된 함수들:');
  console.log('  - useDashboardActions');
  console.log('  - useDashboardStats');
  console.log('  - useDashboardCalculations');
  console.log('  - useDashboardAttendance');
  console.log('  - calculateMonthlyAttendanceRateService');
  console.log('  - calculateCompanyStatsService\n');
} else {
  console.log('⚠️ useEmployeeManagement import를 찾을 수 없습니다.');
}
