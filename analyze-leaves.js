const mongoose = require('mongoose');

mongoose
  .connect('mongodb://127.0.0.1:27017/busung_hr')
  .then(async () => {
    console.log('✅ MongoDB 연결 성공\n');

    const Leave = mongoose.model(
      'Leave',
      new mongoose.Schema(
        {},
        {
          strict: false,
          collection: 'leaves',
        }
      )
    );

    // 샘플 데이터 조회
    const samples = await Leave.find().limit(5).lean();
    console.log('📊 Leaves 샘플 데이터 (최대 5건):');
    console.log(JSON.stringify(samples, null, 2));

    // 총 개수
    const count = await Leave.countDocuments();
    console.log('\n📈 총 연차 기록 수:', count);

    // 상태별 통계
    const stats = await Leave.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    console.log('\n📊 상태별 통계:');
    stats.forEach((s) => console.log(`  ${s._id}: ${s.count}건`));

    // 연차 타입별 통계
    const typeStats = await Leave.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    console.log('\n📊 연차 타입별 통계:');
    typeStats.forEach((t) => console.log(`  ${t._id}: ${t.count}건`));

    // 직원별 통계
    const empStats = await Leave.aggregate([
      { $group: { _id: '$employeeId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    console.log('\n📊 직원별 연차 신청 수 (상위 10명):');
    empStats.forEach((e) => console.log(`  ${e._id}: ${e.count}건`));

    // 필드 검사 (첫 번째 문서)
    if (samples.length > 0) {
      console.log('\n🔍 필드 구조 분석 (첫 번째 문서):');
      const firstDoc = samples[0];
      Object.keys(firstDoc).forEach((key) => {
        const value = firstDoc[key];
        const type = Array.isArray(value) ? 'Array' : typeof value;
        console.log(`  ${key}: ${type} = ${JSON.stringify(value)}`);
      });
    }

    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ 오류:', e.message);
    process.exit(1);
  });
