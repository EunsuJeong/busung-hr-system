const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/common/common_admin_dashboard.js');

// 파일 읽기
let content = fs.readFileSync(filePath, 'utf8');

// 기존 주간/야간 판단 로직 (두 곳에 있음)
const oldLogic1 = `      // 주간: 06:00 ~ 18:00 (6시 ~ 18시)
      // 야간: 18:00 ~ 06:00 (18시 ~ 익일 6시)
      if (hour >= 6 && hour < 18) {
        return '주간';
      } else {
        return '야간';
      }`;

const oldLogic2 = `        // 주간: 06:00 ~ 18:00 (6시 ~ 18시)
        // 야간: 18:00 ~ 06:00 (18시 ~ 익일 6시)
        if (hour >= 6 && hour < 18) {
          return '주간';
        } else {
          return '야간';
        }`;

// 새로운 로직
const newLogic1 = `      // 주간: 03:00 ~ 16:00 (3시 ~ 16시)
      // 야간: 16:00 ~ 03:00 (16시 ~ 익일 3시)
      if (hour >= 3 && hour < 16) {
        return '주간';
      } else {
        return '야간';
      }`;

const newLogic2 = `        // 주간: 03:00 ~ 16:00 (3시 ~ 16시)
        // 야간: 16:00 ~ 03:00 (16시 ~ 익일 3시)
        if (hour >= 3 && hour < 16) {
          return '주간';
        } else {
          return '야간';
        }`;

// 로직 교체 (두 곳 모두)
content = content.replace(oldLogic1, newLogic1);
content = content.replace(oldLogic2, newLogic2);

// 파일 쓰기
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 주간/야간 출근시간 기준 변경 완료!');
console.log('📌 새로운 기준:');
console.log('  - 주간: 03:00 ~ 16:00 (3시 이상 ~ 16시 미만)');
console.log('  - 야간: 16:00 ~ 03:00 (16시 이상 또는 3시 미만)');
console.log('');
console.log('예시:');
console.log('  - 03:00 출근 → 주간');
console.log('  - 15:59 출근 → 주간');
console.log('  - 16:00 출근 → 야간');
console.log('  - 23:00 출근 → 야간');
console.log('  - 02:59 출근 → 야간');
