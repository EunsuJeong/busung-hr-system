// MongoDB Atlas에 빈 컬렉션 초기화
const mongoose = require('mongoose');

const atlasURI =
  process.env.MONGO_URI ||
  'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/busung_hr';

async function initializeCollections() {
  try {
    console.log('☁️ MongoDB Atlas 연결 중...');
    await mongoose.connect(atlasURI);
    console.log('✅ 연결 성공\n');

    // 필요한 컬렉션들
    const collections = [
      'admins',
      'employees',
      'attendance',
      'leaves',
      'payrolls',
      'schedules',
      'notices',
      'notifications',
      'suggestions',
      'evaluations',
      'safetyincidents',
    ];

    for (const collName of collections) {
      try {
        // 컬렉션이 존재하는지 확인
        const existing = await mongoose.connection.db
          .listCollections({ name: collName })
          .toArray();

        if (existing.length === 0) {
          // 컬렉션 생성
          await mongoose.connection.db.createCollection(collName);
          console.log(`✅ ${collName} 컬렉션 생성`);
        } else {
          console.log(`⏭️ ${collName} 이미 존재`);
        }
      } catch (err) {
        console.log(`⚠️ ${collName} 생성 실패:`, err.message);
      }
    }

    console.log('\n🎉 초기화 완료!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 초기화 실패:', error);
    process.exit(1);
  }
}

initializeCollections();
