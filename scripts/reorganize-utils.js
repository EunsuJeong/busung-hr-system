const fs = require('fs');
const path = require('path');

const utilsDir = path.join(__dirname, '../src/utils');
const appJsPath = path.join(__dirname, '../src/App.js');

// 메뉴별 파일 매핑
const fileMapping = {
  'utils_common.js': {
    description: '[1_공통] 공통 유틸리티 함수들',
    sourceFiles: ['dateUtils.js', 'leaveCalculations.js', 'attendanceUtils.js'],
    patterns: ['[1_공통]']
  },
  'utils_admin_dashboard.js': {
    description: '[2_관리자 모드] 2.1_대시보드 유틸리티',
    sourceFiles: ['dashboardUtils.js'],
    patterns: ['[2_관리자 모드] 2.1']
  },
  'utils_admin_payroll.js': {
    description: '[2_관리자 모드] 2.9_급여 관리 유틸리티',
    sourceFiles: ['payrollUtils.js', 'salaryUtils.js'],
    patterns: ['[2_관리자 모드] 2.9', '*[2_관리자 모드] 2.9']
  },
  'utils_admin_leave.js': {
    description: '[2_관리자 모드] 2.6_연차 관리 유틸리티',
    sourceFiles: ['sortUtils.js', 'leaveCalculations.js'],
    patterns: ['[2_관리자 모드] 2.6', '*[2_관리자 모드] 2.6']
  },
  'utils_admin_evaluation.js': {
    description: '[2_관리자 모드] 2.10_평가 관리 유틸리티',
    sourceFiles: ['filterUtils.js'],
    patterns: ['[2_관리자 모드] 2.10', '*[2_관리자 모드] 2.10']
  },
  'utils_staff_attendance.js': {
    description: '[3_일반직원 모드] 3.4_회사 일정 및 근태 유틸리티',
    sourceFiles: ['attendanceColors.js'],
    patterns: ['[3_일반직원 모드] 3.4']
  },
  'utils_staff_salary.js': {
    description: '[3_일반직원 모드] 3.6_급여 내역 유틸리티',
    sourceFiles: ['salaryUtils.js'],
    patterns: ['[3_일반직원 모드] 3.6', '*[3_일반직원 모드] 3.6']
  }
};

console.log('🔄 Utils 폴더 재구성 시작...\n');

// Step 1: 새 파일들 생성
Object.entries(fileMapping).forEach(([newFileName, config]) => {
  console.log(`📝 생성 중: ${newFileName}`);

  let content = `/**\n * ${config.description}\n */\n\n`;
  const collectedFunctions = [];

  config.sourceFiles.forEach(sourceFile => {
    const sourcePath = path.join(utilsDir, sourceFile);
    if (fs.existsSync(sourcePath)) {
      const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
      const lines = sourceContent.split('\n');

      let collecting = false;
      let functionCode = '';

      lines.forEach(line => {
        // 패턴에 해당하는 주석을 찾으면 수집 시작
        const matchesPattern = config.patterns.some(pattern => {
          if (pattern.startsWith('*')) {
            return line.includes(pattern.substring(1));
          }
          return line.includes(pattern);
        });

        if (matchesPattern || (collecting && line.trim().startsWith('//'))) {
          collecting = true;
          functionCode = line + '\n';
        } else if (collecting) {
          functionCode += line + '\n';

          // export 함수의 끝을 감지
          if (line.trim() === '};' || (line.trim().endsWith(';') && !line.includes('const') && !line.includes('export'))) {
            collectedFunctions.push(functionCode);
            collecting = false;
            functionCode = '';
          }
        }
      });
    }
  });

  content += collectedFunctions.join('\n');

  const newFilePath = path.join(utilsDir, newFileName);
  fs.writeFileSync(newFilePath, content, 'utf-8');
  console.log(`✅ 생성 완료: ${newFileName} (함수 ${collectedFunctions.length}개)\n`);
});

// Step 2: 기존 파일들을 @@old 폴더로 이동
const oldDir = path.join(utilsDir, '@@old', '251105_utils_reorganize');
if (!fs.existsSync(oldDir)) {
  fs.mkdirSync(oldDir, { recursive: true });
}

const filesToMove = new Set();
Object.values(fileMapping).forEach(config => {
  config.sourceFiles.forEach(file => filesToMove.add(file));
});

console.log('\n📦 기존 파일 이동 중...');
filesToMove.forEach(file => {
  const sourcePath = path.join(utilsDir, file);
  const targetPath = path.join(oldDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, targetPath);
    console.log(`✅ 이동: ${file} → @@old/251105_utils_reorganize/`);
  }
});

// Step 3: App.js의 import 문 업데이트
console.log('\n🔄 App.js import 문 업데이트 중...');
let appContent = fs.readFileSync(appJsPath, 'utf-8');

const importUpdates = {
  'dateUtils': 'utils_common',
  'leaveCalculations': 'utils_common',
  'attendanceUtils': 'utils_common',
  'dashboardUtils': 'utils_admin_dashboard',
  'payrollUtils': 'utils_admin_payroll',
  'salaryUtils': 'utils_staff_salary',
  'sortUtils': 'utils_admin_leave',
  'filterUtils': 'utils_admin_evaluation',
  'attendanceColors': 'utils_staff_attendance'
};

Object.entries(importUpdates).forEach(([oldName, newName]) => {
  const regex = new RegExp(`from ['"]\\.\\./utils/${oldName}['"]`, 'g');
  const count = (appContent.match(regex) || []).length;
  if (count > 0) {
    appContent = appContent.replace(regex, `from '../utils/${newName}'`);
    console.log(`✅ 업데이트: ${oldName} → ${newName} (${count}개)`);
  }
});

fs.writeFileSync(appJsPath, appContent, 'utf-8');

console.log('\n✅ Utils 폴더 재구성 완료!');
console.log('\n📊 생성된 파일:');
Object.keys(fileMapping).forEach(fileName => {
  console.log(`  - ${fileName}`);
});
