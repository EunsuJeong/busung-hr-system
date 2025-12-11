const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system')
  .then(async () => {
    const Schedule = mongoose.model('Schedule', new mongoose.Schema({}, { strict: false }), 'schedules');

    // 2025년 전체 공휴일 조회
    const holidays = await Schedule.find({
      category: '공휴일',
      startDate: { $regex: '^2025-' }
    }).sort({ startDate: 1 });

    console.log('=== 2025년 전체 공휴일 ===');
    console.log(`총 ${holidays.length}개`);
    holidays.forEach(h => {
      console.log(`${h.startDate} - ${h.title}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
