const fs = require('fs');

// File 1: AppWithSocket.js
let content = fs.readFileSync('C:/hr-system/src/AppWithSocket.js', 'utf8');
content = content.replace(
  /import \{ useAttendanceSync \} from '\.\/hooks\/hooks_admin_common';/,
  `import { useAttendanceSync } from './components/common/common_common';`
);
fs.writeFileSync('C:/hr-system/src/AppWithSocket.js', content, 'utf8');
console.log('✅ AppWithSocket.js updated');

// File 2: AdminScheduleManagement.js
content = fs.readFileSync('C:/hr-system/src/components/admin/AdminScheduleManagement.js', 'utf8');
content = content.replace(
  /import holidayService from '\.\.\/\.\.\/services\/services_common';/,
  `import holidayService from '../common/common_common';`
);
fs.writeFileSync('C:/hr-system/src/components/admin/AdminScheduleManagement.js', content, 'utf8');
console.log('✅ AdminScheduleManagement.js updated');

// File 3: CommonDownloadService.js
content = fs.readFileSync('C:/hr-system/src/components/common/CommonDownloadService.js', 'utf8');
content = content.replace(
  /import \{[^}]+\} from '\.\.\/\.\.\/utils\/utils_common';/s,
  `import {
  getDaysInMonth,
  getDayOfWeek,
  DAY_NAMES_WITH_PARENTHESES,
} from './common_common';`
);
fs.writeFileSync('C:/hr-system/src/components/common/CommonDownloadService.js', content, 'utf8');
console.log('✅ CommonDownloadService.js updated');

// File 4: common_admin_attendance.js
content = fs.readFileSync('C:/hr-system/src/components/common/common_admin_attendance.js', 'utf8');
content = content.replace(
  /import \{ getDateKey, getDayOfWeek, getDaysInMonth \} from '\.\.\/\.\.\/utils\/utils_common';/,
  `import { getDateKey, getDayOfWeek, getDaysInMonth } from './common_common';`
);
fs.writeFileSync('C:/hr-system/src/components/common/common_admin_attendance.js', content, 'utf8');
console.log('✅ common_admin_attendance.js updated');

// File 5: common_admin_dashboard.js
content = fs.readFileSync('C:/hr-system/src/components/common/common_admin_dashboard.js', 'utf8');
content = content.replace(
  /import \{ getDaysInMonth \} from '\.\.\/\.\.\/utils\/utils_common';/,
  `import { getDaysInMonth } from './common_common';`
);
fs.writeFileSync('C:/hr-system/src/components/common/common_admin_dashboard.js', content, 'utf8');
console.log('✅ common_admin_dashboard.js updated');

console.log('\n✅ All remaining imports updated successfully!');
