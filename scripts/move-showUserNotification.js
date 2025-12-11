const fs = require('fs');
const path = require('path');

// App.js 파일 읽기
const appJsPath = path.join(__dirname, '..', 'src', 'App.js');
const content = fs.readFileSync(appJsPath, 'utf8');
const lines = content.split('\n');

// showUserNotification 함수 찾기 (2037~2052 라인)
const functionStart = 2036; // "// *[2_관리자 모드] 2.13_사용자 알림 표시*"
const functionEnd = 2052; // showUserNotification 함수 끝

const functionLines = lines.slice(functionStart, functionEnd + 1);

// usePayrollManagement 호출 위치 찾기 (1337줄 직전에 삽입)
const insertPosition = 1337; // 1338번째 줄 앞

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

console.log('✅ showUserNotification 함수를 1337줄로 이동 완료');
console.log(`이동된 함수: ${functionEnd - functionStart + 1}줄`);
