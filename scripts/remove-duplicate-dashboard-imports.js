const fs = require('fs');
const path = require('path');

console.log('🔧 App.js 중복 대시보드 import 제거 시작...\n');

const appPath = path.join(__dirname, '../src/App.js');
let content = fs.readFileSync(appPath, 'utf-8');

// 1. utils_admin_dashboard import 찾기 및 제거
const utilsDashboardImportPattern = /import\s+\{[\s\S]*?\}\s+from\s+['"]\.\/utils\/utils_admin_dashboard['"];?\n/g;
const utilsMatches = content.match(utilsDashboardImportPattern);

if (utilsMatches && utilsMatches.length > 0) {
  console.log(`✓ ${utilsMatches.length}개의 utils_admin_dashboard import 발견`);
  content = content.replace(utilsDashboardImportPattern, '');
  console.log('  → 제거 완료\n');
}

// 2. services_admin_analytics import 찾기 및 제거
const servicesAnalyticsImportPattern = /import\s+\{[\s\S]*?\}\s+from\s+['"]\.\/services\/services_admin_analytics['"];?\n/g;
const servicesMatches = content.match(servicesAnalyticsImportPattern);

if (servicesMatches && servicesMatches.length > 0) {
  console.log(`✓ ${servicesMatches.length}개의 services_admin_analytics import 발견`);
  content = content.replace(servicesAnalyticsImportPattern, '');
  console.log('  → 제거 완료\n');
}

// 파일 저장
fs.writeFileSync(appPath, content, 'utf-8');

console.log('✅ 중복 import 제거 완료!');
console.log('📝 변경 사항:');
console.log('  - utils_admin_dashboard import 제거 (중복)');
console.log('  - services_admin_analytics import 제거 (중복)');
console.log('  - common_admin_dashboard import만 유지\n');
