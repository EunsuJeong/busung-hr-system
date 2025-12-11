// MongoDB에 password 필드 추가 스크립트
const mongoose = require('mongoose');

async function addPasswordField() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/busung_hr');
    console.log('✅ MongoDB 연결 성공');

    const db = mongoose.connection.db;
    const collection = db.collection('employees');

    // 모든 직원 조회
    const employees = await collection.find({}).toArray();
    let updateCount = 0;

    for (const emp of employees) {
      if (emp.phone) {
        // 전화번호에서 숫자만 추출하고 뒷자리 4자리 가져오기
        const phoneNumbers = emp.phone.replace(/[^0-9]/g, '');
        const password = phoneNumbers.slice(-4);

        await collection.updateOne(
          { _id: emp._id },
          { $set: { password: password } }
        );
        updateCount++;
        console.log(
          `✓ ${emp.employeeId} (${emp.name}): ${emp.phone} → ${password}`
        );
      } else {
        console.log(`⚠ ${emp.employeeId} (${emp.name}): 전화번호 없음`);
      }
    }

    console.log(`\n✅ ${updateCount}개 직원의 비밀번호 설정 완료`);

    // 확인
    const sample = await collection.findOne({ employeeId: 'BS-257' });
    console.log('\nBS-257 확인:', {
      employeeId: sample.employeeId,
      name: sample.name,
      phone: sample.phone,
      password: sample.password,
    });

    await mongoose.connection.close();
    console.log('✅ 작업 완료');
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

addPasswordField();
