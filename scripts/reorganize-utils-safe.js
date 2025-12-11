const fs = require('fs');
const path = require('path');

const utilsDir = path.join(__dirname, '../src/utils');
const appJsPath = path.join(__dirname, '../src/App.js');

console.log('🔄 Utils 폴더 재구성 시작 (안전 모드)...\n');

// Step 1: utils_common.js 생성
console.log('📝 생성 중: utils_common.js');
const commonFiles = ['dateUtils.js', 'leaveCalculations.js', 'attendanceUtils.js'];
let commonContent = `/**
 * [1_공통] 공통 유틸리티 함수들
 * - 날짜 관련 함수 (dateUtils)
 * - 연차 계산 함수 (leaveCalculations)
 * - 근태 관련 함수 (attendanceUtils)
 */

`;

commonFiles.forEach(file => {
  const filePath = path.join(utilsDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    commonContent += `\n// ============ ${file} ============\n`;
    commonContent += content;
    commonContent += '\n';
  }
});

fs.writeFileSync(path.join(utilsDir, 'utils_common.js'), commonContent, 'utf-8');
console.log('✅ utils_common.js 생성 완료\n');

// Step 2: utils_staff_attendance.js 생성
console.log('📝 생성 중: utils_staff_attendance.js');
const attendanceColorsContent = fs.readFileSync(path.join(utilsDir, 'attendanceColors.js'), 'utf-8');
const staffAttendanceContent = `/**
 * [3_일반직원 모드] 3.4_회사 일정 및 근태 유틸리티
 */

${attendanceColorsContent}
`;

fs.writeFileSync(path.join(utilsDir, 'utils_staff_attendance.js'), staffAttendanceContent, 'utf-8');
console.log('✅ utils_staff_attendance.js 생성 완료\n');

// Step 3: App.js의 import 문 업데이트
console.log('🔄 App.js import 문 업데이트 중...');
let appContent = fs.readFileSync(appJsPath, 'utf-8');

const updates = [
  { from: "from '../utils/dateUtils'", to: "from '../utils/utils_common'" },
  { from: "from '../utils/leaveCalculations'", to: "from '../utils/utils_common'" },
  { from: "from '../utils/attendanceUtils'", to: "from '../utils/utils_common'" },
  { from: "from '../utils/attendanceColors'", to: "from '../utils/utils_staff_attendance'" }
];

updates.forEach(({ from, to }) => {
  const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const count = (appContent.match(regex) || []).length;
  if (count > 0) {
    appContent = appContent.replace(regex, to);
    console.log(`✅ 업데이트: ${from} → ${to} (${count}개)`);
  }
});

fs.writeFileSync(appJsPath, appContent, 'utf-8');

// Step 4: 기존 파일들을 @@old 폴더로 이동
const oldDir = path.join(utilsDir, '@@old', '251105_utils_reorganize');
if (!fs.existsSync(oldDir)) {
  fs.mkdirSync(oldDir, { recursive: true });
}

console.log('\n📦 기존 파일 이동 중...');
const filesToMove = [...commonFiles, 'attendanceColors.js'];

filesToMove.forEach(file => {
  const sourcePath = path.join(utilsDir, file);
  const targetPath = path.join(oldDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, targetPath);
    console.log(`✅ 이동: ${file} → @@old/251105_utils_reorganize/`);
  }
});

console.log('\n✅ Utils 폴더 재구성 완료!');
console.log('\n📊 생성된 파일:');
console.log('  - utils_common.js');
console.log('  - utils_staff_attendance.js');
