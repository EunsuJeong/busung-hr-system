// 연차 계산 로직 테스트 스크립트
// 완료연차(Anniversary) 기준 검증

// 완료된 연수/개월 계산 (입사기념일 기준)
const diffYMD = (startDate, endDate = new Date()) => {
  const s = new Date(startDate);
  const e = new Date(endDate);
  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  let days = e.getDate() - s.getDate();

  // 일 미만이면 개월 차에서 -1
  if (days < 0) {
    months -= 1;
  }
  // 개월이 음수면 연 차에서 -1, 개월 +12
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  // 완료된 연수/개월만 반환
  return { years: Math.max(years, 0), months: Math.max(months, 0) };
};

const calculateAnnualLeave = (joinDate, today = new Date()) => {
  if (!joinDate) return 0;

  const { years, months } = diffYMD(joinDate, today);

  // 1년 미만: 완료 개월수만큼 부여
  if (years < 1) {
    return Math.max(months, 0);
  }

  // 1년 이상: 15일 + 가산일 (3~4년차부터 2년마다 +1일), 상한 25일
  // 가산일 = floor((완료연수 - 1) / 2), 최대 10 (25일 상한)
  const base = 15;
  const extra = Math.min(10, Math.floor((years - 1) / 2));
  return Math.min(25, base + extra);
};

// 테스트 케이스 실행
console.log('='.repeat(80));
console.log('연차 계산 검증 테스트 (완료연차 기준 + 상한 25일)');
console.log('='.repeat(80));
console.log('');

// 기준일: 2025-10-17 (오늘)
const today = new Date('2025-10-17');

const testCases = [
  {
    description: '1년 미만 (입사 7개월)',
    joinDate: '2025-03-15',
    expectedDays: 7,
    expectedRule: '1년 미만, 완료 개월수만큼 부여'
  },
  {
    description: '1년 미만 (입사 6개월 - 경계)',
    joinDate: '2025-04-17',
    expectedDays: 6,
    expectedRule: '1년 미만, 완료 개월수만큼 부여'
  },
  {
    description: '1년 미만 (입사 6개월 - 일자 미달)',
    joinDate: '2025-04-18',
    expectedDays: 5,
    expectedRule: '1년 미만, 일자 미달로 개월 -1'
  },
  {
    description: '정확히 1년 (1년차)',
    joinDate: '2024-10-17',
    expectedDays: 15,
    expectedRule: '1년차: 15일 (가산 0)'
  },
  {
    description: '1년 초과 2년 미만 (1년 5개월)',
    joinDate: '2024-05-17',
    expectedDays: 15,
    expectedRule: '1년차: 15일 (가산 0)'
  },
  {
    description: '2년차 (2년 5개월)',
    joinDate: '2023-05-01',
    expectedDays: 15,
    expectedRule: '2년차: 15일 (가산 0)'
  },
  {
    description: '정확히 3년 (3년차)',
    joinDate: '2022-10-17',
    expectedDays: 16,
    expectedRule: '3년차: 15 + 1 = 16일 (가산 1)'
  },
  {
    description: '4년차',
    joinDate: '2021-10-17',
    expectedDays: 16,
    expectedRule: '4년차: 15 + 1 = 16일 (가산 1)'
  },
  {
    description: '5년차',
    joinDate: '2020-10-17',
    expectedDays: 17,
    expectedRule: '5년차: 15 + 2 = 17일 (가산 2)'
  },
  {
    description: '10년차',
    joinDate: '2015-10-17',
    expectedDays: 19,
    expectedRule: '10년차: 15 + 4 = 19일 (가산 4)'
  },
  {
    description: '20년차',
    joinDate: '2005-10-17',
    expectedDays: 24,
    expectedRule: '20년차: 15 + 9 = 24일 (가산 9)'
  },
  {
    description: '21년차 (상한 적용)',
    joinDate: '2004-10-17',
    expectedDays: 25,
    expectedRule: '21년차 이상: 25일 상한'
  },
  {
    description: '25년차 (상한 적용)',
    joinDate: '2000-10-17',
    expectedDays: 25,
    expectedRule: '25년차: 25일 상한'
  },
  {
    description: '입사기념일 직전 (경계 테스트)',
    joinDate: '2022-10-18',
    expectedDays: 15,
    expectedRule: '2년 11개월 29일 → 2년차: 15일 (가산 0)'
  },
  {
    description: '3년 경계 (기념일 이후)',
    joinDate: '2022-10-16',
    expectedDays: 16,
    expectedRule: '3년 0개월 1일 → 3년차: 16일 (가산 1)'
  }
];

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  const { years, months } = diffYMD(testCase.joinDate, today);
  const result = calculateAnnualLeave(testCase.joinDate, today);
  const pass = result === testCase.expectedDays;

  if (pass) passCount++;
  else failCount++;

  const status = pass ? '✅ PASS' : '❌ FAIL';
  const base = 15;
  const extra = years >= 1 ? Math.min(10, Math.floor((years - 1) / 2)) : 0;

  console.log(`${index + 1}. ${status} - ${testCase.description}`);
  console.log(`   입사일: ${testCase.joinDate}`);
  console.log(`   완료: ${years}년 ${months}개월`);
  if (years >= 1) {
    console.log(`   계산: ${base}(기본) + ${extra}(가산) = ${result}일`);
  } else {
    console.log(`   계산: ${months}개월 → ${result}일`);
  }
  console.log(`   기대값: ${testCase.expectedDays}일`);
  console.log(`   규칙: ${testCase.expectedRule}`);
  if (!pass) {
    console.log(`   ⚠️  오류: 기대값 ${testCase.expectedDays}일, 실제값 ${result}일`);
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

// 추가 검증: 연차 계산 공식 확인
console.log('\n연차 계산 공식 검증:');
console.log('-'.repeat(80));
console.log('1년 미만: 완료 개월수');
console.log('1~2년차: 15일 (가산 0)');
console.log('3~4년차: 16일 (가산 1)');
console.log('5~6년차: 17일 (가산 2)');
console.log('7~8년차: 18일 (가산 3)');
console.log('9~10년차: 19일 (가산 4)');
console.log('11~12년차: 20일 (가산 5)');
console.log('13~14년차: 21일 (가산 6)');
console.log('15~16년차: 22일 (가산 7)');
console.log('17~18년차: 23일 (가산 8)');
console.log('19~20년차: 24일 (가산 9)');
console.log('21년차 이상: 25일 상한 (가산 10)');
console.log('-'.repeat(80));
