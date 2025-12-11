const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB 연결 성공');

  const Notice = mongoose.model('Notice', new mongoose.Schema({}, { strict: false }), 'notices');

  // 모든 공지사항 조회
  const notices = await Notice.find({}).sort({ createdAt: -1 }).limit(10);

  console.log(`\n📋 최근 공지사항 ${notices.length}건:`);
  notices.forEach((notice, index) => {
    console.log(`\n${index + 1}. ID: ${notice._id}`);
    console.log(`   제목: ${notice.title}`);
    console.log(`   작성자: ${notice.author}`);
    console.log(`   생성일: ${notice.createdAt}`);
  });

  // 특정 ID 조회
  const testId = '691ec5f8e2ecd20080aed814';
  console.log(`\n🔍 ID ${testId} 조회 시도...`);
  const specificNotice = await Notice.findById(testId);

  if (specificNotice) {
    console.log('✅ 공지사항 존재:', specificNotice.title);
  } else {
    console.log('❌ 공지사항을 찾을 수 없습니다.');
  }

  await mongoose.connection.close();
  console.log('\n✅ MongoDB 연결 종료');
  process.exit(0);
})
.catch(error => {
  console.error('❌ MongoDB 연결 실패:', error);
  process.exit(1);
});
