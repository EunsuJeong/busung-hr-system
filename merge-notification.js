const fs = require('fs');

// 파일 읽기
const hooksContent = fs.readFileSync('src/hooks/hooks_admin_notification.js', 'utf8');
const servicesContent = fs.readFileSync('src/services/services_admin_notification.js', 'utf8');
const noticeContent = fs.readFileSync('src/components/common/common_admin_notice.js', 'utf8');

// Import 문 추출
const hooksImports = hooksContent.match(/import[^;]+;/g) || [];
const noticeImports = noticeContent.match(/import[^;]+;/g) || [];

// 중복 제거
const uniqueImports = [...new Set([...hooksImports, ...noticeImports])];

// 헤더 생성
const header = `/**
 * [2_관리자 모드] 2.4_알림 관리 통합 모듈
 * - Hook → Service → Util → Export
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
              '// [2_관리자 모드] 2.4_알림 관리 - HOOKS\n' +
              '// ============================================================\n\n' +
              hooksSection.trim();

// Services 섹션 추출 (import 제거, 헤더 제거)
let servicesSection = servicesContent;
servicesSection = servicesSection.replace(/^\/\*\*[\s\S]*?\*\/\n/, ''); // 파일 헤더 제거
servicesSection = '\n\n// ============================================================\n' +
                 '// [2_관리자 모드] 2.4_알림 관리 - SERVICES\n' +
                 '// ============================================================\n\n' +
                 servicesSection.trim();

// Notice Util 섹션 추출 (filterNotices만)
let noticeSection = noticeContent;
noticeImports.forEach(imp => {
  noticeSection = noticeSection.replace(imp, '');
});
noticeSection = noticeSection.replace(/^\/\*\*[\s\S]*?\*\/\n/, '');

// filterNotices 함수만 추출
const filterNoticesMatch = noticeSection.match(/\/\/ =+[\s\S]*?export const filterNotices[\s\S]*?^};/m);
if (filterNoticesMatch) {
  noticeSection = '\n\n// ============================================================\n' +
                 '// [2_관리자 모드] 2.3_공지 관리 - UTILS\n' +
                 '// ============================================================\n\n' +
                 filterNoticesMatch[0].replace(/\/\/ =+[\s\S]*?\n/, '').trim();
} else {
  noticeSection = '';
}

// useNoticeManagement Hook 추출
const noticeHookMatch = noticeContent.match(/export const useNoticeManagement[\s\S]*?^};/m);
let noticeHookSection = '';
if (noticeHookMatch) {
  noticeHookSection = '\n\n// *[2_관리자 모드] 2.3_공지 관리 훅*\n' + noticeHookMatch[0].trim();
}

// 최종 병합
const merged = header + hooksSection + noticeHookSection + servicesSection + noticeSection + '\n';

// 파일 저장
fs.writeFileSync('src/components/common/common_admin_notification.js', merged);

console.log('✅ 병합 완료: common_admin_notification.js');
console.log('  - Hooks: useNotificationRecurring, useAdminNotifications, useEmployeeNotifications, useNoticeManagement');
console.log('  - Services: createNotificationHandlers, get관리자알림목록, send자동알림 등');
console.log('  - Utils: filterNotices');
console.log('  - 파일 크기:', Math.round(merged.length / 1024), 'KB');
