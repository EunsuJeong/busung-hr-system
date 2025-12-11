const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

console.log('=== App.js 업데이트 시작 ===\n');

// 1. import에 useDashboardStats 추가
const importSearch = `import { useAttendanceManagement } from './hooks/useAttendanceManagement';`;
const importReplace = `import { useAttendanceManagement } from './hooks/useAttendanceManagement';
import { useDashboardStats } from './hooks/useDashboardStats';`;

if (!content.includes('useDashboardStats')) {
  content = content.replace(importSearch, importReplace);
  console.log('✅ useDashboardStats import 추가');
} else {
  console.log('⏭️  useDashboardStats import 이미 존재');
}

// 2. calculateDashboardStats + dashboardStatsReal 제거
const statsToRemove = `  // [2_관리자 모드] 2.1_대시보드 - 통계 계산
  const calculateDashboardStats = () => {
    devLog('🔍 getDashboardStatsByDateReal 호출됨');
    const stats = {
      present: 0,
      late: 0,
      absent: 0,
      leave: 0,
      nightPresent: 0,
      nightLate: 0,
      nightAbsent: 0,
      nightLeave: 0,
      totalDayShift: 0,
      totalNightShift: 0,
    };

    let targetDate, targetYesterday;

    if (dashboardDateFilter === 'today') {
      targetDate = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      targetYesterday = yesterday.toISOString().split('T')[0];
    } else {
      targetDate = dashboardSelectedDate;
      const selectedDate = new Date(dashboardSelectedDate);
      selectedDate.setDate(selectedDate.getDate() - 1);
      targetYesterday = selectedDate.toISOString().split('T')[0];
    }

    devLog('🔍 대상 날짜:', { targetDate, targetYesterday });
    devLog('🔍 총 직원 수:', employees.length);

    employees.forEach((emp) => {
      const workType = emp.workType || '주간';
      const leaveType = emp.leaveType || null;

      if (leaveType === '휴직') {
        return;
      }

      if (workType === '주간' || !workType) {
        stats.totalDayShift++;
        const targetDateObj = new Date(targetDate);
        const attendanceData = getAttendanceForEmployee(
          emp.id,
          targetDateObj.getFullYear(),
          targetDateObj.getMonth() + 1,
          targetDateObj.getDate()
        );

        let status = '결근';
        status = analyzeAttendanceStatusForDashboard(
          attendanceData,
          targetDateObj.getFullYear(),
          targetDateObj.getMonth() + 1,
          targetDateObj.getDate(),
          workType,
          leaveType
        );

        if (status === null) {
          stats.totalDayShift--;
          return;
        }

        if (status === '결근') {
          const attendanceTarget = emp.attendance
            ? emp.attendance.find((att) => att.date === targetDate)
            : null;
          if (attendanceTarget) {
            status = attendanceTarget.status;
          }
        }

        devLog(\`🔍 \${emp.name}: \${status}\`);

        switch (status) {
          case '출근':
          case '근무중':
            stats.present++;
            break;
          case '지각':
            stats.late++;
            break;
          case '결근':
            stats.absent++;
            break;
          case '연차':
            stats.leave++;
            break;
          case '휴일':
            break;
          default:
            stats.absent++;
            break;
        }
      }

      if (workType === '야간') {
        stats.totalNightShift++;
        const yesterdayDateObj = new Date(targetYesterday);
        const attendanceData = getAttendanceForEmployee(
          emp.id,
          yesterdayDateObj.getFullYear(),
          yesterdayDateObj.getMonth() + 1,
          yesterdayDateObj.getDate()
        );

        let status = '결근';
        status = analyzeAttendanceStatusForDashboard(
          attendanceData,
          yesterdayDateObj.getFullYear(),
          yesterdayDateObj.getMonth() + 1,
          yesterdayDateObj.getDate(),
          workType,
          leaveType
        );

        if (status === null) {
          stats.totalNightShift--;
          return;
        }

        if (status === '결근') {
          const attendanceTarget = emp.attendance
            ? emp.attendance.find((att) => att.date === targetYesterday)
            : null;
          if (attendanceTarget) {
            status = attendanceTarget.status;
          }
        }

        devLog(\`🔍 야간 \${emp.name}: \${status}\`);

        switch (status) {
          case '출근':
          case '근무중':
            stats.nightPresent++;
            break;
          case '지각':
            stats.nightLate++;
            break;
          case '결근':
            stats.nightAbsent++;
            break;
          case '연차':
            stats.nightLeave++;
            break;
          case '휴일':
            break;
          default:
            stats.nightAbsent++;
            break;
        }
      }
    });

    devLog('🔍 최종 통계:', stats);
    return stats;
  };

  // [2_관리자 모드] 2.1_대시보드 - 통계 데이터 (useMemo)
  const dashboardStatsReal = useMemo(() => {
    return (
      calculateDashboardStats() || {
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
        nightPresent: 0,
        nightLate: 0,
        nightAbsent: 0,
        nightLeave: 0,
        totalDayShift: 0,
        totalNightShift: 0,
      }
    );
  }, [
    employees,
    dashboardDateFilter,
    dashboardSelectedDate,
    attendanceSheetData,
  ]);

`;

if (content.includes('const calculateDashboardStats = () => {')) {
  content = content.replace(statsToRemove, '');
  console.log('✅ calculateDashboardStats + dashboardStatsReal 제거 (185줄)');
} else {
  console.log('⏭️  calculateDashboardStats를 찾을 수 없습니다 (이미 제거되었을 수 있음)');
}

// 3. useDashboardStats 훅 호출 추가 (적절한 위치에)
// 일단 다른 훅들이 호출되는 부분 찾기
const hookCallLocation = `  // *[3_일반직원 모드] 3.5_연차 신청/내역 - 연차 관리 훅*
  const { handleCancelLeave, handleLeaveFormChange, handleLeaveRequest } = useStaffLeave({`;

const hookToAdd = `  // *[2_관리자 모드] 2.1_대시보드 - 통계 관리 훅*
  const { dashboardStatsReal } = useDashboardStats({
    employees,
    dashboardDateFilter,
    dashboardSelectedDate,
    attendanceSheetData,
    getAttendanceForEmployee,
    analyzeAttendanceStatusForDashboard,
    devLog,
  });

  // *[3_일반직원 모드] 3.5_연차 신청/내역 - 연차 관리 훅*
  const { handleCancelLeave, handleLeaveFormChange, handleLeaveRequest } = useStaffLeave({`;

if (content.includes(hookCallLocation) && !content.includes('useDashboardStats({')) {
  content = content.replace(hookCallLocation, hookToAdd);
  console.log('✅ useDashboardStats 훅 호출 추가');
} else {
  console.log('⏭️  useDashboardStats 훅 호출 위치를 찾을 수 없거나 이미 추가되어 있음');
}

// 4. handleAttendanceKeyDown 제거
const keyboardHandlerToRemove = `  // [2_관리자 모드] 2.8_근태 관리 - 키보드 이벤트 처리 (복사/붙여넣기)
  const handleAttendanceKeyDown = async (e) => {
    if (!isEditingAttendance) {
      return;
    }

    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      handleAttendanceCopy();
    }

    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();

      if (selectedCells.size === 0) {
        alert('붙여넣기할 셀을 먼저 선택해주세요.');
        return;
      }

      try {
        const text = await navigator.clipboard.readText();
        if (text.trim()) {
          devLog('Ctrl+V로 붙여넣기 실행:', text);
          pasteToSelectedCells(text);
        }
      } catch (err) {
        devLog('클립보드 읽기 실패:', err);
        alert('클립보드 읽기에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };
`;

if (content.includes('const handleAttendanceKeyDown = async (e) => {')) {
  content = content.replace(keyboardHandlerToRemove, '');
  console.log('✅ handleAttendanceKeyDown 제거 (31줄)');
} else {
  console.log('⏭️  handleAttendanceKeyDown를 찾을 수 없습니다 (이미 제거되었을 수 있음)');
}

fs.writeFileSync(path, content, 'utf8');
console.log('\n📄 App.js 저장 완료');
console.log('📊 총 제거된 코드: 약 216줄');
