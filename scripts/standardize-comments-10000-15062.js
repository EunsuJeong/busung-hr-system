const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  App.js 10000~15062줄 주석 완전 정리');
console.log('  (규칙 기반 자동 처리)');
console.log('========================================\n');

const appPath = path.join(__dirname, '../src/App.js');
const backupPath = path.join(__dirname, '../src/App.js.backup.' + Date.now());

// 백업 생성
console.log('💾 백업 생성 중...');
fs.copyFileSync(appPath, backupPath);
console.log('✓ 백업: ' + backupPath + '\n');

// 파일 읽기
const content = fs.readFileSync(appPath, 'utf8');
const lines = content.split('\n');
console.log('📄 총 라인 수: ' + lines.length + '\n');

console.log('🔄 10000~15062줄 주석 처리 중...\n');

const START_LINE = 9999; // 0-indexed (10000번째 줄)
const END_LINE = Math.min(15062, lines.length);
let removeCount = 0;

console.log('🔧 [1/1] 규칙 기반 inline 주석 제거...');

for (let i = START_LINE; i < END_LINE && i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // 이미 처리된 줄이거나 주석이 아니면 스킵
  if (!trimmed.startsWith('//')) continue;

  // 유지할 주석 패턴들
  const keepPatterns = [
    /^\/\/\s*\*\d+/,                    // // *1_xxx* 형식
    /^\/\/---\d+/,                       // //---2.1_xxx---// 형식
    /^\/\/\s*==+$/,                      // // ========== 형식
    /^\/\/\s*🧩/,                        // // 🧩 제목 형식
    /^\/\/\s*📁/,                        // // 📁 구조 설명
    /^\/\/\s*\[COMMON\]/,                // // [COMMON] 형식
    /^\/\/\s*\[ADMIN\]/,                 // // [ADMIN] 형식
    /^\/\/\s*\[STAFF\]/,                 // // [STAFF] 형식
    /^\/\/\s*\[1_프로그램 기본\]/,          // // [1_프로그램 기본]
    /^\/\/\s*⚠️\s*레거시:/,              // // ⚠️ 레거시: 형식 (유지)
  ];

  let shouldKeep = false;
  for (const pattern of keepPatterns) {
    if (pattern.test(trimmed)) {
      shouldKeep = true;
      break;
    }
  }

  // 유지할 주석이 아니면 제거
  if (!shouldKeep) {
    // 단, 블록 주석의 일부인지 확인
    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';

    // 레거시 블록 내부인지 확인
    if (prevLine.includes('// ===') || nextLine.includes('// ===')) {
      // 레거시 블록 전체를 제거
      lines[i] = '';
      removeCount++;
    }
    // 일반 inline 주석 제거
    else {
      lines[i] = '';
      removeCount++;
    }
  }
}

console.log(`  ✓ ${removeCount}개 inline 주석 제거`);

// 연속된 빈 줄 정리 (3개 이상 → 2개로)
const cleanedLines = [];
let emptyCount = 0;
for (const line of lines) {
  if (line.trim() === '') {
    emptyCount++;
    if (emptyCount <= 2) {
      cleanedLines.push(line);
    }
  } else {
    emptyCount = 0;
    cleanedLines.push(line);
  }
}

// 파일 저장
console.log('\n💾 파일 저장 중...');
const newContent = cleanedLines.join('\n');
fs.writeFileSync(appPath, newContent, 'utf8');

console.log('✓ 완료\n');
console.log('========================================');
console.log('📊 결과');
console.log('========================================');
console.log('  - 대상 범위: 10000~15062줄');
console.log('  - 제거된 주석: ' + removeCount + '개');
console.log('  - 원본 라인: ' + lines.length);
console.log('  - 정리 후: ' + cleanedLines.length);
console.log('  - 제거된 빈 줄: ' + (lines.length - cleanedLines.length));
console.log('\n✅ 주석 정리 완료!');
console.log('📝 유지된 주석:');
console.log('  - // *X_xxx* 형식');
console.log('  - //---X_xxx---// 형식');
console.log('  - /* === */ 블록 형식');
console.log('  - // ⚠️ 레거시: 형식');
console.log('\n백업 위치: ' + backupPath);
