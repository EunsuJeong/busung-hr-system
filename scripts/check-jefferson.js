const mongoose = require('mongoose');
require('dotenv').config();

const EmployeeSchema = new mongoose.Schema({}, { collection: 'employees', strict: false });
const Employee = mongoose.model('Employee', EmployeeSchema);

async function checkJefferson() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 제퍼슨 검색
    const jefferson = await Employee.findOne({
      name: { $regex: /제퍼슨/i }
    }).lean();

    if (jefferson) {
      console.log('📋 제퍼슨 직원 정보:');
      console.log(JSON.stringify(jefferson, null, 2));

      console.log('\n🔍 시프터 자동판정 조건 체크:');
      console.log(`  department: ${jefferson.department} (필요: "생산")`);
      console.log(`  subDepartment: ${jefferson.subDepartment} (필요: 열/표면/구부/인발/교정·절단/검사)`);
      console.log(`  salaryType: ${jefferson.salaryType} (필요: "시급")`);

      const targetSubdepartments = ['열', '표면', '구부', '인발', '교정·절단', '검사'];
      const isDept = jefferson.department === '생산';
      const isSubDept = targetSubdepartments.includes(jefferson.subDepartment);
      const isSalary = jefferson.salaryType === '시급';

      console.log('\n✅ 조건 충족 여부:');
      console.log(`  부서: ${isDept ? '✓' : '✗'}`);
      console.log(`  하위부서: ${isSubDept ? '✓' : '✗'}`);
      console.log(`  급여형태: ${isSalary ? '✓' : '✗'}`);
      console.log(`\n  시프터 자동판정 대상: ${isDept && isSubDept && isSalary ? '✅ 예' : '❌ 아니오'}`);
    } else {
      console.log('❌ 제퍼슨 직원을 찾을 수 없습니다.');

      // 전체 직원 목록에서 이름에 "제" 포함된 직원 검색
      const employees = await Employee.find({
        name: { $regex: /제/ }
      }).lean();

      if (employees.length > 0) {
        console.log('\n📋 "제"가 포함된 직원 목록:');
        employees.forEach(emp => {
          console.log(`  - ${emp.name} (${emp.department}/${emp.subDepartment})`);
        });
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ 완료');
  } catch (error) {
    console.error('❌ 오류:', error);
    await mongoose.connection.close();
  }
}

checkJefferson();
