const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '../src/services');

console.log('🔄 Services 폴더 재구성 시작...\n');

// 파일 매핑 정의
const fileMapping = {
  'services_common.js': {
    description: '[1_공통] 공통 서비스',
    files: ['holidayService.js', 'companyDataService.js']
  },
  'services_admin_analytics.js': {
    description: '[2_관리자 모드] 2.1_대시보드 분석/통계 서비스',
    files: ['analyticsService.js']
  },
  'services_admin_leave.js': {
    description: '[2_관리자 모드] 2.6_연차 관리 서비스',
    files: ['annualLeaveService.js', 'leaveNotificationService.js']
  },
  'services_admin_attendance.js': {
    description: '[2_관리자 모드] 2.8_근태 관리 서비스',
    files: ['AttendanceExcelParser.js']
  },
  'services_admin_notification.js': {
    description: '[2_관리자 모드] 2.4_알림 관리 서비스',
    files: ['notificationService.js']
  },
  'services_admin_payroll.js': {
    description: '[2_관리자 모드] 2.9_급여 관리 서비스',
    files: ['payrollService.js']
  },
  'services_admin_schedule.js': {
    description: '[2_관리자 모드] 2.5_일정 관리 서비스',
    files: ['scheduleService.js']
  },
  'services_admin_suggestion.js': {
    description: '[2_관리자 모드] 2.7_건의사항 관리 서비스',
    files: ['suggestionService.js']
  }
};

// Step 1: 새 파일들 생성
Object.entries(fileMapping).forEach(([newFileName, config]) => {
  console.log(`📝 생성 중: ${newFileName}`);

  let content = `/**\n * ${config.description}\n */\n\n`;

  config.files.forEach(sourceFile => {
    const sourcePath = path.join(servicesDir, sourceFile);
    if (fs.existsSync(sourcePath)) {
      const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
      content += `// ============ ${sourceFile} ============\n`;
      content += sourceContent;
      content += '\n\n';
      console.log(`  ✅ ${sourceFile} 추가`);
    } else {
      console.log(`  ⚠️  ${sourceFile} 파일을 찾을 수 없음`);
    }
  });

  const newFilePath = path.join(servicesDir, newFileName);
  fs.writeFileSync(newFilePath, content, 'utf-8');
  console.log(`✅ ${newFileName} 생성 완료\n`);
});

// Step 2: 기존 파일들을 @@old 폴더로 이동
const oldDir = path.join(servicesDir, '@@old', '251105_services_reorganize');
if (!fs.existsSync(oldDir)) {
  fs.mkdirSync(oldDir, { recursive: true });
}

console.log('📦 기존 파일 이동 중...');
const allSourceFiles = new Set();
Object.values(fileMapping).forEach(config => {
  config.files.forEach(file => allSourceFiles.add(file));
});

allSourceFiles.forEach(file => {
  const sourcePath = path.join(servicesDir, file);
  const targetPath = path.join(oldDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, targetPath);
    console.log(`✅ 이동: ${file} → @@old/251105_services_reorganize/`);
  }
});

console.log('\n✅ Services 폴더 재구성 완료!');
console.log('\n📊 생성된 파일:');
Object.keys(fileMapping).forEach(fileName => {
  console.log(`  - ${fileName}`);
});
console.log('\n⚠️  다음 단계: import 경로 업데이트 필요');
