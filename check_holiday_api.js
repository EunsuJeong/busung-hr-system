const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system')
  .then(async () => {
    const Schedule = mongoose.model('Schedule', new mongoose.Schema({}, { strict: false }), 'schedules');

    console.log('=== 모든 스케줄 조회 (category 필터 없이) ===');
    const allSchedules = await Schedule.find({}).limit(50);
    console.log(`총 ${allSchedules.length}개`);

    console.log('\n=== 카테고리별 분류 ===');
    const categories = {};
    allSchedules.forEach(s => {
      const cat = s.category || 'undefined';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    console.log(JSON.stringify(categories, null, 2));

    console.log('\n=== 첫 10개 스케줄 샘플 ===');
    allSchedules.slice(0, 10).forEach(s => {
      console.log(JSON.stringify({
        title: s.title,
        startDate: s.startDate,
        category: s.category,
        type: s.type
      }, null, 2));
    });

    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
