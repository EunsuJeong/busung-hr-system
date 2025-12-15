// MongoDB 데이터 마이그레이션 스크립트
const mongoose = require('mongoose');

// 로컬 MongoDB
const localURI = 'mongodb://127.0.0.1:27017/busung_hr';

// Atlas MongoDB (실제 연결 문자열로 교체하세요)
const atlasURI =
  'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/busung_hr?retryWrites=true&w=majority';

async function migrateData() {
  try {
    console.log('📦 로컬 MongoDB 연결 중...');
    const localConn = await mongoose.createConnection(localURI).asPromise();
    console.log('✅ 로컬 연결 성공');

    console.log('☁️ Atlas MongoDB 연결 중...');
    const atlasConn = await mongoose.createConnection(atlasURI).asPromise();
    console.log('✅ Atlas 연결 성공');

    // 모든 컬렉션 가져오기
    const collections = await localConn.db.listCollections().toArray();
    console.log(`\n📋 총 ${collections.length}개 컬렉션 발견`);

    for (const collInfo of collections) {
      const collName = collInfo.name;
      console.log(`\n🔄 ${collName} 마이그레이션 중...`);

      const localColl = localConn.db.collection(collName);
      const atlasColl = atlasConn.db.collection(collName);

      // 데이터 가져오기
      const data = await localColl.find({}).toArray();
      console.log(`  📊 ${data.length}개 문서 발견`);

      if (data.length > 0) {
        // 기존 데이터 삭제 (선택사항)
        await atlasColl.deleteMany({});

        // 데이터 삽입
        await atlasColl.insertMany(data);
        console.log(`  ✅ ${collName} 마이그레이션 완료`);
      } else {
        console.log(`  ⚠️ ${collName}은 비어있음`);
      }
    }

    console.log('\n🎉 모든 데이터 마이그레이션 완료!');

    await localConn.close();
    await atlasConn.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  }
}

migrateData();
