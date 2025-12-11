const mongoose = require('mongoose');

/**
 * 기존 Leave 데이터를 새로운 스키마로 마이그레이션하는 스크립트
 *
 * 변경 사항:
 * 1. String → Date 타입 변환 (requestDate, startDate, endDate)
 * 2. employeeName, department, position 추가 (Employee 컬렉션에서 조회)
 * 3. requestedDays 계산 및 추가
 * 4. approvedAt, rejectedAt 등 새 필드 추가
 */

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

    const Employee = mongoose.model(
      'Employee',
      new mongoose.Schema(
        {},
        {
          strict: false,
          collection: 'employees',
        }
      )
    );

    try {
      // 1. 모든 기존 연차 데이터 조회
      const leaves = await Leave.find().lean();
      console.log(
        `📊 총 ${leaves.length}건의 연차 데이터를 마이그레이션합니다.\n`
      );

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      // 2. 각 연차 데이터 마이그레이션
      for (const leave of leaves) {
        try {
          console.log(
            `🔄 처리 중: ${leave._id} (${leave.employeeId || 'ID 없음'})`
          );

          // 2-1. 직원 정보 조회
          const employee = await Employee.findOne({
            employeeId: leave.employeeId,
          });

          if (!employee) {
            console.warn(`⚠️  직원 정보를 찾을 수 없음: ${leave.employeeId}`);
          }

          // 2-2. 날짜 변환 (String → Date)
          const requestDate = leave.requestDate
            ? new Date(leave.requestDate)
            : new Date(leave.createdAt || Date.now());
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);

          // 2-3. 연차 일수 계산
          let requestedDays = 0;
          const leaveType = leave.type || leave.leaveType || '';

          if (leaveType.includes('반차')) {
            requestedDays = 0.5;
          } else if (leaveType === '연차') {
            const diffTime = Math.abs(endDate - startDate);
            requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          }

          // 2-4. 업데이트할 데이터 준비
          const updateData = {
            // 직원 정보 (비정규화)
            employeeName: employee
              ? employee.name
              : leave.name || leave.employeeName || '알 수 없음',
            department: employee ? employee.department : leave.department || '',
            position: employee ? employee.position : leave.position || '',

            // 날짜 타입 변환
            requestDate: requestDate,
            startDate: startDate,
            endDate: endDate,

            // 일수 정보
            requestedDays: requestedDays,

            // 승인 정보 (기존 approvalDate가 있으면 approvedAt으로 변환)
            ...(leave.approvalDate &&
              leave.status === '승인' && {
                approvedAt: new Date(leave.approvalDate),
                approvedDays: requestedDays, // 승인된 경우 신청일수와 동일하게 설정
              }),

            // 반려 정보 (기존 rejectedDate가 있으면 변환)
            ...(leave.rejectedDate &&
              leave.status === '반려' && {
                rejectedAt: new Date(leave.rejectedDate),
                rejectedByName: leave.approvedBy || '관리자',
              }),

            // 시스템 정보
            updatedAt: new Date(),
          };

          // 2-5. DB 업데이트
          await Leave.updateOne({ _id: leave._id }, { $set: updateData });

          console.log(`✅ 성공: ${leave._id}`);
          successCount++;
        } catch (error) {
          console.error(`❌ 실패: ${leave._id}`, error.message);
          failCount++;
          errors.push({
            leaveId: leave._id,
            employeeId: leave.employeeId,
            error: error.message,
          });
        }
      }

      // 3. 결과 출력
      console.log('\n' + '='.repeat(50));
      console.log('📊 마이그레이션 완료 결과');
      console.log('='.repeat(50));
      console.log(`✅ 성공: ${successCount}건`);
      console.log(`❌ 실패: ${failCount}건`);

      if (errors.length > 0) {
        console.log('\n❌ 실패 항목 상세:');
        errors.forEach((err) => {
          console.log(
            `  - Leave ID: ${err.leaveId}, Employee ID: ${err.employeeId}`
          );
          console.log(`    오류: ${err.error}`);
        });
      }

      // 4. 마이그레이션 후 데이터 검증
      console.log('\n' + '='.repeat(50));
      console.log('🔍 데이터 검증');
      console.log('='.repeat(50));

      const migratedLeaves = await Leave.find().limit(3).lean();
      console.log('\n샘플 데이터 (3건):');
      migratedLeaves.forEach((leave, idx) => {
        console.log(
          `\n[${idx + 1}] ${leave.employeeName} (${leave.employeeId})`
        );
        console.log(`  - 유형: ${leave.type}`);
        console.log(
          `  - 기간: ${leave.startDate?.toISOString().split('T')[0]} ~ ${
            leave.endDate?.toISOString().split('T')[0]
          }`
        );
        console.log(
          `  - 신청일: ${leave.requestDate?.toISOString().split('T')[0]}`
        );
        console.log(`  - 신청일수: ${leave.requestedDays}일`);
        console.log(`  - 상태: ${leave.status}`);
        console.log(`  - 부서: ${leave.department || '없음'}`);
        console.log(`  - 직급: ${leave.position || '없음'}`);
        if (leave.approvedAt) {
          console.log(
            `  - 승인일: ${leave.approvedAt.toISOString().split('T')[0]}`
          );
          console.log(`  - 승인일수: ${leave.approvedDays}일`);
        }
      });

      // 5. 통계
      const stats = await Leave.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalDays: { $sum: '$requestedDays' },
          },
        },
      ]);

      console.log('\n상태별 통계:');
      stats.forEach((stat) => {
        console.log(`  ${stat._id}: ${stat.count}건, 총 ${stat.totalDays}일`);
      });

      process.exit(0);
    } catch (error) {
      console.error('❌ 마이그레이션 오류:', error);
      process.exit(1);
    }
  })
  .catch((e) => {
    console.error('❌ MongoDB 연결 실패:', e.message);
    process.exit(1);
  });
