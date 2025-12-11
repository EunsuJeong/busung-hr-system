const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// Step 1: Remove the hook call from its current location (after useSuggestionApproval)
const hookToRemove = `
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

content = content.replace(hookToRemove, '');
console.log('✅ Removed useStaffLeave hook from incorrect location');

// Step 2: Add it after remainAnnualLeave calculation
const searchStr = `  const remainAnnualLeave = totalAnnualLeave - usedAnnualLeave;`;
const replaceStr = `  const remainAnnualLeave = totalAnnualLeave - usedAnnualLeave;

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
  });`;

content = content.replace(searchStr, replaceStr);
console.log('✅ Added useStaffLeave hook after remainAnnualLeave calculation');

fs.writeFileSync(path, content, 'utf8');
console.log('🎉 Fixed hook initialization order!');
