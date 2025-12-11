const { connectToDatabase } = require('./utils/mongodb');
const {
  setCorsHeaders,
  handleOptions,
  errorResponse,
  successResponse,
  validateAndRespond,
  parsePagination,
  createPaginationMeta,
  parseNumber,
  log,
} = require('./utils/helpers');

/**
 * Vercel Serverless Function - 급여 관리 API
 * @route /api/payroll
 * @methods GET, POST, PUT, DELETE
 */
module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const { db } = await connectToDatabase();
    const payrollCollection = db.collection('payrolls');

    const { action, year, month, employeeId, id } = req.query;

    switch (req.method) {
      // ==========================================
      // GET: 급여 조회
      // ==========================================
      case 'GET': {
        // 월별 급여 데이터 조회
        if (year && month) {
          const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

          console.log(`🔍 [Payroll API] 급여 데이터 조회: ${yearMonth}`);

          const payrolls = await payrollCollection
            .find({ yearMonth })
            .sort({ employeeId: 1 })
            .toArray();

          console.log(`✅ [Payroll API] 조회 완료: ${payrolls.length}건`);

          return res.status(200).json({
            success: true,
            data: payrolls,
            count: payrolls.length,
          });
        }

        // 특정 직원의 급여 내역 조회
        if (employeeId) {
          const query = { employeeId };
          if (year) {
            query.year = parseInt(year);
          }

          const { limit } = req.query;

          console.log(`🔍 [Payroll API] 직원 급여 조회: ${employeeId}`);

          const payrolls = await payrollCollection
            .find(query)
            .sort({ year: -1, month: -1 })
            .limit(limit ? parseInt(limit) : 12)
            .toArray();

          console.log(`✅ [Payroll API] 조회 완료: ${payrolls.length}건`);

          return res.status(200).json({
            success: true,
            data: payrolls,
            count: payrolls.length,
          });
        }

        return res.status(400).json({
          success: false,
          message: 'year/month 또는 employeeId 파라미터가 필요합니다.',
        });
      }

      // ==========================================
      // POST: 급여 생성/대량저장
      // ==========================================
      case 'POST': {
        // 대량 저장
        if (action === 'bulk') {
          const { records, year, month } = req.body;

          if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
              success: false,
              message: '저장할 급여 데이터가 없습니다.',
            });
          }

          if (!year || !month) {
            return res.status(400).json({
              success: false,
              message: '연도와 월 정보가 필요합니다.',
            });
          }

          console.log(
            `📊 [Payroll API] 급여 데이터 저장: ${year}년 ${month}월, ${records.length}건`
          );

          const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
          let inserted = 0;
          let updated = 0;

          for (const record of records) {
            if (!record.employeeId && !record.사번) {
              console.warn('⚠️ employeeId가 없는 레코드 스킵:', record);
              continue;
            }

            const payrollData = {
              employeeId: record.employeeId || record.사번,
              year: parseInt(year),
              month: parseInt(month),
              yearMonth,

              // 직원 정보
              name: record.name || record.성명 || '',
              department: record.department || record.부서 || '',
              position: record.position || record.직급 || '',
              joinDate: record.joinDate || record.입사일자 || '',

              // 기본 급여
              hourlyWage: parseNumber(record.hourlyWage || record.시급),
              basicHours: parseNumber(record.basicHours || record.기본시간),
              basicPay: parseNumber(record.basicPay || record.기본급),

              // 근무 시간 및 수당
              overtimeHours: parseNumber(
                record.overtimeHours || record.연장시간
              ),
              overtimePay: parseNumber(record.overtimePay || record.연장수당),
              holidayWorkHours: parseNumber(
                record.holidayWorkHours || record.휴일근로시간
              ),
              holidayWorkPay: parseNumber(
                record.holidayWorkPay || record.휴일근로수당
              ),
              nightWorkHours: parseNumber(
                record.nightWorkHours || record.야간근로시간
              ),
              nightWorkPay: parseNumber(
                record.nightWorkPay || record.야간근로수당
              ),

              // 공제 항목
              lateEarlyHours: parseNumber(
                record.lateEarlyHours || record.지각조퇴시간
              ),
              lateEarlyDeduction: parseNumber(
                record.lateEarlyDeduction || record.지각조퇴공제
              ),
              absentDays: parseNumber(record.absentDays || record.결근일수),
              absentDeduction: parseNumber(
                record.absentDeduction || record.결근공제
              ),

              // 수당
              carAllowance: parseNumber(
                record.carAllowance || record.차량수당 || record.차량
              ),
              transportAllowance: parseNumber(
                record.transportAllowance || record.교통비
              ),
              phoneAllowance: parseNumber(
                record.phoneAllowance || record.통신비
              ),
              otherAllowance: parseNumber(
                record.otherAllowance || record.기타수당
              ),
              annualLeaveDays: parseNumber(
                record.annualLeaveDays || record.년차일수
              ),
              annualLeavePay: parseNumber(
                record.annualLeavePay || record.년차수당
              ),
              bonus: parseNumber(record.bonus || record.상여금),

              // 급여 합계
              totalSalary: parseNumber(record.totalSalary || record.급여합계),

              // 세금 및 보험
              incomeTax: parseNumber(record.incomeTax || record.소득세),
              localTax: parseNumber(record.localTax || record.지방세),
              nationalPension: parseNumber(
                record.nationalPension || record.국민연금
              ),
              healthInsurance: parseNumber(
                record.healthInsurance || record.건강보험
              ),
              longTermCare: parseNumber(record.longTermCare || record.장기요양),
              employmentInsurance: parseNumber(
                record.employmentInsurance || record.고용보험
              ),

              // 기타 공제
              advanceDeduction: parseNumber(
                record.advanceDeduction || record.가불금과태료
              ),
              irpMatching: parseNumber(
                record.irpMatching || record.매칭IRP적립
              ),
              otherDeduction: parseNumber(
                record.otherDeduction || record.경조비기타공제
              ),
              dormitory: parseNumber(record.dormitory || record.기숙사),

              // 연말정산
              healthYearEnd: parseNumber(
                record.healthYearEnd || record.건강보험연말정산
              ),
              longTermYearEnd: parseNumber(
                record.longTermYearEnd || record.장기요양연말정산
              ),
              taxYearEnd: parseNumber(
                record.taxYearEnd || record.연말정산징수세액
              ),

              // 최종 금액
              totalDeduction: parseNumber(
                record.totalDeduction || record.공제합계
              ),
              netSalary: parseNumber(record.netSalary || record.차인지급액),

              lastModified: new Date(),
              updatedAt: new Date(),
            };

            const existing = await payrollCollection.findOne({
              employeeId: payrollData.employeeId,
              yearMonth,
            });

            await payrollCollection.updateOne(
              { employeeId: payrollData.employeeId, yearMonth },
              {
                $set: payrollData,
                $setOnInsert: { createdAt: new Date() },
              },
              { upsert: true }
            );

            if (existing) {
              updated++;
            } else {
              inserted++;
            }
          }

          console.log(
            `✅ [Payroll API] 저장 완료: ${inserted}건 추가, ${updated}건 업데이트`
          );

          return res.status(200).json({
            success: true,
            message: `${year}년 ${month}월 급여 데이터 저장 완료`,
            data: {
              inserted,
              updated,
              total: inserted + updated,
            },
          });
        }

        // 단일 급여 생성
        const payrollData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await payrollCollection.insertOne(payrollData);
        const created = await payrollCollection.findOne({
          _id: result.insertedId,
        });

        console.log(`✅ [Payroll API] 급여 생성: ${payrollData.employeeId}`);

        return res.status(201).json({
          success: true,
          data: created,
        });
      }

      // ==========================================
      // PUT: 급여 수정
      // ==========================================
      case 'PUT': {
        if (!id) {
          return res.status(400).json({
            success: false,
            message: '급여 ID가 필요합니다.',
          });
        }

        const { ObjectId } = require('mongodb');
        const { _id, createdAt, ...updateData } = req.body;
        updateData.updatedAt = new Date();

        const result = await payrollCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );

        if (!result.value) {
          return res.status(404).json({
            success: false,
            message: '급여 정보를 찾을 수 없습니다.',
          });
        }

        console.log(`✅ [Payroll API] 급여 수정: ${id}`);

        return res.status(200).json({
          success: true,
          data: result.value,
        });
      }

      // ==========================================
      // DELETE: 급여 삭제
      // ==========================================
      case 'DELETE': {
        if (!id) {
          return res.status(400).json({
            success: false,
            message: '급여 ID가 필요합니다.',
          });
        }

        const { ObjectId } = require('mongodb');
        const result = await payrollCollection.findOneAndDelete({
          _id: new ObjectId(id),
        });

        if (!result.value) {
          return res.status(404).json({
            success: false,
            message: '급여 정보를 찾을 수 없습니다.',
          });
        }

        console.log(`✅ [Payroll API] 급여 삭제: ${id}`);

        return res.status(200).json({
          success: true,
          message: '급여 정보가 삭제되었습니다.',
        });
      }

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
    }
  } catch (error) {
    console.error('❌ [Payroll API] 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message,
    });
  }
};
