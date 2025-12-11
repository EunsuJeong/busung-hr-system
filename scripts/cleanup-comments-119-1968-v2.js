const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  App.js 119~1968줄 주석 정리 (v2)');
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

console.log('🔄 119~1968줄 주석 정리 중...\n');

let changeCount = 0;

// 1. Line 136-143: [1_공통 - STATE] 블록 주석 정리
console.log('🔧 [1/4] [1_공통 - STATE] 블록 주석 정리...');
for (let i = 118; i < 1968 && i < lines.length; i++) {
  if (lines[i].trim() === '// ==========================================') {
    // 다음 줄이 [1_공통 - STATE]인지 확인
    if (i + 1 < lines.length && lines[i + 1].includes('// [1_공통 - STATE]')) {
      // 블록 전체를 표준 주석으로 교체
      const blockStart = i;
      let blockEnd = i;

      // 블록 끝 찾기 (다음 ========== 또는 빈 줄까지)
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].trim().startsWith('//') && !lines[j].includes('├─') && !lines[j].includes('└─') && !lines[j].includes('// [1_공통')) {
          blockEnd = j;
          break;
        }
      }

      // 블록 제거하고 간단한 주석으로 교체
      const beforeLines = lines.slice(0, blockStart);
      const afterLines = lines.slice(blockEnd + 1);

      const newComment = [
        '',
        '/* ================================',
        '   [1_공통] STATE 관리',
        '================================ */'
      ];

      lines.length = 0;
      lines.push(...beforeLines, ...newComment, ...afterLines);

      console.log(`  ✓ ${blockStart + 1}-${blockEnd + 1}줄: [1_공통 - STATE] 블록 → 표준 형식`);
      changeCount++;
      break;
    }
  }
}

// 2. Line 357: "// 3. 근태/달력 관련" 주석 정리
console.log('🔧 [2/4] 근태/달력 관련 주석 정리...');
for (let i = 118; i < 1968 && i < lines.length; i++) {
  if (lines[i].trim() === '// 3. 근태/달력 관련') {
    lines[i] = '';
    console.log(`  ✓ ${i + 1}줄: 불필요한 번호 주석 제거`);
    changeCount++;
    break;
  }
}

// 3. Line 615-621: 잘못 위치한 FUNCTIONS 주석 블록 제거
console.log('🔧 [3/4] 잘못 위치한 FUNCTIONS 주석 블록 제거...');
for (let i = 118; i < 1968 && i < lines.length; i++) {
  if (lines[i].includes('const [showSuggestionApplyPopup, setShowSuggestionApplyPopup] =')) {
    // 다음 몇 줄을 확인하여 잘못된 주석 블록 찾기
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      if (lines[j].includes('// [2_공통 - FUNCTIONS] (1500-3000줄)')) {
        // 이 블록의 시작과 끝 찾기
        const blockStart = j - 1; // ========== 시작
        let blockEnd = j;

        // 블록 끝 찾기 (└─까지)
        for (let k = j + 1; k < Math.min(j + 10, lines.length); k++) {
          if (lines[k].includes('└─')) {
            blockEnd = k;
            break;
          }
        }

        // 블록 제거
        for (let k = blockStart; k <= blockEnd; k++) {
          lines[k] = '';
        }

        console.log(`  ✓ ${blockStart + 1}-${blockEnd + 1}줄: 잘못된 위치의 FUNCTIONS 주석 블록 제거`);
        changeCount++;
        break;
      }
    }
    break;
  }
}

// 4. Line 740: "BEGIN ADMIN - 관리자 전용 상태" 주석 정리
console.log('🔧 [4/4] BEGIN ADMIN 주석 정리...');
for (let i = 118; i < 1968 && i < lines.length; i++) {
  if (lines[i].trim() === '// BEGIN ADMIN - 관리자 전용 상태') {
    lines[i] = '  //---2.0_관리자 모드_공통사항 (STATE)---//';
    console.log(`  ✓ ${i + 1}줄: BEGIN ADMIN → 표준 형식`);
    changeCount++;
    break;
  }
}

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
console.log('  - 대상 범위: 119~1968줄');
console.log('  - 변경 사항: ' + changeCount + '개');
console.log('  - 원본 라인: ' + lines.length);
console.log('  - 정리 후: ' + cleanedLines.length);
console.log('  - 제거된 빈 줄: ' + (lines.length - cleanedLines.length));
console.log('\n✅ 주석 정리 완료!');
console.log('📝 주요 변경사항:');
console.log('  1. [1_공통 - STATE] 블록 → 표준 형식');
console.log('  2. 근태/달력 관련 번호 주석 제거');
console.log('  3. 잘못 위치한 FUNCTIONS 주석 블록 제거');
console.log('  4. BEGIN ADMIN → 표준 형식');
console.log('\n백업 위치: ' + backupPath);
