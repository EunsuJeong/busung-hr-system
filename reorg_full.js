const fs = require('fs');

// 원본 파일 읽기
const content = fs.readFileSync('C:/hr-system/src/App.js', 'utf8');
const lines = content.split('\n');

// 섹션별로 코드 추출
const sections = {};
let currentSection = 'header';
sections[currentSection] = [];

// 섹션 패턴 정의
const sectionPattern = /\/\/---(\d+(?:\.\d+)*)[_]/;
const majorSectionPattern = /\/\* ================================\s*\[(\d+)_/;

for (let i = 0; i < lines.length && i < 3993; i++) {
  const line = lines[i];

  // 섹션 헤더 검사
  const match = line.match(sectionPattern);
  if (match) {
    currentSection = match[1];
    if (!sections[currentSection]) {
      sections[currentSection] = [];
    }
  }

  sections[currentSection].push(line);
}

// 올바른 순서 정의
const order = [
  'header',
  '1.0', '1.1', '1.2', '1.3',
  '1.3.1', '1.3.2', '1.3.3', '1.3.4', '1.3.5', '1.3.6', '1.3.7', '1.3.8', '1.3.9', '1.3.10',
  '2.0', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10', '2.11', '2.12',
  '3.0', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8'
];

// 재정렬된 내용 생성
const reordered = [];
reordered.push('/* === [App.js 1~3993 재정렬됨] === */\n');

for (const key of order) {
  if (sections[key] && sections[key].length > 0) {
    reordered.push(...sections[key]);
  }
}

// 파일 저장
const output = reordered.join('\n');
fs.writeFileSync('C:/hr-system/src/app_refactoring.js', output, 'utf8');

console.log('✅ 재정렬 완료!');
console.log(`총 ${reordered.length}줄 작성됨`);
console.log('\n포함된 섹션:');
order.forEach(key => {
  if (sections[key] && sections[key].length > 0) {
    console.log(`  ${key}: ${sections[key].length}줄`);
  }
});
