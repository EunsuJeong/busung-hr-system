const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.js');

console.log('🔧 App.js hooks import 통합 중...\n');

let content = fs.readFileSync(appPath, 'utf-8');

// 같은 파일에서 import하는 것들을 찾아서 통합
const filesToConsolidate = [
  'hooks_common',
  'hooks_admin_common',
  'hooks_admin_dashboard',
  'hooks_admin_attendance',
  'hooks_admin_leave',
  'hooks_admin_payroll',
  'hooks_admin_ai',
  'hooks_admin_system',
  'hooks_admin_schedule',
  'hooks_admin_notification',
];

filesToConsolidate.forEach(fileName => {
  // 해당 파일에서 import하는 모든 named imports 찾기
  const pattern = new RegExp(`import\\s+\\{\\s*([^}]+)\\s*\\}\\s+from\\s+['"]\\./hooks/${fileName}['"];?`, 'g');

  const matches = [...content.matchAll(pattern)];

  if (matches.length > 1) {
    console.log(`📦 ${fileName}에서 ${matches.length}개 import 발견, 통합 중...`);

    // 모든 import된 항목들을 수집
    const imports = [];
    const importLines = [];

    matches.forEach(match => {
      const items = match[1].split(',').map(s => s.trim()).filter(Boolean);
      imports.push(...items);
      importLines.push(match[0]);
    });

    // 중복 제거
    const uniqueImports = [...new Set(imports)];

    console.log(`  ✓ ${uniqueImports.join(', ')}`);

    // 첫 번째 import만 남기고 나머지 제거
    let isFirst = true;
    importLines.forEach(line => {
      if (isFirst) {
        // 첫 번째는 통합된 내용으로 교체
        content = content.replace(
          line,
          `import {\n  ${uniqueImports.join(',\n  ')},\n} from './hooks/${fileName}';`
        );
        isFirst = false;
      } else {
        // 나머지는 제거
        content = content.replace(line + '\n', '');
      }
    });
  }

  // default import도 확인 (useAIRecommendations 같은 경우)
  const defaultPattern = new RegExp(`import\\s+([a-zA-Z]+)\\s+from\\s+['"]\\./hooks/${fileName}['"];?`, 'g');
  const defaultMatches = [...content.matchAll(defaultPattern)];

  if (defaultMatches.length > 0) {
    console.log(`  ℹ️  default import: ${defaultMatches.map(m => m[1]).join(', ')}`);
  }
});

fs.writeFileSync(appPath, content, 'utf-8');

console.log('\n✅ Import 통합 완료!');
