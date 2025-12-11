const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {})
.then(async () => {
  console.log('✅ MongoDB 연결 성공');
  console.log('📊 데이터베이스:', mongoose.connection.db.databaseName);

  // 모든 컬렉션 목록
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\n📋 컬렉션 목록:');
  collections.forEach((col, index) => {
    console.log(`  ${index + 1}. ${col.name}`);
  });

  // 각 컬렉션의 문서 개수
  console.log('\n📊 컬렉션별 문서 개수:');
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`  ${col.name}: ${count}건`);
  }

  await mongoose.connection.close();
  console.log('\n✅ MongoDB 연결 종료');
  process.exit(0);
})
.catch(error => {
  console.error('❌ MongoDB 연결 실패:', error);
  process.exit(1);
});
