const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  중복 직원 데이터 제거');
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

// import 추가할 위치 찾기 (useAIChat import 다음)
let importInsertLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("import useAIChat from './hooks/useAIChat'")) {
    importInsertLine = i + 1;
    console.log('📍 import 추가 위치: ' + (importInsertLine + 1) + '번째 줄');
    break;
  }
}

// generateEmployees 함수 시작과 끝 찾기
let funcStart = -1;
let funcEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const generateEmployees = () => {')) {
    funcStart = i;
    console.log('📍 generateEmployees 시작: ' + (funcStart + 1) + '번째 줄');
  }

  // generateEmployees 시작 후, "return employees;" 다음의 "  };" 찾기
  if (funcStart !== -1 && i > funcStart) {
    if (lines[i].trim() === 'return employees;') {
      // 다음 줄이 "  };"인지 확인
      if (lines[i + 1] && lines[i + 1].trim() === '};') {
        funcEnd = i + 1;
        console.log('📍 generateEmployees 끝: ' + (funcEnd + 1) + '번째 줄\n');
        break;
      }
    }
  }
}

if (funcStart === -1 || funcEnd === -1) {
  console.log('❌ generateEmployees 함수를 찾을 수 없습니다.');
  process.exit(1);
}

// 새 파일 생성
const newLines = [
  // import 섹션까지
  ...lines.slice(0, importInsertLine),
  // 새 import 추가
  "import generateEmployees from './utils/employeeDataGenerator';",
  // import 섹션 이후부터 generateEmployees 함수 시작 전까지
  ...lines.slice(importInsertLine, funcStart - 2), // 주석 2줄도 제거
  // generateEmployees 함수 끝 이후
  ...lines.slice(funcEnd + 1)
];

// 파일 저장
console.log('💾 파일 업데이트 중...');
const newContent = newLines.join('\n');
fs.writeFileSync(appPath, newContent, 'utf8');

console.log('✓ 파일 업데이트 완료\n');
console.log('📊 결과:');
console.log('  - 원본 라인 수: ' + lines.length);
console.log('  - 새 라인 수: ' + newLines.length);
console.log('  - 삭제된 라인 수: ' + (lines.length - newLines.length));
console.log('  - 삭제된 함수: generateEmployees (' + (funcStart + 1) + '-' + (funcEnd + 1) + '번째 줄)');
console.log('\n✅ 완료! import문이 추가되고 중복 코드가 제거되었습니다.');
