const mongoose = require('mongoose');
require('dotenv').config();

const AttendanceSchema = new mongoose.Schema({}, { collection: 'attendances', strict: false });
const Attendance = mongoose.model('Attendance', AttendanceSchema);

async function checkAllAttendance() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 전체 데이터 개수
    const totalCount = await Attendance.countDocuments();
    console.log(`📊 전체 근태 기록: ${totalCount}건\n`);

    // 날짜별 그룹핑
    const dateGroups = await Attendance.aggregate([
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    console.log('📅 최근 월별 근태 데이터:');
    dateGroups.forEach(group => {
      console.log(`  ${group._id}: ${group.count}건`);
    });

    // 최근 데이터 몇 개 확인
    const recentRecords = await Attendance.find()
      .sort({ date: -1 })
      .limit(5)
      .lean();

    console.log('\n📋 최근 근태 기록 샘플:');
    recentRecords.forEach((rec, idx) => {
      console.log(`  ${idx + 1}. ${rec.date} | 직원ID: ${rec.employeeId} | 출근: ${rec.checkIn} | 퇴근: ${rec.checkOut}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ 완료');
  } catch (error) {
    console.error('❌ 오류:', error);
    await mongoose.connection.close();
  }
}

checkAllAttendance();
