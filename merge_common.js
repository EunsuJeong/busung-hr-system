const fs = require('fs');

// Read all 4 source files
const hooksAdminCommon = fs.readFileSync('C:/hr-system/src/hooks/hooks_admin_common.js', 'utf8');
const hooksCommon = fs.readFileSync('C:/hr-system/src/hooks/hooks_common.js', 'utf8');
const servicesCommon = fs.readFileSync('C:/hr-system/src/services/services_common.js', 'utf8');
const utilsCommon = fs.readFileSync('C:/hr-system/src/utils/utils_common.js', 'utf8');

// Extract imports from hooks_admin_common
const adminImports = [];
const adminImportMatches = hooksAdminCommon.matchAll(/^import .+ from .+;$/gm);
for (const match of adminImportMatches) {
  adminImports.push(match[0]);
}

// Extract imports from hooks_common
const commonImports = [];
const commonImportMatches = hooksCommon.matchAll(/^import .+ from .+;$/gm);
for (const match of commonImportMatches) {
  commonImports.push(match[0]);
}

// Extract imports from services_common
const serviceImports = [];
const serviceImportMatches = servicesCommon.matchAll(/^import .+ from .+;$/gm);
for (const match of serviceImportMatches) {
  serviceImports.push(match[0]);
}

// Combine and deduplicate imports
// Group React imports separately
const reactImports = new Set();
const otherImports = [];

[...adminImports, ...commonImports, ...serviceImports].forEach(imp => {
  if (imp.includes("from 'react'")) {
    // Extract what's being imported from react
    const match = imp.match(/import\s+\{([^}]+)\}/);
    if (match) {
      match[1].split(',').forEach(item => reactImports.add(item.trim()));
    }
  } else if (!otherImports.includes(imp)) {
    otherImports.push(imp);
  }
});

// Build deduplicated imports
const allImports = [];
if (reactImports.size > 0) {
  allImports.push(`import { ${Array.from(reactImports).sort().join(', ')} } from 'react';`);
}
allImports.push(...otherImports);

// Remove imports from each file content
let adminContent = hooksAdminCommon.replace(/^import .+ from .+;$\n?/gm, '').trim();
let commonContent = hooksCommon.replace(/^import .+ from .+;$\n?/gm, '').trim();
let serviceContent = servicesCommon.replace(/^\/\*\*[\s\S]*?\*\/\n?/, '').trim(); // Remove file header comment
let utilContent = utilsCommon.replace(/^\/\*\*[\s\S]*?\*\/\n?/, '').trim(); // Remove file header comment

// Remove the first comment block from admin and common
adminContent = adminContent.replace(/^\/\*\*[\s\S]*?\*\/\n?/, '');
commonContent = commonContent.replace(/^\/\*\*[\s\S]*?\*\/\n?/, '');

// Build the merged file
const mergedContent = `/**
 * [1_공통] 공통 통합 모듈
 * - Hook → Service → Util → Export
 */

${allImports.join('\n')}

// ============================================================
// [1_공통] HOOKS - 관리자 공통
// ============================================================

${adminContent}

// ============================================================
// [1_공통] HOOKS - 공통
// ============================================================

${commonContent}

// ============================================================
// [1_공통] SERVICES
// ============================================================

${serviceContent}

// ============================================================
// [1_공통] UTILS
// ============================================================

${utilContent}

// ============================================================
// [1_공통] EXPORTS (update-only)
// ============================================================

// Hook exports (관리자 공통):
// - useAdminFilters
// - useEmployeeState
// - useEmployeeSearch
// - useSortHandlers
// - useNotificationRecipients
// - useAttendanceSync
// - useScheduledNoticePublisher

// Hook exports (공통):
// - useAiChat
// - useLanguage
// - useMonthNavigation
// - useStorageSync
// - useSystemSettings
// - useAuth
// - useMidnightScheduler
// - useMenuStateReset

// Service exports:
// - HolidayService (class)
// - holidayService (instance)
// - getCompanyData

// Util exports:
// - dateUtils (날짜 관련)
// - leaveCalculations (연차 계산)
// - attendanceUtils (근태 관련)
// - permissionUtils (권한 체크)
// - uiUtils (UI 관련)
// - adminDataGenerator (generateAdmins)
// - employeeDataGenerator (generateEmployees)
`;

// Write the merged file
fs.writeFileSync('C:/hr-system/src/components/common/common_common.js', mergedContent, 'utf8');

console.log('✅ 파일 병합 완료: common_common.js');
console.log('📊 총 라인 수:', mergedContent.split('\n').length);
