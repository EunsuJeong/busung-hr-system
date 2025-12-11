/**
 * 음력 공휴일 통계 확인 스크립트
 */
const mongoose = require('mongoose');
require('dotenv').config();

async function checkLunarHolidays() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/busung_hr'
    );
    console.log('✅ MongoDB 연결 성공 (busung_hr)\n');

    const Holiday = mongoose.model(
      'Holiday',
      new mongoose.Schema({
        year: Number,
        date: String,
        name: String,
        type: String,
        isDeleted: Boolean,
        isCustom: Boolean,
      }),
      'holidays'
    );

    // 타입별 통계
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 공휴일 타입별 통계');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const typeStats = await Holiday.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    typeStats.forEach((stat) => {
      const typeName =
        {
          solar: '양력',
          lunar: '음력',
          substitute: '대체공휴일',
          temporary: '임시공휴일',
        }[stat._id] || stat._id;
      console.log(`${typeName.padEnd(15)} : ${stat.count}건`);
    });

    const totalCount = typeStats.reduce((sum, stat) => sum + stat.count, 0);
    console.log(`${'총계'.padEnd(15)} : ${totalCount}건`);

    // 음력 공휴일 샘플 (2025년)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📅 2025년 음력 공휴일 샘플');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const lunar2025 = await Holiday.find({
      year: 2025,
      type: 'lunar',
    }).sort({ date: 1 });

    lunar2025.forEach((holiday) => {
      console.log(`${holiday.date} : ${holiday.name}`);
    });

    // 연도별 음력 공휴일 수
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 연도별 음력 공휴일 수 (샘플)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const yearStats = await Holiday.aggregate([
      { $match: { type: 'lunar' } },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 10 },
    ]);

    yearStats.forEach((stat) => {
      console.log(`${stat._id}년 : ${stat.count}개`);
    });

    console.log('\n✨ 확인 완료!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

checkLunarHolidays();
