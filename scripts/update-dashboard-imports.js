const fs = require('fs');
const path = require('path');

console.log('🔧 App.js 대시보드 import 경로 업데이트 시작...\n');

const appPath = path.join(__dirname, '../src/App.js');
let content = fs.readFileSync(appPath, 'utf-8');

// 1. hooks_admin_dashboard import 찾기
const hooksImportMatch = content.match(
  /import\s+\{[\s\S]*?\}\s+from\s+['"]\.\/hooks\/hooks_admin_dashboard['"]/
);

// 2. utils_admin_dashboard import 찾기
const utilsImportMatch = content.match(
  /import\s+\{[\s\S]*?\}\s+from\s+['"]\.\/utils\/utils_admin_dashboard['"]/
);

// 3. services_admin_analytics import 찾기
const servicesImportMatch = content.match(
  /import\s+\{[\s\S]*?\}\s+from\s+['"]\.\/services\/services_admin_analytics['"]/
);

if (!hooksImportMatch || !utilsImportMatch || !servicesImportMatch) {
  console.log('⚠️ 필요한 import 문을 찾을 수 없습니다.');
  process.exit(1);
}

console.log('✓ hooks_admin_dashboard import 발견');
console.log('✓ utils_admin_dashboard import 발견');
console.log('✓ services_admin_analytics import 발견\n');

// 통합된 import 생성
const combinedImport = `import {
  useDashboardStats,
  useDashboardAttendance,
  useSafetyManagement,
  useDashboardCalculations,
  useDashboardActions,
  getEmployeesByStatus as getEmployeesByStatusUtil,
  getSortedAttendanceEmployees as getSortedAttendanceEmployeesUtil,
  calculateAttendanceRate as calculateAttendanceRateUtil,
  calculateLateRate as calculateLateRateUtil,
  calculateAbsentRate as calculateAbsentRateUtil,
  calculateTurnoverRate as calculateTurnoverRateUtil,
  calculateAverageOvertimeHours as calculateAverageOvertimeHoursUtil,
  calculateLeaveUsageRate as calculateLeaveUsageRateUtil,
  calculateMonthlyLeaveUsageRate as calculateMonthlyLeaveUsageRateUtil,
  calculateWeekly52HoursViolation as calculateWeekly52HoursViolationUtil,
  calculateStressIndex as calculateStressIndexUtil,
  calculateMonthlyAttendanceRate as calculateMonthlyAttendanceRateService,
  calculateCompanyStats as calculateCompanyStatsService,
} from './common/common_admin_dashboard';`;

// hooks import를 통합된 import로 교체
content = content.replace(hooksImportMatch[0], combinedImport);

// utils import 제거
content = content.replace(utilsImportMatch[0] + '\n', '');

// services import 제거
content = content.replace(servicesImportMatch[0] + '\n', '');

// 파일 저장
fs.writeFileSync(appPath, content, 'utf-8');

console.log('✅ App.js import 경로 업데이트 완료!');
console.log('📝 변경 사항:');
console.log('  - hooks_admin_dashboard → common_admin_dashboard (통합)');
console.log('  - utils_admin_dashboard → common_admin_dashboard (병합)');
console.log('  - services_admin_analytics → common_admin_dashboard (병합)\n');
