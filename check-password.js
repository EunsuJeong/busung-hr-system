// 비밀번호 확인 스크립트
const mongoose = require('mongoose');

async function checkPassword() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/busung_hr');

    const db = mongoose.connection.db;
    const collection = db.collection('employees');

    const employee = await collection.findOne({ employeeId: 'BS-257' });

    console.log('BS-257 비밀번호 확인:');
    console.log('employeeId:', employee.employeeId);
    console.log('name:', employee.name);
    console.log('password:', employee.password);

    await mongoose.connection.close();
  } catch (error) {
    console.error('오류:', error);
    process.exit(1);
  }
}

checkPassword();
