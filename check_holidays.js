const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system')
  .then(async () => {
    const Schedule = mongoose.model('Schedule', new mongoose.Schema({}, { strict: false }), 'schedules');

    // 2025년 8월 공휴일 조회
    const holidays = await Schedule.find({
      category: '공휴일',
      startDate: { $regex: '2025-08' }
    }).sort({ startDate: 1 });

    console.log('=== 2025년 8월 공휴일 ===');
    holidays.forEach(h => {
      console.log(JSON.stringify({
        title: h.title,
        startDate: h.startDate,
        endDate: h.endDate,
        category: h.category
      }, null, 2));
    });

    // 8월 15일 광복절 확인
    const liberation = await Schedule.findOne({
      category: '공휴일',
      startDate: '2025-08-15'
    });

    console.log('\n=== 8월 15일 광복절 확인 ===');
    if (liberation) {
      console.log('✅ 광복절이 공휴일로 등록되어 있습니다.');
      console.log(JSON.stringify(liberation, null, 2));
    } else {
      console.log('❌ 광복절이 공휴일로 등록되어 있지 않습니다!');
    }

    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
