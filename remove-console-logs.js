const fs = require('fs');
const path = require('path');

// 파일 경로 목록
const files = [
  'src/components/common/common_admin_notice.js',
  'src/components/common/common_admin_leave.js',
  'src/components/common/common_admin_notification.js',
  'src/components/common/common_admin_attendance.js',
  'src/components/admin/AdminNoticeManagement.js',
  'src/components/common/common_staff_suggestion.js',
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  파일 없음: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const result = [];
  let inConsoleLog = false;
  let consoleLogBuffer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // console.log 시작 감지
    if (trimmed.startsWith('console.log(')) {
      inConsoleLog = true;
      consoleLogBuffer = line;

      // 한 줄로 완료되는 경우
      if (trimmed.endsWith(');')) {
        inConsoleLog = false;
        consoleLogBuffer = '';
        continue;
      }
    } else if (inConsoleLog) {
      // console.log 내부
      consoleLogBuffer += '\n' + line;
      if (trimmed.endsWith(');')) {
        inConsoleLog = false;
        consoleLogBuffer = '';
        continue;
      }
    } else {
      // 일반 라인
      result.push(line);
    }
  }

  const newContent = result.join('\n');
  fs.writeFileSync(fullPath, newContent, 'utf8');
  console.log(`✅ 처리 완료: ${filePath}`);
});

console.log('\n🎉 모든 console.log 제거 완료!');
