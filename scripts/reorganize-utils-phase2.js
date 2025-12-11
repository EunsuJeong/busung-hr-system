const fs = require('fs');
const path = require('path');

const utilsDir = path.join(__dirname, '../src/utils');
const appJsPath = path.join(__dirname, '../src/App.js');

console.log('🔄 Utils 폴더 재구성 Phase 2 시작...\n');

// Step 1: utils_admin_dashboard.js 생성
console.log('📝 생성 중: utils_admin_dashboard.js');
const dashboardUtilsPath = path.join(utilsDir, 'dashboardUtils.js');
if (fs.existsSync(dashboardUtilsPath)) {
  const dashboardContent = fs.readFileSync(dashboardUtilsPath, 'utf-8');
  const adminDashboardContent = `/**
 * [2_관리자 모드] 2.1_대시보드 유틸리티
 * - 출근 상태별 직원 조회
 * - 출근 직원 목록 정렬
 * - 통계 계산 함수들
 */

${dashboardContent}
`;
  fs.writeFileSync(path.join(utilsDir, 'utils_admin_dashboard.js'), adminDashboardContent, 'utf-8');
  console.log('✅ utils_admin_dashboard.js 생성 완료\n');
}

// Step 2: utils_admin_payroll.js 생성 (payrollUtils.js + salaryUtils.js의 관리자 부분)
console.log('📝 생성 중: utils_admin_payroll.js');
const payrollUtilsPath = path.join(utilsDir, 'payrollUtils.js');
const salaryUtilsPath = path.join(utilsDir, 'salaryUtils.js');

let adminPayrollContent = `/**
 * [2_관리자 모드] 2.9_급여 관리 유틸리티
 * - 급여 데이터 관리
 * - 수당 계산
 * - 공제 계산
 */

`;

// payrollUtils.js 전체 내용 추가
if (fs.existsSync(payrollUtilsPath)) {
  const payrollContent = fs.readFileSync(payrollUtilsPath, 'utf-8');
  adminPayrollContent += `// ============ payrollUtils.js ============\n`;
  adminPayrollContent += payrollContent;
  adminPayrollContent += '\n';
}

// salaryUtils.js에서 관리자 모드 부분만 추출 (calcAllowances, calcDeductions)
if (fs.existsSync(salaryUtilsPath)) {
  const salaryContent = fs.readFileSync(salaryUtilsPath, 'utf-8');
  const lines = salaryContent.split('\n');

  // calcAllowances 함수 추출 (lines 11-21)
  adminPayrollContent += '\n// ============ salaryUtils.js - Admin functions ============\n';
  adminPayrollContent += lines.slice(10, 21).join('\n');
  adminPayrollContent += '\n\n';

  // calcDeductions 함수 추출 (lines 23-34)
  adminPayrollContent += lines.slice(22, 34).join('\n');
  adminPayrollContent += '\n';
}

fs.writeFileSync(path.join(utilsDir, 'utils_admin_payroll.js'), adminPayrollContent, 'utf-8');
console.log('✅ utils_admin_payroll.js 생성 완료\n');

// Step 3: utils_staff_salary.js 생성 (salaryUtils.js의 일반직원 부분)
console.log('📝 생성 중: utils_staff_salary.js');
if (fs.existsSync(salaryUtilsPath)) {
  const salaryContent = fs.readFileSync(salaryUtilsPath, 'utf-8');
  const lines = salaryContent.split('\n');

  let staffSalaryContent = `/**
 * [3_일반직원 모드] 3.6_급여 내역 유틸리티
 * - 급여 마스킹
 * - 급여 내역 생성
 */

`;

  // maskSalary 함수 (lines 1-9)
  staffSalaryContent += lines.slice(0, 9).join('\n');
  staffSalaryContent += '\n\n';

  // generateSalaryHistory 함수 (lines 36-191)
  staffSalaryContent += lines.slice(35, 191).join('\n');
  staffSalaryContent += '\n';

  fs.writeFileSync(path.join(utilsDir, 'utils_staff_salary.js'), staffSalaryContent, 'utf-8');
  console.log('✅ utils_staff_salary.js 생성 완료\n');
}

// Step 4: utils_admin_filters.js 생성
console.log('📝 생성 중: utils_admin_filters.js');
const filterUtilsPath = path.join(utilsDir, 'filterUtils.js');
if (fs.existsSync(filterUtilsPath)) {
  const filterContent = fs.readFileSync(filterUtilsPath, 'utf-8');
  const adminFiltersContent = `/**
 * [2_관리자 모드] 필터링 유틸리티
 * - 2.10_평가 관리 필터링
 * - 2.3_공지 관리 필터링
 * - 2.7_건의 관리 필터링
 * - 2.6_연차 관리 필터링
 */

${filterContent}
`;
  fs.writeFileSync(path.join(utilsDir, 'utils_admin_filters.js'), adminFiltersContent, 'utf-8');
  console.log('✅ utils_admin_filters.js 생성 완료\n');
}

// Step 5: utils_admin_sorts.js 생성
console.log('📝 생성 중: utils_admin_sorts.js');
const sortUtilsPath = path.join(utilsDir, 'sortUtils.js');
if (fs.existsSync(sortUtilsPath)) {
  const sortContent = fs.readFileSync(sortUtilsPath, 'utf-8');
  const adminSortsContent = `/**
 * [2_관리자 모드] 정렬 유틸리티
 * - 2.6_연차 관리 정렬
 * - 2.7_건의 관리 정렬
 * - 2.10_평가 관리 정렬
 * - 2.2_직원 관리 정렬
 */

${sortContent}
`;
  fs.writeFileSync(path.join(utilsDir, 'utils_admin_sorts.js'), adminSortsContent, 'utf-8');
  console.log('✅ utils_admin_sorts.js 생성 완료\n');
}

// Step 6: 기존 파일들을 @@old 폴더로 이동
const oldDir = path.join(utilsDir, '@@old', '251105_utils_reorganize');
if (!fs.existsSync(oldDir)) {
  fs.mkdirSync(oldDir, { recursive: true });
}

console.log('\n📦 기존 파일 이동 중...');
const filesToMove = [
  'dashboardUtils.js',
  'payrollUtils.js',
  'salaryUtils.js',
  'filterUtils.js',
  'sortUtils.js'
];

filesToMove.forEach(file => {
  const sourcePath = path.join(utilsDir, file);
  const targetPath = path.join(oldDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, targetPath);
    console.log(`✅ 이동: ${file} → @@old/251105_utils_reorganize/`);
  }
});

console.log('\n✅ Utils 폴더 재구성 Phase 2 완료!');
console.log('\n📊 생성된 파일:');
console.log('  - utils_admin_dashboard.js');
console.log('  - utils_admin_payroll.js');
console.log('  - utils_admin_filters.js');
console.log('  - utils_admin_sorts.js');
console.log('  - utils_staff_salary.js');
console.log('\n⚠️  다음 단계: App.js의 import 경로를 수동으로 업데이트해야 합니다.');
