const fs = require('fs');
const path = require('path');

const utilsDir = path.join(__dirname, '../src/utils');

console.log('🔄 Utils 폴더 재구성 Phase 3 시작 (나머지 파일 병합)...\n');

// Step 1: utils_common.js에 추가
console.log('📝 utils_common.js에 파일 추가 중...');
const commonPath = path.join(utilsDir, 'utils_common.js');
let commonContent = fs.readFileSync(commonPath, 'utf-8');

// permissionUtils.js 추가
const permissionPath = path.join(utilsDir, 'permissionUtils.js');
if (fs.existsSync(permissionPath)) {
  const permissionContent = fs.readFileSync(permissionPath, 'utf-8');
  commonContent += '\n\n// ============ permissionUtils.js ============\n';
  commonContent += permissionContent;
  console.log('  ✅ permissionUtils.js 추가');
}

// uiUtils.js 추가
const uiUtilsPath = path.join(utilsDir, 'uiUtils.js');
if (fs.existsSync(uiUtilsPath)) {
  const uiContent = fs.readFileSync(uiUtilsPath, 'utf-8');
  commonContent += '\n\n// ============ uiUtils.js ============\n';
  commonContent += uiContent;
  console.log('  ✅ uiUtils.js 추가');
}

// adminDataGenerator.js 추가
const adminGenPath = path.join(utilsDir, 'adminDataGenerator.js');
if (fs.existsSync(adminGenPath)) {
  const adminGenContent = fs.readFileSync(adminGenPath, 'utf-8');
  commonContent += '\n\n// ============ adminDataGenerator.js ============\n';
  commonContent += adminGenContent;
  console.log('  ✅ adminDataGenerator.js 추가');
}

// employeeDataGenerator.js 추가
const empGenPath = path.join(utilsDir, 'employeeDataGenerator.js');
if (fs.existsSync(empGenPath)) {
  const empGenContent = fs.readFileSync(empGenPath, 'utf-8');
  commonContent += '\n\n// ============ employeeDataGenerator.js ============\n';
  commonContent += empGenContent;
  console.log('  ✅ employeeDataGenerator.js 추가');
}

fs.writeFileSync(commonPath, commonContent, 'utf-8');
console.log('✅ utils_common.js 업데이트 완료\n');

// Step 2: utils_admin_system.js에 systemLogger.js 추가
console.log('📝 utils_admin_system.js 확인 중...');
const adminSystemPath = path.join(utilsDir, 'utils_admin_system.js');
const systemLoggerPath = path.join(utilsDir, 'systemLogger.js');

if (fs.existsSync(adminSystemPath) && fs.existsSync(systemLoggerPath)) {
  let adminSystemContent = fs.readFileSync(adminSystemPath, 'utf-8');
  const systemLoggerContent = fs.readFileSync(systemLoggerPath, 'utf-8');

  // systemLogger가 이미 포함되어 있는지 확인
  if (!adminSystemContent.includes('logSystemEvent')) {
    adminSystemContent += '\n\n// ============ systemLogger.js ============\n';
    adminSystemContent += systemLoggerContent;
    fs.writeFileSync(adminSystemPath, adminSystemContent, 'utf-8');
    console.log('  ✅ systemLogger.js를 utils_admin_system.js에 추가');
  } else {
    console.log('  ℹ️  systemLogger.js 이미 포함되어 있음');
  }
} else {
  console.log('  ⚠️  utils_admin_system.js 또는 systemLogger.js를 찾을 수 없음');
}

// Step 3: utils_admin_ai.js 생성 (aiProviderUtils.js)
console.log('\n📝 생성 중: utils_admin_ai.js');
const aiProviderPath = path.join(utilsDir, 'aiProviderUtils.js');
if (fs.existsSync(aiProviderPath)) {
  const aiProviderContent = fs.readFileSync(aiProviderPath, 'utf-8');
  const adminAiContent = `/**
 * [2_관리자 모드] 2.12.9_AI Provider 유틸리티
 * - AI API Key 관리
 * - AI Provider 선택
 */

${aiProviderContent}
`;
  fs.writeFileSync(path.join(utilsDir, 'utils_admin_ai.js'), adminAiContent, 'utf-8');
  console.log('✅ utils_admin_ai.js 생성 완료\n');
}

// Step 4: 기존 파일들을 @@old 폴더로 이동
const oldDir = path.join(utilsDir, '@@old', '251105_utils_reorganize');
if (!fs.existsSync(oldDir)) {
  fs.mkdirSync(oldDir, { recursive: true });
}

console.log('📦 기존 파일 이동 중...');
const filesToMove = [
  'permissionUtils.js',
  'uiUtils.js',
  'adminDataGenerator.js',
  'employeeDataGenerator.js',
  'systemLogger.js',
  'aiProviderUtils.js'
];

filesToMove.forEach(file => {
  const sourcePath = path.join(utilsDir, file);
  const targetPath = path.join(oldDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, targetPath);
    console.log(`✅ 이동: ${file} → @@old/251105_utils_reorganize/`);
  }
});

console.log('\n✅ Utils 폴더 재구성 Phase 3 완료!');
console.log('\n📊 업데이트된 파일:');
console.log('  - utils_common.js (permissionUtils, uiUtils, adminDataGenerator, employeeDataGenerator 추가)');
console.log('  - utils_admin_system.js (systemLogger 추가 확인)');
console.log('  - utils_admin_ai.js (신규 생성)');
