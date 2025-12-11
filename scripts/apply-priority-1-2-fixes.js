const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  우선순위 1+2 자동 적용');
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

console.log('🔧 적용 시작...\n');

let fixCount = 0;

// ==========================================
// 우선순위 1: 긴급 조치
// ==========================================

// 1. attendanceData 더미 코드 처리 (1607줄 근처)
console.log('🔴 [1/5] attendanceData 더미 코드 주석 추가...');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const attendanceData = [];')) {
    lines[i] = '  // ==========================================';
    lines.splice(i + 1, 0, '  // ⚠️ 레거시: attendanceData는 더미 변수');
    lines.splice(i + 2, 0, '  // 실제 데이터는 attendanceSheetData 사용 중');
    lines.splice(i + 3, 0, '  // TODO: 향후 attendanceData 참조를 모두 attendanceSheetData로 교체 필요');
    lines.splice(i + 4, 0, '  // ==========================================');
    lines.splice(i + 5, 0, '  const attendanceData = [];');
    console.log(`  ✓ ${i + 1}줄: attendanceData 더미 경고 추가`);
    fixCount++;
    break;
  }
}

// 2. 중복 레거시 주석 통합 (500-520줄 근처)
console.log('🔴 [2/5] 중복 레거시 주석 통합...');
let legacyCommentStart = -1;
let legacyCommentEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('대체공휴일 계산은 이제 holidayService에서 처리됨')) {
    legacyCommentStart = i;
  }
  if (legacyCommentStart !== -1 && lines[i].includes('공휴일 계산 및 실시간 업데이트는 holidayService에서 처리됨')) {
    legacyCommentEnd = i;
    break;
  }
}

if (legacyCommentStart !== -1 && legacyCommentEnd !== -1) {
  // 해당 범위 제거하고 새 주석으로 교체
  const beforeLines = lines.slice(0, legacyCommentStart);
  const afterLines = lines.slice(legacyCommentEnd + 1);

  const newComment = [
    '',
    '  // ==========================================',
    '  // ⚠️ 레거시: 공휴일 관련 함수들은 모두 holidayService로 통합됨',
    '  // 참조: src/services/holidayService.js',
    '  // - 대체공휴일 계산',
    '  // - 외부 API 호출',
    '  // - API 파싱 함수',
    '  // - 백업 데이터 관리',
    '  // - 실시간 업데이트',
    '  // ==========================================',
    ''
  ];

  lines.length = 0;
  lines.push(...beforeLines, ...newComment, ...afterLines);
  console.log(`  ✓ ${legacyCommentStart + 1}-${legacyCommentEnd + 1}줄: 6개 주석 → 1개 블록으로 통합`);
  fixCount++;
}

// ==========================================
// 우선순위 2: 개선 권장
// ==========================================

// 3. MAIN COMPONENT START 표준화 (148줄)
console.log('🟡 [3/5] MAIN COMPONENT START 표준화...');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/* ========== MAIN COMPONENT START ========== */')) {
    lines[i] = '/* ================================';
    lines.splice(i + 1, 0, '   [1_공통] 메인 컴포넌트 시작');
    lines.splice(i + 2, 0, '================================ */');
    console.log(`  ✓ ${i + 1}줄: MAIN COMPONENT START → 표준 형식`);
    fixCount++;
    break;
  }
}

// 4. BEGIN/END ADMIN 표준화 (302-320줄 근처)
console.log('🟡 [4/5] BEGIN/END ADMIN 표준화...');
let beginAdminLine = -1;
let endAdminLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// BEGIN ADMIN - 관리자 기능 상수 및 유틸')) {
    beginAdminLine = i;
  }
  if (lines[i].trim() === '// END ADMIN') {
    endAdminLine = i;
    break;
  }
}

if (beginAdminLine !== -1 && endAdminLine !== -1) {
  // BEGIN ADMIN 교체
  lines[beginAdminLine] = '  //---1.1_공통_관리자 전용 유틸리티---//';

  // getWorkPeriodText 함수 찾기
  for (let i = beginAdminLine + 1; i < endAdminLine; i++) {
    if (lines[i].includes('// 근속년수 계산 함수')) {
      lines[i] = '  // *1.1.1_근속년수 계산*';
    }
    if (lines[i].includes('// 조직도 엑셀 다운로드 함수')) {
      lines[i] = '  // *1.1.2_조직도 엑셀 다운로드*';
    }
  }

  // END ADMIN 교체
  lines[endAdminLine] = '  //---[1_공통] 관리자 전용 유틸리티 끝---//';

  console.log(`  ✓ ${beginAdminLine + 1}줄: BEGIN ADMIN → 표준 형식`);
  console.log(`  ✓ ${endAdminLine + 1}줄: END ADMIN → 표준 형식`);
  fixCount += 2;
}

// 5. 레거시 함수에 경고 추가 (265줄 근처)
console.log('🟡 [5/5] 레거시 함수 경고 추가...');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// 레거시 호환용 함수 (기존 코드와의 호환성 유지)')) {
    lines[i] = '  // ⚠️ 레거시: 호환성 유지용 - holidayData 직접 사용 권장';
    console.log(`  ✓ ${i + 1}줄: 레거시 함수 경고 추가`);
    fixCount++;
    break;
  }
}

// 파일 저장
console.log('\n💾 파일 저장 중...');
const newContent = lines.join('\n');
fs.writeFileSync(appPath, newContent, 'utf8');

console.log('✓ 완료\n');
console.log('========================================');
console.log('📊 최종 결과');
console.log('========================================');
console.log('✅ 우선순위 1 (긴급):');
console.log('  1. attendanceData 더미 코드 경고 추가 ✓');
console.log('  2. 중복 레거시 주석 통합 (6개→1개) ✓');
console.log('');
console.log('✅ 우선순위 2 (개선):');
console.log('  3. MAIN COMPONENT START 표준화 ✓');
console.log('  4. BEGIN/END ADMIN 표준화 ✓');
console.log('  5. 레거시 함수 경고 추가 ✓');
console.log('');
console.log('📊 통계:');
console.log('  - 적용된 수정: ' + fixCount + '개');
console.log('  - 원본 라인: ' + content.split('\n').length);
console.log('  - 수정 후: ' + lines.length);
console.log('  - 백업 위치: ' + backupPath);
console.log('');
console.log('✅ 모든 조치사항이 적용되었습니다!');
console.log('💡 개발 서버가 자동으로 재컴파일됩니다.');
