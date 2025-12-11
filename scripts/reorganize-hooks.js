const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, '../src/hooks');
const timestamp = '251105_hooks_reorganize';
const oldDir = path.join(hooksDir, '@@old', timestamp);

// 파일 매핑 (수동 분류 + 자동 감지)
const fileMapping = {
  'hooks_common.js': {
    description: '[1_공통] 공통 훅',
    files: [
      'useAIChat.js',
      'useLanguage.js',
      'useMonthNavigation.js',
      'useStorageSync.js',
      'useSystemSettings.js',
      'useAuth.js',
      'useMidnightScheduler.js',
      'useMenuStateReset.js',
    ],
  },
  'hooks_admin_common.js': {
    description: '[2_관리자 모드] 2.0_공통사항',
    files: [
      'useAdminFilters.js',
      'useEmployeeState.js',
      'useEmployeeSearch.js',
      'useSortHandlers.js',
      'useNotificationRecipients.js',
      'useAttendanceSync.js',
      'useScheduledNoticePublisher.js',
    ],
  },
  'hooks_admin_dashboard.js': {
    description: '[2_관리자 모드] 2.1_대시보드',
    files: [
      'useDashboardStats.js',
      'useSafetyManagement.js',
      'useDashboardActions.js',
      'useDashboardCalculations.js',
      'useDashboardAttendance.js',
    ],
  },
  'hooks_admin_employee.js': {
    description: '[2_관리자 모드] 2.2_직원 관리',
    files: ['useEmployeeManagement.js'],
  },
  'hooks_admin_notice.js': {
    description: '[2_관리자 모드] 2.3_공지 관리',
    files: ['useNoticeFileManager.js', 'useNoticeManagement.js'],
  },
  'hooks_admin_notification.js': {
    description: '[2_관리자 모드] 2.4_알림 관리',
    files: [
      'useNotificationRecurring.js',
      'useAdminNotifications.js',
      'useEmployeeNotifications.js',
    ],
  },
  'hooks_admin_schedule.js': {
    description: '[2_관리자 모드] 2.5_일정 관리',
    files: ['useHolidayManagement.js', 'useScheduleManagement.js'],
  },
  'hooks_admin_leave.js': {
    description: '[2_관리자 모드] 2.6_연차 관리',
    files: [
      'useAnnualLeaveEditor.js',
      'useLeaveApproval.js',
      'useAnnualLeaveManager.js',
    ],
  },
  'hooks_admin_suggestion.js': {
    description: '[2_관리자 모드] 2.7_건의 관리',
    files: ['useSuggestionApproval.js'],
  },
  'hooks_admin_attendance.js': {
    description: '[2_관리자 모드] 2.8_근태 관리',
    files: [
      'useAttendanceCellSelection.js',
      'useAttendanceManagement.js',
      'useAttendanceFilter.js',
      'useAttendanceClipboard.js',
    ],
  },
  'hooks_admin_payroll.js': {
    description: '[2_관리자 모드] 2.9_급여 관리',
    files: ['usePayrollManagement.js', 'usePayrollFilter.js'],
  },
  'hooks_admin_evaluation.js': {
    description: '[2_관리자 모드] 2.10_평가 관리',
    files: ['useEvaluationManagement.js'],
  },
  'hooks_admin_ai.js': {
    description: '[2_관리자 모드] 2.11_AI 챗봇',
    files: [
      'useAIRecommendations.js',
      'useAISettings.js',
      'useChatbotPermissions.js',
    ],
  },
  'hooks_admin_system.js': {
    description: '[2_관리자 모드] 2.12_시스템 관리',
    files: ['useModelSelection.js', 'useSystemManagement.js', 'useSystemStatus.js'],
  },
  'hooks_staff_common.js': {
    description: '[3_일반직원 모드] 3.0_공통사항',
    files: ['useStaffPWAInitializer.js'],
  },
  'hooks_staff_leave.js': {
    description: '[3_일반직원 모드] 3.5_연차 신청/내역',
    files: ['useStaffLeave.js'],
  },
  'hooks_staff_salary.js': {
    description: '[3_일반직원 모드] 3.6_급여 내역',
    files: ['useStaffSalary.js'],
  },
  'hooks_staff_suggestion.js': {
    description: '[3_일반직원 모드] 3.7_건의 사항',
    files: ['useStaffSuggestion.js'],
  },
};

console.log('🔧 hooks 폴더 재구성 시작...\n');

// 1. 백업 폴더 생성
if (!fs.existsSync(oldDir)) {
  fs.mkdirSync(oldDir, { recursive: true });
  console.log(`✓ 백업 폴더 생성: ${oldDir}\n`);
}

// 2. 각 파일 병합
let mergedCount = 0;
let totalFiles = 0;

Object.entries(fileMapping).forEach(([targetFile, config]) => {
  const { description, files } = config;
  totalFiles += files.length;

  console.log(`📝 생성 중: ${targetFile} (${files.length}개 파일 병합)`);

  let mergedContent = `/**\n * ${description}\n */\n\n`;

  files.forEach((sourceFile, index) => {
    const sourcePath = path.join(hooksDir, sourceFile);

    if (!fs.existsSync(sourcePath)) {
      console.log(`  ⚠️  파일 없음: ${sourceFile}`);
      return;
    }

    // 파일 읽기
    let content = fs.readFileSync(sourcePath, 'utf-8');

    // 구분자 추가 (첫 파일은 제외)
    if (index > 0) {
      mergedContent += `\n// ============================================================\n`;
      mergedContent += `// ${sourceFile}\n`;
      mergedContent += `// ============================================================\n\n`;
    }

    mergedContent += content;

    // 원본 파일 백업으로 이동
    const backupPath = path.join(oldDir, sourceFile);
    fs.renameSync(sourcePath, backupPath);
    console.log(`  ✓ ${sourceFile}`);
    mergedCount++;
  });

  // 새 파일 저장
  const targetPath = path.join(hooksDir, targetFile);
  fs.writeFileSync(targetPath, mergedContent, 'utf-8');
});

console.log(`\n✅ 병합 완료!`);
console.log(`   - ${totalFiles}개 파일 → ${Object.keys(fileMapping).length}개 파일로 병합`);
console.log(`   - 원본 파일은 ${oldDir}로 이동됨`);
