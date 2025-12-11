// MongoDB에서 password 필드 직접 확인 (toJSON 우회)
const mongoose = require('mongoose');

async function checkPasswords() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/busung_hr');
    console.log('✅ MongoDB 연결 성공\n');

    const db = mongoose.connection.db;
    const collection = db.collection('employees');

    // "정은수" 이름으로 검색
    const employees = await collection.find({ name: '정은수' }).toArray();

    console.log('📊 "정은수" 이름 검색 결과:\n');
    if (employees.length > 0) {
      employees.forEach((emp) => {
        console.log(`사번: ${emp.employeeId}`);
        console.log(`이름: ${emp.name}`);
        console.log(`전화번호: ${emp.phone}`);
        console.log(`Password: ${emp.password || '없음'}`);
        console.log('---');
      });
    } else {
      console.log('❌ "정은수"를 찾을 수 없습니다.');
    }

    // BS-257과 BS-189 모두 확인
    console.log('\n📊 BS-257 확인:');
    const bs257 = await collection.findOne({ employeeId: 'BS-257' });
    if (bs257) {
      console.log(`사번: ${bs257.employeeId}, 이름: ${bs257.name}`);
    }

    console.log('\n📊 BS-189 확인:');
    const bs189 = await collection.findOne({ employeeId: 'BS-189' });
    if (bs189) {
      console.log(`사번: ${bs189.employeeId}, 이름: ${bs189.name}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

checkPasswords();
