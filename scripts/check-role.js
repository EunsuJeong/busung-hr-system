const mongoose = require('mongoose');
require('dotenv').config();

const EmployeeSchema = new mongoose.Schema({}, { collection: 'employees', strict: false });
const Employee = mongoose.model('Employee', EmployeeSchema);

async function checkRole() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    const employees = await Employee.find({ status: '재직' }).lean();

    // 직책(role) 별 분포 확인
    const roleCount = {};
    employees.forEach(emp => {
      const role = emp.role || '미정';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });

    console.log('📋 직책(role)별 분포:');
    Object.entries(roleCount).sort((a, b) => b[1] - a[1]).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}명`);
    });

    // 샘플 직원 15명 출력
    console.log('\n📋 샘플 직원 15명 (세부부서 + 직책):');
    employees.slice(0, 15).forEach(emp => {
      console.log(`  ${emp.name} | 세부부서: ${emp.subDepartment || '없음'} | 직책(role): ${emp.role}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ 완료');
  } catch (error) {
    console.error('❌ 오류:', error);
    await mongoose.connection.close();
  }
}

checkRole();
