const fs = require('fs');
const path = require('path');

console.log('🔧 Dashboard common 파일 import 경로 수정 시작...\n');

const dashboardPath = path.join(__dirname, '../src/components/common/common_admin_dashboard.js');
let content = fs.readFileSync(dashboardPath, 'utf-8');

console.log('📖 현재 파일 읽기 완료\n');

// 잘못된 import 수정
// 1. 중복된 import 제거 및 경로 수정
content = content.replace(
  /import \* as CommonDownloadService from '\.\.\/components\/common\/CommonDownloadService';/g,
  `import * as CommonDownloadService from './CommonDownloadService';`
);

// 2. 중복 import 제거 및 경로 수정
content = content.replace(
  /import \{\nimport \{ getDaysInMonth \} from '\.\.\/utils\/utils_common';/g,
  `import { getDaysInMonth } from '../../utils/utils_common';`
);

// 파일 저장
fs.writeFileSync(dashboardPath, content, 'utf-8');

console.log('✅ Import 경로 수정 완료!\n');
console.log('📝 변경 사항:');
console.log('  - CommonDownloadService 경로: ./CommonDownloadService');
console.log('  - utils_common 경로: ../../utils/utils_common');
console.log('  - 중복 import 제거\n');
