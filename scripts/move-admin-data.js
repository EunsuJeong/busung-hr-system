const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  관리자 데이터 생성 함수 분리');
console.log('========================================\n');

const appPath = path.join(__dirname, '../src/App.js');
const backupPath = path.join(__dirname, '../src/App.js.backup.' + Date.now());

// 백업 생성
console.log('💾 백업 생성 중...');
fs.copyFileSync(appPath, backupPath);
console.log('✓ 백업: ' + backupPath + '\n');

// 파일 읽기
const content = fs.readFileSync(appPath, 'utf8');
const lines = content.split('\n');
console.log('📄 총 라인 수: ' + lines.length + '\n');

// 1. import 추가 위치 찾기 (generateEmployees import 다음)
let importInsertLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("import generateEmployees from './utils/employeeDataGenerator'")) {
    importInsertLine = i + 1;
    console.log('📍 import 추가 위치: ' + (importInsertLine + 1) + '번째 줄');
    break;
  }
}

// 2. generateAdmins 함수 시작과 끝 찾기
let funcStart = -1;
let funcEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const generateAdmins = () => {')) {
    funcStart = i - 1; // "// Generate admin users based on image data" 주석 포함
    console.log('📍 generateAdmins 시작: ' + (funcStart + 1) + '번째 줄');
  }

  if (funcStart !== -1 && i > funcStart) {
    if (lines[i].trim() === '};' && lines[i-1].includes('return adminData;')) {
      funcEnd = i;
      console.log('📍 generateAdmins 끝: ' + (funcEnd + 1) + '번째 줄\n');
      break;
    }
  }
}

if (funcStart === -1 || funcEnd === -1) {
  console.log('❌ generateAdmins 함수를 찾을 수 없습니다.');
  process.exit(1);
}

// 3. 새 파일 생성
const newLines = [
  // import 섹션까지
  ...lines.slice(0, importInsertLine),
  // 새 import 추가
  "import generateAdmins from './utils/adminDataGenerator';",
  // import 섹션 이후부터 generateAdmins 함수 시작 전까지
  ...lines.slice(importInsertLine, funcStart),
  // 주석으로 대체
  '  // ==========================================',
  '  // generateAdmins 함수는 utils/adminDataGenerator.js로 분리됨',
  '  // 사용처:',
  '  //   - [1_공통] 로그인/인증 (handleLogin)',
  '  //   - [2.4_관리자 모드_알림 관리] (대표이사 찾기)',
  '  // ==========================================',
  '',
  // generateAdmins 함수 끝 이후
  ...lines.slice(funcEnd + 1)
];

// 4. 파일 저장
console.log('💾 파일 업데이트 중...');
const newContent = newLines.join('\n');
fs.writeFileSync(appPath, newContent, 'utf8');

console.log('✓ 완료\n');
console.log('📊 결과:');
console.log('  - 원본 라인 수: ' + lines.length);
console.log('  - 새 라인 수: ' + newLines.length);
console.log('  - 삭제된 라인 수: ' + (lines.length - newLines.length));
console.log('  - 삭제된 함수: generateAdmins (' + (funcStart + 1) + '-' + (funcEnd + 1) + '번째 줄)');
console.log('  - 추가된 import: utils/adminDataGenerator.js');
console.log('\n✅ 완료! 관리자 데이터 생성 함수가 분리되었습니다.');
console.log('📁 새 파일: src/utils/adminDataGenerator.js');
