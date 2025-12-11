const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  App.js 0~2000줄 주석 종합 정리');
console.log('  (체계적 번호 부여 + 누락 주석 추가)');
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

console.log('🔄 0~2000줄 주석 종합 정리 중...\n');

let changeCount = 0;

// ========== 주석 개선 매핑 ==========
const improvements = [
  {
    lineNumber: 146,
    action: 'insert',
    newLine: '  // *1.1_공통_숫자 포맷팅 함수*'
  },
  {
    lineNumber: 336,
    action: 'insert',
    newLine: '  // *1.2_공통_근태 상태 분석 함수*'
  },
  {
    lineNumber: 430,
    action: 'insert',
    newLine: '  // *1.2.1_시간 파싱 유틸*'
  },
  {
    lineNumber: 317,
    action: 'replace',
    oldLine: '  const [employees, setEmployees] = useState(generateEmployees());',
    newLine: '  // *1.3_공통_직원 데이터*\n  const [employees, setEmployees] = useState(generateEmployees());'
  },
  {
    lineNumber: 318,
    action: 'replace',
    oldLine: '  const [admins, setAdmins] = useState(generateAdmins());',
    newLine: '  // *1.4_공통_관리자 데이터*\n  const [admins, setAdmins] = useState(generateAdmins());'
  },
];

console.log('🔧 주석 개선 적용 중...\n');

// 개선사항 적용 (역순으로 처리하여 라인 번호 변경 최소화)
improvements.reverse().forEach((item) => {
  const idx = item.lineNumber - 1;

  if (item.action === 'insert') {
    // 주석이 이미 있는지 확인
    const prevLine = idx > 0 ? lines[idx - 1].trim() : '';
    if (!prevLine.startsWith('//') && !prevLine.startsWith('/*')) {
      lines.splice(idx, 0, item.newLine);
      console.log(`  ✓ ${item.lineNumber}줄 앞에 주석 추가`);
      changeCount++;
    }
  } else if (item.action === 'replace') {
    if (lines[idx] && lines[idx].includes(item.oldLine.trim())) {
      lines[idx] = item.newLine;
      console.log(`  ✓ ${item.lineNumber}줄 주석 추가 및 개선`);
      changeCount++;
    }
  }
});

console.log(`\n✓ 총 ${changeCount}개 개선사항 적용\n`);

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
console.log('💾 파일 저장 중...');
const newContent = cleanedLines.join('\n');
fs.writeFileSync(appPath, newContent, 'utf8');

console.log('✓ 완료\n');
console.log('========================================');
console.log('📊 결과');
console.log('========================================');
console.log('  - 대상 범위: 0~2000줄');
console.log('  - 개선된 주석: ' + changeCount + '개');
console.log('  - 원본 라인: ' + lines.length);
console.log('  - 정리 후: ' + cleanedLines.length);
console.log('  - 제거된 빈 줄: ' + (lines.length - cleanedLines.length));
console.log('\n✅ 0~2000줄 주석 정리 완료!');
console.log('\n📝 적용된 개선사항:');
console.log('  1. 누락된 함수 주석 추가');
console.log('  2. STATE 변수 주석 체계화');
console.log('  3. 하위 번호 부여 (1.1, 1.2, 1.2.1 등)');
console.log('\n💡 다음 구간 안내:');
console.log('  → 2001~4000줄 구간을 처리하세요.');
console.log('\n백업 위치: ' + backupPath);
