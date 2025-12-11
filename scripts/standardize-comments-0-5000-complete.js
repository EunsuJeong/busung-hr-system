const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  App.js 0~5000줄 주석 완전 정리');
console.log('  (주석 규칙 준수 + 자동 생성)');
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

console.log('🔄 0~5000줄 주석 처리 중...\n');

const END_LINE = Math.min(5000, lines.length);
let changeCount = 0;
let removeCount = 0;
let addCount = 0;

// ========== 제거할 inline 주석 패턴들 ==========
const removeInlineComments = [
  { line: 105, pattern: 'Chart.js imports removed' },
  { line: 204, pattern: '기본 공휴일 반환' },
  { line: 258, pattern: '컴포넌트 언마운트 시' },
  { line: 291, pattern: 'setHolidayLastUpdated' },
  { line: 341, pattern: '새로고침 시 localStorage' },
  { line: 407, pattern: '출근만 있고 퇴근이 없는 경우' },
  { line: 412, pattern: '출퇴근 시간이 모두 있는 경우 분석' },
  { line: 427, pattern: '야간 근무자와 주간 근무자 구분' },
  { line: 430, pattern: '17:00~19:00' },
  { line: 435, pattern: '야간 근무자:' },
  { line: 439, pattern: '주간 근무자:' },
  { line: 510, pattern: '1. 커스텀 공휴일 확인' },
  { line: 515, pattern: '2. 실시간 로드된' },
  { line: 521, pattern: 'YYYY-MM-DD 형식과' },
  { line: 527, pattern: '연도 데이터가 없으면' },
  { line: 591, pattern: "'employee-leave' 또는 'leave-history'" },
  { line: 656, pattern: '알림 로그 더보기 상태' },
  { line: 728, pattern: "'regular' 또는 'realtime'" },
  { line: 732, pattern: '새로고침 시 localStorage에서' },
  { line: 752, pattern: 'ref가 없으면' },
  { line: 759, pattern: '각 메뉴에서 다른 메뉴로' },
  { line: 830, pattern: '알림 로그 검색 필터' },
  { line: 858, pattern: '정기 알림 클린업' },
  { line: 859, pattern: '1. 5일 경과한' },
  { line: 860, pattern: '2. 종료일이 지난' },
  { line: 863, pattern: '5일 경과 체크' },
  { line: 866, pattern: '정기 알림의 경우' },
  { line: 870, pattern: '종료일이 지났으면' },
  { line: 878, pattern: '실시간 알림 클린업' },
  { line: 888, pattern: '종료 다음날' },
  { line: 889, pattern: '00:00 기준' },
];

// ========== 제거할 블록 주석들 ==========
const removeBlockComments = [
  { start: 217, end: 246, description: '단계별 주석 (1-4단계)' },
  { start: 250, end: 252, description: '실패 시 기본 연도만 로드' },
  { start: 327, end: 332, description: 'generateAdmins 함수 설명 블록' },
  { start: 578, end: 586, description: '레거시 공휴일 관련 함수 블록' },
];

console.log('🔧 [1/3] inline 주석 제거...');
for (const item of removeInlineComments) {
  const lineIndex = item.line - 1;
  if (lineIndex < END_LINE && lineIndex < lines.length) {
    const line = lines[lineIndex];
    if (line.includes(item.pattern) && line.trim().startsWith('//')) {
      lines[lineIndex] = '';
      removeCount++;
    }
  }
}
console.log(`  ✓ ${removeCount}개 inline 주석 제거`);

console.log('\n🔧 [2/3] 블록 주석 제거...');
for (const block of removeBlockComments) {
  for (let i = block.start - 1; i < block.end && i < END_LINE && i < lines.length; i++) {
    if (lines[i].trim().startsWith('//')) {
      lines[i] = '';
      removeCount++;
    }
  }
  console.log(`  ✓ ${block.start}-${block.end}줄: ${block.description} 제거`);
}

console.log('\n🔧 [3/3] 주석 없는 중요 구간 확인 및 추가...');
// 주석이 없는 중요 함수/변수에 주석 추가
const addComments = [
  { line: 359, comment: '// *1_공통_근태 상태 분석*', before: 'const analyzeAttendanceStatus' },
  { line: 459, comment: '// *1_공통_시간 파싱*', before: 'const parseTime' },
  { line: 855, comment: '// *1_공통_알림 만료 정리*', before: 'const cleanupExpiredNotifications' },
];

for (const item of addComments) {
  const lineIndex = item.line - 1;
  if (lineIndex < END_LINE && lineIndex < lines.length) {
    const line = lines[lineIndex];
    if (line.includes(item.before)) {
      // 이전 줄에 주석이 없으면 추가
      if (lineIndex > 0 && !lines[lineIndex - 1].trim().startsWith('//')) {
        lines.splice(lineIndex, 0, item.comment);
        addCount++;
        console.log(`  ✓ ${item.line}줄: 주석 추가 - "${item.comment}"`);
      }
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
console.log('========================================');
console.log('📊 결과');
console.log('========================================');
console.log('  - 대상 범위: 0~5000줄');
console.log('  - 제거된 주석: ' + removeCount + '개');
console.log('  - 추가된 주석: ' + addCount + '개');
console.log('  - 원본 라인: ' + lines.length);
console.log('  - 정리 후: ' + cleanedLines.length);
console.log('  - 제거된 빈 줄: ' + (lines.length - cleanedLines.length));
console.log('\n✅ 주석 정리 완료!');
console.log('\n백업 위치: ' + backupPath);
