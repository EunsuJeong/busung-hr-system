const fs = require('fs');
const path = require('path');

// App.js 파일 읽기
const appJsPath = path.join(__dirname, '..', 'src', 'App.js');
const content = fs.readFileSync(appJsPath, 'utf8');
const lines = content.split('\n');

// wrapper 함수들과 send자동알림 함수 찾기 (1860~1918 라인)
const functionStart = 1860; // wrapper 함수들 시작
const functionEnd = 1918; // send자동알림 함수 끝

const functionLines = lines.slice(functionStart, functionEnd + 1);

// showUserNotification 함수 뒤에 삽입 (1354줄)
const insertPosition = 1354; // showUserNotification 함수 뒤

// 새로운 배열 생성
const newLines = [
  ...lines.slice(0, insertPosition),
  '', // 빈 줄 추가
  ...functionLines,
  '', // 빈 줄 추가
  ...lines.slice(insertPosition, functionStart),
  ...lines.slice(functionEnd + 1)
];

// 파일 저장
fs.writeFileSync(appJsPath, newLines.join('\n'), 'utf8');

console.log('✅ Wrapper 함수들과 send자동알림 함수를 1354줄로 이동 완료');
console.log(`이동된 함수: ${functionEnd - functionStart + 1}줄`);
console.log('이동된 함수 목록:');
console.log('  - get관리자알림목록Wrapper');
console.log('  - get통합알림리스트Wrapper');
console.log('  - calculateRecipientCountWrapper');
console.log('  - getFilteredNotificationLogsWrapper');
console.log('  - getFilteredScheduleEventsWrapper');
console.log('  - get연차갱신알림수신자Wrapper');
console.log('  - get연차알림대상자Wrapper');
console.log('  - get건의사항알림대상자Wrapper');
console.log('  - get부서관리자및대표이사Wrapper');
console.log('  - send자동알림');
