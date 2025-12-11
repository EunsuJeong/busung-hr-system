const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

console.log('=== Step 1: testWageCalculations 함수 삭제 ===\n');

// testWageCalculations 함수 전체 삭제 (Lines 4349-4408)
const functionToDelete = `  const testWageCalculations = () => {
    devLog('=== 회사 급여 계산 규정 테스트 시작 ===');

    const testCase1 = calcDailyWage('08:30', '17:30', 'day', '2025-09-16');
    devLog('테스트 1 - 기본 주간 근무:', testCase1);

    const testCase2 = calcDailyWage('08:30', '20:00', 'day', '2025-09-16');
    devLog('테스트 2 - 연장 근무 포함:', testCase2);

    const testCase3 = calcDailyWage('22:00', '06:00', 'night', '2025-09-16');
    devLog('테스트 3 - 야간 근무:', testCase3);

    const testCase4 = calcDailyWage('08:30', '17:30', 'day', '2025-09-15'); // 일요일
    devLog('테스트 4 - 휴일 근무:', testCase4);

    const monthlyTestData = [
      {
        date: '2025-09-01',
        checkIn: '08:30',
        checkOut: '17:30',
        workType: 'day',
      },
      {
        date: '2025-09-02',
        checkIn: '08:30',
        checkOut: '20:00',
        workType: 'day',
      },
      {
        date: '2025-09-03',
        checkIn: '22:00',
        checkOut: '06:00',
        workType: 'night',
      },
    ];

    const monthlyResult = calcMonthlyWage(monthlyTestData);
    devLog('월별 급여 계산 테스트:', monthlyResult);

    const testEmployee = {
      position: '과장',
      department: '가공',
      isUnionMember: true,
    };

    const allowanceTest = calcAllowances(testEmployee, monthlyTestData, 8);
    devLog('수당 계산 테스트:', allowanceTest);

    const deductionTest = calcDeductions(3500000, testEmployee);
    devLog('공제 계산 테스트:', deductionTest);

    devLog('=== 급여 계산 규정 테스트 완료 ===');

    return {
      dailyTests: [testCase1, testCase2, testCase3, testCase4],
      monthlyTest: monthlyResult,
      allowanceTest,
      deductionTest,
    };
  };

`;

if (content.includes('const testWageCalculations = () => {')) {
  content = content.replace(functionToDelete, '');
  console.log('✅ testWageCalculations 함수 삭제 완료 (60줄)');
} else {
  console.log('⏭️  testWageCalculations 함수를 찾을 수 없습니다 (이미 삭제되었을 수 있음)');
}

fs.writeFileSync(path, content, 'utf8');
console.log('📄 App.js 저장 완료\n');
