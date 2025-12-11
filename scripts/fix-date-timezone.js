const fs = require('fs');

const hrRoutesPath = 'C:/hr-system/server/routes/hrRoutes.js';
let content = fs.readFileSync(hrRoutesPath, 'utf8');

// 1. moment-timezone import 추가 확인
if (!content.includes("const moment = require('moment-timezone')")) {
  const oldImport = `const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');`;

  const newImport = `const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment-timezone');`;

  content = content.replace(oldImport, newImport);
  console.log('✅ 1. moment-timezone import 추가');
}

// 2. parseDateString 함수를 moment-timezone으로 변경
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
  console.log('✅ 2. parseDateString 함수를 moment-timezone으로 수정');
} else {
  console.log('⚠️  2. parseDateString 함수를 찾을 수 없음 (이미 수정되었거나 형식이 다름)');
}

// 3. formatDateToString은 그대로 유지 (로컬 시간 기준이므로 문제없음)

fs.writeFileSync(hrRoutesPath, content, 'utf8');
console.log('\n✅ hrRoutes.js 수정 완료!');
console.log('이제 연차 신청 시 날짜가 정확하게 저장됩니다.');
