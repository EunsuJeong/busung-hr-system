const fs = require('fs');
const path = require('path');

console.log('🔧 App.js 공지 관리 import 경로 업데이트 시작...\n');

const appPath = path.join(__dirname, '../src/App.js');
let content = fs.readFileSync(appPath, 'utf-8');

// 1. useNoticeFileManager import 교체
const oldHookImport = /import\s+\{\s*useNoticeFileManager\s*\}\s+from\s+['\"]\.\/hooks\/hooks_admin_notice['\"];?/g;
const match1 = content.match(oldHookImport);

if (match1) {
  console.log('✓ useNoticeFileManager import 발견');
  content = content.replace(
    oldHookImport,
    `import { useNoticeManagement, filterNotices as filterNoticesFromNotice } from './components/common/common_admin_notice';`
  );
  console.log('  → useNoticeManagement + filterNotices로 변경\n');
} else {
  console.log('⚠️ useNoticeFileManager import를 찾을 수 없습니다.\n');
}

// 2. filterNotices import에서 filterNotices 제거
const oldFilterImport = /import\s+\{([^}]*filterNotices[^}]*)\}\s+from\s+['\"]\.\/utils\/utils_admin_filters['\"];?/g;
const match2 = content.match(oldFilterImport);

if (match2) {
  console.log('✓ utils_admin_filters에서 filterNotices import 발견');

  // filterNotices를 제거하고 나머지만 유지
  content = content.replace(oldFilterImport, (match, imports) => {
    const importList = imports
      .split(',')
      .map(s => s.trim())
      .filter(s => s && !s.includes('filterNotices'))
      .join(',\n  ');

    if (importList) {
      return `import {\n  ${importList}\n} from './utils/utils_admin_filters';`;
    } else {
      return ''; // 모든 import가 제거되면 전체 import 문 삭제
    }
  });
  console.log('  → filterNotices 제거 (common_admin_notice에서 import)\n');
}

// 3. useNoticeFileManager 사용을 useNoticeManagement로 변경
const oldHookUsage = /useNoticeFileManager\s*\(/g;
if (content.match(oldHookUsage)) {
  console.log('✓ useNoticeFileManager 사용 발견');
  content = content.replace(oldHookUsage, 'useNoticeManagement(');
  console.log('  → useNoticeManagement으로 변경\n');
}

// 4. filterNotices를 filterNoticesFromNotice로 변경 (또는 그대로 사용)
// 실제로는 filterNotices를 common에서 export하므로 별칭이 필요 없음
// 대신 utils_admin_filters의 filterNotices 제거 후 common에서 사용

// 파일 저장
fs.writeFileSync(appPath, content, 'utf-8');

console.log('✅ App.js import 경로 업데이트 완료!');
console.log('📝 변경 사항:');
console.log('  - useNoticeFileManager → useNoticeManagement');
console.log('  - hooks_admin_notice → components/common/common_admin_notice');
console.log('  - utils_admin_filters의 filterNotices 제거\n');
