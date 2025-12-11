const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.js');

console.log('🔧 App.js hooks import 경로 업데이트 중...\n');

let content = fs.readFileSync(appPath, 'utf-8');

// Import 매핑: 기존 파일 → 새 파일
const importMapping = {
  // hooks_common.js
  'useAIChat': 'hooks_common',
  'useLanguage': 'hooks_common',
  'useMonthNavigation': 'hooks_common',
  'useStorageSync': 'hooks_common',
  'useSystemSettings': 'hooks_common',
  'useAuth': 'hooks_common',
  'useMidnightScheduler': 'hooks_common',
  'useMenuStateReset': 'hooks_common',

  // hooks_admin_common.js
  'useAdminFilters': 'hooks_admin_common',
  'useEmployeeState': 'hooks_admin_common',
  'useEmployeeSearch': 'hooks_admin_common',
  'useSortHandlers': 'hooks_admin_common',
  'useNotificationRecipients': 'hooks_admin_common',
  'useAttendanceSync': 'hooks_admin_common',
  'useScheduledNoticePublisher': 'hooks_admin_common',

  // hooks_admin_dashboard.js
  'useDashboardStats': 'hooks_admin_dashboard',
  'useSafetyManagement': 'hooks_admin_dashboard',
  'useDashboardActions': 'hooks_admin_dashboard',
  'useDashboardCalculations': 'hooks_admin_dashboard',
  'useDashboardAttendance': 'hooks_admin_dashboard',

  // hooks_admin_employee.js
  'useEmployeeManagement': 'hooks_admin_employee',

  // hooks_admin_notice.js
  'useNoticeFileManager': 'hooks_admin_notice',
  'useNoticeManagement': 'hooks_admin_notice',

  // hooks_admin_notification.js
  'useNotificationRecurring': 'hooks_admin_notification',
  'useAdminNotifications': 'hooks_admin_notification',
  'useEmployeeNotifications': 'hooks_admin_notification',

  // hooks_admin_schedule.js
  'useHolidayManagement': 'hooks_admin_schedule',
  'useScheduleManagement': 'hooks_admin_schedule',

  // hooks_admin_leave.js
  'useAnnualLeaveEditor': 'hooks_admin_leave',
  'useLeaveApproval': 'hooks_admin_leave',
  'useAnnualLeaveManager': 'hooks_admin_leave',

  // hooks_admin_suggestion.js
  'useSuggestionApproval': 'hooks_admin_suggestion',

  // hooks_admin_attendance.js
  'useAttendanceCellSelection': 'hooks_admin_attendance',
  'useAttendanceManagement': 'hooks_admin_attendance',
  'useAttendanceFilter': 'hooks_admin_attendance',
  'useAttendanceClipboard': 'hooks_admin_attendance',

  // hooks_admin_payroll.js
  'usePayrollManagement': 'hooks_admin_payroll',
  'usePayrollFilter': 'hooks_admin_payroll',

  // hooks_admin_evaluation.js
  'useEvaluationManagement': 'hooks_admin_evaluation',

  // hooks_admin_ai.js
  'useAIRecommendations': 'hooks_admin_ai',
  'useAISettings': 'hooks_admin_ai',
  'useChatbotPermissions': 'hooks_admin_ai',

  // hooks_admin_system.js
  'useModelSelection': 'hooks_admin_system',
  'useSystemManagement': 'hooks_admin_system',
  'useSystemStatus': 'hooks_admin_system',

  // hooks_staff_common.js
  'useStaffPWAInitializer': 'hooks_staff_common',

  // hooks_staff_leave.js
  'useStaffLeave': 'hooks_staff_leave',

  // hooks_staff_salary.js
  'useStaffSalary': 'hooks_staff_salary',

  // hooks_staff_suggestion.js
  'useStaffSuggestion': 'hooks_staff_suggestion',
};

// 각 import 문을 찾아서 교체
let updatedCount = 0;

Object.entries(importMapping).forEach(([hookName, newFile]) => {
  // Named import 패턴
  const namedPattern = new RegExp(
    `import\\s+\\{\\s*${hookName}\\s*\\}\\s+from\\s+['"]\\./hooks/use[A-Z][a-zA-Z]*['"];?`,
    'g'
  );

  // Default import 패턴
  const defaultPattern = new RegExp(
    `import\\s+${hookName}\\s+from\\s+['"]\\./hooks/use[A-Z][a-zA-Z]*['"];?`,
    'g'
  );

  if (namedPattern.test(content)) {
    content = content.replace(namedPattern, `import { ${hookName} } from './hooks/${newFile}';`);
    console.log(`✓ ${hookName} → hooks/${newFile}`);
    updatedCount++;
  } else if (defaultPattern.test(content)) {
    content = content.replace(defaultPattern, `import ${hookName} from './hooks/${newFile}';`);
    console.log(`✓ ${hookName} → hooks/${newFile} (default)`);
    updatedCount++;
  }
});

// 멀티라인 import도 처리
const multilinePattern = /} from ['"]\.\/hooks\/useNotificationRecurring['"];/g;
if (multilinePattern.test(content)) {
  content = content.replace(multilinePattern, `} from './hooks/hooks_admin_notification';`);
  console.log(`✓ useNotificationRecurring (multiline) → hooks/hooks_admin_notification`);
  updatedCount++;
}

fs.writeFileSync(appPath, content, 'utf-8');

console.log(`\n✅ 총 ${updatedCount}개 import 경로 업데이트 완료!`);
