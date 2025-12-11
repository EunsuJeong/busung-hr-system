const fs = require('fs');
const path = require('path');

console.log('🔧 App.js common 모듈 import 경로 업데이트 시작...\n');

const appPath = path.join(__dirname, '../src/App.js');
let content = fs.readFileSync(appPath, 'utf-8');

// 업데이트 전 경로 확인
const dashboardImport = content.match(/from\s+['"]\.\/common\/common_admin_dashboard['"]/);
const employeeImport = content.match(/from\s+['"]\.\/common\/common_admin_employee['"]/);

console.log('📖 현재 import 경로:');
console.log(`  - Dashboard: ${dashboardImport ? '✓ 발견' : '✗ 없음'}`);
console.log(`  - Employee: ${employeeImport ? '✓ 발견' : '✗ 없음'}\n`);

// common_admin_dashboard import 경로 업데이트
content = content.replace(
  /from\s+['"]\.\/common\/common_admin_dashboard['"]/g,
  `from './components/common/common_admin_dashboard'`
);

// common_admin_employee import 경로 업데이트
content = content.replace(
  /from\s+['"]\.\/common\/common_admin_employee['"]/g,
  `from './components/common/common_admin_employee'`
);

// 파일 저장
fs.writeFileSync(appPath, content, 'utf-8');

console.log('✅ App.js import 경로 업데이트 완료!');
console.log('📝 변경 사항:');
console.log('  - ./common/common_admin_dashboard → ./components/common/common_admin_dashboard');
console.log('  - ./common/common_admin_employee → ./components/common/common_admin_employee\n');
