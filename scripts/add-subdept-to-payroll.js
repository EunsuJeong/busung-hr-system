const fs = require('fs');

const payrollPath = 'C:/hr-system/src/components/common/common_admin_payroll.js';
let content = fs.readFileSync(payrollPath, 'utf8');

// 1. 급여 초기화 시 세부부서 추가
const oldInit = `      return {
        지급년도: currentYear,
        지급월: currentMonth,
        성명: emp.name,
        부서: emp.department || '미정',
        직급: emp.position || '사원',`;

const newInit = `      return {
        지급년도: currentYear,
        지급월: currentMonth,
        성명: emp.name,
        부서: emp.department || '미정',
        세부부서: emp.subDepartment || '',
        직급: emp.position || '사원',`;

if (content.includes(oldInit)) {
  content = content.replace(oldInit, newInit);
  console.log('✅ 1. 급여 초기화 시 세부부서 추가');
} else {
  console.log('❌ 1. 급여 초기화 코드를 찾을 수 없음');
}

// 2. 엑셀 파싱 시 세부부서 추가 (914-942 라인 근처)
const oldParse = `            const 부서 = parseText(row[2]) || '미지정';

            const 성명 = parseText(row[4]) || '이름없음';
            const 직급 = parseText(row[5]) || '미지정';`;

const newParse = `            const 부서 = parseText(row[2]) || '미지정';
            const 세부부서 = parseText(row[3]) || '';
            const 성명 = parseText(row[4]) || '이름없음';
            const 직급 = parseText(row[5]) || '미지정';`;

if (content.includes(oldParse)) {
  content = content.replace(oldParse, newParse);
  console.log('✅ 2. 엑셀 파싱 시 세부부서 추가');
} else {
  console.log('⚠️  2. 엑셀 파싱 코드를 찾을 수 없음 (이미 수정되었거나 형식이 다름)');
}

// 3. 파싱된 데이터에 세부부서 포함
const oldParseData = `              부서: registeredEmployee.department,
              직급: registeredEmployee.position,`;

const newParseData = `              부서: registeredEmployee.department,
              세부부서: registeredEmployee.subDepartment || 세부부서,
              직급: registeredEmployee.position,`;

if (content.includes(oldParseData)) {
  content = content.replace(oldParseData, newParseData);
  console.log('✅ 3. 파싱 데이터에 세부부서 포함');
} else {
  console.log('⚠️  3. 파싱 데이터 코드를 찾을 수 없음');
}

// 4. 새 데이터 생성 시 세부부서 포함
const oldNewData = `              성명: registeredEmployee.name,
              부서: registeredEmployee.department || '미지정',
              직급: registeredEmployee.position || '사원',`;

const newNewData = `              성명: registeredEmployee.name,
              부서: registeredEmployee.department || '미지정',
              세부부서: registeredEmployee.subDepartment || '',
              직급: registeredEmployee.position || '사원',`;

if (content.includes(oldNewData)) {
  content = content.replace(oldNewData, newNewData);
  console.log('✅ 4. 새 데이터 생성 시 세부부서 포함');
} else {
  console.log('⚠️  4. 새 데이터 생성 코드를 찾을 수 없음');
}

// 5. DB 동기화 시 세부부서 포함
const oldSync = `                name: item.성명,
                department: item.부서,`;

const newSync = `                name: item.성명,
                department: item.부서,
                subDepartment: item.세부부서,`;

if (content.includes(oldSync)) {
  content = content.replace(oldSync, newSync);
  console.log('✅ 5. DB 동기화 시 세부부서 포함');
} else {
  console.log('⚠️  5. DB 동기화 코드를 찾을 수 없음');
}

fs.writeFileSync(payrollPath, content, 'utf8');
console.log('\n✅ 저장 완료!');
