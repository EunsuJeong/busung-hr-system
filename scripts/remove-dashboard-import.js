const fs = require('fs');
const path = require('path');

console.log('🔧 App.js에서 Dashboard import 제거 시작...\n');

const appPath = path.join(__dirname, '../src/App.js');
let content = fs.readFileSync(appPath, 'utf-8');

// Dashboard import 구문 제거
const dashboardImportBlock = `import {
  useDashboardActions,
  useDashboardStats,
  useDashboardCalculations,
  useDashboardAttendance,
  calculateMonthlyAttendanceRate as calculateMonthlyAttendanceRateService,
  calculateCompanyStats as calculateCompanyStatsService,
} from './components/common/common_admin_dashboard';
`;

if (content.includes(dashboardImportBlock)) {
  content = content.replace(dashboardImportBlock, '');
  console.log('✓ Dashboard import 블록 발견 및 제거\n');
} else {
  console.log('⚠️  Dashboard import 블록을 찾을 수 없습니다.\n');
}

// 파일 저장
fs.writeFileSync(appPath, content, 'utf-8');

console.log('✅ Dashboard import 제거 완료!');
console.log('📝 이전 상태로 복원되었습니다.\n');
