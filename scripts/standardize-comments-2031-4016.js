const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  App.js 2031~4016줄 주석 완전 표준화');
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

console.log('🔄 모든 주석 표준화 중...\n');

let changeCount = 0;

// 주석 변환 규칙 (라인별)
const commentRules = {
  // 2_관리자 모드_시스템 관리
  2031: { old: '🔄 API Key 입력 시 자동 Provider 감지 및 모델 목록 로드', new: '// *2.12_API Key 자동 감지*' },
  2046: { old: '첫 번째 모델 자동 선택', new: '' }, // 제거
  2070: { old: '💾 통합 AI 설정 저장 함수', new: '// *2.12_AI 설정 저장*' },
  2107: { old: '3초 후 메시지 자동 제거', new: '' }, // 제거
  2140: { old: '백엔드에서 AI 설정 로드', new: '' }, // 제거
  2148: { old: '통합 UI에도 반영', new: '' }, // 제거
  2165: { old: '🚀 통합 AI 질의 함수 (CommonAIService wrapper)', new: '// *2.12_통합 AI 질의*' },
  2166: { old: '통합 AI 키/프로바이더 참조 (추천사항 + 챗봇 공유)', new: '' }, // 제거
  2168: { old: '통합 AI 설정에서 API Key 가져오기 (우선순위)', new: '' }, // 제거
  2172: { old: '레거시: 개별 설정 (하위 호환성)', new: '' }, // 제거
  2177: { old: '통합 AI 설정에서 Provider 가져오기 (우선순위)', new: '' }, // 제거
  2185: { old: '레거시: 실제로 키가 있는 프로바이더 우선 선택', new: '' }, // 제거
  2193: { old: '선택된 모델 타입 상태 관리', new: '// *2.12_선택 모델 타입*' },
  2198: { old: '실제 모델 사용 상태 관리 (선택된 모델만 사용중)', new: '// *2.12_모델 사용 상태*' },
  2205: { old: 'API 연결 상태', new: '// *2.12_API 연결 상태*' },
  2212: { old: '동적으로 로드된 모델 목록 저장', new: '// *2.12_동적 모델 목록*' },
  2219: { old: 'AI 챗봇 권한 관리 상태 - 관리자 시스템이므로 모든 권한 기본 활성화', new: '// *2.11_챗봇 권한 관리*' },
  2225: { old: "          read: true, // 읽기 권한 (관리자 전용 시스템)", new: "          read: true," },
  2226: { old: "          modify: true, // 수정 권한 (관리자 전용 시스템)", new: "          modify: true," },
  2227: { old: "          download: true, // 다운로드 권한 (관리자 전용 시스템)", new: "          download: true," },
  2232: { old: '// These functions must be defined before useAIChat hook', new: '' }, // 제거
  2242: { old: "      type, // 'DB_CONNECTION', 'API_ERROR', 'AUTH_FAILURE', 'NETWORK_ERROR', 'DATA_ACCESS', 'MODEL_CHANGE' 등", new: "      type," },
  2249: { old: "      priority, // 'LOW', 'INFO', 'WARNING', 'HIGH', 'CRITICAL'", new: "      priority," },
  2251: { old: "      ipAddress: '192.168.1.100', // 실제 환경에서는 클라이언트 IP 수집", new: "      ipAddress: '192.168.1.100'," },
  2255: { old: '    // 콘솔 로깅 (우선순위별 색상)', new: '' }, // 제거
  2269: { old: '    // 🔐 관리자 전용 상세 로그 저장', new: '' }, // 제거
  2275: { old: '      // 관리자 로그는 최근 500개 유지', new: '' }, // 제거
  2279: { old: '      // 일반 사용자용 요약 로그도 별도 저장', new: '' }, // 제거
  2296: { old: '    // 🚨 중요한 이벤트는 관리자 알림 생성', new: '' }, // 제거
  2308: { old: '      // 1. DB/ERP 연동 설정 확인', new: '' }, // 제거
  2314: { old: '          // 실제 DB/ERP API 호출 시도', new: '' }, // 제거
  2322: { old: '            signal: AbortSignal.timeout(10000), // 10초 타임아웃', new: '            signal: AbortSignal.timeout(10000),' },
  2356: { old: '          // DB 연동 실패 시 상세 에러 처리 및 로깅', new: '' }, // 제거
  2378: { old: '          // 관리자에게 알림', new: '' }, // 제거
  2385: { old: '      // 2. 로컬 데이터 사용 (DB 미연동 또는 실패 시)', new: '' }, // 제거
  2407: { old: '      // 오늘 날짜 출근 데이터를 attendanceSheetData에서 생성', new: '' }, // 제거
  2441: { old: "        .filter((att) => att.status !== '결근' || att.checkIn || att.checkOut); // 기록이 있는 것만", new: "        .filter((att) => att.status !== '결근' || att.checkIn || att.checkOut);" },
  2561: { old: '      // 데이터 무결성 검증 로그', new: '' }, // 제거
  2579: { old: '      // 전체 시스템 오류 처리', new: '' }, // 제거
  2601: { old: '  // AI 챗봇 커스텀 훅 사용', new: '' }, // 제거
  2624: { old: '채팅 컨테이너 자동 스크롤을 위한 ref', new: '// *2.11_채팅 스크롤 ref*' },
  2627: { old: '채팅 메시지 자동 스크롤 - 메시지 업데이트 시 항상 마지막으로 이동', new: '// *2.11_채팅 자동 스크롤*' },
  2635: { old: '급여 데이터 실시간 동기화 - payrollByMonth 변경 시 localStorage 저장', new: '// *2.9_급여 데이터 동기화*' },
  2641: { old: '      // 5MB 이상이면 데이터 제한 (localStorage 최대 용량 고려)', new: '' }, // 제거
  2643: { old: '        // 최근 3개월 데이터만 저장', new: '' }, // 제거
  2651: { old: '        // 최근 3개월 키만 필터링', new: '' }, // 제거
  2669: { old: '        // 용량 초과 시 현재 월만 저장', new: '' }, // 제거
  2691: { old: '급여 해시 실시간 동기화 - payrollHashes 변경 시 localStorage 저장', new: '// *2.9_급여 해시 동기화*' },
  2700: { old: 'AI 모델별 사용 가능한 모델 타입 정의 (CommonAIService에서 import)', new: '// *2.11_AI 모델 타입*' },
  2703: { old: 'AI 모델 목록 및 상태', new: '// *2.11_AI 모델 목록*' },
  2715: { old: 'AI 추천사항 프롬프트 설정', new: '// *2.1_AI 프롬프트 설정*' },
  2725: { old: '  // AI 추천사항 커스텀 훅 사용', new: '' }, // 제거
  2737: { old: '각종 팝업 상태', new: '// *2.1_팝업 상태*' },
  2742: { old: '출근현황 팝업 정렬 관련', new: '// *2.1_출근현황 정렬*' },
  2745: { old: '대시보드 팝업 상태', new: '// *2.1_대시보드 팝업*' },
  2751: { old: '목표달성률 상세 팝업 데이터', new: '// *2.1_목표달성률 팝업*' },
  2755: { old: '워라밸 지표 월별 상세 팝업 데이터', new: '// *2.1_워라밸 팝업*' },
  2759: { old: '평균 특근시간 팝업 정렬 상태', new: '// *2.1_특근시간 정렬*' },
  2764: { old: '연차 사용률 팝업 정렬 상태', new: '// *2.1_연차사용률 정렬*' },
  2769: { old: '주 52시간 위반 팝업 정렬 상태', new: '// *2.1_52시간 위반 정렬*' },
  2774: { old: '대시보드 출근현황 날짜 필터링 상태', new: '// *2.1_날짜 필터링*' },
  2780: { old: '대시보드 주간/야간 현황 실시간 연동 상태', new: '// *2.1_출근현황 연동*' },
  2783: { old: '날짜 필터링된 대시보드 통계 계산 함수는 나중에 정의됨', new: '' }, // 제거
  2785: { old: '대시보드 통계 데이터 최적화 - 메모이제이션으로 성능 개선', new: '' }, // 제거
  2786: { old: '(calculateDashboardStats 정의 전까지 기본값 사용)', new: '' }, // 제거
  2798: { old: '52시간 위반 알림 시스템', new: '// *2.1_52시간 위반 알림*' },
  2818: { old: '    // 우선순위 결정: 52시간 이상 HIGH, 50시간 MEDIUM, 48시간 LOW', new: '' }, // 제거
  2822: { old: '    // 수신자 결정: 관리자, 대표/대표/대표, 임원/임원/총괄, 관리/관리/팀장 (당사자 제외)', new: '' }, // 제거
  2825: { old: '    // 1. 대표', new: '' }, // 제거
  2834: { old: '    // 2. 임원/임원/총괄', new: '' }, // 제거
  2843: { old: '    // 3. 관리/관리/팀장', new: '' }, // 제거
  2852: { old: '    // 중복 제거 및 당사자 제외', new: '' }, // 제거
  2881: { old: '    // 정기 알림 목록에 추가', new: '' }, // 제거
  2884: { old: '    // 알림 로그에 추가', new: '' }, // 제거
  2903: { old: '    // 알림 로그 콘솔 출력', new: '' }, // 제거
  2915: { old: '52시간 근무시간 자동 체크 (주간 근무시간 계산 후 알림 발송)', new: '// *2.1_52시간 자동 체크*' },
  2922: { old: '      // 매주 월요일 오전 9시에만 체크 (중복 방지)', new: '' }, // 제거
  2931: { old: '      // 지난 주 월요일~일요일 범위 계산', new: '' }, // 제거
  2940: { old: '        // 지난 주 근무시간 집계', new: '' }, // 제거
  2963: { old: '        // 48시간, 50시간, 52시간 임계치 체크', new: '' }, // 제거
  2973: { old: '      // 체크 완료 기록', new: '' }, // 제거
  2977: { old: '    // 초기 체크', new: '' }, // 제거
  2980: { old: '    // 매시간 체크 (월요일 오전 9시에만 실행되도록 조건 있음)', new: '' }, // 제거
  2986: { old: '연도별 목표달성률 데이터 생성 함수 - 실제 데이터 기반 계산', new: '// *2.1_목표달성률 데이터 생성*' },
  2990: { old: '    // 실제 출근 데이터를 기반으로 월별 통계 계산', new: '' }, // 제거
  2999: { old: '      // 미래 월은 null 처리', new: '' }, // 제거
  3006: { old: '        // 대표단 제외 필터링', new: '' }, // 제거
  3042: { old: '        // 퇴사율: 해당 월에 퇴사한 직원 수 (대표단 제외)', new: '' }, // 제거
  3076: { old: '워라밸 지표 연도별 데이터 생성 함수 - attendanceSheetData 기반 실제 계산', new: '// *2.1_워라밸 데이터 생성*' },
  3081: { old: '    // 월별 데이터 계산', new: '' }, // 제거
  3090: { old: '      // 미래 월은 null 처리', new: '' }, // 제거
  3099: { old: '      // 1. 평균 특근시간 계산 (해당 월)', new: '' }, // 제거
  3147: { old: '      // 2. 연차 사용률 계산', new: '' }, // 제거
  3153: { old: '      // 3. 주 52시간 위반율 계산 (해당 월의 모든 주 확인)', new: '' }, // 제거
  3187: { old: '      // 4. 스트레스 지수 계산 (해당 월 평균, calculateStressIndex와 동일한 로직)', new: '' }, // 제거
  3195: { old: '        // 1. 근무시간 스트레스 (해당 월의 주간 근무시간 기준) - 최대 40점', new: '' }, // 제거
  3199: { old: '        // 해당 월을 주 단위로 나누어서 각 주의 근무시간 계산', new: '' }, // 제거
  3224: { old: '          // 매주 일요일마다 주간 근무시간 계산', new: '' }, // 제거
  3240: { old: '        // 근무 데이터가 없으면 스트레스 지수 계산 안함', new: '' }, // 제거
  3245: { old: '        // 주간 평균으로 정규화', new: '' }, // 제거
  3250: { old: '        // 2. 휴식시간 스트레스 (연차 사용률) - 최대 30점', new: '' }, // 제거
  3264: { old: '        // 3. 업무강도 스트레스 (직급 기준) - 최대 30점', new: '' }, // 제거
  3284: { old: '52시간 위반 상세 정보 생성 함수', new: '// *2.1_52시간 위반 상세*' },
  3286: { old: '    // [5] 주 52시간 위반 데이터 실시간 동기화', new: '' }, // 제거
  3290: { old: '    // 대표단 제외 필터링', new: '' }, // 제거
  3323: { old: '        // 매주 일요일마다 또는 월말에 주간 근무시간 체크', new: '' }, // 제거
  3339: { old: '          // 다음 주 시작', new: '' }, // 제거
  3346: { old: '    // 위반시간 내림차순 정렬', new: '' }, // 제거
  3352: { old: '워라밸 지표 월별 상세 데이터 추출 함수', new: '// *2.1_워라밸 상세 데이터*' },
  3354: { old: '    // month: 0-11 (1월-12월)', new: '' }, // 제거
  3358: { old: '    // 대표단 제외 필터링', new: '' }, // 제거
  3364: { old: '      // [2] 직원별 특근 총 시간 (7개 항목별 분리) - 근태 관리 합계와 동일한 로직 사용', new: '' }, // 제거
  3393: { old: '            // 근태 관리와 동일한 categorizeWorkTime 함수 사용', new: '' }, // 제거
  3401: { old: '            // 각 항목별 시간 누적 (근태 관리 합계와 동일 로직)', new: '' }, // 제거
  3410: { old: '            // 추가 특근 관련 타입들도 누적 (근태 관리와 동일)', new: '' }, // 제거
  3437: { old: '      // 급여형태 > 특근시간 > 직원명 정렬', new: '' }, // 제거
  3448: { old: '      // 직원별 해당 월 연차 사용일 (일자 포함)', new: '' }, // 제거
  3474: { old: '      // 날짜 > 직원명 정렬', new: '' }, // 제거
  3482: { old: '      // 주 52시간 위반 직원 목록 (주차별로 표시)', new: '' }, // 제거
  3484: { old: '        // 해당 월의 모든 주를 확인', new: '' }, // 제거
  3489: { old: '        // 주의 시작을 월요일로 맞춤', new: '' }, // 제거
  3500: { old: '          // 해당 주의 근무시간 계산', new: '' }, // 제거
  3506: { old: '            if (d < monthStart || d > monthEnd) continue; // 해당 월 범위 확인', new: '            if (d < monthStart || d > monthEnd) continue;' },
  3553: { old: '          // 다음 주로 이동', new: '' }, // 제거
  3558: { old: '      // 직원명 오름차순 → 해당 주 기간 오름차순 정렬', new: '' }, // 제거
  3569: { old: '목표달성률 상세 데이터 추출 함수 (날짜별 직원 상태) - attendanceSheetData 기반', new: '// *2.1_목표달성률 상세*' },
  3571: { old: '    // month: 0-11 (1월-12월)', new: '' }, // 제거
  3575: { old: '    // 대표단 제외 필터링', new: '' }, // 제거
  3580: { old: '    // metric에 따라 필터링', new: '' }, // 제거
  3584: { old: '      // 퇴사율은 해당 월에 퇴사한 직원 필터링 (대표단 제외)', new: '' }, // 제거
  3606: { old: '      // 출근/지각/결근 데이터 수집 (대표단 제외)', new: '' }, // 제거
  3643: { old: '          // [2] 출근률 상세 팝업 전용 - 주말 출근자 표시', new: '' }, // 제거
  3656: { old: '          // 평일 데이터 - 주말/공휴일 제외', new: '' }, // 제거
  3658: { old: '            // metric에 맞는 상태만 추가', new: '' }, // 제거
  3681: { old: '    // 날짜별로 그룹화', new: '' }, // 제거
  3697: { old: '    // 배열로 변환하여 날짜순 정렬 - 줄 단위 형식으로 변환', new: '' }, // 제거
  3703: { old: '        // 날짜 형식 변경: YYYY-MM-DD → YYYY/MM/DD', new: '' }, // 제거
  3706: { old: '        // 직원명 리스트 생성 (지각률일 경우 출근시간 포함)', new: '' }, // 제거
  3716: { old: '        // [3] 상세 팝업 날짜별 총 인원 표시', new: '' }, // 제거
  3725: { old: '사용 가능한 연도 목록', new: '// *2.1_사용 가능 연도*' },
  3739: { old: '// Salary password state', new: '// *3.6_급여 비밀번호*' },
  3744: { old: '  // State moved to StaffEmployeeInfo component', new: '' }, // 제거
  3747: { old: '  // expandedNotices - moved to StaffNotice component (local state)', new: '' }, // 제거
  3748: { old: '  // readAnnouncements - kept in App.js (shared with popup modal)', new: '' }, // 제거
  3755: { old: '  // expandedNotification - moved to StaffNotification component (local state)', new: '' }, // 제거
  3756: { old: '  // readNotifications - kept in App.js (shared with popup modal)', new: '' }, // 제거
  3758: { old: '읽음/읽지않음 추적 상태 (localStorage에서 복원)', new: '// *3.3_알림 읽음 상태*' },
  3800: { old: '  // ✅ 일반직원모드 글씨 크기 조절', new: '' }, // 제거
  3805: { old: '  // ✅ 모바일·태블릿 기본 글씨 크기 자동 축소 (최초 로드 시)', new: '' }, // 제거
  3811: { old: '    // localStorage에 저장된 설정이 없고 모바일/태블릿인 경우만 자동으로 small 적용', new: '' }, // 제거
  3818: { old: '  // ✅ 글씨 크기 변경 시 동적 스타일 주입', new: '' }, // 제거
  3820: { old: '    // 기존 스타일 제거', new: '' }, // 제거
  3826: { old: '    // 글씨 크기 배율 설정', new: '' }, // 제거
  3827: { old: '    let scale = 1.0; // normal', new: '    let scale = 1.0;' },
  3829: { old: '      scale = 0.95; // 5% 축소', new: '      scale = 0.95;' },
  3831: { old: '      scale = 1.1; // 10% 확대', new: '      scale = 1.1;' },
  3834: { old: '    // 동적 CSS 생성 및 주입', new: '' }, // 제거
  3854: { old: '    // 컴포넌트 언마운트 시 스타일 제거', new: '' }, // 제거
  3863: { old: '10. AI 어시스턴트 관련', new: '// *1_공통_AI 어시스턴트*' },
  3868: { old: '11. AI 분석 기능 관련', new: '// *2.1_AI 분석*' },
  3882: { old: '서버로부터 사용 가능한 모델 목록 로드 및 통합', new: '// *2.1_서버 모델 로드*' },
  3890: { old: '          // 서버 모델 + ALL_MODELS 통합 (중복 제거)', new: '' }, // 제거
  3898: { old: '            // 현재 선택된 모델이 허용 목록에 있으면 유지, 없으면 첫 번째 허용 모델 선택', new: '' }, // 제거
  3911: { old: 'AI 메시지 업데이트 시 자동 스크롤', new: '// *2.11_AI 메시지 자동 스크롤*' },
  3922: { old: '직원관리 정렬 상태', new: '// *2.2_직원관리 정렬*' },
  3924: { old: "  const [employeeSortOrder, setEmployeeSortOrder] = useState('asc'); // 'asc' | 'desc'", new: "  const [employeeSortOrder, setEmployeeSortOrder] = useState('asc');" },
  3926: { old: '연차관리 정렬 상태', new: '// *2.6_연차관리 정렬*' },
  3928: { old: "  const [leaveSortOrder, setLeaveSortOrder] = useState('asc'); // 'asc' | 'desc'", new: "  const [leaveSortOrder, setLeaveSortOrder] = useState('asc');" },
  3930: { old: '건의관리 정렬 상태', new: '// *2.7_건의관리 정렬*' },
  3932: { old: "  const [suggestionSortOrder, setSuggestionSortOrder] = useState('asc'); // 'asc' | 'desc'", new: "  const [suggestionSortOrder, setSuggestionSortOrder] = useState('asc');" },
  3934: { old: '평가관리 정렬 상태', new: '// *2.10_평가관리 정렬*' },
  3936: { old: "  const [evaluationSortOrder, setEvaluationSortOrder] = useState('asc'); // 'asc' | 'desc'", new: "  const [evaluationSortOrder, setEvaluationSortOrder] = useState('asc');" },
  3938: { old: '근태관리 렌더링 빈도 측정 상태', new: '// *2.8_렌더링 빈도 측정*' },
  3944: { old: '연차관리 정렬 상태', new: '// *2.6_연차관리 정렬 상태*' },
  3946: { old: "  const [annualLeaveSortOrder, setAnnualLeaveSortOrder] = useState('asc'); // 'asc' | 'desc'", new: "  const [annualLeaveSortOrder, setAnnualLeaveSortOrder] = useState('asc');" },
  3948: { old: '연차관리 검색 상태', new: '// *2.6_연차관리 검색*' },
  3960: { old: '건의관리 검색 상태', new: '// *2.7_건의관리 검색*' },
  3971: { old: '공지관리 검색 상태', new: '// *2.3_공지관리 검색*' },
  3979: { old: '공지관리 파일 첨부 상태', new: '// *2.3_공지 파일 첨부*' },
  3982: { old: '공지사항 데이터 상태 (제거됨 - notices 사용)', new: '' }, // 제거
  3984: { old: '평가관리 검색 상태', new: '// *2.10_평가관리 검색*' },
  3992: { old: '인라인 수정 상태', new: '// *2.2_인라인 수정*' },
  4003: { old: "    phone: '',", new: "    phone: ''," }
};

// 라인별 주석 변경 적용
for (const [lineNumStr, rule] of Object.entries(commentRules)) {
  const lineNum = parseInt(lineNumStr);
  const idx = lineNum - 1; // 0-based index

  if (idx >= 0 && idx < lines.length) {
    const line = lines[idx];

    if (rule.new === '') {
      // 주석 제거인 경우
      if (line.includes(rule.old)) {
        lines[idx] = lines[idx].replace(new RegExp('\\s*//\\s*' + rule.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*'), '');
        if (lines[idx].trim() === '') {
          lines[idx] = ''; // 완전히 빈 줄로
        }
        console.log(`  ✓ ${lineNum}줄: 주석 제거 - "${rule.old.substring(0, 50)}..."`);
        changeCount++;
      }
    } else {
      // 주석 변경인 경우
      if (line.includes(rule.old)) {
        lines[idx] = line.replace(new RegExp('//\\s*' + rule.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*'), rule.new);
        console.log(`  ✓ ${lineNum}줄: 주석 변경`);
        changeCount++;
      }
    }
  }
}

// 특별 처리: 잘못된 위치의 트리 구조 주석 블록 제거
console.log('\n🔧 잘못된 위치의 트리 구조 주석 제거...');

// 1. Line 2118-2132 블록
for (let i = 2117; i <= 2132; i++) {
  if (lines[i] && (lines[i].includes('[3_관리자 모드 - STATE]') || lines[i].includes('├─') || lines[i].includes('└─'))) {
    lines[i] = '';
    changeCount++;
  }
}
console.log('  ✓ 2118-2132줄: 잘못된 STATE 블록 제거');

// 2. Line 2452-2462 블록
for (let i = 2451; i <= 2462; i++) {
  if (lines[i] && (lines[i].includes('[4_일반직원 모드 - STATE]') || lines[i].includes('├─') || lines[i].includes('└─'))) {
    lines[i] = '';
    changeCount++;
  }
}
console.log('  ✓ 2452-2462줄: 잘못된 STATE 블록 제거');

// 3. Line 4005-4010 블록
for (let i = 4004; i <= 4010; i++) {
  if (lines[i] && (lines[i].includes('[3_관리자 모드 - EFFECT]') || lines[i].includes('├─') || lines[i].includes('└─'))) {
    lines[i] = '';
    changeCount++;
  }
}
console.log('  ✓ 4005-4010줄: 잘못된 EFFECT 블록 제거');

// 4. Line 2231-2232 블록 제거
if (lines[2230] && lines[2230].includes('/* ========== FUNCTIONS FOR useAIChat ========== */')) {
  lines[2230] = '';
  changeCount++;
  console.log('  ✓ 2231줄: FUNCTIONS FOR useAIChat 블록 제거');
}

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
console.log('  - 대상 범위: 2031~4016줄');
console.log('  - 변경 사항: ' + changeCount + '개');
console.log('  - 원본 라인: ' + lines.length);
console.log('  - 정리 후: ' + cleanedLines.length);
console.log('  - 제거된 빈 줄: ' + (lines.length - cleanedLines.length));
console.log('\n✅ 모든 주석 표준화 완료!');
console.log('\n백업 위치: ' + backupPath);
