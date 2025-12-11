const mongoose = require('mongoose');

/**
 * 마이그레이션 후 데이터 검증 스크립트
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

    try {
      console.log('='.repeat(60));
      console.log('📊 Leave 컬렉션 데이터 검증');
      console.log('='.repeat(60));

      // 1. 전체 데이터 조회
      const leaves = await Leave.find().lean();
      console.log(`\n✅ 총 ${leaves.length}건의 연차 데이터 확인\n`);

      // 2. 필수 필드 검증
      console.log('🔍 필수 필드 검증:');
      let missingFields = 0;

      leaves.forEach((leave, idx) => {
        const missing = [];

        if (!leave.employeeId) missing.push('employeeId');
        if (!leave.employeeName) missing.push('employeeName');
        if (!leave.type) missing.push('type');
        if (!leave.startDate) missing.push('startDate');
        if (!leave.endDate) missing.push('endDate');
        if (!leave.requestedDays) missing.push('requestedDays');
        if (!leave.status) missing.push('status');

        if (missing.length > 0) {
          console.log(
            `  ❌ [${idx + 1}] ${
              leave.employeeName || leave._id
            }: 누락 필드 - ${missing.join(', ')}`
          );
          missingFields++;
        }
      });

      if (missingFields === 0) {
        console.log('  ✅ 모든 데이터의 필수 필드가 정상입니다.');
      } else {
        console.log(`  ⚠️  ${missingFields}건에서 필수 필드 누락 발견`);
      }

      // 3. 날짜 타입 검증
      console.log('\n🔍 날짜 타입 검증:');
      let dateTypeErrors = 0;

      leaves.forEach((leave, idx) => {
        const errors = [];

        if (leave.requestDate && !(leave.requestDate instanceof Date)) {
          errors.push('requestDate');
        }
        if (leave.startDate && !(leave.startDate instanceof Date)) {
          errors.push('startDate');
        }
        if (leave.endDate && !(leave.endDate instanceof Date)) {
          errors.push('endDate');
        }

        if (errors.length > 0) {
          console.log(
            `  ❌ [${idx + 1}] ${
              leave.employeeName
            }: Date 타입이 아님 - ${errors.join(', ')}`
          );
          dateTypeErrors++;
        }
      });

      if (dateTypeErrors === 0) {
        console.log('  ✅ 모든 날짜 필드가 Date 타입입니다.');
      } else {
        console.log(`  ⚠️  ${dateTypeErrors}건에서 날짜 타입 오류 발견`);
      }

      // 4. 일수 계산 검증
      console.log('\n🔍 일수 계산 검증:');
      let daysErrors = 0;

      leaves.forEach((leave, idx) => {
        if (leave.type && leave.type.includes('반차')) {
          if (leave.requestedDays !== 0.5) {
            console.log(
              `  ❌ [${idx + 1}] ${leave.employeeName}: 반차인데 ${
                leave.requestedDays
              }일로 계산됨`
            );
            daysErrors++;
          }
        } else if (leave.type === '연차') {
          const start = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          const expectedDays =
            Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

          if (leave.requestedDays !== expectedDays) {
            console.log(
              `  ⚠️  [${idx + 1}] ${
                leave.employeeName
              }: 예상 ${expectedDays}일, 실제 ${leave.requestedDays}일`
            );
            daysErrors++;
          }
        }
      });

      if (daysErrors === 0) {
        console.log('  ✅ 모든 일수 계산이 정확합니다.');
      } else {
        console.log(`  ⚠️  ${daysErrors}건에서 일수 계산 오류 발견`);
      }

      // 5. 승인/반려 정보 검증
      console.log('\n🔍 승인/반려 정보 검증:');

      const approved = leaves.filter((l) => l.status === '승인');
      const rejected = leaves.filter((l) => l.status === '반려');

      console.log(`  승인: ${approved.length}건`);
      approved.forEach((leave) => {
        if (!leave.approvedAt && !leave.approvalDate) {
          console.log(`    ⚠️  ${leave.employeeName}: 승인일 없음`);
        }
        if (!leave.approvedDays) {
          console.log(`    ⚠️  ${leave.employeeName}: 승인일수 없음`);
        }
      });

      console.log(`  반려: ${rejected.length}건`);
      rejected.forEach((leave) => {
        if (!leave.rejectedAt && !leave.rejectedDate) {
          console.log(`    ⚠️  ${leave.employeeName}: 반려일 없음`);
        }
        if (!leave.rejectionReason) {
          console.log(`    ⚠️  ${leave.employeeName}: 반려 사유 없음`);
        }
      });

      // 6. 상세 데이터 출력
      console.log('\n' + '='.repeat(60));
      console.log('📋 전체 데이터 상세 정보');
      console.log('='.repeat(60));

      leaves.forEach((leave, idx) => {
        console.log(
          `\n[${idx + 1}] ${leave.employeeName} (${leave.employeeId})`
        );
        console.log(
          `  부서: ${leave.department || '없음'} / 직급: ${
            leave.position || '없음'
          }`
        );
        console.log(`  유형: ${leave.type}`);
        console.log(
          `  기간: ${leave.startDate?.toISOString().split('T')[0]} ~ ${
            leave.endDate?.toISOString().split('T')[0]
          }`
        );
        console.log(
          `  신청일: ${leave.requestDate?.toISOString().split('T')[0]}`
        );
        console.log(`  신청일수: ${leave.requestedDays}일`);
        console.log(`  상태: ${leave.status}`);

        if (leave.status === '승인') {
          console.log(
            `  승인자: ${leave.approverName || leave.approver || '없음'}`
          );
          console.log(
            `  승인일: ${
              leave.approvedAt?.toISOString().split('T')[0] ||
              leave.approvalDate?.toISOString().split('T')[0] ||
              '없음'
            }`
          );
          console.log(`  승인일수: ${leave.approvedDays || '없음'}일`);
        }

        if (leave.status === '반려') {
          console.log(
            `  반려자: ${leave.rejectedByName || leave.approvedBy || '없음'}`
          );
          console.log(
            `  반려일: ${
              leave.rejectedAt?.toISOString().split('T')[0] ||
              leave.rejectedDate?.toISOString().split('T')[0] ||
              '없음'
            }`
          );
          console.log(`  반려사유: ${leave.rejectionReason || '없음'}`);
        }

        console.log(`  사유: ${leave.reason}`);
        console.log(`  연락처: ${leave.contact || '없음'}`);
      });

      // 7. 최종 결과
      console.log('\n' + '='.repeat(60));
      console.log('✅ 검증 완료');
      console.log('='.repeat(60));
      console.log(`총 ${leaves.length}건 중:`);
      console.log(`  - 필수 필드 누락: ${missingFields}건`);
      console.log(`  - 날짜 타입 오류: ${dateTypeErrors}건`);
      console.log(`  - 일수 계산 오류: ${daysErrors}건`);

      if (missingFields === 0 && dateTypeErrors === 0 && daysErrors === 0) {
        console.log('\n🎉 모든 데이터가 정상적으로 마이그레이션되었습니다!');
      } else {
        console.log(
          '\n⚠️  일부 데이터에서 문제가 발견되었습니다. 위 내용을 확인하세요.'
        );
      }

      process.exit(0);
    } catch (error) {
      console.error('❌ 검증 오류:', error);
      process.exit(1);
    }
  })
  .catch((e) => {
    console.error('❌ MongoDB 연결 실패:', e.message);
    process.exit(1);
  });
