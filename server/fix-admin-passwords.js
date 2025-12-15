// 관리자 비밀번호를 bcrypt 해시로 변환
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const MONGO_URI =
  'mongodb+srv://admin:pkmFyucLEwbn2j0T@BusungSteel.crpfhuw.mongodb.net/busung_hr?retryWrites=true&w=majority';

async function updateAdminPasswords() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB 연결 성공\n');

    const adminsCollection = mongoose.connection.db.collection('admins');

    // 모든 관리자 조회
    const admins = await adminsCollection.find({}).toArray();
    console.log(`📋 총 ${admins.length}명의 관리자 발견\n`);

    for (const admin of admins) {
      const plainPassword = admin.password;

      // 이미 해시화되어 있으면 스킵
      if (
        plainPassword.startsWith('$2b$') ||
        plainPassword.startsWith('$2a$')
      ) {
        console.log(`⏭️  ${admin.adminId} - 이미 해시화됨`);
        continue;
      }

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // 업데이트
      await adminsCollection.updateOne(
        { _id: admin._id },
        { $set: { password: hashedPassword } }
      );

      console.log(`✅ ${admin.adminId} - 비밀번호 해시화 완료`);
      console.log(`   평문: ${plainPassword}`);
      console.log(`   해시: ${hashedPassword.substring(0, 30)}...\n`);
    }

    console.log('🎉 모든 관리자 비밀번호 업데이트 완료!');
    console.log('\n📝 로그인 정보:');
    for (const admin of admins) {
      console.log(
        `- ID: ${admin.adminId}, 비밀번호: ${admin.password} (평문 그대로 사용)`
      );
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

updateAdminPasswords();
