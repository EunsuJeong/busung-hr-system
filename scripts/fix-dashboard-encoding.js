const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/utils/utils_admin_dashboard.js');

console.log('🔧 utils_admin_dashboard.js 인코딩 수정 중...\n');

// Read file as buffer first to handle encoding issues
let content = fs.readFileSync(filePath, 'utf-8');

// 깨진 한글 패턴을 올바른 한글로 교체
const replacements = [
  // 단일 문자 패턴 (가장 먼저 처리)
  [/'�'/g, "'주간'"],
  [/'��'/g, "'출근'"],
  [/'�4'/g, "'근무중'"],
  [/'�\('/g, "'조퇴'"],
  [/'4�'/g, "'퇴사'"],
  [/'4\|'/g, "'퇴사'"],
  [/'��'/g, "'결근'"],

  // 로그 메시지
  [/매개변수� �� -  ���:/g, "근무 상태 조회 - 날짜:"],
  [/\(날짜: \$\{checkDate\}\)/g, "(날짜: ${checkDate})"],

  // 야간/주간 패턴
  [/isNightShift \? '\|' :/g, "isNightShift ? '야간' :"],
  [/workType \|\| /g, "workType || "],
  [/workType === '\|'/g, "workType === '야간'"],
  [/workType !== '\|'/g, "workType !== '야간'"],
  [/if \(workType === '\|'\)/g, "if (workType === '야간')"],

  // Switch case에서의 중복 '출근' 처리 (두번째 것을 '결근'으로)
  [/case '출근':\s+return empStatus === '출근' \|\| empStatus/g, "case '출근':\n          return empStatus === '출근' || empStatus"],

  // 마지막 case를 '결근'으로 (118번줄 근처)
  [/case '출근':\s+return \(\s+empStatus !== '출근'/g, "case '결근':\n          return (\n            empStatus !== '출근'"],
];

replacements.forEach(([pattern, replacement]) => {
  const before = content.length;
  content = content.replace(pattern, replacement);
  const after = content.length;
  if (before !== after) {
    console.log(`✓ 교체: ${pattern} → ${replacement}`);
  }
});

// Write back
fs.writeFileSync(filePath, content, 'utf-8');

console.log('\n✅ 인코딩 수정 완료!');
console.log('파일: src/utils/utils_admin_dashboard.js');
