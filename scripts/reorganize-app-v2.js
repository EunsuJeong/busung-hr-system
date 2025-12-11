/**
 * App.js 재정리 스크립트 V2 (정확한 라인 범위 기반)
 *
 * 사용법: node scripts/reorganize-app-v2.js
 */

const fs = require('fs');
const path = require('path');

const APP_PATH = path.join(__dirname, '../src/App.js');
const BACKUP_PATH = path.join(__dirname, '../src/@@OLD/251028_2055_재배치전_App.js');
const OUTPUT_PATH = path.join(__dirname, '../src/App_reorganized.js');

console.log('🚀 App.js 정확한 재정리 시작...\n');

// 1. 백업 생성
console.log('📦 백업 생성 중...');
const originalContent = fs.readFileSync(APP_PATH, 'utf8');
fs.writeFileSync(BACKUP_PATH, originalContent);
console.log(`✅ 백업 완료: ${BACKUP_PATH}\n`);

// 2. 파일을 줄 단위로 읽기
const lines = originalContent.split('\n');
console.log(`📄 총 라인 수: ${lines.length}\n`);

// 3. 정확한 라인 범위 정의
const ranges = {
  // [1_프로그램 기본]
  imports: { start: 0, end: 113 },  // 1-113줄 (0-based index)
  constants: { start: 113, end: 132 },  // 114-132줄

  // [2_공통]
  commonStateHoliday: { start: 132, end: 288 },  // 133-288줄 (언어/공휴일)
  commonStateLogin: { start: 288, end: 431 },  // 289-431줄 (로그인)

  // [3_관리자] - STATE
  adminStateSchedule: { start: 431, end: 552 },  // 432-552줄 (일정)
  adminStateLeave: { start: 552, end: 558 },  // 553-558줄 (연차)
  adminStateSuggestion: { start: 570, end: 577 },  // 571-577줄 (건의)
  adminStateEvaluation: { start: 583, end: 587 },  // 584-587줄 (평가)
  adminStateNotification: { start: 612, end: 715 },  // 613-715줄 (알림)
  adminStateAttendance: { start: 1479, end: 1499 },  // 1480-1499줄 (근태)
  adminStateNotice: { start: 1499, end: 1510 },  // 1500-1510줄 (공지)
  adminStateEmployee: { start: 1510, end: 1536 },  // 1511-1536줄 (직원)
  adminStatePayroll: { start: 1536, end: 1839 },  // 1537-1839줄 (급여)
  adminStateSystem: { start: 1843, end: 2176 },  // 1844-2176줄 (시스템/AI)
  adminStateDashboard: { start: 2176, end: 3188 },  // 2177-3188줄 (대시보드)

  // [4_일반직원] - STATE
  staffStateLeave: { start: 558, end: 570 },  // 559-570줄 (연차)
  staffStateSuggestion: { start: 577, end: 583 },  // 578-583줄 (건의)
  staffStateEvaluation: { start: 587, end: 612 },  // 588-612줄 (평가)
  staffStateSalary: { start: 1839, end: 1843 },  // 1840-1843줄 (급여)
  staffStateNotice: { start: 3188, end: 3196 },  // 3189-3196줄 (공지)
  staffStateNotification: { start: 3196, end: 3210 },  // 3197-3210줄 (알림)
  staffStateSchedule: { start: 3210, end: 3214 },  // 3211-3214줄 (일정)
  commonStateLanguage: { start: 3214, end: 13060 },  // 3215-13060줄 (언어/함수들)

  // [5_렌더링]
  rendering: { start: 13060, end: lines.length }  // 13061줄~끝
};

// 4. 라인 추출 함수
function extractLines(start, end) {
  return lines.slice(start, end);
}

console.log('📦 섹션별 추출 중...\n');

// 5. 재배치된 파일 생성
const newFile = [];

// [1_프로그램 기본]
newFile.push('// ==========================================');
newFile.push('// 🧩 부성스틸 인사관리시스템 - App.js (재정리됨)');
newFile.push('// ==========================================');
newFile.push('// 재정리 날짜: 2025-10-29');
newFile.push('// ==========================================');
newFile.push('');
newFile.push('// ==========================================');
newFile.push('// [1_프로그램 기본]');
newFile.push('// ==========================================');
newFile.push(...extractLines(ranges.imports.start, ranges.imports.end));
newFile.push(...extractLines(ranges.constants.start, ranges.constants.end));
newFile.push('');

// [2_공통 - STATE]
newFile.push('// ==========================================');
newFile.push('// [2_공통 - STATE]');
newFile.push('// ==========================================');
newFile.push(...extractLines(ranges.commonStateHoliday.start, ranges.commonStateHoliday.end));
newFile.push(...extractLines(ranges.commonStateLogin.start, ranges.commonStateLogin.end));
newFile.push('');

// [3_관리자 모드 - STATE]
newFile.push('// ==========================================');
newFile.push('// [3_관리자 모드 - STATE]');
newFile.push('// ==========================================');
newFile.push('');
newFile.push('  // ① 대시보드');
newFile.push(...extractLines(ranges.adminStateDashboard.start, ranges.adminStateDashboard.end));
newFile.push('');
newFile.push('  // ② 직원 관리');
newFile.push(...extractLines(ranges.adminStateEmployee.start, ranges.adminStateEmployee.end));
newFile.push('');
newFile.push('  // ③ 공지 관리');
newFile.push(...extractLines(ranges.adminStateNotice.start, ranges.adminStateNotice.end));
newFile.push('');
newFile.push('  // ④ 알림 관리');
newFile.push(...extractLines(ranges.adminStateNotification.start, ranges.adminStateNotification.end));
newFile.push('');
newFile.push('  // ⑤ 일정 관리');
newFile.push(...extractLines(ranges.adminStateSchedule.start, ranges.adminStateSchedule.end));
newFile.push('');
newFile.push('  // ⑥ 연차 관리');
newFile.push(...extractLines(ranges.adminStateLeave.start, ranges.adminStateLeave.end));
newFile.push('');
newFile.push('  // ⑦ 건의 관리');
newFile.push(...extractLines(ranges.adminStateSuggestion.start, ranges.adminStateSuggestion.end));
newFile.push('');
newFile.push('  // ⑧ 근태 관리');
newFile.push(...extractLines(ranges.adminStateAttendance.start, ranges.adminStateAttendance.end));
newFile.push('');
newFile.push('  // ⑨ 급여 관리');
newFile.push(...extractLines(ranges.adminStatePayroll.start, ranges.adminStatePayroll.end));
newFile.push('');
newFile.push('  // ⑩ 평가 관리');
newFile.push(...extractLines(ranges.adminStateEvaluation.start, ranges.adminStateEvaluation.end));
newFile.push('');
newFile.push('  // ⑫ 시스템 관리');
newFile.push(...extractLines(ranges.adminStateSystem.start, ranges.adminStateSystem.end));
newFile.push('');

// [4_일반직원 모드 - STATE]
newFile.push('// ==========================================');
newFile.push('// [4_일반직원 모드 - STATE]');
newFile.push('// ==========================================');
newFile.push('');
newFile.push('  // ② 공지사항');
newFile.push(...extractLines(ranges.staffStateNotice.start, ranges.staffStateNotice.end));
newFile.push('');
newFile.push('  // ③ 알림사항');
newFile.push(...extractLines(ranges.staffStateNotification.start, ranges.staffStateNotification.end));
newFile.push('');
newFile.push('  // ④ 일정/근태');
newFile.push(...extractLines(ranges.staffStateSchedule.start, ranges.staffStateSchedule.end));
newFile.push('');
newFile.push('  // ⑤ 연차');
newFile.push(...extractLines(ranges.staffStateLeave.start, ranges.staffStateLeave.end));
newFile.push('');
newFile.push('  // ⑥ 급여');
newFile.push(...extractLines(ranges.staffStateSalary.start, ranges.staffStateSalary.end));
newFile.push('');
newFile.push('  // ⑦ 건의');
newFile.push(...extractLines(ranges.staffStateSuggestion.start, ranges.staffStateSuggestion.end));
newFile.push('');
newFile.push('  // ⑧ 평가');
newFile.push(...extractLines(ranges.staffStateEvaluation.start, ranges.staffStateEvaluation.end));
newFile.push('');

// [공통 - EFFECT & FUNCTIONS] (3215-13060줄)
newFile.push('// ==========================================');
newFile.push('// [2_공통 - EFFECT & FUNCTIONS]');
newFile.push('// ==========================================');
newFile.push(...extractLines(ranges.commonStateLanguage.start, ranges.commonStateLanguage.end));
newFile.push('');

// [5_렌더링]
newFile.push('// ==========================================');
newFile.push('// [5_렌더링]');
newFile.push('// ==========================================');
newFile.push(...extractLines(ranges.rendering.start, ranges.rendering.end));

// 6. 파일 저장
fs.writeFileSync(OUTPUT_PATH, newFile.join('\n'));

console.log('\n✅ 재정리 완료!');
console.log(`📁 출력 파일: ${OUTPUT_PATH}`);
console.log(`\n📊 통계:`);
console.log(`  원본: ${lines.length}줄`);
console.log(`  재정리: ${newFile.length}줄`);
console.log(`\n⚠️  컴파일 테스트가 필요합니다!`);
