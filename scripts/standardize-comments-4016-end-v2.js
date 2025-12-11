const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  App.js 4016줄~끝 주석 완전 표준화 v2');
console.log('  (패턴 기반 자동 처리)');
console.log('========================================\n');

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

console.log('🔄 4016줄~끝 주석 처리 중...\n');

const START_LINE = 4015; // 0-indexed
let changeCount = 0;
let removeCount = 0;

// 함수 정의 앞에 있는 주석만 표준화 (나머지는 모두 제거)
const functionComments = {
  // Effect hooks
  '대시보드 활성화 시 AI 추천사항 자동 분석': '// *2.1_대시보드 AI 추천 자동 분석*',
  '모델 변경 시 내부/외부 데이터 접근 스폿체크': '// *2.12_모델 스폿체크*',
  '[직원모드] 새 공지사항 푸쉬 알림': '// *3_직원모드_공지사항 푸시*',
  '[직원모드] 새 알림 푸쉬 알림': '// *3_직원모드_알림 푸시*',
  '[직원모드] 새 급여 내역 푸쉬 알림': '// *3_직원모드_급여 푸시*',
  '[직원모드] 급여 내역 초기 동기화': '// *3_직원모드_급여 초기 동기화*',
  '근태관리 연도 변경 시 해당 연도 공휴일 데이터 로드': '// *2.8_근태 연도 변경 시 공휴일 로드*',
  'attendanceSheetData 변경 시 localStorage에 자동 저장': '// *2.8_근태 데이터 자동 저장*',

  // Functions
  '모델 선택 검증 함수': '// *2.12_모델 선택 검증*',
  '모델의 내부/외부 응답 능력 스폿체크': '// *2.12_모델 응답 능력 스폿체크*',
  'API Key 저장 공통 함수': '// *2.12_API Key 저장*',
  '알림 관리 핸들러 함수들': '// *2.4_알림 핸들러*',
  '5일 만료 판정 유틸 함수': '// *2.4_알림 만료 판정*',
  '한국 날짜 형식을 timestamp로 변환하는 함수': '// *2.4_날짜 timestamp 변환*',
  '직원 알림 자동 업데이트': '// *2.4_직원 알림 자동 업데이트*',
  '사용자 변경 시 읽음 상태 초기화': '// *2.4_알림 읽음 상태 초기화*',
  '알림 읽음 처리 함수': '// *2.4_알림 읽음 처리*',
  '공지사항 읽음 처리 함수': '// *2.3_공지사항 읽음 처리*',
  '읽지 않은 알림 개수 계산': '// *2.4_읽지 않은 알림 개수*',
  '읽지 않은 공지사항 개수 계산': '// *2.3_읽지 않은 공지사항 개수*',
  '수신자 필터링 함수': '// *2.4_알림 수신자 필터링*',
  '알림 수신자 체크 함수': '// *2.4_알림 수신자 체크*',
  '반복주기 옵션': '// *2.4_반복주기 옵션*',
  '부서/직급/직책 옵션': '// *2.4_부서/직급/직책 옵션*',
  '반복 설정 모달 관련 함수들': '// *2.4_반복 설정 모달*',
  '직원 검색 상태': '// *2.4_직원 검색 상태*',
  '직원 검색 관련 함수들': '// *2.4_직원 검색*',
  '관리자용 알림 목록 생성': '// *2.4_관리자 알림 목록*',
  '통합 알림 리스트 생성': '// *2.4_통합 알림 리스트*',
  '수신자 수 계산 헬퍼 함수': '// *2.4_수신자 수 계산*',
  '알림 로그 필터링 함수': '// *2.4_알림 로그 필터링*',
  '일정 필터링 함수': '// *2.5_일정 필터링*',
  '커스텀 공휴일을 이벤트 형태로 변환': '// *2.5_커스텀 공휴일 변환*',
  '연차 갱신 알림 수신자 찾기 함수': '// *2.6_연차 갱신 알림 수신자*',
  '연차 알림 대상자 찾기 함수': '// *2.6_연차 알림 대상자*',
  '건의사항 알림 대상자 찾기 함수': '// *2.7_건의사항 알림 대상자*',
  '부서 관리자 및 대표이사 찾기 함수': '// *2.7_부서 관리자 찾기*',
  '알림 재시도 함수': '// *2.4_알림 재시도*',
  '자동 알림 전송 함수': '// *2.4_자동 알림 전송*',
  'API 연결 테스트 함수': '// *2.12_API 연결 테스트*',
  '백엔드 AI 설정 동기화 함수': '// *2.12_백엔드 AI 동기화*',
  '대시보드용 출근 상태 분석': '// *2.1_대시보드 출근 상태 분석*',
  '실제 대시보드 통계 계산 함수': '// *2.1_대시보드 통계 계산*',
  '대시보드 통계 데이터': '// *2.1_대시보드 통계 데이터*',
  '근태 관리 데이터를 employees 배열에 동기화하는 함수': '// *2.8_근태 데이터 동기화*',
  '키보드 이벤트 처리': '// *2.8_키보드 이벤트 처리*',
  '셀 선택 관리 함수': '// *2.8_셀 선택 관리*',
  '드래그 선택 시작': '// *2.8_드래그 시작*',
  '드래그 선택 중': '// *2.8_드래그 중*',
  '드래그 선택 종료': '// *2.8_드래그 종료*',
  '전역 마우스 이벤트 리스너': '// *2.8_마우스 이벤트*',
  '두 셀 사이의 범위를 계산하는 함수': '// *2.8_셀 범위 계산*',
  '편집 모드 토글 함수': '// *2.8_편집 모드 토글*',
  '선택된 셀들의 데이터를 클립보드로 복사': '// *2.8_클립보드 복사*',
  '전체 테이블 데이터를 Excel 형식으로 복사': '// *2.8_Excel 복사*',
  '인라인 붙여넣기 처리': '// *2.8_인라인 붙여넣기*',
  '선택된 셀들에 데이터 붙여넣기': '// *2.8_데이터 붙여넣기*',
  '요일목록': '// *2.4_요일목록*',
};

console.log('🔧 [1/2] 4016줄 이후 주석 처리...');

for (let i = START_LINE; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // 이미 처리한 줄은 스킵
  if (!trimmed.startsWith('//')) continue;

  // 함수 주석인지 확인
  let isFunctionComment = false;
  for (const [oldComment, newComment] of Object.entries(functionComments)) {
    if (trimmed.includes(oldComment)) {
      lines[i] = newComment;
      console.log(`  ✓ ${i + 1}줄: "${oldComment.substring(0, 40)}..." → 표준 형식`);
      changeCount++;
      isFunctionComment = true;
      break;
    }
  }

  // 함수 주석이 아니면 제거
  if (!isFunctionComment) {
    // 특수 주석들은 유지 (이미 표준화된 것들)
    if (trimmed.startsWith('// *') ||
        trimmed.startsWith('//---') ||
        trimmed.startsWith('/* ===')) {
      continue;
    }

    // 나머지 모든 주석 제거
    lines[i] = '';
    removeCount++;
  }
}

console.log(`  ✓ 총 ${removeCount}개 주석 제거`);

// 잘못 배치된 트리 블록 제거 (4989-5003)
console.log('\n🔧 [2/2] 잘못 배치된 블록 제거...');
for (let i = 4988; i <= 5002 && i < lines.length; i++) {
  if (lines[i].trim().startsWith('//')) {
    lines[i] = '';
    removeCount++;
  }
}
console.log('  ✓ 4989-5003줄: 잘못된 FUNCTIONS 블록 제거');

// 연속된 빈 줄 정리 (3개 이상 → 2개로)
const cleanedLines = [];
let emptyCount = 0;
for (const line of lines) {
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
console.log('\n💾 파일 저장 중...');
const newContent = cleanedLines.join('\n');
fs.writeFileSync(appPath, newContent, 'utf8');

console.log('✓ 완료\n');
console.log('========================================');
console.log('📊 결과');
console.log('========================================');
console.log('  - 대상 범위: 4016줄~끝');
console.log('  - 표준화된 함수 주석: ' + changeCount + '개');
console.log('  - 제거된 설명 주석: ' + removeCount + '개');
console.log('  - 원본 라인: ' + lines.length);
console.log('  - 정리 후: ' + cleanedLines.length);
console.log('  - 제거된 빈 줄: ' + (lines.length - cleanedLines.length));
console.log('\n✅ 주석 표준화 완료!');
console.log('\n백업 위치: ' + backupPath);
