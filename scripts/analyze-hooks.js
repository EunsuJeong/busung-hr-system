const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, '../src/hooks');
const files = fs.readdirSync(hooksDir).filter(f => f.endsWith('.js') && !f.includes('@@'));

console.log(`📊 총 ${files.length}개 hooks 파일 분석 중...\n`);

const categorized = {
  '1_공통': [],
  '2.0_공통사항': [],
  '2.1_대시보드': [],
  '2.2_직원관리': [],
  '2.3_공지관리': [],
  '2.4_알림관리': [],
  '2.5_일정관리': [],
  '2.6_연차관리': [],
  '2.7_건의관리': [],
  '2.8_근태관리': [],
  '2.9_급여관리': [],
  '2.10_평가관리': [],
  '2.11_AI챗봇': [],
  '2.12_시스템관리': [],
  '3.0_공통사항': [],
  '3.1_사원정보': [],
  '3.2_공지사항': [],
  '3.3_알림사항': [],
  '3.4_일정및근태': [],
  '3.5_연차': [],
  '3.6_급여내역': [],
  '3.7_건의사항': [],
  '3.8_직원평가': [],
  'UNKNOWN': []
};

files.forEach(fileName => {
  const filePath = path.join(hooksDir, fileName);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').slice(0, 20);

  // 주석에서 카테고리 찾기
  let category = 'UNKNOWN';

  for (let line of lines) {
    if (line.includes('[1_공통]')) {
      category = '1_공통';
      break;
    }
    if (line.includes('[2_관리자 모드]')) {
      if (line.includes('2.0_')) category = '2.0_공통사항';
      else if (line.includes('2.1_')) category = '2.1_대시보드';
      else if (line.includes('2.2_')) category = '2.2_직원관리';
      else if (line.includes('2.3_')) category = '2.3_공지관리';
      else if (line.includes('2.4_')) category = '2.4_알림관리';
      else if (line.includes('2.5_')) category = '2.5_일정관리';
      else if (line.includes('2.6_')) category = '2.6_연차관리';
      else if (line.includes('2.7_')) category = '2.7_건의관리';
      else if (line.includes('2.8_')) category = '2.8_근태관리';
      else if (line.includes('2.9_')) category = '2.9_급여관리';
      else if (line.includes('2.10_')) category = '2.10_평가관리';
      else if (line.includes('2.11_')) category = '2.11_AI챗봇';
      else if (line.includes('2.12_')) category = '2.12_시스템관리';
      break;
    }
    if (line.includes('[3_일반직원 모드]')) {
      if (line.includes('3.0_')) category = '3.0_공통사항';
      else if (line.includes('3.1_')) category = '3.1_사원정보';
      else if (line.includes('3.2_')) category = '3.2_공지사항';
      else if (line.includes('3.3_')) category = '3.3_알림사항';
      else if (line.includes('3.4_')) category = '3.4_일정및근태';
      else if (line.includes('3.5_')) category = '3.5_연차';
      else if (line.includes('3.6_')) category = '3.6_급여내역';
      else if (line.includes('3.7_')) category = '3.7_건의사항';
      else if (line.includes('3.8_')) category = '3.8_직원평가';
      break;
    }
  }

  categorized[category].push(fileName);
});

// 결과 출력
Object.entries(categorized).forEach(([cat, files]) => {
  if (files.length > 0) {
    console.log(`\n[${cat}] (${files.length}개 파일)`);
    files.forEach(f => console.log(`  - ${f}`));
  }
});
