const fs = require('fs');

console.log('🔍 App.js 완벽 재정렬 시작...\n');

// 원본 파일 읽기
const content = fs.readFileSync('C:/hr-system/src/App.js', 'utf8');
const lines = content.split('\n');
const maxLine = 3993;

// 섹션 헤더 패턴 정의
const sectionPattern = /^(\s*)\/\/---(\d+(?:\.\d+)*)[_]/;

// 모든 섹션 헤더 찾기
const sections = [];
for (let i = 0; i < Math.min(lines.length, maxLine); i++) {
  const match = lines[i].match(sectionPattern);
  if (match) {
    sections.push({
      key: match[2],
      line: i,
      indent: match[1]
    });
  }
}

console.log(`📊 발견된 섹션: ${sections.length}개\n`);

// 섹션별로 코드 추출
const sectionBlocks = {};

for (let i = 0; i < sections.length; i++) {
  const current = sections[i];
  const next = sections[i + 1];
  const startLine = current.line;
  const endLine = next ? next.line : Math.min(lines.length, maxLine);

  // 현재 섹션부터 다음 섹션 직전까지의 모든 라인 추출
  sectionBlocks[current.key] = lines.slice(startLine, endLine);

  console.log(`[${current.key}] 라인 ${startLine + 1} ~ ${endLine}: ${sectionBlocks[current.key].length}줄`);
}

// 헤더 추출 (첫 섹션 이전의 모든 코드)
const firstSectionLine = sections[0] ? sections[0].line : maxLine;
const header = lines.slice(0, firstSectionLine);

console.log(`\n[헤더] 라인 1 ~ ${firstSectionLine}: ${header.length}줄`);

// 올바른 순서 정의
const correctOrder = [
  '1.0', '1.1', '1.2', '1.3',
  '1.3.1', '1.3.2', '1.3.3', '1.3.4', '1.3.5', '1.3.6', '1.3.7', '1.3.8', '1.3.9', '1.3.10',
  '2.0', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10', '2.11', '2.12',
  '3.0', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8'
];

// 재조립
console.log('\n🔄 올바른 순서로 재조립 중...\n');

const output = [];

// 1. 헤더 추가
output.push('/* === [App.js 1~3993 완벽 재정렬 - 주석 규칙 순서] === */');
output.push('');
output.push(...header);

// 2. 각 섹션을 올바른 순서대로 추가
correctOrder.forEach(key => {
  if (sectionBlocks[key]) {
    output.push(...sectionBlocks[key]);
    console.log(`✅ [${key}] 추가됨 (${sectionBlocks[key].length}줄)`);
  }
});

// 파일 저장
const finalContent = output.join('\n');
fs.writeFileSync('C:/hr-system/src/app_refactoring.js', finalContent, 'utf8');

console.log(`\n✅ 완벽한 재정렬 완료!`);
console.log(`📝 총 ${output.length}줄 작성됨\n`);

// 검증: 누락된 섹션 확인
const missing = Object.keys(sectionBlocks).filter(key => !correctOrder.includes(key));
if (missing.length > 0) {
  console.log('⚠️  올바른 순서에 포함되지 않은 섹션:');
  missing.forEach(key => console.log(`  - ${key}`));
} else {
  console.log('✅ 모든 섹션이 포함되었습니다!');
}

console.log('\n💾 저장 위치: C:/hr-system/src/app_refactoring.js');
