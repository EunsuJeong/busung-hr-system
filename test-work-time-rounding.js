// 근무시간 반올림 로직 검증 테스트
// 규칙: 0~29분=0, 30~59분=0.5

// 0.5시간 단위로 반올림하는 함수 (0~29분=0, 30~59분=0.5)
function roundDownToHalfHour(hours) {
  // 시간과 분 분리
  const wholeHours = Math.floor(hours);
  const minutes = (hours - wholeHours) * 60;

  // 0~29분 = 0, 30~59분 = 0.5
  const roundedMinutes = minutes < 30 ? 0 : 0.5;

  return wholeHours + roundedMinutes;
}

console.log('='.repeat(80));
console.log('근무시간 반올림 검증 테스트');
console.log('규칙: 0~29분 = 0, 30~59분 = 0.5');
console.log('='.repeat(80));
console.log('');

const testCases = [
  // 요구사항 테스트 케이스
  {
    description: '1시간 29분 (89분)',
    hours: 89 / 60,
    expectedHours: 1.0,
    expectedRule: '29분 < 30분 → 0'
  },
  {
    description: '2시간 30분 (150분)',
    hours: 150 / 60,
    expectedHours: 2.5,
    expectedRule: '30분 = 30분 → 0.5'
  },
  // 경계값 테스트
  {
    description: '0시간 0분',
    hours: 0,
    expectedHours: 0,
    expectedRule: '0분 < 30분 → 0'
  },
  {
    description: '0시간 29분',
    hours: 29 / 60,
    expectedHours: 0,
    expectedRule: '29분 < 30분 → 0'
  },
  {
    description: '0시간 30분',
    hours: 30 / 60,
    expectedHours: 0.5,
    expectedRule: '30분 = 30분 → 0.5'
  },
  {
    description: '0시간 59분',
    hours: 59 / 60,
    expectedHours: 0.5,
    expectedRule: '59분 ≥ 30분 → 0.5'
  },
  {
    description: '1시간 0분',
    hours: 1.0,
    expectedHours: 1.0,
    expectedRule: '0분 < 30분 → 0'
  },
  {
    description: '1시간 15분',
    hours: 75 / 60,
    expectedHours: 1.0,
    expectedRule: '15분 < 30분 → 0'
  },
  {
    description: '1시간 30분',
    hours: 90 / 60,
    expectedHours: 1.5,
    expectedRule: '30분 = 30분 → 0.5'
  },
  {
    description: '1시간 45분',
    hours: 105 / 60,
    expectedHours: 1.5,
    expectedRule: '45분 ≥ 30분 → 0.5'
  },
  {
    description: '2시간 15분',
    hours: 135 / 60,
    expectedHours: 2.0,
    expectedRule: '15분 < 30분 → 0'
  },
  {
    description: '2시간 45분',
    hours: 165 / 60,
    expectedHours: 2.5,
    expectedRule: '45분 ≥ 30분 → 0.5'
  },
  // 합계 계산 시나리오 (일별 반올림 후 합산)
  {
    description: '9/5 조출 1시간 15분 (일별 반올림)',
    hours: 75 / 60,
    expectedHours: 1.0,
    expectedRule: '15분 < 30분 → 1.0시간'
  },
  {
    description: '9/6 조출 2시간 45분 (일별 반올림)',
    hours: 165 / 60,
    expectedHours: 2.5,
    expectedRule: '45분 ≥ 30분 → 2.5시간'
  },
];

let passCount = 0;
let failCount = 0;

console.log('개별 테스트 케이스:');
console.log('-'.repeat(80));

testCases.forEach((testCase, index) => {
  const result = roundDownToHalfHour(testCase.hours);
  const pass = result === testCase.expectedHours;

  if (pass) passCount++;
  else failCount++;

  const status = pass ? '✅ PASS' : '❌ FAIL';
  const inputMinutes = Math.round(testCase.hours * 60);
  const wholeHours = Math.floor(testCase.hours);
  const minutes = Math.round((testCase.hours - wholeHours) * 60);

  console.log(`${index + 1}. ${status} - ${testCase.description}`);
  console.log(`   입력: ${inputMinutes}분 (${wholeHours}시간 ${minutes}분)`);
  console.log(`   결과: ${result}시간`);
  console.log(`   기대: ${testCase.expectedHours}시간`);
  console.log(`   규칙: ${testCase.expectedRule}`);

  if (!pass) {
    console.log(`   ⚠️  오류: 기대값 ${testCase.expectedHours}, 실제값 ${result}`);
  }
  console.log('');
});

console.log('='.repeat(80));
console.log(`테스트 결과: ${passCount}/${testCases.length} 통과`);
if (failCount > 0) {
  console.log(`❌ ${failCount}개 테스트 실패`);
} else {
  console.log('✅ 모든 테스트 통과!');
}
console.log('='.repeat(80));

// 합계 계산 시나리오 검증
console.log('\n합계 계산 시나리오:');
console.log('-'.repeat(80));
console.log('시나리오: 9/5 조출 1시간 15분 + 9/6 조출 2시간 45분');
console.log('');

const day1 = roundDownToHalfHour(75 / 60); // 1시간 15분
const day2 = roundDownToHalfHour(165 / 60); // 2시간 45분
const total = day1 + day2;

console.log(`9/5: 1시간 15분 → ${day1}시간 (일별 반올림)`);
console.log(`9/6: 2시간 45분 → ${day2}시간 (일별 반올림)`);
console.log(`합계: ${day1} + ${day2} = ${total}시간`);
console.log('');

if (total === 3.5) {
  console.log('✅ 합계 계산 정확: 일별 반올림 후 합산 = 3.5시간');
} else {
  console.log(`❌ 합계 계산 오류: 기대값 3.5시간, 실제값 ${total}시간`);
}

console.log('');
console.log('⚠️  주의: 전체 합산 후 반올림하면 4.0시간이 됨 (잘못된 방식)');
console.log(`   전체 합산: (75 + 165) / 60 = ${(75 + 165) / 60}시간`);
console.log(`   전체 반올림: ${roundDownToHalfHour((75 + 165) / 60)}시간 ❌`);
console.log(`   올바른 방식: 일별 반올림 후 합산 = ${total}시간 ✅`);
console.log('='.repeat(80));

// 추가 검증: 반올림 규칙 요약
console.log('\n반올림 규칙 요약:');
console.log('-'.repeat(80));
console.log('분(minutes) → 반올림 결과');
console.log('  0 ~  29분 → 0 (내림)');
console.log(' 30 ~  59분 → 0.5 (올림)');
console.log('');
console.log('예시:');
console.log('  1시간  0분 (60분)  → 1.0시간');
console.log('  1시간 29분 (89분)  → 1.0시간');
console.log('  1시간 30분 (90분)  → 1.5시간');
console.log('  1시간 59분 (119분) → 1.5시간');
console.log('  2시간  0분 (120분) → 2.0시간');
console.log('-'.repeat(80));
