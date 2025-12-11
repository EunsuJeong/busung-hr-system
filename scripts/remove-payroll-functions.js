const fs = require('fs');
const path = require('path');

// App.js 파일 읽기
const appJsPath = path.join(__dirname, '..', 'src', 'App.js');
const content = fs.readFileSync(appJsPath, 'utf8');
const lines = content.split('\n');

// 1940~2921 라인 제거 (1941~2920줄 + 주석 1줄 + ensureMonthlyPayrollData 마지막 줄)
// 인덱스는 0부터 시작하므로 1940 = lines[1940]
const startLine = 1940; // 1941번째 줄의 인덱스 (주석 포함)
const endLine = 2921; // 2921번째 줄까지 제거 (ensureMonthlyPayrollData 닫는 괄호 포함)

const newLines = [
  ...lines.slice(0, startLine),
  ...lines.slice(endLine)
];

// 파일 저장
fs.writeFileSync(appJsPath, newLines.join('\n'), 'utf8');

console.log(`✅ App.js에서 ${startLine+1}~${endLine}줄 (급여 관리 함수들) 제거 완료`);
console.log(`제거된 줄 수: ${endLine - startLine}줄`);
