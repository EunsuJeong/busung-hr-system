const fs = require('fs');

const hrRoutesPath = 'C:/hr-system/server/routes/hrRoutes.js';
const content = fs.readFileSync(hrRoutesPath, 'utf8');
const lines = content.split('\n');

// Insert date parsing code after line 167 (try {)
const insertCode = [
  '    // 날짜 문자열을 KST Date로 변환',
  '    if (req.body.joinDate && typeof req.body.joinDate === \'string\') {',
  '      req.body.joinDate = parseDateString(req.body.joinDate);',
  '    }',
  '    if (req.body.leaveDate && typeof req.body.leaveDate === \'string\') {',
  '      req.body.leaveDate = parseDateString(req.body.leaveDate);',
  '    }',
  ''
];

// Insert after line 167 (index 167, which is the "  try {" line)
lines.splice(168, 0, ...insertCode);

fs.writeFileSync(hrRoutesPath, lines.join('\n'), 'utf8');
console.log('✅ 직원 POST 라우트에 날짜 파싱 추가 완료');
