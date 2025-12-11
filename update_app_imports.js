const fs = require('fs');

let appContent = fs.readFileSync('C:/hr-system/src/App.js', 'utf8');

// 1. Replace utils_common import (lines 45-62)
appContent = appContent.replace(
  /import \{[^}]*\} from '\.\/utils\/utils_common';/s,
  `import {
  diffYMD,
  calculateAnnualLeave,
  getMonthlyAnnualLeave as getMonthlyAnnualLeaveUtil,
  getUsedAnnualLeave as getUsedAnnualLeaveUtil,
  getLeaveDays,
  calculateEmployeeAnnualLeave as calculateEmployeeAnnualLeaveUtil,
  generateEmployees,
  generateAdmins,
  getDateKey,
  isHolidayDate,
  getDaysInMonth,
  getDayOfWeek,
  getTodayDateWithDay,
  getYesterdayDateWithDay,
  getStatusTextColor,
  formatDateWithDay,
} from './components/common/common_common';`
);

// 2. Replace hooks_admin_common import (line 87)
appContent = appContent.replace(
  /import \{ useEmployeeState, useScheduledNoticePublisher, useAdminFilters, useEmployeeSearch, useNotificationRecipients, useSortHandlers \} from '\.\/hooks\/hooks_admin_common';/,
  `import { useEmployeeState, useScheduledNoticePublisher, useAdminFilters, useEmployeeSearch, useNotificationRecipients, useSortHandlers } from './components/common/common_common';`
);

// 3. Replace hooks_common import (line 91)
appContent = appContent.replace(
  /import \{ useMidnightScheduler, useStorageSync, useAiChat, useSystemSettings, useMenuStateReset \} from '\.\/hooks\/hooks_common';/,
  `import { useMidnightScheduler, useStorageSync, useAiChat, useSystemSettings, useMenuStateReset } from './components/common/common_common';`
);

// 4. Replace hooks_common.js import (line 118)
appContent = appContent.replace(
  /import \{ useMonthNavigation \} from '\.\/hooks\/hooks_common\.js';/,
  `import { useMonthNavigation } from './components/common/common_common';`
);

// Write updated App.js
fs.writeFileSync('C:/hr-system/src/App.js', appContent, 'utf8');

console.log('✅ App.js imports updated successfully!');
