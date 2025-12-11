const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/busung_hr';

mongoose
  .connect(mongoURI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch((err) => console.error('❌ MongoDB 연결 실패:', err));

// Leave 모델
const Leave = require('./server/models/Leave');
const Employee = require('./server/models/Employee');

async function fixLeaveData() {
  try {
    console.log('\n🔧 연차 데이터 수정 시작...\n');

    const leaves = await Leave.find({});
    console.log(`📊 총 ${leaves.length}개의 연차 데이터 발견`);

    for (const leave of leaves) {
      let updated = false;
      const updates = {};

      // employeeName이 없으면 Employee에서 찾기
      if (!leave.employeeName && leave.employeeId) {
        const employee = await Employee.findOne({
          employeeId: leave.employeeId,
        });
        if (employee) {
          updates.employeeName = employee.name;
          updates.name = employee.name;
          updates.department = employee.department;
          updated = true;
          console.log(
            `✏️ ${leave.employeeId}: employeeName="${employee.name}" 추가`
          );
        }
      }

      // leaveType이 없으면 기본값 설정
      if (!leave.leaveType) {
        updates.leaveType = '연차';
        updates.type = '연차';
        updated = true;
        console.log(`✏️ ${leave.employeeId}: leaveType="연차" 추가`);
      }

      // days가 없으면 계산
      if (!leave.days && leave.startDate && leave.endDate) {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const diffDays = Math.abs((end - start) / (1000 * 60 * 60 * 24)) + 1;
        updates.days = diffDays;
        updated = true;
        console.log(`✏️ ${leave.employeeId}: days=${diffDays} 추가`);
      }

      // 업데이트 실행
      if (updated) {
        await Leave.findByIdAndUpdate(leave._id, updates);
        console.log(`✅ ${leave._id} 업데이트 완료\n`);
      }
    }

    console.log('\n🎉 모든 연차 데이터 수정 완료!');

    // 수정 후 데이터 확인
    const updatedLeaves = await Leave.find({});
    console.log('\n📋 수정된 연차 데이터:');
    updatedLeaves.forEach((leave) => {
      console.log(
        `- ${leave.employeeId} (${leave.employeeName}): ${leave.leaveType}, ${
          leave.days
        }일, ${leave.startDate?.toISOString().split('T')[0]} ~ ${
          leave.endDate?.toISOString().split('T')[0]
        }`
      );
    });
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixLeaveData();
