/**
 * App.js 재정리 스크립트
 *
 * 사용법: node scripts/reorganize-app.js
 */

const fs = require('fs');
const path = require('path');

const APP_PATH = path.join(__dirname, '../src/App.js');
const BACKUP_PATH = path.join(__dirname, '../src/@@OLD/251028_2050_재배치전_App.js');
const OUTPUT_PATH = path.join(__dirname, '../src/App_reorganized.js');

console.log('🚀 App.js 재정리 시작...\n');

// 1. 백업 생성
console.log('📦 백업 생성 중...');
const originalContent = fs.readFileSync(APP_PATH, 'utf8');
fs.writeFileSync(BACKUP_PATH, originalContent);
console.log(`✅ 백업 완료: ${BACKUP_PATH}\n`);

// 2. 파일을 줄 단위로 읽기
const lines = originalContent.split('\n');
console.log(`📄 총 라인 수: ${lines.length}\n`);

// 3. 섹션별로 분류
const sections = {
  imports: [],
  constants: [],
  commonState: [],
  commonEffect: [],
  commonFunctions: [],
  adminState: [],
  adminEffect: [],
  adminFunctions: [],
  staffState: [],
  staffFunctions: [],
  rendering: []
};

// 4. 라인별 분석 및 분류
let currentSection = 'imports';
let insideFunction = false;
let braceCount = 0;

console.log('🔍 코드 분석 중...');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // import 문 감지
  if (i < 132 && (line.trim().startsWith('import ') || line.includes('from '))) {
    sections.imports.push(line);
    continue;
  }

  // Constants 섹션 (114-130줄)
  if (i >= 114 && i <= 130) {
    sections.constants.push(line);
    continue;
  }

  // useState로 state 감지
  if (line.includes('useState')) {
    if (line.includes('[COMMON]') || i < 700) {
      currentSection = 'commonState';
    } else if (line.includes('[ADMIN]')) {
      currentSection = 'adminState';
    } else if (line.includes('[STAFF]')) {
      currentSection = 'staffState';
    }
  }

  // useEffect로 effect 감지
  if (line.includes('useEffect')) {
    if (i < 2000) {
      currentSection = 'commonEffect';
    } else {
      currentSection = 'adminEffect';
    }
  }

  // 함수 감지
  if (line.includes('const handle') || line.includes('const get') || line.includes('const calculate')) {
    if (i < 3000) {
      currentSection = 'commonFunctions';
    } else if (line.includes('[ADMIN]') || i < 10000) {
      currentSection = 'adminFunctions';
    } else {
      currentSection = 'staffFunctions';
    }
  }

  // renderContent 감지
  if (line.includes('const renderContent') || i > 13000) {
    currentSection = 'rendering';
  }

  // 현재 섹션에 라인 추가
  sections[currentSection].push(line);
}

console.log('\n📊 섹션별 라인 수:');
Object.entries(sections).forEach(([name, lines]) => {
  console.log(`  ${name}: ${lines.length}줄`);
});

// 5. 재배치된 파일 생성
console.log('\n✏️  재배치된 파일 생성 중...');

const reorganized = [
  '// ==========================================',
  '// 🧩 부성스틸 인사관리시스템 - App.js (재정리됨)',
  '// ==========================================',
  '// 재정리 날짜: ' + new Date().toISOString().split('T')[0],
  '// ==========================================',
  '',
  '// ==========================================',
  '// [1_프로그램 기본]',
  '// ==========================================',
  ...sections.imports,
  '',
  ...sections.constants,
  '',
  '// ==========================================',
  '// [2_공통 - STATE]',
  '// ==========================================',
  ...sections.commonState,
  '',
  '// ==========================================',
  '// [2_공통 - EFFECT]',
  '// ==========================================',
  ...sections.commonEffect,
  '',
  '// ==========================================',
  '// [2_공통 - FUNCTIONS]',
  '// ==========================================',
  ...sections.commonFunctions,
  '',
  '// ==========================================',
  '// [3_관리자 모드 - STATE]',
  '// ==========================================',
  ...sections.adminState,
  '',
  '// ==========================================',
  '// [3_관리자 모드 - EFFECT]',
  '// ==========================================',
  ...sections.adminEffect,
  '',
  '// ==========================================',
  '// [3_관리자 모드 - FUNCTIONS]',
  '// ==========================================',
  ...sections.adminFunctions,
  '',
  '// ==========================================',
  '// [4_일반직원 모드 - STATE & FUNCTIONS]',
  '// ==========================================',
  ...sections.staffState,
  ...sections.staffFunctions,
  '',
  '// ==========================================',
  '// [5_렌더링]',
  '// ==========================================',
  ...sections.rendering
].join('\n');

fs.writeFileSync(OUTPUT_PATH, reorganized);

console.log(`\n✅ 재배치 완료!`);
console.log(`📁 출력 파일: ${OUTPUT_PATH}`);
console.log(`\n⚠️  주의: 이 파일은 자동 생성되었으므로 반드시 테스트가 필요합니다!`);
console.log(`\n다음 단계:`);
console.log(`1. App_reorganized.js 파일 확인`);
console.log(`2. 컴파일 에러 확인`);
console.log(`3. 문제 없으면 App.js로 교체`);
