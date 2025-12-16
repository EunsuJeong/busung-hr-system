const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://admin:pkmFyucLEwbn2j0T@BusungSteel.crpfhuw.mongodb.net/busung_hr';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB 연결 성공');

    const db = mongoose.connection.db;

    console.log('\n📊 인덱스 생성 시작...\n');

    try {
      // Employee 컬렉션 인덱스
      await db
        .collection('employees')
        .createIndex({ employeeId: 1 }, { unique: true });
      await db.collection('employees').createIndex({ name: 1 });
      await db.collection('employees').createIndex({ department: 1 });
      console.log('✅ employees 인덱스 생성 완료');

      // Attendance 컬렉션 인덱스
      await db
        .collection('attendances')
        .createIndex({ employeeId: 1, date: -1 });
      await db.collection('attendances').createIndex({ date: -1 });
      console.log('✅ attendances 인덱스 생성 완료');

      // Leave 컬렉션 인덱스
      await db.collection('leaves').createIndex({ employeeId: 1 });
      await db.collection('leaves').createIndex({ status: 1 });
      await db.collection('leaves').createIndex({ startDate: -1 });
      console.log('✅ leaves 인덱스 생성 완료');

      // Notice 컬렉션 인덱스
      await db.collection('notices').createIndex({ createdAt: -1 });
      await db.collection('notices').createIndex({ isImportant: 1 });
      console.log('✅ notices 인덱스 생성 완료');

      // Payroll 컬렉션 인덱스
      await db
        .collection('payrolls')
        .createIndex({ employeeId: 1, year: -1, month: -1 });
      await db.collection('payrolls').createIndex({ createdAt: -1 });
      console.log('✅ payrolls 인덱스 생성 완료');

      // Schedule 컬렉션 인덱스
      await db.collection('schedules').createIndex({ date: -1 });
      await db.collection('schedules').createIndex({ employeeId: 1 });
      console.log('✅ schedules 인덱스 생성 완료');

      // Notification 컬렉션 인덱스
      await db
        .collection('notifications')
        .createIndex({ employeeId: 1, createdAt: -1 });
      await db.collection('notifications').createIndex({ isRead: 1 });
      console.log('✅ notifications 인덱스 생성 완료');

      console.log('\n🎉 모든 인덱스 생성 완료!');
      console.log('\n📈 성능 개선 예상:');
      console.log('  - 직원 조회: 50-70% 빠름');
      console.log('  - 근태 조회: 60-80% 빠름');
      console.log('  - 공지사항: 40-60% 빠름');
    } catch (error) {
      console.error('❌ 인덱스 생성 오류:', error);
    }

    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  });
