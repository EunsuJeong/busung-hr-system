const fs = require('fs');
const path = require('path');

console.log('🔧 App.js 직원 관리 import 경로 업데이트 시작...\n');

const appPath = path.join(__dirname, '../src/App.js');
let content = fs.readFileSync(appPath, 'utf-8');

// hooks_admin_employee import 찾기 및 교체
const oldImport = /import\s+\{([^}]*useEmployeeManagement[^}]*)\}\s+from\s+['"]\.\/hooks\/hooks_admin_employee['"];?/g;
const match = content.match(oldImport);

if (match) {
  console.log('✓ hooks_admin_employee import 발견');
  content = content.replace(oldImport, `import { useEmployeeManagement } from './common/common_admin_employee';`);
  console.log('  → common_admin_employee로 변경\n');
} else {
  console.log('⚠️ hooks_admin_employee import를 찾을 수 없습니다.\n');
}

// 파일 저장
fs.writeFileSync(appPath, content, 'utf-8');

console.log('✅ App.js import 경로 업데이트 완료!');
console.log('📝 변경 사항:');
console.log('  - hooks_admin_employee → common_admin_employee\n');
