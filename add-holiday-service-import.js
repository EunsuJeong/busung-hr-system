const fs = require('fs');

const appPath = 'C:/hr-system/src/App.js';
const app = fs.readFileSync(appPath, 'utf8');

if (app.includes('import holidayService')) {
  console.log('holidayService import가 이미 있습니다.');
} else {
  const lines = app.split('\n');
  const xlsxIdx = lines.findIndex(l => l.includes('import * as XLSX'));

  if (xlsxIdx !== -1) {
    lines.splice(xlsxIdx + 1, 0, "import holidayService from './services/holidayService';");
    fs.writeFileSync(appPath, lines.join('\n'));
    console.log('holidayService import 추가 완료!');
  } else {
    console.log('XLSX import를 찾을 수 없습니다.');
  }
}
