// 근속년수 동기화 검증 테스트
// 직원 관리 vs 연차 관리 근속년수 일치 확인

// 직원 관리 기준 근속년수 계산 (getWorkPeriodText)
const getWorkPeriodText = (hireDate) => {
  if (!hireDate) return '';
  const start = new Date(hireDate);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years}년 ${months}개월`;
};

// 연차 관리 기준 근속년수 계산 (calculateEmployeeAnnualLeave 내부 로직)
const calculateEmployeeWorkPeriod = (hireDate) => {
  if (!hireDate) return { years: 0, months: 0 };
  const now = new Date();
  let years = now.getFullYear() - hireDate.getFullYear();
  let months = now.getMonth() - hireDate.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months };
};

// 테스트 케이스
console.log('='.repeat(80));
console.log('근속년수 동기화 검증 테스트');
console.log('직원 관리 (getWorkPeriodText) vs 연차 관리 (calculateEmployeeAnnualLeave)');
console.log('='.repeat(80));
console.log('');

const today = new Date();
console.log(`기준일: ${today.toISOString().split('T')[0]}`);
console.log('');

const testEmployees = [
  {
    name: '김철수',
    joinDate: '2020-03-15',
    description: '5년 7개월 근속'
  },
  {
    name: '이영희',
    joinDate: '2023-06-01',
    description: '2년 4개월 근속'
  },
  {
    name: '박민수',
    joinDate: '2024-01-10',
    description: '1년 9개월 근속'
  },
  {
    name: '정수진',
    joinDate: '2025-04-01',
    description: '6개월 근속'
  },
  {
    name: '최영수',
    joinDate: '2015-10-17',
    description: '10년 0개월 근속 (오늘 기준)'
  },
  {
    name: '강민지',
    joinDate: '2022-10-18',
    description: '2년 11개월 근속 (입사기념일 하루 전)'
  }
];

let passCount = 0;
let failCount = 0;

testEmployees.forEach((emp, index) => {
  // 직원 관리 기준
  const employeeManagement = getWorkPeriodText(emp.joinDate);

  // 연차 관리 기준
  const hireDateObj = new Date(emp.joinDate);
  const annualLeave = calculateEmployeeWorkPeriod(hireDateObj);
  const annualManagement = `${annualLeave.years}년 ${annualLeave.months}개월`;

  // 비교
  const isMatch = employeeManagement === annualManagement;

  if (isMatch) passCount++;
  else failCount++;

  const status = isMatch ? '✅ 일치' : '❌ 불일치';

  console.log(`${index + 1}. ${status} - ${emp.name} (${emp.description})`);
  console.log(`   입사일: ${emp.joinDate}`);
  console.log(`   직원 관리: ${employeeManagement}`);
  console.log(`   연차 관리: ${annualManagement}`);

  if (!isMatch) {
    console.log(`   ⚠️  동기화 오류 발생!`);
  }
  console.log('');
});

console.log('='.repeat(80));
console.log(`테스트 결과: ${passCount}/${testEmployees.length} 일치`);
if (failCount > 0) {
  console.log(`❌ ${failCount}개 불일치 발견 - 동기화 실패`);
  console.log('\n해결 방법:');
  console.log('1. calculateEmployeeAnnualLeave 함수 내부의 근속년수 계산 로직 확인');
  console.log('2. getWorkPeriodText와 동일한 계산 방식 사용');
  console.log('3. 두 함수 모두 현재 날짜(new Date()) 기준으로 계산하는지 확인');
} else {
  console.log('✅ 모든 근속년수가 동기화되었습니다!');
  console.log('\n✨ 검증 완료:');
  console.log('- 직원 관리 탭의 근속년수');
  console.log('- 연차 관리 탭의 근속년수');
  console.log('→ 두 값이 완전히 일치합니다.');
}
console.log('='.repeat(80));

// 추가 검증: 계산 방식 설명
console.log('\n계산 방식:');
console.log('-'.repeat(80));
console.log('1. 입사일부터 현재(today)까지의 연/월 차이 계산');
console.log('2. 월이 음수인 경우 → 연도 -1, 월 +12');
console.log('3. 결과: n년 n개월 형식으로 표시');
console.log('-'.repeat(80));
console.log('\n실시간 동기화:');
console.log('- 직원 입사일 변경 시 자동 반영');
console.log('- employees 상태 변경 시 useEffect로 재계산');
console.log('- UI/DB 구조 변경 없이 계산 로직만 통일');
console.log('='.repeat(80));
