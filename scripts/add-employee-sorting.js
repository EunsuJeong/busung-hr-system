const fs = require('fs');

// 1. 근태 관리 정렬 추가
const attendancePath = 'C:/hr-system/src/components/common/common_admin_attendance.js';
let attendanceContent = fs.readFileSync(attendancePath, 'utf8');

const attendanceOldCode = `      return true;
    });
  }, [
    employees,
    attendanceSearchFilter,
    attendanceSheetData,
    attendanceSheetYear,
    attendanceSheetMonth,
  ]);`;

const attendanceNewCode = `      return true;
    }).sort((a, b) => {
      // 정렬 우선순위 배열
      const subDeptOrder = ['대표', '임원', '관리', '영업', '출하', '품질', '생산관리', '열', '표면', '구부', '인발', '교정·절단', '검사', '금형', '공무', '가공'];
      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '팀원'];

      // 1순위: 세부부서명
      const subDeptA = subDeptOrder.indexOf(a.subDepartment);
      const subDeptB = subDeptOrder.indexOf(b.subDepartment);
      const subDeptCompare = (subDeptA === -1 ? 999 : subDeptA) - (subDeptB === -1 ? 999 : subDeptB);

      if (subDeptCompare !== 0) return subDeptCompare;

      // 2순위: 직책
      const posA = positionOrder.indexOf(a.position);
      const posB = positionOrder.indexOf(b.position);
      return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
    });
  }, [
    employees,
    attendanceSearchFilter,
    attendanceSheetData,
    attendanceSheetYear,
    attendanceSheetMonth,
  ]);`;

if (attendanceContent.includes(attendanceOldCode)) {
  attendanceContent = attendanceContent.replace(attendanceOldCode, attendanceNewCode);
  fs.writeFileSync(attendancePath, attendanceContent, 'utf8');
  console.log('✅ 1. 근태 관리 정렬 추가 완료');
} else {
  console.log('❌ 1. 근태 관리 대상 코드를 찾을 수 없음');
}

// 2. 급여 관리 정렬 추가
const payrollPath = 'C:/hr-system/src/components/common/common_admin_payroll.js';
let payrollContent = fs.readFileSync(payrollPath, 'utf8');

const payrollOldCode = `      return true;
    });
  }, [payrollTableData, payrollSearchFilter]);

  return filteredPayrollData;
};`;

const payrollNewCode = `      return true;
    }).sort((a, b) => {
      // 정렬 우선순위 배열
      const subDeptOrder = ['대표', '임원', '관리', '영업', '출하', '품질', '생산관리', '열', '표면', '구부', '인발', '교정·절단', '검사', '금형', '공무', '가공'];
      const positionOrder = ['대표', '임원', '팀장', '반장', '조장', '팀원'];

      // 급여 테이블은 세부부서 정보가 없을 수 있으므로 성명 기준으로 직원 찾기 필요
      // 여기서는 직급만으로 정렬 (세부부서 정보는 row에 없음)
      const posA = positionOrder.indexOf(a.직급);
      const posB = positionOrder.indexOf(b.직급);
      return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
    });
  }, [payrollTableData, payrollSearchFilter]);

  return filteredPayrollData;
};`;

if (payrollContent.includes(payrollOldCode)) {
  payrollContent = payrollContent.replace(payrollOldCode, payrollNewCode);
  fs.writeFileSync(payrollPath, payrollContent, 'utf8');
  console.log('✅ 2. 급여 관리 정렬 추가 완료 (직급 기준만)');
  console.log('⚠️  급여 테이블에 세부부서 정보가 없어 직급 기준으로만 정렬됩니다.');
} else {
  console.log('❌ 2. 급여 관리 대상 코드를 찾을 수 없음');
}

console.log('\n완료!');
