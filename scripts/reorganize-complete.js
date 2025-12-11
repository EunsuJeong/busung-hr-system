const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('  App.js 완전 재구성 스크립트');
console.log('==========================================\n');

const appPath = path.join(__dirname, '../src/App.js');
const backupPath = path.join(__dirname, '../src/App.js.backup.' + Date.now());

// 백업 생성
console.log('💾 백업 생성 중...');
fs.copyFileSync(appPath, backupPath);
console.log('✓ 백업 완료: ' + backupPath + '\n');

// 원본 파일 읽기
const content = fs.readFileSync(appPath, 'utf8');
const lines = content.split('\n');
console.log('📄 총 라인 수: ' + lines.length + '줄\n');

// 새로운 파일 내용 생성
const sections = [];

// [1_프로그램 기본]
sections.push('// ==========================================');
sections.push('// [1_프로그램 기본] (1-130줄)');
sections.push('// ==========================================');
sections.push('// ├─ Imports');
sections.push('// └─ Chart.js 설정');
sections.push('');
sections.push(...lines.slice(0, 130));
sections.push('');

// [2_공통 - STATE]
sections.push('// ==========================================');
sections.push('// [2_공통 - STATE] (131-600줄)');
sections.push('// ==========================================');
sections.push('// ├─ 로그인 관련 state');
sections.push('// ├─ 언어 선택 state');
sections.push('// ├─ 휴일 데이터 state');
sections.push('// ├─ 알림 관련 state');
sections.push('// └─ AI 챗봇 state');
sections.push('');
sections.push(...lines.slice(130, 600));
sections.push('');

// [2_공통 - EFFECT]
sections.push('// ==========================================');
sections.push('// [2_공통 - EFFECT] (600-1500줄)');
sections.push('// ==========================================');
sections.push('// ├─ 초기화 effect');
sections.push('// ├─ 데이터 로딩 effect');
sections.push('// └─ 실시간 동기화 effect');
sections.push('');
sections.push(...lines.slice(600, 1500));
sections.push('');

// [2_공통 - FUNCTIONS]
sections.push('// ==========================================');
sections.push('// [2_공통 - FUNCTIONS] (1500-3000줄)');
sections.push('// ==========================================');
sections.push('// ├─ 인증 및 로그인 함수');
sections.push('// ├─ 언어 처리 함수');
sections.push('// ├─ 날짜/시간 유틸리티');
sections.push('// └─ 공통 헬퍼 함수');
sections.push('');
sections.push(...lines.slice(1500, 3000));
sections.push('');

// [3_관리자 모드 - STATE]
sections.push('// ==========================================');
sections.push('// [3_관리자 모드 - STATE] (3000-4500줄)');
sections.push('// ==========================================');
sections.push('// ├─ ① 대시보드 state');
sections.push('// ├─ ② 직원 관리 state');
sections.push('// ├─ ③ 공지 관리 state');
sections.push('// ├─ ④ 알림 관리 state');
sections.push('// ├─ ⑤ 일정 관리 state');
sections.push('// ├─ ⑥ 연차 관리 state');
sections.push('// ├─ ⑦ 건의 관리 state');
sections.push('// ├─ ⑧ 근태 관리 state');
sections.push('// ├─ ⑨ 급여 관리 state');
sections.push('// ├─ ⑩ 평가 관리 state');
sections.push('// ├─ ⑪ AI 챗봇 state');
sections.push('// └─ ⑫ 시스템 관리 state');
sections.push('');
sections.push(...lines.slice(3000, 4500));
sections.push('');

// [3_관리자 모드 - EFFECT]
sections.push('// ==========================================');
sections.push('// [3_관리자 모드 - EFFECT] (4500-5500줄)');
sections.push('// ==========================================');
sections.push('// ├─ 대시보드 데이터 동기화');
sections.push('// ├─ 실시간 업데이트');
sections.push('// └─ 자동 알림 발송');
sections.push('');
sections.push(...lines.slice(4500, 5500));
sections.push('');

// [3_관리자 모드 - FUNCTIONS]
sections.push('// ==========================================');
sections.push('// [3_관리자 모드 - FUNCTIONS] (5500-9000줄)');
sections.push('// ==========================================');
sections.push('// ├─ ① 대시보드 함수');
sections.push('// ├─ ② 직원 관리 함수');
sections.push('// ├─ ③ 공지 관리 함수');
sections.push('// ├─ ④ 알림 관리 함수');
sections.push('// ├─ ⑤ 일정 관리 함수');
sections.push('// ├─ ⑥ 연차 관리 함수');
sections.push('// ├─ ⑦ 건의 관리 함수');
sections.push('// ├─ ⑧ 근태 관리 함수');
sections.push('// ├─ ⑨ 급여 관리 함수');
sections.push('// ├─ ⑩ 평가 관리 함수');
sections.push('// ├─ ⑪ AI 챗봇 함수');
sections.push('// └─ ⑫ 시스템 관리 함수');
sections.push('');
sections.push(...lines.slice(5500, 9000));
sections.push('');

// [4_일반직원 모드 - STATE]
sections.push('// ==========================================');
sections.push('// [4_일반직원 모드 - STATE] (9000-9500줄)');
sections.push('// ==========================================');
sections.push('// ├─ ① 사원정보 state');
sections.push('// ├─ ② 공지사항 state');
sections.push('// ├─ ③ 알림사항 state');
sections.push('// ├─ ④ 회사일정 state');
sections.push('// ├─ ⑤ 연차신청 state');
sections.push('// ├─ ⑥ 급여조회 state');
sections.push('// ├─ ⑦ 건의사항 state');
sections.push('// └─ ⑧ 평가조회 state');
sections.push('');
sections.push(...lines.slice(9000, 9500));
sections.push('');

// [4_일반직원 모드 - FUNCTIONS]
sections.push('// ==========================================');
sections.push('// [4_일반직원 모드 - FUNCTIONS] (9500-13000줄)');
sections.push('// ==========================================');
sections.push('// ├─ ① 사원정보 함수');
sections.push('// ├─ ② 공지사항 함수');
sections.push('// ├─ ③ 알림사항 함수');
sections.push('// ├─ ④ 회사일정 함수');
sections.push('// ├─ ⑤ 연차신청 함수');
sections.push('// ├─ ⑥ 급여조회 함수');
sections.push('// ├─ ⑦ 건의사항 함수');
sections.push('// └─ ⑧ 평가조회 함수');
sections.push('');
sections.push(...lines.slice(9500, 13000));
sections.push('');

// [5_렌더링]
sections.push('// ==========================================');
sections.push('// [5_렌더링] (13000-끝)');
sections.push('// ==========================================');
sections.push('// ├─ renderContent 함수');
sections.push('// ├─ Main return 문');
sections.push('// └─ export default App');
sections.push('');
sections.push(...lines.slice(13000));

const newContent = sections.join('\n');

// 새 파일 저장
console.log('💾 새 파일 생성 중...');
fs.writeFileSync(appPath, newContent, 'utf8');

const newLines = newContent.split('\n');
console.log('✓ 새 파일 저장 완료\n');
console.log('📊 결과:');
console.log('  - 원본 라인 수: ' + lines.length + '줄');
console.log('  - 새 파일 라인 수: ' + newLines.length + '줄');
console.log('  - 추가된 주석: ' + (newLines.length - lines.length) + '줄');
console.log('\n✅ 재구성 완료!');
