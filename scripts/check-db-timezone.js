const mongoose = require('mongoose');
require('dotenv').config();

async function checkDBTimezone() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 1. 연차 신청 데이터 확인
    const Leave = mongoose.model('Leave', new mongoose.Schema({}, { strict: false, collection: 'leaves' }));
    const recentLeaves = await Leave.find().sort({ createdAt: -1 }).limit(5).lean();

    console.log('📋 최근 연차 신청 5건:');
    recentLeaves.forEach((leave, idx) => {
      console.log(`\n${idx + 1}. ${leave.employeeName || leave.name}`);
      console.log(`   신청일(startDate): ${leave.startDate}`);
      console.log(`   종료일(endDate): ${leave.endDate}`);
      console.log(`   생성일(createdAt): ${leave.createdAt}`);
      console.log(`   승인일(approvedAt): ${leave.approvedAt || '없음'}`);

      if (leave.startDate) {
        const startDate = new Date(leave.startDate);
        console.log(`   → startDate UTC: ${startDate.toISOString()}`);
        console.log(`   → startDate KST: ${startDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
      }
    });

    // 2. 안전사고 데이터 확인
    const Safety = mongoose.model('Safety', new mongoose.Schema({}, { strict: false, collection: 'safeties' }));
    const recentSafety = await Safety.find().sort({ createdAt: -1 }).limit(3).lean();

    console.log('\n\n🔧 최근 안전사고 3건:');
    recentSafety.forEach((safety, idx) => {
      console.log(`\n${idx + 1}. ${safety.accidentType || '사고'}`);
      console.log(`   발생일시(accidentDateTime): ${safety.accidentDateTime}`);
      console.log(`   등록일(createdAt): ${safety.createdAt}`);

      if (safety.accidentDateTime) {
        const accidentDate = new Date(safety.accidentDateTime);
        console.log(`   → accidentDateTime UTC: ${accidentDate.toISOString()}`);
        console.log(`   → accidentDateTime KST: ${accidentDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
      }
    });

    // 3. MongoDB 서버 시간 확인
    const serverStatus = await mongoose.connection.db.admin().serverStatus();
    console.log('\n\n⏰ MongoDB 서버 정보:');
    console.log(`   localTime: ${serverStatus.localTime}`);

    await mongoose.connection.close();
    console.log('\n✅ 완료');
  } catch (error) {
    console.error('❌ 오류:', error);
    await mongoose.connection.close();
  }
}

checkDBTimezone();
