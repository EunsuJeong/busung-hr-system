const fs = require('fs');

const hrRoutesPath = 'C:/hr-system/server/routes/hrRoutes.js';
let content = fs.readFileSync(hrRoutesPath, 'utf8');

// 연차 수정 시 날짜 파싱 추가 (400라인 근처)
const oldUpdateData = `    const updateData = Object.assign({}, req.body, {
      startDate: updateData.startDate,
      endDate: updateData.endDate,
      type: updateData.type,
      reason: updateData.reason,
      contact: updateData.contact,
    });`;

const newUpdateData = `    // 날짜 문자열을 KST Date로 변환
    if (req.body.startDate && typeof req.body.startDate === 'string') {
      req.body.startDate = parseDateString(req.body.startDate);
    }
    if (req.body.endDate && typeof req.body.endDate === 'string') {
      req.body.endDate = parseDateString(req.body.endDate);
    }

    const updateData = Object.assign({}, req.body, {
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      type: req.body.type,
      reason: req.body.reason,
      contact: req.body.contact,
    });`;

if (content.includes(oldUpdateData)) {
  content = content.replace(oldUpdateData, newUpdateData);
  console.log('✅ 연차 수정 시 날짜 파싱 추가');
} else {
  console.log('⚠️  연차 수정 대상 코드를 찾을 수 없음');
}

fs.writeFileSync(hrRoutesPath, content, 'utf8');
console.log('완료!');
