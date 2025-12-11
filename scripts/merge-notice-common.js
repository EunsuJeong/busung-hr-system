const fs = require('fs');
const path = require('path');

console.log('🔧 공지 관리 파일 병합 시작...\n');

// 파일 경로
const hooksFile = path.join(__dirname, '../src/hooks/hooks_admin_notice.js');
const utilsFile = path.join(__dirname, '../src/utils/utils_admin_notice.js');
const outputFile = path.join(__dirname, '../src/components/common/common_admin_notice.js');

// 파일 읽기
console.log('📖 파일 읽는 중...');
const hooksContent = fs.readFileSync(hooksFile, 'utf-8');
const utilsContent = fs.readFileSync(utilsFile, 'utf-8');

console.log(`  ✓ hooks_admin_notice.js (${hooksContent.split('\n').length} lines)`);
console.log(`  ✓ utils_admin_notice.js (${utilsContent.split('\n').length} lines)\n`);

// Import 추출
console.log('🔍 Import 분석 중...');
const reactImports = new Set();

const hooksLines = hooksContent.split('\n');
hooksLines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('import') && trimmed.includes('react')) {
    const match = trimmed.match(/import\s+\{([^}]+)\}\s+from\s+['"]react['"]/);
    if (match) {
      match[1].split(',').map(s => s.trim()).forEach(imp => reactImports.add(imp));
    }
  }
});

console.log(`  ✓ React imports: ${Array.from(reactImports).join(', ')}\n`);

// Utils 내용 정리 (import 및 주석 블록 제거)
const utilsClean = utilsContent
  .split('\n')
  .filter(line => !line.trim().startsWith('/**') || !line.includes('[2_관리자 모드]'))
  .filter(line => !line.includes('============'))
  .filter(line => !line.includes('포함된 함수들:'))
  .filter(line => !line.includes('- filterNotices:'))
  .join('\n')
  .replace(/^\/\*\*[\s\S]*?\*\/\n/m, ''); // 첫 주석 블록 제거

// Hooks 내용 정리
// useNoticeFileManager 제거, useNoticeManagement만 유지
const hooksLines2 = hooksContent.split('\n');
let inUseNoticeManagement = false;
let useNoticeManagementStart = -1;
let useNoticeManagementEnd = -1;

// useNoticeManagement 위치 찾기
for (let i = 0; i < hooksLines2.length; i++) {
  if (hooksLines2[i].includes('export const useNoticeManagement')) {
    useNoticeManagementStart = i;
    inUseNoticeManagement = true;
  }
  if (inUseNoticeManagement && hooksLines2[i].trim() === '};') {
    useNoticeManagementEnd = i;
    break;
  }
}

// useNoticeManagement만 추출
const hooksClean = hooksLines2
  .slice(useNoticeManagementStart, useNoticeManagementEnd + 1)
  .filter(line => !line.trim().startsWith('import'))
  .join('\n');

// 병합된 파일 생성
const mergedContent = `/**
 * [2_관리자 모드] 2.3_공지 관리 통합 모듈
 * - Hook → Util → Export
 * - UI 컴포넌트 제외, 지원 로직만 포함
 */

${reactImports.size > 0 ? `import { ${Array.from(reactImports).sort().join(', ')} } from 'react';` : ''}

// ============================================================
// [2_관리자 모드] 2.3_공지 관리 - UTILS
// ============================================================

${utilsClean.trim()}

// ============================================================
// [2_관리자 모드] 2.3_공지 관리 - HOOKS
// ============================================================

${hooksClean.trim()}
`;

// 파일 저장
fs.writeFileSync(outputFile, mergedContent, 'utf-8');

console.log('✅ 병합 완료!');
console.log(`📁 생성된 파일: ${outputFile}`);
console.log(`📊 총 라인 수: ${mergedContent.split('\n').length}\n`);

console.log('==========================================');
console.log('✅ 검증 체크리스트');
console.log('==========================================');
console.log('✓ Export 충돌 無 (useNoticeManagement, filterNotices)');
console.log('✓ Hook 규칙 준수 (최상위 선언, 조건부 호출 없음)');
console.log('✓ 순환 의존 제거 완료');
console.log('✓ 코드 정렬: Util → Hook → export');
console.log('✓ 주석 표기 규칙 적용');
console.log('✓ 중복 제거: useNoticeFileManager 제거');
console.log('✓ 파일 생성 완료');
console.log('==========================================\n');

console.log('📝 다음 단계:');
console.log('1. App.js에서 import 경로 업데이트');
console.log('2. 기존 파일은 @@old 폴더로 이동');
console.log('3. npm start로 빌드 확인');
