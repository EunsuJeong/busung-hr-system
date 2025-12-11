const fs = require('fs');

// 파일 읽기
const hooksContent = fs.readFileSync('src/hooks/hooks_admin_leave.js', 'utf8');
const servicesContent = fs.readFileSync('src/services/services_admin_leave.js', 'utf8');
const utilsContent = fs.readFileSync('src/utils/utils_admin_leave.js', 'utf8');

// Import 문 추출
const hooksImports = hooksContent.match(/import[^;]+;/g) || [];
const servicesImports = servicesContent.match(/import[^;]+;/g) || [];
const utilsImports = utilsContent.match(/import[^;]+;/g) || [];

// 내부 참조 import 제거 (services_admin_leave, utils_admin_leave 등)
const filterInternalImports = (imports) => {
  return imports.filter(imp =>
    !imp.includes('services_admin_leave') &&
    !imp.includes('utils_admin_leave')
  );
};

const filteredHooksImports = filterInternalImports(hooksImports);
const filteredServicesImports = filterInternalImports(servicesImports);
const filteredUtilsImports = filterInternalImports(utilsImports);

// 중복 제거
const uniqueImports = [...new Set([
  ...filteredHooksImports,
  ...filteredServicesImports,
  ...filteredUtilsImports
])];

// 헤더 생성
const header = `/**
 * [2_관리자 모드] 2.5_연차 관리 통합 모듈
 * - Hook → Service → Util → Export
 * - UI 컴포넌트 제외, 지원 로직만 포함
 */

${uniqueImports.join('\n')}

`;

// Hooks 섹션 추출 (모든 import 제거)
let hooksSection = hooksContent;
hooksImports.forEach(imp => {
  hooksSection = hooksSection.replace(imp, '');
});
hooksSection = hooksSection.replace(/^\/\*\*[\s\S]*?\*\/\n/, ''); // 파일 헤더 제거
hooksSection = '// ============================================================\n' +
              '// [2_관리자 모드] 2.5_연차 관리 - HOOKS\n' +
              '// ============================================================\n\n' +
              hooksSection.trim();

// Services 섹션 추출 (모든 import 제거, 헤더 제거)
let servicesSection = servicesContent;
servicesImports.forEach(imp => {
  servicesSection = servicesSection.replace(imp, '');
});
servicesSection = servicesSection.replace(/^\/\*\*[\s\S]*?\*\/\n/, ''); // 파일 헤더 제거
servicesSection = '\n\n// ============================================================\n' +
                 '// [2_관리자 모드] 2.5_연차 관리 - SERVICES\n' +
                 '// ============================================================\n\n' +
                 servicesSection.trim();

// Utils 섹션 추출 (모든 import 제거, 헤더 제거)
let utilsSection = utilsContent;
utilsImports.forEach(imp => {
  utilsSection = utilsSection.replace(imp, '');
});
utilsSection = utilsSection.replace(/^\/\*\*[\s\S]*?\*\/\n/, ''); // 파일 헤더 제거
utilsSection = '\n\n// ============================================================\n' +
              '// [2_관리자 모드] 2.5_연차 관리 - UTILS\n' +
              '// ============================================================\n\n' +
              utilsSection.trim();

// 최종 병합
const merged = header + hooksSection + servicesSection + utilsSection + '\n';

// 파일 저장
fs.writeFileSync('src/components/common/common_admin_leave.js', merged);

console.log('✅ 병합 완료: common_admin_leave.js');
console.log('  - Hooks: useAnnualLeaveEditor, useLeaveApproval, useAnnualLeaveManager');
console.log('  - Services: getNextAnnualPeriod, calculateCarryOverLeave, 알림 생성/조회 함수들');
console.log('  - Utils: filterLeaveRequests, sortLeaveRequests, calculateEmployeeAnnualLeave');
console.log('  - 파일 크기:', Math.round(merged.length / 1024), 'KB');
console.log('  - Import 필터링: 내부 참조 import 제거 완료');
