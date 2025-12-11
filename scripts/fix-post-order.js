const fs = require('fs');

const hrRoutesPath = 'C:/hr-system/server/routes/hrRoutes.js';
let content = fs.readFileSync(hrRoutesPath, 'utf8');

// Fix the order: date parsing should come BEFORE new Employee()
const wrong = `  try {
    const employee = new Employee(req.body);
    // 날짜 문자열을 KST Date로 변환
    if (req.body.joinDate && typeof req.body.joinDate === 'string') {
      req.body.joinDate = parseDateString(req.body.joinDate);
    }
    if (req.body.leaveDate && typeof req.body.leaveDate === 'string') {
      req.body.leaveDate = parseDateString(req.body.leaveDate);
    }

    await employee.save();`;

const correct = `  try {
    // 날짜 문자열을 KST Date로 변환
    if (req.body.joinDate && typeof req.body.joinDate === 'string') {
      req.body.joinDate = parseDateString(req.body.joinDate);
    }
    if (req.body.leaveDate && typeof req.body.leaveDate === 'string') {
      req.body.leaveDate = parseDateString(req.body.leaveDate);
    }

    const employee = new Employee(req.body);
    await employee.save();`;

if (content.includes(wrong)) {
  content = content.replace(wrong, correct);
  fs.writeFileSync(hrRoutesPath, content, 'utf8');
  console.log('✅ 직원 POST 라우트 순서 수정 완료');
} else {
  console.log('⚠️  코드를 찾을 수 없음');
}
