const fs = require('fs');

const hrRoutesPath = 'C:/hr-system/server/routes/hrRoutes.js';
let content = fs.readFileSync(hrRoutesPath, 'utf8');

console.log('🔧 날짜 처리 수정 시작...\n');

// 1. parseDateString 함수 수정
const oldParseDateString = `// YYYY-MM-DD 문자열을 한국 시간 기준 Date 객체로 변환
const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  // YYYY-MM-DD 형식의 문자열을 한국 시간(KST) 기준으로 파싱
  const [year, month, day] = dateStr.split('-').map(Number);
  // 한국 시간 00:00:00으로 설정 (로컬 시간대가 Asia/Seoul로 설정되어 있음)
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};`;

const newParseDateString = `// YYYY-MM-DD 문자열을 한국 시간 기준 Date 객체로 변환
const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  // moment-timezone을 사용하여 KST 기준 00:00:00으로 Date 객체 생성
  // DB에는 UTC로 저장되지만, KST로 읽을 때 정확한 날짜가 표시됨
  return moment.tz(dateStr, 'YYYY-MM-DD', 'Asia/Seoul').startOf('day').toDate();
};`;

if (content.includes(oldParseDateString)) {
  content = content.replace(oldParseDateString, newParseDateString);
  console.log('✅ 1. parseDateString 함수를 moment-timezone으로 수정');
} else {
  console.log('⚠️  1. parseDateString 함수가 이미 수정되었거나 형식이 다름');
}

// 2. 직원 등록 시 joinDate 파싱 추가
const oldEmployeePost = `// ✅ 직원 등록
router.post('/employees', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('❌ 직원 등록 실패:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});`;

const newEmployeePost = `// ✅ 직원 등록
router.post('/employees', async (req, res) => {
  try {
    // 날짜 문자열을 KST Date로 변환
    if (req.body.joinDate && typeof req.body.joinDate === 'string') {
      req.body.joinDate = parseDateString(req.body.joinDate);
    }
    if (req.body.leaveDate && typeof req.body.leaveDate === 'string') {
      req.body.leaveDate = parseDateString(req.body.leaveDate);
    }

    const employee = new Employee(req.body);
    await employee.save();
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('❌ 직원 등록 실패:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});`;

if (content.includes(oldEmployeePost)) {
  content = content.replace(oldEmployeePost, newEmployeePost);
  console.log('✅ 2. 직원 등록 시 날짜 파싱 추가');
} else {
  console.log('⚠️  2. 직원 등록 코드를 찾을 수 없음 (이미 수정되었거나 형식이 다름)');
}

// 3. 직원 수정 시 joinDate/leaveDate 파싱 추가 (line 104 근처)
// 먼저 기존 직원 수정 라우트를 찾음
const employeePutRegex = /\/\/ ✅ 직원 정보 수정\s+router\.put\('\/employees\/:id'[\s\S]*?res\.status\(500\)\.json\(\{ success: false, error: error\.message \}\);[\s\S]*?\}\);/;
const match = content.match(employeePutRegex);

if (match) {
  const oldEmployeePut = match[0];

  // console.log 다음에 날짜 파싱 코드 추가
  const newEmployeePut = oldEmployeePut.replace(
    /console\.log\('📥 직원 정보 수정 요청:',[\s\S]*?\}\);/,
    `$&

    // 날짜 문자열을 KST Date로 변환
    if (req.body.joinDate && typeof req.body.joinDate === 'string') {
      req.body.joinDate = parseDateString(req.body.joinDate);
    }
    if (req.body.leaveDate && typeof req.body.leaveDate === 'string') {
      req.body.leaveDate = parseDateString(req.body.leaveDate);
    }`
  );

  content = content.replace(oldEmployeePut, newEmployeePut);
  console.log('✅ 3. 직원 수정 시 날짜 파싱 추가');
} else {
  console.log('⚠️  3. 직원 수정 코드를 찾을 수 없음');
}

fs.writeFileSync(hrRoutesPath, content, 'utf8');
console.log('\n✅ 모든 날짜 처리 수정 완료!');
console.log('이제 다음 항목들이 정확하게 저장됩니다:');
console.log('  - 연차 신청/수정 날짜');
console.log('  - 직원 입사일/퇴사일');
