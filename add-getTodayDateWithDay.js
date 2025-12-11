const fs = require('fs');

const appPath = 'C:/hr-system/src/App.js';
const app = fs.readFileSync(appPath, 'utf8');

if (app.includes('getTodayDateWithDay')) {
  console.log('getTodayDateWithDay import가 이미 있습니다.');
} else {
  // getDayOfWeek, 다음에 getTodayDateWithDay 추가
  const updated = app.replace(
    'getDayOfWeek,\n} from',
    'getDayOfWeek,\n  getTodayDateWithDay,\n} from'
  );

  if (updated !== app) {
    fs.writeFileSync(appPath, updated);
    console.log('getTodayDateWithDay import 추가 완료!');
  } else {
    console.log('패턴을 찾을 수 없습니다.');
  }
}
