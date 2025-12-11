const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

console.log('=== Step 3: 주석 추가 (12개) ===\n');

const commentAdditions = [
  {
    search: `  const getCellId = (empId, day, type) => {`,
    replace: `  // [2_관리자 모드] 2.8_근태 관리 - 셀 ID 생성
  const getCellId = (empId, day, type) => {`,
    name: 'getCellId',
  },
  {
    search: `  const isCellSelected = (cellId) => {`,
    replace: `  // [2_관리자 모드] 2.8_근태 관리 - 셀 선택 여부 확인
  const isCellSelected = (cellId) => {`,
    name: 'isCellSelected',
  },
  {
    search: `  const parseAttendanceFromClipboard = (rows) => {`,
    replace: `  // [2_관리자 모드] 2.8_근태 관리 - 클립보드 데이터 파싱
  const parseAttendanceFromClipboard = (rows) => {`,
    name: 'parseAttendanceFromClipboard',
  },
  {
    search: `  const clearPopupState = () => {`,
    replace: `  // [1_공통] 팝업 상태 초기화
  const clearPopupState = () => {`,
    name: 'clearPopupState',
  },
  {
    search: `  const handleLogout = () => {`,
    replace: `  // [1_공통] 로그아웃 처리
  const handleLogout = () => {`,
    name: 'handleLogout',
  },
  {
    search: `  const handleFontSizeChange = (size) => {`,
    replace: `  // [1_공통] 폰트 크기 변경
  const handleFontSizeChange = (size) => {`,
    name: 'handleFontSizeChange',
  },
  {
    search: `  const goToPrevMonth = () => {`,
    replace: `  // [1_공통] 이전 달로 이동
  const goToPrevMonth = () => {`,
    name: 'goToPrevMonth',
  },
  {
    search: `  const goToNextMonth = () => {`,
    replace: `  // [1_공통] 다음 달로 이동
  const goToNextMonth = () => {`,
    name: 'goToNextMonth',
  },
  {
    search: `  const handleAiQuery = async () => {`,
    replace: `  // [1_공통] AI 챗봇 쿼리 처리
  const handleAiQuery = async () => {`,
    name: 'handleAiQuery',
  },
  {
    search: `  useEffect(() => {
    const fetchAttendance = async () => {`,
    replace: `  // [1_공통] 근태 데이터 초기 로딩
  useEffect(() => {
    const fetchAttendance = async () => {`,
    name: 'useEffect (fetchAttendance)',
  },
  {
    search: `  const getFilteredEmployees = (emp, m) =>`,
    replace: `  // [1_공통] 필터링된 직원 목록 조회
  const getFilteredEmployees = (emp, m) =>`,
    name: 'getFilteredEmployees',
  },
  {
    search: `  const getMonthlyAttendanceData = (dataObj, m) => {`,
    replace: `  // [1_공통] 월별 근태 데이터 조회
  const getMonthlyAttendanceData = (dataObj, m) => {`,
    name: 'getMonthlyAttendanceData',
  },
  {
    search: `  const goalStats = useMemo(`,
    replace: `  // [2_관리자 모드] 2.1_대시보드 - 목표 통계
  const goalStats = useMemo(`,
    name: 'goalStats',
  },
  {
    search: `  const workLifeBalanceStats = useMemo(`,
    replace: `  // [2_관리자 모드] 2.1_대시보드 - 워라밸 통계
  const workLifeBalanceStats = useMemo(`,
    name: 'workLifeBalanceStats',
  },
];

let addedCount = 0;

commentAdditions.forEach(({ search, replace, name }) => {
  if (content.includes(search) && !content.includes(replace)) {
    content = content.replace(search, replace);
    console.log(`✅ ${name}: 주석 추가`);
    addedCount++;
  } else if (content.includes(replace)) {
    console.log(`⏭️  ${name}: 주석이 이미 존재함`);
  } else {
    console.log(`⏭️  ${name}: 함수를 찾을 수 없음`);
  }
});

fs.writeFileSync(path, content, 'utf8');
console.log(`\n📄 총 ${addedCount}개 주석 추가 완료`);
console.log('📄 App.js 저장 완료\n');
