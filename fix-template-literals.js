const fs = require('fs');
const path = 'C:/hr-system/src/hooks/useDashboardStats.js';
let content = fs.readFileSync(path, 'utf8');

// Fix escaped template literals
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$\{/g, '${');

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Template literal escape 문제 수정 완료');
