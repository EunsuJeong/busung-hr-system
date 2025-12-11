const fs = require('fs');

const filePath = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(filePath, 'utf8');

// 대괄호 형식의 주석을 * 형식으로 변경
// 패턴: "  // [2_관리자 모드]" -> "  // *[2_관리자 모드]*"
const before = content;
content = content.replace(
  /^(\s*)\/\/ (\[(?:1_공통|2_관리자 모드|3_일반직원 모드)[^\]]*\].*?)$/gm,
  '$1// *$2*'
);

const lines = before.split('\n');
const newLines = content.split('\n');
let changeCount = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i] !== newLines[i]) {
    changeCount++;
    console.log(`✅ ${i + 1}줄 수정: ${lines[i].trim()} → ${newLines[i].trim()}`);
  }
}

// 파일 저장
fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n✅ 총 ${changeCount}개 주석 형식 통일 완료!`);
