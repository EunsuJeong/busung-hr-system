const fs = require('fs');
const path = 'C:/hr-system/src/hooks/useAttendanceManagement.js';
let content = fs.readFileSync(path, 'utf8');

// 1. 파라미터 추가 - 기존 파라미터 마지막에 추가
const paramsToAdd = `  isEditingAttendance = false,
  handleAttendanceCopy = () => {},
  selectedCells = new Set(),
  pasteToSelectedCells = () => {},`;

// CommonDownloadService 뒤에 추가
const paramSearch = '  CommonDownloadService = {},';
const paramReplace = `  CommonDownloadService = {},
  isEditingAttendance = false,
  handleAttendanceCopy = () => {},
  selectedCells = new Set(),
  pasteToSelectedCells = () => {},`;

if (content.includes(paramSearch) && !content.includes('isEditingAttendance')) {
  content = content.replace(paramSearch, paramReplace);
  console.log('✅ useAttendanceManagement 파라미터 추가 완료');
} else {
  console.log('⏭️  파라미터가 이미 추가되어 있거나 추가할 위치를 찾을 수 없습니다.');
}

// 2. handleAttendanceKeyDown 함수 추가 (return 문 바로 앞에)
const returnSearch = `  return {
    isHolidayDate,
    getWorkTypeForDate,`;

const functionToAdd = `  // [2_관리자 모드] 2.8_근태 관리 - 키보드 이벤트 처리 (복사/붙여넣기)
  const handleAttendanceKeyDown = useCallback(
    async (e) => {
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
    },
    [isEditingAttendance, handleAttendanceCopy, selectedCells, pasteToSelectedCells, devLog]
  );

  return {
    isHolidayDate,
    getWorkTypeForDate,`;

if (content.includes(returnSearch) && !content.includes('handleAttendanceKeyDown')) {
  content = content.replace(returnSearch, functionToAdd);
  console.log('✅ handleAttendanceKeyDown 함수 추가 완료');
} else {
  console.log('⏭️  함수가 이미 추가되어 있거나 추가할 위치를 찾을 수 없습니다.');
}

// 3. return 문에 handleAttendanceKeyDown 추가
const returnEndSearch = `    uploadAttendanceXLSX,
    exportAttendanceXLSX,
  };
};`;

const returnEndReplace = `    uploadAttendanceXLSX,
    exportAttendanceXLSX,
    handleAttendanceKeyDown,
  };
};`;

if (content.includes(returnEndSearch)) {
  content = content.replace(returnEndSearch, returnEndReplace);
  console.log('✅ return 문에 handleAttendanceKeyDown 추가 완료');
} else {
  console.log('⏭️  return 문을 찾을 수 없습니다.');
}

fs.writeFileSync(path, content, 'utf8');
console.log('📄 useAttendanceManagement.js 저장 완료');
