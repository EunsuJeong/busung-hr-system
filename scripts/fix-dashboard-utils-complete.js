const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/utils/utils_admin_dashboard.js');
const backupPath = path.join(__dirname, '../src/utils/@@old/251105_utils_reorganize/dashboardUtils.js');

console.log('🔧 utils_admin_dashboard.js 완전 복구 중...\n');

// Read backup file
let content = fs.readFileSync(backupPath, 'utf-8');

// 한글 패턴 교체 (순서 중요!)
const replacements = [
  // 헤더 주석
  [/\/\*\*\s*\*\s*���\s*\(\s*���\s*h�\s*\*\//g, "/**\n * [2_관리자 모드] 2.1_대시보드 유틸리티\n * - 출근 상태별 직원 조회\n * - 출근 직원 목록 정렬\n * - 통계 계산 함수들\n */"],

  // 섹션 헤더
  [/\/\/ \[2_\s*��\s*��\] 2\.1_\s*���\s*-\s*��\s*���\s*��\s*�\]\s*p�/g, "// [2_관리자 모드] 2.1_대시보드 - 출근 상태별 직원 조회"],
  [/\/\/ \[2_\s*��\s*��\] 2\.1_\s*���\s*-\s*���\s*��\s*��\s*�\]\s*h�/g, "// [2_관리자 모드] 2.1_대시보드 - 정렬된 출근 직원 목록 반환"],
  [/\/\/ \[2_\s*��\s*��\] 2\.1_\s*���\s*-\s*��\s*���\s*��/g, "// [2_관리자 모드] 2.1_대시보드 - 월별 출근율 계산"],
  [/\/\/ \[2_\s*��\s*��\] 2\.1_\s*���\s*-\s*��\s*�\u0001��/g, "// [2_관리자 모드] 2.1_대시보드 - 월별 지각율 계산"],
  [/\/\/ \[2_\s*��\s*��\] 2\.1_\s*���\s*-\s*��\s*����/g, "// [2_관리자 모드] 2.1_대시보드 - 월별 결근율 계산"],
  [/\/\/ \[2_\s*��\s*��\] 2\.1_\s*���\s*-\s*��\s*�\u0004�/g, "// [2_관리자 모드] 2.1_대시보드 - 월별 이직률 계산"],
  [/\/\/ \[2_\s*��\s*��\] 2\.1_\s*���\s*-\s*�\u0011�\s*�4������/g, "// [2_관리자 모드] 2.1_대시보드 - 평균 초과근무시간 계산"],
  [/\/\/ \[2_\s*��\s*��\] 2\.1_\s*���\s*-\s*��\s*4������/g, "// [2_관리자 모드] 2.1_대시보드 - 연차 사용률 계산"],
  [/\/\/ \[2_\s*��\s*��\] 2\.1_\s*���\s*-\s*�\s*52���\s*\u0004�H��/g, "// [2_관리자 모드] 2.1_대시보드 - 주 52시간 위반율 계산"],
  [/\/\/ \[2_\s*��\s*��\] 2\.1_\s*���\s*-\s*�\u00114�t\s*���\s*��/g, "// [2_관리자 모드] 2.1_대시보드 - 스트레스 지수 계산"],

  // JSDoc 주석 내용
  [/\*\s*��\s*���\s*��\s*�\]D\s*p�i��/g, "* 출근 상태별 직원 목록 조회"],
  [/\*\s*��\s*��\s*�\]D\s*���\��\s*h�/g, "* 출근 직원 목록을 정렬하여 반환"],
  [/\* @param \{Object\} params - ��\s*�/g, "* @param {Object} params - 매개변수"],
  [/\* @param \{Array\} params\.employees - ��\s*�\]/g, "* @param {Array} params.employees - 직원 목록"],
  [/\* @param \{string\} params\.status - p�`\s*��/g, "* @param {string} params.status - 조회할 상태"],
  [/\* @param \{boolean\} params\.isNightShift - \|\s*�4\s*�/g, "* @param {boolean} params.isNightShift - 야간 근무 여부"],
  [/\* @param \{string\} params\.dashboardDateFilter - ��\s*D0/g, "* @param {string} params.dashboardDateFilter - 날짜 필터"],
  [/\* @param \{string\} params\.dashboardSelectedDate -\s*�\s*��/g, "* @param {string} params.dashboardSelectedDate - 선택된 날짜"],
  [/\* @param \{Function\} params\.getAttendanceForEmployee - ��\s*pt0\s*p�\s*h/g, "* @param {Function} params.getAttendanceForEmployee - 출근 데이터 조회 함수"],
  [/\* @param \{Function\} params\.analyzeAttendanceStatusForDashboard - ��\s*��\s*�\s*h/g, "* @param {Function} params.analyzeAttendanceStatusForDashboard - 출근 상태 분석 함수"],
  [/\* @param \{Function\} params\.devLog -\s*\\�\s*h/g, "* @param {Function} params.devLog - 개발 로그 함수"],
  [/\* @returns \{Array\} D0�\s*��\s*�\]/g, "* @returns {Array} 필터링된 직원 목록"],

  // 문자열 리터럴 (정확한 바이트 패턴 사용)
  [/'\\|\\u0004'/g, "'야간'"],
  [/'�'/g, "'주간'"],
  [/'��'/g, "'출근'"],
  [/'�4\\u0011'/g, "'근무중'"],
  [/'�\\u0001'/g, "'지각'"],
  [/'�\\('/g, "'조퇴'"],
  [/'4�'/g, "'퇴사'"],
  [/'��'/g, "'결근'"],
  [/'미출근'/g, "'미출근'"],

  // 로그 메시지
  [/��\s*��\s*��\s*��\s*-\s*���:/g, "직원 목록 조회 - 날짜:"],
];

console.log('📝 패턴 교체 중...');
let changedCount = 0;

replacements.forEach(([pattern, replacement], index) => {
  const before = content;
  content = content.replace(pattern, replacement);
  if (before !== content) {
    changedCount++;
    console.log(`  ✓ 패턴 ${index + 1} 교체 완료`);
  }
});

console.log(`\n✅ 총 ${changedCount}개 패턴 교체 완료`);

// Write to destination
fs.writeFileSync(filePath, content, 'utf-8');

console.log('\n✅ 파일 저장 완료!');
console.log(`📁 경로: ${filePath}`);
