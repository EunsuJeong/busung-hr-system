const fs = require('fs');

// 파일 읽기
const hooksContent = fs.readFileSync('src/hooks/hooks_admin_schedule.js', 'utf8');
const servicesContent = fs.readFileSync('src/services/services_admin_schedule.js', 'utf8');

// Import 문 추출
const hooksImports = hooksContent.match(/import[^;]+;/g) || [];
const servicesImports = servicesContent.match(/import[^;]+;/g) || [];

// 중복 제거
const uniqueImports = [...new Set([...hooksImports, ...servicesImports])];

// 헤더 생성
const header = `/**
 * [2_관리자 모드] 2.7_일정 관리 통합 모듈
 * - Hook → Service → Export
 * - UI 컴포넌트 제외, 지원 로직만 포함
 */

${uniqueImports.join('\n')}

`;

// Hooks 섹션 추출 (import 제거)
let hooksSection = hooksContent;
hooksImports.forEach(imp => {
  hooksSection = hooksSection.replace(imp, '');
});
hooksSection = hooksSection.replace(/^\/\*\*[\s\S]*?\*\/\n/, ''); // 파일 헤더 제거
hooksSection = '// ============================================================\n' +
              '// [2_관리자 모드] 2.7_일정 관리 - HOOKS\n' +
              '// ============================================================\n\n' +
              hooksSection.trim();

// Services 섹션 추출 (import 제거, 헤더 제거)
let servicesSection = servicesContent;
servicesImports.forEach(imp => {
  servicesSection = servicesSection.replace(imp, '');
});
servicesSection = servicesSection.replace(/^\/\*\*[\s\S]*?\*\/\n/, ''); // 파일 헤더 제거
servicesSection = '\n\n// ============================================================\n' +
                 '// [2_관리자 모드] 2.7_일정 관리 - SERVICES\n' +
                 '// ============================================================\n\n' +
                 servicesSection.trim();

// 최종 병합
const merged = header + hooksSection + servicesSection + '\n';

// 파일 저장
fs.writeFileSync('src/components/common/common_admin_schedule.js', merged);

console.log('✅ 병합 완료: common_admin_schedule.js');
console.log('  - Hooks: useHolidayManagement, useScheduleManagement');
console.log('  - Services: getFilteredScheduleEvents');
console.log('  - 파일 크기:', Math.round(merged.length / 1024), 'KB');
