const fs = require('fs');
const path = require('path');

// App.js 파일 읽기
const appJsPath = path.join(__dirname, '..', 'src', 'App.js');
const content = fs.readFileSync(appJsPath, 'utf8');
const lines = content.split('\n');

// send자동알림 함수 찾기 (1904~1918 라인)
const functionStart = 1904; // "// *[2_관리자 모드] 2.4_자동 알림 발송*"
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

console.log('✅ send자동알림 함수를 1354줄로 이동 완료');
console.log(`이동된 함수: ${functionEnd - functionStart + 1}줄`);
