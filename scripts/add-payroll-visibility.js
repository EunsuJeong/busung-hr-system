const fs = require('fs');

console.log('📝 급여 가시성 제어 기능 추가 스크립트 실행 중...\n');

// ========================================
// 1. common_admin_payroll.js 수정
// ========================================
const adminPayrollPath = 'C:/hr-system/src/components/common/common_admin_payroll.js';
let adminContent = fs.readFileSync(adminPayrollPath, 'utf8');

// 1-1. payrollMonthMetadata 상태 추가 (after payrollByMonth state)
const metadataStateCode = `
  // *[2_관리자 모드] 2.9.5a_급여대장 월별 메타데이터 STATE (가시성 제어)*
  const [payrollMonthMetadata, setPayrollMonthMetadata] = useState(() => {
    try {
      const saved = localStorage.getItem('payrollMonthMetadata');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('급여 메타데이터 로드 오류:', error);
      return {};
    }
  });
`;

const payrollByMonthMarker = `  });

  // *[2_관리자 모드] 2.9.6_현재 월 데이터*`;

if (!adminContent.includes('payrollMonthMetadata')) {
  adminContent = adminContent.replace(
    payrollByMonthMarker,
    `  });
${metadataStateCode}
  // *[2_관리자 모드] 2.9.6_현재 월 데이터*`
  );
  console.log('✅ 1-1. payrollMonthMetadata 상태 추가 완료');
} else {
  console.log('⏭️  1-1. payrollMonthMetadata 상태 이미 존재');
}

// 1-2. setPayrollTableData 수정 - isVisible 자동 설정
const oldSetPayrollTableData = `  // *[2_관리자 모드] 2.9.7_월별 데이터 업데이트*
  const setPayrollTableData = useCallback(
    (newData) => {
      const currentKey = ymKey(
        payrollSearchFilter.year,
        payrollSearchFilter.month
      );
      setPayrollByMonth((prev) => ({
        ...prev,
        [currentKey]:
          typeof newData === 'function'
            ? newData(prev[currentKey] || [])
            : newData,
      }));
    },
    [payrollSearchFilter.year, payrollSearchFilter.month]
  );`;

const newSetPayrollTableData = `  // *[2_관리자 모드] 2.9.7_월별 데이터 업데이트*
  const setPayrollTableData = useCallback(
    (newData) => {
      const currentKey = ymKey(
        payrollSearchFilter.year,
        payrollSearchFilter.month
      );
      setPayrollByMonth((prev) => ({
        ...prev,
        [currentKey]:
          typeof newData === 'function'
            ? newData(prev[currentKey] || [])
            : newData,
      }));
      // 급여 데이터 저장 시 해당 월을 가시성 true로 설정
      setPayrollMonthMetadata((prev) => ({
        ...prev,
        [currentKey]: { isVisible: true, lastModified: new Date().toISOString() },
      }));
    },
    [payrollSearchFilter.year, payrollSearchFilter.month]
  );`;

adminContent = adminContent.replace(oldSetPayrollTableData, newSetPayrollTableData);
console.log('✅ 1-2. setPayrollTableData 수정 - 가시성 자동 설정 추가');

// 1-3. localStorage 동기화 추가 (after payrollByMonth sync)
const metadataSyncCode = `
  // *[2_관리자 모드] 2.9_급여 메타데이터 동기화*
  useEffect(() => {
    try {
      localStorage.setItem('payrollMonthMetadata', JSON.stringify(payrollMonthMetadata));
    } catch (error) {
      console.error('급여 메타데이터 저장 오류:', error);
    }
  }, [payrollMonthMetadata]);
`;

const payrollHashesSyncMarker = `  // *[2_관리자 모드] 2.9_급여 해시 동기화*
  useEffect(() => {
    try {
      localStorage.setItem('payrollHashes', JSON.stringify(payrollHashes));
    } catch (error) {
      console.error('급여 해시 저장 오류:', error);
    }
  }, [payrollHashes]);`;

if (!adminContent.includes('급여 메타데이터 동기화')) {
  adminContent = adminContent.replace(
    payrollHashesSyncMarker,
    payrollHashesSyncMarker + metadataSyncCode
  );
  console.log('✅ 1-3. localStorage 동기화 추가 완료');
} else {
  console.log('⏭️  1-3. localStorage 동기화 이미 존재');
}

// 1-4. return 문에 payrollMonthMetadata, setPayrollMonthMetadata 추가
const oldReturn = `  return {
    payrollSearchFilter,
    setPayrollSearchFilter,
    payrollValidationErrors,
    setPayrollValidationErrors,
    payrollHashes,
    setPayrollHashes,
    payrollByMonth,
    setPayrollByMonth,
    payrollTableData,
    setPayrollTableData,`;

const newReturn = `  return {
    payrollSearchFilter,
    setPayrollSearchFilter,
    payrollValidationErrors,
    setPayrollValidationErrors,
    payrollHashes,
    setPayrollHashes,
    payrollByMonth,
    setPayrollByMonth,
    payrollMonthMetadata,
    setPayrollMonthMetadata,
    payrollTableData,
    setPayrollTableData,`;

adminContent = adminContent.replace(oldReturn, newReturn);
console.log('✅ 1-4. return 문에 메타데이터 상태 추가 완료');

fs.writeFileSync(adminPayrollPath, adminContent, 'utf8');
console.log('✅ common_admin_payroll.js 수정 완료\n');

// ========================================
// 2. common_staff_payroll.js 수정
// ========================================
const staffPayrollPath = 'C:/hr-system/src/components/common/common_staff_payroll.js';
let staffContent = fs.readFileSync(staffPayrollPath, 'utf8');

// 2-1. generateSalaryHistory 함수 수정 - 가시성 필터링 추가
const oldGenerateSalary = `  const generateSalaryHistory = useCallback(
    (joinDate, employeeId = currentUser?.id) => {
      if (!currentUser) {
        devLog('❌ 현재 사용자 정보 없음');
        return [];
      }

      const allPayrollData = [];
      if (payrollByMonth && typeof payrollByMonth === 'object') {
        Object.keys(payrollByMonth).forEach((ymKey) => {
          const monthData = payrollByMonth[ymKey];
          if (Array.isArray(monthData)) {
            monthData.forEach((payroll) => {
              if (!payroll.귀속년월) {
                payroll.귀속년월 = ymKey;
              }
              allPayrollData.push(payroll);
            });
          }
        });
      }`;

const newGenerateSalary = `  const generateSalaryHistory = useCallback(
    (joinDate, employeeId = currentUser?.id) => {
      if (!currentUser) {
        devLog('❌ 현재 사용자 정보 없음');
        return [];
      }

      // 급여 메타데이터 로드
      const payrollMonthMetadata = (() => {
        try {
          const saved = localStorage.getItem('payrollMonthMetadata');
          return saved ? JSON.parse(saved) : {};
        } catch (error) {
          console.error('급여 메타데이터 로드 오류:', error);
          return {};
        }
      })();

      const allPayrollData = [];
      if (payrollByMonth && typeof payrollByMonth === 'object') {
        Object.keys(payrollByMonth).forEach((ymKey) => {
          // 가시성 체크: 메타데이터에 isVisible이 true인 경우만 포함
          const metadata = payrollMonthMetadata[ymKey];
          if (!metadata || !metadata.isVisible) {
            devLog(\`⏭️  \${ymKey} 급여 데이터는 가시성이 설정되지 않아 스킵합니다\`);
            return; // 가시성이 설정되지 않은 월은 건너뜀
          }

          const monthData = payrollByMonth[ymKey];
          if (Array.isArray(monthData)) {
            monthData.forEach((payroll) => {
              if (!payroll.귀속년월) {
                payroll.귀속년월 = ymKey;
              }
              allPayrollData.push(payroll);
            });
          }
        });
      }`;

staffContent = staffContent.replace(oldGenerateSalary, newGenerateSalary);
console.log('✅ 2-1. generateSalaryHistory 함수 - 가시성 필터링 추가 완료');

fs.writeFileSync(staffPayrollPath, staffContent, 'utf8');
console.log('✅ common_staff_payroll.js 수정 완료\n');

// ========================================
// 3. generateSalaryHistoryImpl 함수 수정 (Util 버전)
// ========================================
const oldGenerateSalaryImpl = `  const allPayrollData = [];
  if (payrollByMonth && typeof payrollByMonth === 'object') {
    Object.keys(payrollByMonth).forEach((ymKey) => {
      const monthData = payrollByMonth[ymKey];
      if (Array.isArray(monthData)) {
        monthData.forEach((payroll) => {
          if (!payroll.귀속년월) {
            payroll.귀속년월 = ymKey;
          }
          allPayrollData.push(payroll);
        });
      }
    });
  }`;

const newGenerateSalaryImpl = `  // 급여 메타데이터 로드
  const payrollMonthMetadata = (() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('payrollMonthMetadata');
        return saved ? JSON.parse(saved) : {};
      }
      return {};
    } catch (error) {
      console.error('급여 메타데이터 로드 오류:', error);
      return {};
    }
  })();

  const allPayrollData = [];
  if (payrollByMonth && typeof payrollByMonth === 'object') {
    Object.keys(payrollByMonth).forEach((ymKey) => {
      // 가시성 체크: 메타데이터에 isVisible이 true인 경우만 포함
      const metadata = payrollMonthMetadata[ymKey];
      if (!metadata || !metadata.isVisible) {
        devLog(\`⏭️  \${ymKey} 급여 데이터는 가시성이 설정되지 않아 스킵합니다\`);
        return; // 가시성이 설정되지 않은 월은 건너뜀
      }

      const monthData = payrollByMonth[ymKey];
      if (Array.isArray(monthData)) {
        monthData.forEach((payroll) => {
          if (!payroll.귀속년월) {
            payroll.귀속년월 = ymKey;
          }
          allPayrollData.push(payroll);
        });
      }
    });
  }`;

staffContent = fs.readFileSync(staffPayrollPath, 'utf8');
staffContent = staffContent.replace(oldGenerateSalaryImpl, newGenerateSalaryImpl);
fs.writeFileSync(staffPayrollPath, staffContent, 'utf8');
console.log('✅ 3. generateSalaryHistoryImpl 함수 - 가시성 필터링 추가 완료\n');

console.log('='.repeat(60));
console.log('✅ 모든 수정 완료!');
console.log('='.repeat(60));
console.log('\n변경 사항:');
console.log('1. common_admin_payroll.js:');
console.log('   - payrollMonthMetadata 상태 추가');
console.log('   - setPayrollTableData에서 자동으로 isVisible: true 설정');
console.log('   - localStorage 동기화 추가');
console.log('   - return 문에 메타데이터 상태 추가');
console.log('\n2. common_staff_payroll.js:');
console.log('   - generateSalaryHistory에서 가시성 체크 추가');
console.log('   - generateSalaryHistoryImpl에서 가시성 체크 추가');
console.log('   - isVisible이 true인 월만 표시');
console.log('\n이제 관리자가 급여를 추가/수정/삭제하면 해당 월이 일반직원에게 표시됩니다.');
console.log('기존 데이터는 가시성이 설정되지 않아 표시되지 않습니다.\n');
