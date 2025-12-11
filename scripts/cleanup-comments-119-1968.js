const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  App.js 119~1968줄 주석 정리');
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

// 라인별 처리
for (let i = 118; i < 1968 && i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;

  // 1. "MAIN COMPONENT START" 주석 표준화
  if (line.includes('/* ========== MAIN COMPONENT START ========== */')) {
    lines[i] = '/* ================================\n   [1_공통] 메인 컴포넌트 시작\n================================ */';
    console.log(`✓ ${lineNum}줄: MAIN COMPONENT START → 표준 형식`);
    changeCount++;
  }

  // 2. "BEGIN ADMIN" / "END ADMIN" 주석 개선
  if (line.trim() === '// BEGIN ADMIN - 관리자 기능 상수 및 유틸') {
    lines[i] = '  // ==========================================';
    lines.splice(i + 1, 0, '  // [1_공통] 관리자 전용 유틸리티 함수');
    lines.splice(i + 2, 0, '  // ==========================================');
    console.log(`✓ ${lineNum}줄: BEGIN ADMIN → 표준 주석`);
    changeCount++;
  }

  if (line.trim() === '// END ADMIN') {
    lines[i] = '  // ==========================================';
    lines.splice(i + 1, 0, '  // [1_공통] 관리자 전용 유틸리티 함수 끝');
    lines.splice(i + 2, 0, '  // ==========================================');
    console.log(`✓ ${lineNum}줄: END ADMIN → 표준 주석`);
    changeCount++;
  }

  // 3. 오래된 형식의 주석 개선 (예: "// 2. 직원/로그인 관련")
  if (line.match(/^  \/\/ \d+\. /)) {
    const content = line.replace(/^  \/\/ \d+\. /, '').trim();
    if (content.includes('직원') || content.includes('로그인')) {
      lines[i] = `  // [1_공통] ${content}`;
      console.log(`✓ ${lineNum}줄: 번호 형식 주석 → 표준 형식`);
      changeCount++;
    }
  }

  // 4. "레거시" 또는 "호환" 키워드가 있는 주석에 경고 추가
  if (line.includes('레거시') && !line.includes('⚠️')) {
    lines[i] = line.replace('레거시', '⚠️ 레거시');
    console.log(`✓ ${lineNum}줄: 레거시 주석에 경고 표시 추가`);
    changeCount++;
  }

  // 5. 빈 주석 블록 제거
  if (line.trim() === '// 대체공휴일 계산은 이제 holidayService에서 처리됨' ||
      line.trim() === '// 기존 복잡한 공휴일 함수들은 holidayService로 대체됨' ||
      line.trim() === '// 외부 API 호출도 holidayService에서 처리됨' ||
      line.trim() === '// API 파싱 함수들도 holidayService에서 처리됨' ||
      line.trim() === '// 백업 데이터도 holidayService에서 관리됨' ||
      line.trim() === '// 공휴일 계산 및 실시간 업데이트는 holidayService에서 처리됨') {
    // 이런 주석들은 하나로 통합
    if (i > 118 && !lines[i-1].includes('holidayService로 통합됨')) {
      lines[i] = '  // ==========================================';
      lines.splice(i + 1, 0, '  // ⚠️ 레거시: 공휴일 관련 함수들은 holidayService로 통합됨');
      lines.splice(i + 2, 0, '  // 참조: src/services/holidayService.js');
      lines.splice(i + 3, 0, '  // ==========================================');
      console.log(`✓ ${lineNum}줄: 레거시 주석 통합`);
      changeCount++;
      // 다음 5줄의 유사 주석 제거
      for (let j = i + 4; j < i + 9 && j < lines.length; j++) {
        if (lines[j].includes('holidayService에서')) {
          lines[j] = '';
        }
      }
    } else {
      lines[i] = '';
    }
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
console.log('📊 결과:');
console.log('  - 대상 범위: 119~1968줄');
console.log('  - 변경 사항: ' + changeCount + '개');
console.log('  - 원본 라인: ' + lines.length);
console.log('  - 정리 후: ' + cleanedLines.length);
console.log('  - 제거된 빈 줄: ' + (lines.length - cleanedLines.length));
console.log('\n✅ 주석 정리 완료!');
console.log('📝 주요 변경사항:');
console.log('  1. MAIN COMPONENT START → 표준 형식');
console.log('  2. BEGIN ADMIN / END ADMIN → 표준 주석');
console.log('  3. 레거시 주석에 경고 표시');
console.log('  4. 중복 레거시 주석 통합');
console.log('  5. 연속된 빈 줄 정리');
