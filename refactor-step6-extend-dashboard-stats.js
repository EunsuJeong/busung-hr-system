const fs = require('fs');
const path = 'C:/hr-system/src/hooks/useDashboardStats.js';
let content = fs.readFileSync(path, 'utf8');

console.log('=== Step 6: useDashboardStats.js 확장 ===\n');

// 1. 파라미터에 계산 함수들 추가
const oldParams = `  devLog = () => {},
} = {}) => {`;

const newParams = `  devLog = () => {},
  calculateAttendanceRate = () => 0,
  calculateLateRate = () => 0,
  calculateAbsentRate = () => 0,
  calculateTurnoverRate = () => 0,
  calculateAverageOvertimeHours = () => 0,
  calculateLeaveUsageRate = () => 0,
  calculateWeekly52HoursViolation = () => 0,
  calculateStressIndex = () => 0,
  leaveRequests = [],
} = {}) => {`;

if (content.includes(oldParams) && !content.includes('calculateAttendanceRate')) {
  content = content.replace(oldParams, newParams);
  console.log('✅ useDashboardStats 파라미터 추가 완료');
} else {
  console.log('⏭️  파라미터가 이미 추가되어 있거나 추가할 위치를 찾을 수 없습니다.');
}

// 2. return 문 앞에 goalStats와 workLifeBalanceStats 추가
const oldReturn = `  return {
    dashboardStatsReal,
    calculateDashboardStats,
  };
};`;

const newReturn = `  // [2_관리자 모드] 2.1_대시보드 - 목표 통계
  const goalStats = useMemo(
    () => ({
      attendanceRate: calculateAttendanceRate(),
      lateRate: calculateLateRate(),
      absentRate: calculateAbsentRate(),
      turnoverRate: calculateTurnoverRate(),
    }),
    [attendanceSheetData, employees, calculateAttendanceRate, calculateLateRate, calculateAbsentRate, calculateTurnoverRate]
  );

  // [2_관리자 모드] 2.1_대시보드 - 워라밸 통계
  const workLifeBalanceStats = useMemo(
    () => ({
      averageOvertimeHours: calculateAverageOvertimeHours(),
      leaveUsageRate: calculateLeaveUsageRate(),
      weekly52HoursViolation: calculateWeekly52HoursViolation(),
      stressIndex: calculateStressIndex(),
    }),
    [attendanceSheetData, employees, leaveRequests, calculateAverageOvertimeHours, calculateLeaveUsageRate, calculateWeekly52HoursViolation, calculateStressIndex]
  );

  return {
    dashboardStatsReal,
    calculateDashboardStats,
    goalStats,
    workLifeBalanceStats,
  };
};`;

if (content.includes(oldReturn) && !content.includes('goalStats')) {
  content = content.replace(oldReturn, newReturn);
  console.log('✅ goalStats 및 workLifeBalanceStats 추가 완료');
} else {
  console.log('⏭️  goalStats가 이미 추가되어 있거나 추가할 위치를 찾을 수 없습니다.');
}

// 3. useMemo import 확인 및 추가 (이미 있을 것으로 예상)
if (!content.includes('useMemo')) {
  content = content.replace(
    `import { useCallback } from 'react';`,
    `import { useCallback, useMemo } from 'react';`
  );
  console.log('✅ useMemo import 추가');
} else {
  console.log('⏭️  useMemo import 이미 존재');
}

fs.writeFileSync(path, content, 'utf8');
console.log('\n📄 useDashboardStats.js 저장 완료\n');
