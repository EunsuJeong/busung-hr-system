const mongoose = require('mongoose');
require('dotenv').config();

const EmployeeSchema = new mongoose.Schema({}, { collection: 'employees', strict: false });
const Employee = mongoose.model('Employee', EmployeeSchema);

async function debugSorting() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    const employees = await Employee.find({ status: '재직' }).lean();

    console.log(`📊 재직 중인 직원 ${employees.length}명\n`);

    // 직책별 분포 확인
    const positionCount = {};
    employees.forEach(emp => {
      const pos = emp.position || '미정';
      positionCount[pos] = (positionCount[pos] || 0) + 1;
    });

    console.log('📋 직책별 분포:');
    Object.entries(positionCount).sort((a, b) => b[1] - a[1]).forEach(([pos, count]) => {
      console.log(`  ${pos}: ${count}명`);
    });

    // 샘플 직원 10명 출력
    console.log('\n📋 샘플 직원 10명 (세부부서 + 직책):');
    employees.slice(0, 10).forEach(emp => {
      console.log(`  ${emp.name} | 부서: ${emp.department} | 세부부서: ${emp.subDepartment || '없음'} | 직책: ${emp.position}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ 완료');
  } catch (error) {
    console.error('❌ 오류:', error);
    await mongoose.connection.close();
  }
}

debugSorting();
