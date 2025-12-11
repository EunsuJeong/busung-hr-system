const fs = require('fs');

// 원본 파일 읽기
const content = fs.readFileSync('C:/hr-system/src/app_refactoring.js', 'utf8');
const lines = content.split('\n');

// 섹션 구분 패턴
const sectionPatterns = {
  // [1_공통]
  '1.0': /\/\/---1\.0_/,
  '1.1': /\/\/---1\.1_/,
  '1.2': /\/\/---1\.2_/,
  '1.3': /\/\/---1\.3_/,
  '1.3.1': /\/\/---1\.3\.1_/,
  '1.3.2': /\/\/---1\.3\.2_/,
  '1.3.3': /\/\/---1\.3\.3_/,
  '1.3.4': /\/\/---1\.3\.4_/,
  '1.3.5': /\/\/---1\.3\.5_/,
  '1.3.6': /\/\/---1\.3\.6_/,
  '1.3.7': /\/\/---1\.3\.7_/,
  '1.3.8': /\/\/---1\.3\.8_/,
  '1.3.9': /\/\/---1\.3\.9_/,
  '1.3.10': /\/\/---1\.3\.10_/,

  // [2_관리자 모드]
  '2.0': /\/\/---2\.0_/,
  '2.1': /\/\/---2\.1_/,
  '2.2': /\/\/---2\.2_/,
  '2.3': /\/\/---2\.3_/,
  '2.4': /\/\/---2\.4_/,
  '2.5': /\/\/---2\.5_/,
  '2.6': /\/\/---2\.6_/,
  '2.7': /\/\/---2\.7_/,
  '2.8': /\/\/---2\.8_/,
  '2.9': /\/\/---2\.9_/,
  '2.10': /\/\/---2\.10_/,
  '2.11': /\/\/---2\.11_/,
  '2.12': /\/\/---2\.12_/,

  // [3_일반직원 모드]
  '3.0': /\/\/---3\.0_/,
  '3.1': /\/\/---3\.1_/,
  '3.2': /\/\/---3\.2_/,
  '3.3': /\/\/---3\.3_/,
  '3.4': /\/\/---3\.4_/,
  '3.5': /\/\/---3\.5_/,
  '3.6': /\/\/---3\.6_/,
  '3.7': /\/\/---3\.7_/,
  '3.8': /\/\/---3\.8_/,
};

// 섹션별 라인 인덱스 찾기
const sectionIndexes = {};
for (const [key, pattern] of Object.entries(sectionPatterns)) {
  const index = lines.findIndex(line => pattern.test(line));
  if (index !== -1) {
    sectionIndexes[key] = index;
  }
}

console.log('발견된 섹션들:');
Object.keys(sectionIndexes).sort().forEach(key => {
  console.log(`  ${key}: 라인 ${sectionIndexes[key] + 1}`);
});

// 섹션들이 순서대로 정렬되어 있는지 확인
const orderedKeys = Object.keys(sectionIndexes).sort((a, b) => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal !== bVal) return aVal - bVal;
  }
  return 0;
});

console.log('\n올바른 순서:');
orderedKeys.forEach(key => console.log(`  ${key}`));

console.log('\n현재 순서:');
const currentOrder = Object.entries(sectionIndexes)
  .sort((a, b) => a[1] - b[1])
  .map(([key]) => key);
currentOrder.forEach(key => console.log(`  ${key}`));

const isOrdered = JSON.stringify(orderedKeys) === JSON.stringify(currentOrder);
console.log(`\n순서 정렬 필요: ${!isOrdered ? 'YES' : 'NO'}`);

if (!isOrdered) {
  console.log('\n재정렬이 필요합니다!');
}
