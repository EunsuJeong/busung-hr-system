const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

console.log('=== Step 7: App.js 업데이트 ===\n');

// 1. useAiChat import 추가
const importSearch = `import { useDashboardStats } from './hooks/useDashboardStats';`;
const importReplace = `import { useDashboardStats } from './hooks/useDashboardStats';
import { useAiChat } from './hooks/useAiChat';`;

if (!content.includes('useAiChat')) {
  content = content.replace(importSearch, importReplace);
  console.log('✅ useAiChat import 추가');
} else {
  console.log('⏭️  useAiChat import 이미 존재');
}

// 2. handleAiQuery 함수 제거 (Lines 4406-4575, 170줄)
const handleAiQueryFunction = `  // [1_공통] AI 챗봇 쿼리 처리
  const handleAiQuery = async () => {
    if (!aiInput.trim()) return;

    const userMessage = aiInput.trim();
    setAiInput('');

    setAiMessages((prev) => [...prev, { type: 'user', message: userMessage }]);

    devLog('🚀 AI 챗봇 쿼리 시작');
    devLog('📝 입력:', userMessage);
    devLog('👤 사용자:', currentUser?.name);

    const unifiedKey = getActiveAiKey(
      unifiedApiKey,
      geminiApiKey,
      chatgptApiKey,
      claudeApiKey
    );
    const unifiedProvider = getActiveProvider(
      detectedProvider,
      geminiApiKey,
      chatgptApiKey,
      claudeApiKey,
      selectedAiModel
    );

    devLog('🔑 통합 키 상태:', unifiedKey ? '설정됨' : '미설정');
    devLog('🌐 통합 프로바이더:', unifiedProvider);

    if (!unifiedKey) {
      const fallbackMsg = \`⚠️ AI 모델 API Key가 설정되지 않았습니다.

**시스템 관리 > AI 모델 설정**에서 API Key를 입력해주세요.

현재는 기본 내부 데이터만 조회 가능합니다.\`;

      setAiMessages((prev) => [...prev, { type: 'ai', message: fallbackMsg }]);
      return;
    }

    const loadingId = Date.now();
    setAiMessages((prev) => [
      ...prev,
      { type: 'ai', message: '🤖 분석 중...', id: loadingId },
    ]);

    try {
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendanceData.filter(
        (att) => att.date === today
      );
      const userEmployee = employees.find((emp) => emp.id === currentUser.id);
      const userUsedLeave = userEmployee
        ? getUsedAnnualLeave(currentUser.id)
        : 0;
      const userTotalLeave = userEmployee
        ? calculateAnnualLeave(userEmployee.joinDate)
        : 0;

      const internalContext = {
        totalEmployees: employees.length,
        todayAttendanceCount: todayAttendance.length,
        todayAttendanceRate: Math.round(
          (todayAttendance.length / employees.length) * 100
        ),
        userAnnualLeave: {
          total: userTotalLeave,
          used: userUsedLeave,
          remaining: userTotalLeave - userUsedLeave,
        },
        approvedLeaveRequests: leaveRequests.filter(
          (req) => req.status === 'approved'
        ).length,
        payrollRecords: payrollTableData.length,
        pendingEvaluations: evaluationData.filter((e) => e.status === 'pending')
          .length,
        completedEvaluations: evaluationData.filter(
          (e) => e.status === 'completed'
        ).length,
      };

      devLog('📊 내부 데이터 컨텍스트:', internalContext);

      const systemPrompt = \`당신은 부성스틸 HR 관리 시스템의 AI 어시스턴트입니다.

**접근 권한:**
1. **내부 데이터**: 사내 ERP, HR DB, 생산 데이터, 근태 기록 등
2. **외부 데이터**: 웹 검색, HR 트렌드, 뉴스, 시장 리포트 등

**현재 사용자**: \${currentUser.name} (\${currentUser.role})

**실시간 내부 데이터 요약** (개인정보 제거):
- 전체 직원 수: \${internalContext.totalEmployees}명
- 오늘 출근자: \${internalContext.todayAttendanceCount}명 (출근율 \${internalContext.todayAttendanceRate}%)
- 사용자 연차: 총 \${internalContext.userAnnualLeave.total}일 중 \${internalContext.userAnnualLeave.used}일 사용 (잔여 \${internalContext.userAnnualLeave.remaining}일)
- 승인된 연차 신청: \${internalContext.approvedLeaveRequests}건
- 급여 처리 건수: \${internalContext.payrollRecords}건
- 진행 중인 평가: \${internalContext.pendingEvaluations}건
- 완료된 평가: \${internalContext.completedEvaluations}건

**응답 규칙:**
- 내부 데이터 질문 시: 위 요약 정보를 기반으로 정확히 답변
- 외부 데이터 질문 시: 최신 HR 트렌드, 뉴스, 시장 정보 제공 (출처 명시)
- 복합 질문 시: 내부 데이터 + 외부 인사이트 결합
- 친절하고 전문적인 톤 유지
- 이모지 적절히 활용 (📊 📈 💡 등)\`;

      devLog('📋 시스템 프롬프트 생성 완료');

      const response = await fetch(\`\${API_BASE_URL}/ai/query\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          internalData: internalContext,
          externalData: {
            systemPrompt: systemPrompt,
            user: {
              name: currentUser.name,
              role: currentUser.role,
            },
          },
        }),
      });

      devLog('🌐 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: FAIL_MSG }));
        throw new Error(errorData?.error || errorData?.message || FAIL_MSG);
      }

      const result = await response.json();
      devLog('✅ AI 응답 수신 완료');

      const aiResponse = result?.response || result?.message || FAIL_MSG;

      devLog('📝 AI 응답 길이:', aiResponse.length, '자');

      setAiMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat([{ type: 'ai', message: aiResponse }])
      );

      devLog('✅ AI 챗봇 쿼리 완료');
    } catch (error) {
      devLog('❌ AI 챗봇 에러:', error);

      setAiMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat([
            {
              type: 'ai',
              message: \`⚠️ \${FAIL_MSG}

서버 연결 또는 AI 모델 호출 중 문제가 발생했습니다.
- API Key가 올바른지 확인해주세요
- 네트워크 연결 상태를 확인해주세요
- 선택한 모델(\${selectedModel})이 활성화되어 있는지 확인해주세요\`,
            },
          ])
      );
    }
  };

`;

if (content.includes('const handleAiQuery = async () => {')) {
  content = content.replace(handleAiQueryFunction, '');
  console.log('✅ handleAiQuery 함수 제거 완료 (170줄)');
} else {
  console.log('⏭️  handleAiQuery 함수를 찾을 수 없습니다');
}

// 3. goalStats 제거
const goalStatsCode = `  // [2_관리자 모드] 2.1_대시보드 - 목표 통계
  const goalStats = useMemo(
    () => ({
      attendanceRate: calculateAttendanceRate(),
      lateRate: calculateLateRate(),
      absentRate: calculateAbsentRate(),
      turnoverRate: calculateTurnoverRate(),
    }),
    [attendanceSheetData, employees]
  );

`;

if (content.includes('const goalStats = useMemo(')) {
  content = content.replace(goalStatsCode, '');
  console.log('✅ goalStats 제거 완료 (10줄)');
} else {
  console.log('⏭️  goalStats를 찾을 수 없습니다');
}

// 4. workLifeBalanceStats 제거
const workLifeBalanceStatsCode = `  // [2_관리자 모드] 2.1_대시보드 - 워라밸 통계
  const workLifeBalanceStats = useMemo(
    () => ({
      averageOvertimeHours: calculateAverageOvertimeHours(),
      leaveUsageRate: calculateLeaveUsageRate(),
      weekly52HoursViolation: calculateWeekly52HoursViolation(),
      stressIndex: calculateStressIndex(),
    }),
    [attendanceSheetData, employees, leaveRequests]
  );

`;

if (content.includes('const workLifeBalanceStats = useMemo(')) {
  content = content.replace(workLifeBalanceStatsCode, '');
  console.log('✅ workLifeBalanceStats 제거 완료 (10줄)');
} else {
  console.log('⏭️  workLifeBalanceStats를 찾을 수 없습니다');
}

fs.writeFileSync(path, content, 'utf8');
console.log('\n📄 App.js 저장 완료');
console.log('📊 총 제거된 코드: 약 190줄\n');
