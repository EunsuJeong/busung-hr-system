const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Step 1: Add useStaffLeave hook call after line 2481
const hookInsertLine = 2481; // After useSuggestionApproval closing });
const hookCode = `
  // *[3_일반직원 모드] 3.5_연차 신청/내역 - 연차 관리 훅*
  const { handleCancelLeave, handleLeaveFormChange, handleLeaveRequest } = useStaffLeave({
    leaveForm,
    setLeaveForm,
    setLeaveFormError,
    setLeaveFormPreview,
    leaveRequests,
    setLeaveRequests,
    currentUser,
    remainAnnualLeave,
    isHolidayDate,
    send자동알림,
    getText,
  });
`;

lines.splice(hookInsertLine, 0, ...hookCode.split('\n'));
console.log('✅ Added useStaffLeave hook call');

// Step 2: Remove duplicate functions
// We need to recalculate line numbers after insertion
content = lines.join('\n');
lines.length = 0;
lines.push(...content.split('\n'));

// Remove handleCancelLeave (originally 3575-3579, plus blank line 3580)
const cancelLeaveStart = `  // [3_일반직원 모드] 3.5_연차 신청/내역 - 연차 신청 취소
  const handleCancelLeave = (leaveId) => {
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === leaveId ? { ...lr, status: '취소' } : lr))
    );
  };`;

content = content.replace(cancelLeaveStart + '\n', '');
console.log('✅ Removed duplicate handleCancelLeave');

// Remove handleLeaveFormChange (originally 3709-3715, plus blank line 3716)
const leaveFormChangeStart = `  // [3_일반직원 모드] 3.5_연차 신청/내역 - 연차 폼 변경
  const handleLeaveFormChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };`;

content = content.replace(leaveFormChangeStart + '\n', '');
console.log('✅ Removed duplicate handleLeaveFormChange');

// Remove handleLeaveRequest (originally 3717-3878)
// This is a large function, so let's use markers to find it
const leaveRequestStart = `  // [3_일반직원 모드] 3.5_연차 신청/내역 - 연차 신청 요청
  const handleLeaveRequest = () => {`;
const leaveRequestEnd = `    setLeaveFormPreview(null);
  };`;

const startIdx = content.indexOf(leaveRequestStart);
if (startIdx === -1) {
  console.error('❌ Could not find handleLeaveRequest start');
  process.exit(1);
}

// Find the end from the start position
const searchFrom = startIdx + leaveRequestStart.length;
const endIdx = content.indexOf(leaveRequestEnd, searchFrom);
if (endIdx === -1) {
  console.error('❌ Could not find handleLeaveRequest end');
  process.exit(1);
}

// Remove the entire function including the end marker
const beforeFunc = content.substring(0, startIdx);
const afterFunc = content.substring(endIdx + leaveRequestEnd.length + 1); // +1 for newline

content = beforeFunc + afterFunc;
console.log('✅ Removed duplicate handleLeaveRequest');

fs.writeFileSync(path, content, 'utf8');
console.log('🎉 Successfully refactored staff leave functions!');
console.log('📊 Removed ~170 lines of duplicate code');
