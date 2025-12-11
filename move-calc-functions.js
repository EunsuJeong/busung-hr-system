const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// Step 1: Remove calculateMonthlyAttendanceRate from line 2425-2431
const toRemove1 = `  const calculateMonthlyAttendanceRate = () => {
    return calculateMonthlyAttendanceRateService(
      employees,
      getAttendanceForEmployee,
      analyzeAttendanceStatusForDashboard
    );
  };

`;

content = content.replace(toRemove1, '');

// Step 2: Remove calculateCompanyStats from line 2452-2460
const toRemove2 = `  // *[2_관리자 모드] 2.1_회사 통계 계산*
  const calculateCompanyStats = () => {
    return calculateCompanyStatsService(
      employees,
      leaveRequests,
      evaluations,
      getAttendanceForEmployee,
      analyzeAttendanceStatusForDashboard
    );
  };

`;

content = content.replace(toRemove2, '');

// Step 3: Add both functions before getCompanyDataWrapper (before line 1748)
const searchStr = `  const getCompanyDataWrapper = useCallback(async () => {`;

const replaceStr = `  // *[2_관리자 모드] 계산 함수들*
  const calculateMonthlyAttendanceRate = () => {
    return calculateMonthlyAttendanceRateService(
      employees,
      getAttendanceForEmployee,
      analyzeAttendanceStatusForDashboard
    );
  };

  const calculateCompanyStats = () => {
    return calculateCompanyStatsService(
      employees,
      leaveRequests,
      evaluations,
      getAttendanceForEmployee,
      analyzeAttendanceStatusForDashboard
    );
  };

  const getCompanyDataWrapper = useCallback(async () => {`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Moved calculateMonthlyAttendanceRate and calculateCompanyStats before getCompanyDataWrapper');
