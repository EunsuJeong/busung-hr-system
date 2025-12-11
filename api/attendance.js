const { connectToDatabase } = require('./utils/mongodb');
const {
  setCorsHeaders,
  handleOptions,
  errorResponse,
  successResponse,
  validateAndRespond,
  log,
} = require('./utils/helpers');

/**
 * 시간 문자열을 분으로 변환
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * 근무 시간 계산 (분 단위)
 */
const calculateWorkMinutes = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const startMinutes = timeToMinutes(checkIn);
  const endMinutes = timeToMinutes(checkOut);
  return endMinutes >= startMinutes ? endMinutes - startMinutes : 0;
};

/**
 * 근무 시간 분류 (연장/특근/야간)
 */
const categorizeWorkHours = (checkIn, checkOut, shiftType, isHoliday) => {
  const totalMinutes = calculateWorkMinutes(checkIn, checkOut);
  const totalHours = totalMinutes / 60;

  if (isHoliday) {
    return {
      overtimeHours: 0,
      holidayHours: totalHours,
      nightHours: 0,
    };
  }

  return {
    overtimeHours: totalHours > 8 ? totalHours - 8 : 0,
    holidayHours: 0,
    nightHours: shiftType === '야간' ? totalHours : 0,
  };
};

/**
 * Vercel Serverless Function - 근태 관리 API
 * @route /api/attendance
 * @methods GET, POST, PUT, DELETE
 */
module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const { db } = await connectToDatabase();
    const attendanceCollection = db.collection('attendances');
    const attendanceStatsCollection = db.collection('attendancestats');

    // URL 경로 파싱
    const { action, year, month, employeeId } = req.query;

    switch (req.method) {
      // ==========================================
      // GET: 근태 조회
      // ==========================================
      case 'GET': {
        // 월별 통계 조회
        if (action === 'stats' && year && month) {
          const stats = await attendanceStatsCollection
            .find({
              year: parseInt(year),
              month: parseInt(month),
            })
            .project({
              employeeId: 1,
              year: 1,
              month: 1,
              totalWorkMinutes: 1,
              regularHours: 1,
              earlyHours: 1,
              overtimeHours: 1,
              nightHours: 1,
              holidayHours: 1,
              workDays: 1,
              lateDays: 1,
              earlyLeaveDays: 1,
              absentDays: 1,
              annualLeaveDays: 1,
              morningHalfDays: 1,
              afternoonHalfDays: 1,
            })
            .toArray();

          return res.status(200).json({
            success: true,
            data: stats,
            count: stats.length,
          });
        }

        // 월별 근태 데이터 조회
        if (action === 'monthly' && year && month) {
          const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
          const daysInMonth = new Date(year, month, 0).getDate();
          const endDate = `${year}-${String(month).padStart(2, '0')}-${String(
            daysInMonth
          ).padStart(2, '0')}`;

          const records = await attendanceCollection
            .find({
              date: {
                $gte: startDate,
                $lte: endDate,
              },
            })
            .sort({ employeeId: 1, date: 1 })
            .toArray();

          // 데이터 정규화
          const normalizedRecords = records.map((record) => ({
            _id: record._id,
            employeeId: record.employeeId,
            date: record.date,
            checkIn: record.checkIn || '',
            checkOut: record.checkOut || '',
            shiftType: record.shiftType || null,
            status: record.status || null,
            note: record.note || null,
            totalWorkMinutes: record.totalWorkMinutes || 0,
            overtimeHours: record.overtimeHours || 0,
            holidayHours: record.holidayHours || 0,
            nightHours: record.nightHours || 0,
            remarks: record.remarks || '',
            autoDetermined: record.autoDetermined || false,
            createdAt: record.createdAt,
          }));

          return res.status(200).json({
            success: true,
            data: normalizedRecords,
            count: normalizedRecords.length,
          });
        }

        // 직원별 근태 조회
        if (employeeId) {
          const { startDate, endDate, page = 1, limit = 30 } = req.query;
          const filter = { employeeId };

          if (startDate && endDate) {
            filter.date = {
              $gte: startDate,
              $lte: endDate,
            };
          }

          const skip = (parseInt(page) - 1) * parseInt(limit);
          const [records, total] = await Promise.all([
            attendanceCollection
              .find(filter)
              .skip(skip)
              .limit(parseInt(limit))
              .sort({ date: -1 })
              .toArray(),
            attendanceCollection.countDocuments(filter),
          ]);

          return res.status(200).json({
            success: true,
            data: records,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total,
              pages: Math.ceil(total / parseInt(limit)),
            },
          });
        }

        // 전체 근태 조회
        const { date, page = 1, limit = 100 } = req.query;
        const filter = {};

        if (date) {
          filter.date = date;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const records = await attendanceCollection
          .find(filter)
          .skip(skip)
          .limit(parseInt(limit))
          .sort({ date: -1 })
          .toArray();

        return res.status(200).json({
          success: true,
          data: records,
        });
      }

      // ==========================================
      // POST: 출근/퇴근/대량저장
      // ==========================================
      case 'POST': {
        // 출근 등록
        if (action === 'check-in') {
          const { employeeId } = req.body;
          const today = new Date().toISOString().split('T')[0];

          // 오늘 출근 기록 확인
          const existing = await attendanceCollection.findOne({
            employeeId,
            date: today,
          });

          if (existing && existing.checkIn) {
            return res.status(400).json({
              success: false,
              message: '이미 출근 등록이 완료되었습니다.',
            });
          }

          const now = new Date();
          const checkInTime = `${String(now.getHours()).padStart(
            2,
            '0'
          )}:${String(now.getMinutes()).padStart(2, '0')}`;
          const standardTime = '09:00';
          const isLate = checkInTime > standardTime;

          const result = await attendanceCollection.findOneAndUpdate(
            { employeeId, date: today },
            {
              $set: {
                checkIn: checkInTime,
                location: req.body.location || 'Office',
                isLate,
                status: isLate ? 'late' : 'present',
                updatedAt: new Date(),
              },
              $setOnInsert: {
                createdAt: new Date(),
              },
            },
            { upsert: true, returnDocument: 'after' }
          );

          console.log(`✅ [Attendance API] 출근 등록: ${employeeId}`);

          return res.status(200).json({
            success: true,
            message: '출근 등록이 완료되었습니다.',
            data: result.value,
          });
        }

        // 퇴근 등록
        if (action === 'check-out') {
          const { employeeId } = req.body;
          const today = new Date().toISOString().split('T')[0];

          const attendance = await attendanceCollection.findOne({
            employeeId,
            date: today,
          });

          if (!attendance || !attendance.checkIn) {
            return res.status(400).json({
              success: false,
              message: '출근 기록이 없습니다.',
            });
          }

          if (attendance.checkOut) {
            return res.status(400).json({
              success: false,
              message: '이미 퇴근 등록이 완료되었습니다.',
            });
          }

          const now = new Date();
          const checkOutTime = `${String(now.getHours()).padStart(
            2,
            '0'
          )}:${String(now.getMinutes()).padStart(2, '0')}`;
          const workMinutes = calculateWorkMinutes(
            attendance.checkIn,
            checkOutTime
          );

          const result = await attendanceCollection.findOneAndUpdate(
            { employeeId, date: today },
            {
              $set: {
                checkOut: checkOutTime,
                workMinutes,
                updatedAt: new Date(),
              },
            },
            { returnDocument: 'after' }
          );

          console.log(`✅ [Attendance API] 퇴근 등록: ${employeeId}`);

          return res.status(200).json({
            success: true,
            message: '퇴근 등록이 완료되었습니다.',
            data: result.value,
          });
        }

        // 대량 저장
        if (action === 'bulk') {
          const { records, year, month } = req.body;

          if (!records || !Array.isArray(records)) {
            return res.status(400).json({
              success: false,
              message: 'records 배열이 필요합니다.',
            });
          }

          if (!year || !month) {
            return res.status(400).json({
              success: false,
              message: 'year와 month가 필요합니다.',
            });
          }

          console.log(
            `[근태 대량 저장] ${year}년 ${month}월 데이터 저장 시작 (${records.length}건)`
          );

          let inserted = 0;
          let updated = 0;
          let errors = 0;
          const errorDetails = [];

          for (const record of records) {
            try {
              const {
                employeeId,
                date,
                checkIn,
                checkOut,
                shiftType,
                leaveType,
              } = record;

              if (!employeeId || !date) {
                errors++;
                errorDetails.push({
                  employeeId,
                  date,
                  error: '필수 필드 누락',
                });
                continue;
              }

              const updateData = {
                updatedAt: new Date(),
              };

              if (checkIn) updateData.checkIn = checkIn;
              if (checkOut) updateData.checkOut = checkOut;
              if (shiftType) updateData.shiftType = shiftType;
              else updateData.shiftType = '주간';
              if (leaveType) updateData.status = leaveType;

              const existing = await attendanceCollection.findOne({
                employeeId,
                date,
              });

              await attendanceCollection.updateOne(
                { employeeId, date },
                {
                  $set: updateData,
                  $setOnInsert: { createdAt: new Date() },
                },
                { upsert: true }
              );

              if (existing) {
                updated++;
              } else {
                inserted++;
              }
            } catch (error) {
              errors++;
              errorDetails.push({
                employeeId: record.employeeId,
                date: record.date,
                error: error.message,
              });
            }
          }

          console.log(
            `[근태 대량 저장] ✅ 완료: ${inserted}건 추가, ${updated}건 업데이트, ${errors}건 실패`
          );

          return res.status(200).json({
            success: true,
            message: `${inserted}건 추가, ${updated}건 업데이트, ${errors}건 실패`,
            stats: { inserted, updated, errors },
            errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
          });
        }

        // 월별 데이터 저장
        if (action === 'monthly' && year && month) {
          const { attendanceData } = req.body;

          if (!attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({
              success: false,
              message: 'attendanceData 배열이 필요합니다.',
            });
          }

          console.log(
            `[근태 저장] ${year}년 ${month}월 데이터 저장 시작 (${attendanceData.length}건)`
          );

          let successCount = 0;
          let errorCount = 0;
          const errors = [];

          for (const record of attendanceData) {
            try {
              const {
                employeeId,
                date,
                checkIn,
                checkOut,
                shiftType,
                status,
                remarks,
              } = record;

              if (!employeeId || !date) {
                errorCount++;
                errors.push({ employeeId, date, error: '필수 필드 누락' });
                continue;
              }

              let overtimeHours = 0;
              let holidayHours = 0;
              let nightHours = 0;
              let totalWorkMinutes = 0;

              if (checkIn && checkOut) {
                const dateObj = new Date(date);
                const dayOfWeek = dateObj.getDay();
                const isHoliday = dayOfWeek === 0 || dayOfWeek === 6;

                const categorized = categorizeWorkHours(
                  checkIn,
                  checkOut,
                  shiftType || '주간',
                  isHoliday
                );
                overtimeHours = categorized.overtimeHours || 0;
                holidayHours = categorized.holidayHours || 0;
                nightHours = categorized.nightHours || 0;
                totalWorkMinutes = calculateWorkMinutes(checkIn, checkOut);
              }

              await attendanceCollection.updateOne(
                { employeeId, date },
                {
                  $set: {
                    checkIn: checkIn || '',
                    checkOut: checkOut || '',
                    shiftType: shiftType || '주간',
                    status: status || '',
                    remarks: remarks || '',
                    totalWorkMinutes,
                    overtimeHours,
                    holidayHours,
                    nightHours,
                    autoDetermined: true,
                    updatedAt: new Date(),
                  },
                  $setOnInsert: { createdAt: new Date() },
                },
                { upsert: true }
              );

              successCount++;
            } catch (error) {
              errorCount++;
              errors.push({
                employeeId: record.employeeId,
                date: record.date,
                error: error.message,
              });
            }
          }

          console.log(
            `[근태 저장] ✅ 완료: ${successCount}건 성공, ${errorCount}건 실패`
          );

          return res.status(200).json({
            success: true,
            message: `${successCount}건 저장 완료, ${errorCount}건 실패`,
            successCount,
            errorCount,
            errors: errors.length > 0 ? errors : undefined,
          });
        }

        return res.status(400).json({
          success: false,
          message: 'Invalid action parameter',
        });
      }

      // ==========================================
      // PUT: 근태 수정
      // ==========================================
      case 'PUT': {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({
            success: false,
            message: '근태 ID가 필요합니다.',
          });
        }

        const { ObjectId } = require('mongodb');
        const { _id, createdAt, ...updateData } = req.body;
        updateData.updatedAt = new Date();

        const result = await attendanceCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );

        if (!result.value) {
          return res.status(404).json({
            success: false,
            message: '근태 정보를 찾을 수 없습니다.',
          });
        }

        console.log(`✅ [Attendance API] 근태 수정: ${id}`);

        return res.status(200).json({
          success: true,
          data: result.value,
        });
      }

      // ==========================================
      // DELETE: 근태 삭제
      // ==========================================
      case 'DELETE': {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({
            success: false,
            message: '근태 ID가 필요합니다.',
          });
        }

        const { ObjectId } = require('mongodb');
        const result = await attendanceCollection.findOneAndDelete({
          _id: new ObjectId(id),
        });

        if (!result.value) {
          return res.status(404).json({
            success: false,
            message: '근태 정보를 찾을 수 없습니다.',
          });
        }

        console.log(`✅ [Attendance API] 근태 삭제: ${id}`);

        return res.status(200).json({
          success: true,
          message: '근태 정보가 삭제되었습니다.',
        });
      }

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
    }
  } catch (error) {
    console.error('❌ [Attendance API] 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message,
    });
  }
};
