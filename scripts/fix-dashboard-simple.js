const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../src/utils/@@old/251105_utils_reorganize/dashboardUtils.js');
const dst = path.join(__dirname, '../src/utils/utils_admin_dashboard.js');

console.log('🔧 파일 복구 시작...\n');

// Read source file
const content = fs.readFileSync(src, 'utf-8');

// Write header
const fixed = `/**
 * [2_관리자 모드] 2.1_대시보드 유틸리티
 * - 출근 상태별 직원 조회
 * - 출근 직원 목록 정렬
 * - 통계 계산 함수들
 */

${content.substring(content.indexOf('// [2_'))}`;

// Save
fs.writeFileSync(dst, fixed, 'utf-8');

console.log('✅ 1단계: 헤더 복구 완료\n');

// Now fix Korean patterns
let c = fs.readFileSync(dst, 'utf-8');

// Fix patterns line by line for better control
c = c.split('\n').map(line => {
  return line
    .replace(/\[2_ �� ��\]/g, '[2_관리자 모드]')
    .replace(/2\.1_ ���/g, '2.1_대시보드')
    .replace(/�� ���/g, '출근 상태')
    .replace(/�� �\]/g, '직원 목록')
    .replace(/p�i��/g, '조회')
    .replace(/h�/g, '반환')
    .replace(/�� �([^])/g, '매개변수$1')
    .replace(/p�\`/g, '조회할')
    .replace(/\| �4/g, '야간 근무')
    .replace(/�� D0/g, '날짜 필터')
    .replace(/ � ��/g, '선택된 날짜')
    .replace(/�� pt0 p� h/g, '출근 데이터 조회 함수')
    .replace(/�� �� � h/g, '출근 상태 분석 함수')
    .replace(/ \\� h/g, '개발 로그 함수')
    .replace(/D0� �� �\]/g, '필터링된 직원 목록')
    .replace(/'�'/g, "'주간'")
    .replace(/'4�'/g, "'퇴사'");
}).join('\n');

fs.writeFileSync(dst, c, 'utf-8');

console.log('✅ 2단계: 한글 패턴 수정 완료\n');
console.log('📁 저장 경로:', dst);
