const fs = require('fs');

let appContent = fs.readFileSync('C:/hr-system/src/App.js', 'utf8');

// 1. utils_admin_filters import 제거 및 각 common 파일에서 import
appContent = appContent.replace(
  /import \{[^}]*filterEvaluations[^}]*filterSuggestions[^}]*filterLeaveRequests[^}]*filterNotices[^}]*\} from '\.\/utils\/utils_admin_filters';/s,
  `// Filters imported from respective common files
import { filterEvaluations } from './components/common/common_admin_evaluation';
import { filterSuggestions } from './components/common/common_admin_suggestion';
import { filterLeaveRequests } from './components/common/common_admin_leave';
import { filterNotices } from './components/common/common_admin_notice';`
);

// 2. utils_admin_sorts import 제거 및 각 common 파일에서 import
appContent = appContent.replace(
  /import \{[^}]*sortLeaveRequests[^}]*sortSuggestions[^}]*sortEvaluations[^}]*sortEmployees[^}]*\} from '\.\/utils\/utils_admin_sorts';/s,
  `// Sorts imported from respective common files
import { sortLeaveRequests } from './components/common/common_admin_leave';
import { sortSuggestions } from './components/common/common_admin_suggestion';
import { sortEvaluations } from './components/common/common_admin_evaluation';
import { sortEmployees } from './components/common/common_admin_employee';`
);

fs.writeFileSync('C:/hr-system/src/App.js', appContent, 'utf8');
console.log('✅ App.js imports updated');
