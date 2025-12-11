const fs = require('fs');
const path = require('path');

console.log('🔧 대시보드 관련 파일 병합 시작...\n');

// 파일 경로
const hooksFile = path.join(__dirname, '../src/hooks/hooks_admin_dashboard.js');
const servicesFile = path.join(__dirname, '../src/services/services_admin_analytics.js');
const utilsFile = path.join(__dirname, '../src/utils/utils_admin_dashboard.js');
const outputFile = path.join(__dirname, '../src/common/common_admin_dashboard.js');

// common 폴더 생성
const commonDir = path.join(__dirname, '../src/common');
if (!fs.existsSync(commonDir)) {
  fs.mkdirSync(commonDir, { recursive: true });
  console.log('✓ common 폴더 생성\n');
}

// 파일 읽기
console.log('📖 파일 읽는 중...');
const hooksContent = fs.readFileSync(hooksFile, 'utf-8');
const servicesContent = fs.readFileSync(servicesFile, 'utf-8');
const utilsContent = fs.readFileSync(utilsFile, 'utf-8');

console.log(`  ✓ hooks_admin_dashboard.js (${hooksContent.split('\n').length} lines)`);
console.log(`  ✓ services_admin_analytics.js (${servicesContent.split('\n').length} lines)`);
console.log(`  ✓ utils_admin_dashboard.js (${utilsContent.split('\n').length} lines)\n`);

// Import 추출 및 중복 제거
console.log('🔍 Import 분석 중...');
const imports = new Set();
const reactImports = new Set();

[hooksContent, servicesContent, utilsContent].forEach(content => {
  const lines = content.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('import') && trimmed.includes('react')) {
      // React imports
      const match = trimmed.match(/import\s+\{([^}]+)\}\s+from\s+['"]react['"]/);
      if (match) {
        match[1].split(',').map(s => s.trim()).forEach(imp => reactImports.add(imp));
      }
    } else if (trimmed.startsWith('import') && !trimmed.includes('react')) {
      // Other imports (utils, services 등)
      imports.add(trimmed);
    }
  });
});

console.log(`  ✓ React imports: ${Array.from(reactImports).join(', ')}`);
console.log(`  ✓ Other imports: ${imports.size}개\n`);

// Hooks 내용 정리 (import 제거)
const hooksClean = hooksContent
  .split('\n')
  .filter(line => !line.trim().startsWith('import'))
  .filter(line => !line.trim().startsWith('/**') || !line.includes('[2_관리자 모드] 2.1_대시보드'))
  .join('\n')
  .replace(/^\/\*\*[\s\S]*?\*\/\n/m, ''); // 첫 주석 블록 제거

// Services 내용 정리
const servicesClean = servicesContent
  .split('\n')
  .filter(line => !line.trim().startsWith('import'))
  .filter(line => !line.includes('============'))
  .filter(line => !line.trim().startsWith('/**') || !line.includes('[2_관리자 모드]'))
  .join('\n')
  .replace(/^\/\*\*[\s\S]*?\*\/\n/m, ''); // 첫 주석 블록 제거

// Utils 내용 정리
const utilsClean = utilsContent
  .split('\n')
  .filter(line => !line.trim().startsWith('import'))
  .filter(line => !line.trim().startsWith('/**') || !line.includes('[2_관리자 모드]'))
  .join('\n')
  .replace(/^\/\*\*[\s\S]*?\*\/\n/m, ''); // 첫 주석 블록 제거

// 병합된 파일 생성
const mergedContent = `/**
 * [2_관리자 모드] 2.1_대시보드 통합 모듈
 * - Hook → Service → Util → Export
 * - UI 컴포넌트 제외, 지원 로직만 포함
 */

${reactImports.size > 0 ? `import { ${Array.from(reactImports).sort().join(', ')} } from 'react';` : ''}
${Array.from(imports).sort().join('\n')}

// ============================================================
// [2_관리자 모드] 2.1_대시보드 - HOOKS
// ============================================================

${hooksClean.trim()}

// ============================================================
// [2_관리자 모드] 2.1_대시보드 - SERVICES
// ============================================================

${servicesClean.trim()}

// ============================================================
// [2_관리자 모드] 2.1_대시보드 - UTILS
// ============================================================

${utilsClean.trim()}
`;

// 파일 저장
fs.writeFileSync(outputFile, mergedContent, 'utf-8');

console.log('✅ 병합 완료!');
console.log(`📁 생성된 파일: ${outputFile}`);
console.log(`📊 총 라인 수: ${mergedContent.split('\n').length}\n`);

console.log('==========================================');
console.log('✅ 검증 체크리스트');
console.log('==========================================');
console.log('✓ Import 중복 제거 완료');
console.log('✓ 코드 정렬: Hook → Service → Util');
console.log('✓ 주석 표기 규칙 적용');
console.log('✓ 파일 생성 완료');
console.log('==========================================\n');

console.log('📝 다음 단계:');
console.log('1. App.js에서 import 경로 업데이트');
console.log('2. 기존 파일은 @@old 폴더로 이동 (선택사항)');
console.log('3. npm start로 빌드 확인');
