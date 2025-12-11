const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('  App.js 주석 표준화');
console.log('==========================================\n');

const appPath = path.join(__dirname, '../src/App.js');
const backupPath = path.join(__dirname, '../src/App.js.backup.' + Date.now());

// 백업 생성
console.log('💾 백업 생성 중...');
fs.copyFileSync(appPath, backupPath);
console.log('✓ 백업: ' + backupPath + '\n');

// 파일 읽기
const content = fs.readFileSync(appPath, 'utf8');
const lines = content.split('\n');
console.log('📄 총 라인 수: ' + lines.length + '\n');

// 번호 매핑 (관리자 모드)
const adminMenuNumbers = {
  '대시보드': '1',
  '직원 관리': '2', '직원관리': '2',
  '공지 관리': '3', '공지관리': '3',
  '알림 관리': '4', '알림관리': '4',
  '일정 관리': '5', '일정관리': '5',
  '연차 관리': '6', '연차관리': '6',
  '건의 관리': '7', '건의관리': '7', '건의사항': '7',
  '근태 관리': '8', '근태관리': '8',
  '급여 관리': '9', '급여관리': '9', '급여': '9',
  '평가 관리': '10', '평가관리': '10', '평가': '10',
  'AI 챗봇': '11', 'AI챗봇': '11',
  '시스템 관리': '12', '시스템관리': '12'
};

// 번호 매핑 (직원 모드)
const staffMenuNumbers = {
  '사원정보': '1', '직원정보': '1',
  '공지사항': '2',
  '알림 사항': '3', '알림사항': '3',
  '회사 일정': '4', '회사일정': '4', '근태': '4',
  '연차 신청': '5', '연차신청': '5', '연차': '5',
  '급여 조회': '6', '급여조회': '6', '급여 내역': '6', '급여내역': '6',
  '건의 사항': '7', '건의사항': '7',
  '직원 평가': '8', '직원평가': '8', '평가': '8'
};

console.log('🔄 주석 패턴 변환 중...\n');

const processedLines = lines.map((line, index) => {
  // 대섹션 헤더는 그대로 유지
  if (line.includes('// [1_프로그램 기본]') ||
      line.includes('// [2_공통 - STATE]') ||
      line.includes('// [2_공통 - EFFECT]') ||
      line.includes('// [2_공통 - FUNCTIONS]') ||
      line.includes('// [3_관리자 모드 - STATE]') ||
      line.includes('// [3_관리자 모드 - EFFECT]') ||
      line.includes('// [3_관리자 모드 - FUNCTIONS]') ||
      line.includes('// [4_일반직원 모드 - STATE]') ||
      line.includes('// [4_일반직원 모드 - FUNCTIONS]') ||
      line.includes('// [5_렌더링]')) {
    return line;
  }

  // /* ========== [COMMON] ... ========== */ 패턴
  if (/\/\* =+ \[COMMON\]/.test(line)) {
    const content = line.match(/\[COMMON\]\s+(.+?)\s+=+/);
    if (content) {
      return `/* ================================\n   [1_공통] ${content[1]}\n================================ */`;
    }
  }

  // /* ========== [ADMIN] ① STATE - 대시보드 ========== */ 패턴
  if (/\/\* =+ \[ADMIN\]/.test(line)) {
    // ① 같은 원 번호 제거하고 메뉴명 추출
    const match = line.match(/\[ADMIN\]\s*[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]?\s*(STATE|FUNCTIONS|EFFECT)?\s*[-–]?\s*(.+?)\s+=+/);
    if (match) {
      const type = match[1] || '';
      let menuName = match[2].trim();

      // 괄호 안 내용 제거
      menuName = menuName.replace(/\s*\([^)]*\)/, '');

      // 번호 찾기
      let menuNum = '';
      for (const [key, num] of Object.entries(adminMenuNumbers)) {
        if (menuName.includes(key)) {
          menuNum = num;
          menuName = key;
          break;
        }
      }

      if (menuNum) {
        const typeText = type ? ` (${type})` : '';
        return `//---2.${menuNum}_관리자 모드_${menuName}${typeText}---//`;
      } else {
        return `/* ================================\n   [2_관리자 모드] ${menuName}${type ? ' (' + type + ')' : ''}\n================================ */`;
      }
    }
  }

  // /* ========== [STAFF] ① STATE - 사원정보 ========== */ 패턴
  if (/\/\* =+ \[STAFF\]/.test(line)) {
    const match = line.match(/\[STAFF\]\s*[①②③④⑤⑥⑦⑧]?\s*(STATE|UI|FUNCTIONS)?\s*[-–]?\s*(.+?)\s+=+/);
    if (match) {
      const type = match[1] || '';
      let menuName = match[2].trim();

      // 괄호 안 내용 제거
      menuName = menuName.replace(/\s*\([^)]*\)/, '');

      // 번호 찾기
      let menuNum = '';
      for (const [key, num] of Object.entries(staffMenuNumbers)) {
        if (menuName.includes(key)) {
          menuNum = num;
          menuName = key;
          break;
        }
      }

      if (menuNum) {
        const typeText = type ? ` (${type})` : '';
        return `//---3.${menuNum}_일반직원 모드_${menuName}${typeText}---//`;
      } else {
        return `/* ================================\n   [3_일반직원 모드] ${menuName}${type ? ' (' + type + ')' : ''}\n================================ */`;
      }
    }
  }

  // JSX 주석 {/* ========== [STAFF] ① UI - ... ========== */} 패턴
  if (/\{\/\* =+ \[STAFF\]/.test(line)) {
    const match = line.match(/\[STAFF\]\s*[①②③④⑤⑥⑦⑧]?\s*UI\s*[-–]\s*(.+?)\s+=+/);
    if (match) {
      let menuName = match[1].trim();

      let menuNum = '';
      for (const [key, num] of Object.entries(staffMenuNumbers)) {
        if (menuName.includes(key)) {
          menuNum = num;
          menuName = key;
          break;
        }
      }

      if (menuNum) {
        return `            {/* ---3.${menuNum}_일반직원 모드_${menuName} (UI)--- */}`;
      }
    }
  }

  // JSX 주석 {/* ========== [ADMIN] ① 대시보드 ========== */} 패턴
  if (/\{\/\* =+ \[ADMIN\]/.test(line)) {
    const match = line.match(/\[ADMIN\]\s*[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]?\s*(.+?)\s+=+/);
    if (match) {
      let menuName = match[1].trim();

      let menuNum = '';
      for (const [key, num] of Object.entries(adminMenuNumbers)) {
        if (menuName.includes(key)) {
          menuNum = num;
          menuName = key;
          break;
        }
      }

      if (menuNum) {
        return `            {/* ---2.${menuNum}_관리자 모드_${menuName} (UI)--- */}`;
      }
    }
  }

  return line;
});

// 불필요한 빈 줄 제거 (3개 이상 연속된 빈 줄을 2개로)
const cleanedLines = [];
let emptyCount = 0;
for (const line of processedLines) {
  if (line.trim() === '') {
    emptyCount++;
    if (emptyCount <= 2) {
      cleanedLines.push(line);
    }
  } else {
    emptyCount = 0;
    cleanedLines.push(line);
  }
}

// 파일 저장
console.log('💾 파일 저장 중...');
const newContent = cleanedLines.join('\n');
fs.writeFileSync(appPath, newContent, 'utf8');

console.log('✓ 완료\n');
console.log('📊 결과:');
console.log('  - 원본 라인: ' + lines.length);
console.log('  - 처리 후: ' + cleanedLines.length);
console.log('  - 변경 사항: ' + (lines.length - cleanedLines.length) + '줄 정리');
console.log('\n✅ 주석 표준화 완료!');
console.log('💡 Tip: 개발 서버가 자동 재컴파일됩니다.');
