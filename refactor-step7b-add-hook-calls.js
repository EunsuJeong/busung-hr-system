const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

console.log('=== Step 7b: 훅 호출 추가 ===\n');

// 1. useDashboardStats 호출에 파라미터 추가
const oldDashboardStatsCall = `  // *[2_관리자 모드] 2.1_대시보드 - 통계 관리 훅*
  const { dashboardStatsReal } = useDashboardStats({`;

const newDashboardStatsCall = `  // *[2_관리자 모드] 2.1_대시보드 - 통계 관리 훅*
  const { dashboardStatsReal, goalStats, workLifeBalanceStats } = useDashboardStats({`;

if (content.includes(oldDashboardStatsCall)) {
  content = content.replace(oldDashboardStatsCall, newDashboardStatsCall);
  console.log('✅ useDashboardStats 훅 호출 업데이트 (goalStats, workLifeBalanceStats 추가)');
} else {
  console.log('⏭️  useDashboardStats 훅 호출을 찾을 수 없거나 이미 업데이트됨');
}

// 2. useDashboardStats 파라미터에 계산 함수들 추가
const dashboardStatsParamsEnd = `    analyzeAttendanceStatusForDashboard,
    devLog,
  });`;

const dashboardStatsParamsNew = `    analyzeAttendanceStatusForDashboard,
    devLog,
    calculateAttendanceRate,
    calculateLateRate,
    calculateAbsentRate,
    calculateTurnoverRate,
    calculateAverageOvertimeHours,
    calculateLeaveUsageRate,
    calculateWeekly52HoursViolation,
    calculateStressIndex,
    leaveRequests,
  });`;

if (content.includes(dashboardStatsParamsEnd) && !content.includes('calculateAttendanceRate,')) {
  content = content.replace(dashboardStatsParamsEnd, dashboardStatsParamsNew);
  console.log('✅ useDashboardStats 파라미터에 계산 함수들 추가');
} else {
  console.log('⏭️  useDashboardStats 파라미터가 이미 업데이트되었거나 찾을 수 없음');
}

// 3. useAiChat 훅 호출 추가 (useDashboardStats 다음에)
const useAiChatCallLocation = `  // *[3_일반직원 모드] 3.5_연차 신청/내역 - 연차 관리 훅*`;

const useAiChatCall = `  // *[1_공통] AI 챗봇 쿼리 처리 훅*
  const { handleAiQuery } = useAiChat({
    aiInput,
    setAiInput,
    setAiMessages,
    currentUser,
    devLog,
    getActiveAiKey,
    getActiveProvider,
    unifiedApiKey,
    geminiApiKey,
    chatgptApiKey,
    claudeApiKey,
    detectedProvider,
    selectedAiModel,
    attendanceData,
    employees,
    getUsedAnnualLeave,
    calculateAnnualLeave,
    leaveRequests,
    payrollTableData,
    evaluationData,
    API_BASE_URL,
    FAIL_MSG,
    selectedModel,
  });

  // *[3_일반직원 모드] 3.5_연차 신청/내역 - 연차 관리 훅*`;

if (content.includes(useAiChatCallLocation) && !content.includes('useAiChat({')) {
  content = content.replace(useAiChatCallLocation, useAiChatCall);
  console.log('✅ useAiChat 훅 호출 추가');
} else if (content.includes('useAiChat({')) {
  console.log('⏭️  useAiChat 훅 호출이 이미 추가되어 있음');
} else {
  console.log('⏭️  useAiChat 훅 호출 추가 위치를 찾을 수 없음');
}

fs.writeFileSync(path, content, 'utf8');
console.log('\n📄 App.js 저장 완료\n');
