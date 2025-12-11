const fs = require('fs');

const hrRoutesPath = 'C:/hr-system/server/routes/hrRoutes.js';
let content = fs.readFileSync(hrRoutesPath, 'utf8');

const old = `router.post('/employees', async (req, res) => {
  try {
    const employee = new Employee(req.body);`;

const newCode = `router.post('/employees', async (req, res) => {
  try {
    // 날짜 문자열을 KST Date로 변환
    if (req.body.joinDate && typeof req.body.joinDate === 'string') {
      req.body.joinDate = parseDateString(req.body.joinDate);
    }
    if (req.body.leaveDate && typeof req.body.leaveDate === 'string') {
      req.body.leaveDate = parseDateString(req.body.leaveDate);
    }

    const employee = new Employee(req.body);`;

if (content.includes(old)) {
  content = content.replace(old, newCode);
  fs.writeFileSync(hrRoutesPath, content, 'utf8');
  console.log('✅ 직원 POST 라우트에 날짜 파싱 추가 완료');
} else {
  console.log('⚠️  이미 수정되었거나 코드를 찾을 수 없음');
}
