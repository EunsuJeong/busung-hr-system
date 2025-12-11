const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// 1. calculateDashboardStats 앞에 주석 추가
const calcStatsStart = '  const calculateDashboardStats = () => {';
const calcStatsWithComment = `  // [2_관리자 모드] 2.1_대시보드 - 통계 계산
  const calculateDashboardStats = () => {`;

if (content.includes(calcStatsStart) && !content.includes('// [2_관리자 모드] 2.1_대시보드 - 통계 계산')) {
  content = content.replace(calcStatsStart, calcStatsWithComment);
  console.log('✅ calculateDashboardStats 주석 추가 완료');
} else {
  console.log('⏭️  calculateDashboardStats 주석이 이미 있거나 함수를 찾을 수 없습니다.');
}

// 2. dashboardStatsReal 주석 수정
const oldComment1 = '  // *2.1_대시보드 통계 데이터*';
const newComment1 = '  // [2_관리자 모드] 2.1_대시보드 - 통계 데이터 (useMemo)';

if (content.includes(oldComment1)) {
  content = content.replace(oldComment1, newComment1);
  console.log('✅ dashboardStatsReal 주석 수정 완료');
} else {
  console.log('⏭️  dashboardStatsReal 주석을 찾을 수 없습니다.');
}

// 3. handleAttendanceKeyDown 주석 수정
const oldComment2 = '  // *2.8_키보드 이벤트 처리*';
const newComment2 = '  // [2_관리자 모드] 2.8_근태 관리 - 키보드 이벤트 처리 (복사/붙여넣기)';

if (content.includes(oldComment2)) {
  content = content.replace(oldComment2, newComment2);
  console.log('✅ handleAttendanceKeyDown 주석 수정 완료');
} else {
  console.log('⏭️  handleAttendanceKeyDown 주석을 찾을 수 없습니다.');
}

fs.writeFileSync(path, content, 'utf8');
console.log('📄 App.js 저장 완료');
