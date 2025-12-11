const { connectToDatabase } = require('./utils/mongodb');
const {
  setCorsHeaders,
  handleOptions,
  errorResponse,
  successResponse,
  log,
} = require('./utils/helpers');

/**
 * Vercel Serverless Function - 공휴일 관리 API
 * @route /api/holiday
 * @methods GET, POST, PUT, DELETE
 */
module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const { db } = await connectToDatabase();
    const schedulesCollection = db.collection('schedules');

    const { action, year, startYear, endYear, date } = req.query;

    switch (req.method) {
      // ==========================================
      // GET: 공휴일 조회
      // ==========================================
      case 'GET': {
        // 통계 조회
        if (action === 'stats') {
          const totalHolidays = await schedulesCollection.countDocuments({
            type: '공휴일',
          });

          const years = await schedulesCollection
            .aggregate([
              { $match: { type: '공휴일' } },
              { $group: { _id: '$year' } },
              { $sort: { _id: 1 } },
            ])
            .toArray();

          const minYear = years.length > 0 ? years[0]._id : null;
          const maxYear = years.length > 0 ? years[years.length - 1]._id : null;

          const typeStats = await schedulesCollection
            .aggregate([
              { $match: { type: '공휴일' } },
              { $group: { _id: '$holidayType', count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ])
            .toArray();

          const typeStatsMap = typeStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {});

          console.log(`✅ [Holiday API] 통계 조회: ${totalHolidays}건`);

          return res.status(200).json({
            success: true,
            data: {
              totalHolidays,
              minYear,
              maxYear,
              years: years.map((y) => y._id),
              typeStats: typeStatsMap,
            },
          });
        }

        // 여러 연도 공휴일 조회
        if (startYear && endYear) {
          const holidays = await schedulesCollection
            .find({
              type: '공휴일',
              year: {
                $gte: parseInt(startYear),
                $lte: parseInt(endYear),
              },
            })
            .sort({ date: 1 })
            .toArray();

          // 연도별로 그룹화
          const holidaysByYear = {};
          holidays.forEach((holiday) => {
            const year = holiday.year;
            if (!holidaysByYear[year]) {
              holidaysByYear[year] = {};
            }
            const fullDate = holiday.date;
            const shortDate = holiday.date.substring(5);
            holidaysByYear[year][fullDate] = holiday.title;
            holidaysByYear[year][shortDate] = holiday.title;
          });

          console.log(
            `✅ [Holiday API] 공휴일 조회 ${startYear}-${endYear}: ${holidays.length}건`
          );

          return res.status(200).json({
            success: true,
            data: holidaysByYear,
          });
        }

        // 특정 연도 공휴일 조회
        if (year) {
          const holidays = await schedulesCollection
            .find({
              type: '공휴일',
              year: parseInt(year),
            })
            .sort({ date: 1 })
            .toArray();

          // 프론트엔드가 기대하는 형태로 변환
          const holidayMap = {};
          holidays.forEach((holiday) => {
            const fullDate = holiday.date; // YYYY-MM-DD
            const shortDate = holiday.date.substring(5); // MM-DD
            holidayMap[fullDate] = holiday.title;
            holidayMap[shortDate] = holiday.title;
          });

          console.log(
            `✅ [Holiday API] 공휴일 조회 ${year}년: ${holidays.length}건`
          );

          return res.status(200).json({
            success: true,
            data: holidayMap,
          });
        }

        return res.status(400).json({
          success: false,
          message: 'year 또는 startYear/endYear 파라미터가 필요합니다.',
        });
      }

      // ==========================================
      // POST: 공휴일 생성/대량 저장
      // ==========================================
      case 'POST': {
        // 대량 저장
        if (action === 'bulk') {
          const { holidays } = req.body;

          if (!Array.isArray(holidays)) {
            return res.status(400).json({
              success: false,
              message: 'holidays 배열이 필요합니다.',
            });
          }

          let successCount = 0;
          let skipCount = 0;

          for (const holiday of holidays) {
            try {
              const existing = await schedulesCollection.findOne({
                type: '공휴일',
                year: holiday.year,
                date: holiday.date,
              });

              if (existing) {
                skipCount++;
                continue;
              }

              await schedulesCollection.insertOne({
                type: '공휴일',
                year: holiday.year,
                date: holiday.date,
                title: holiday.title || holiday.name,
                holidayType: holiday.type || 'public',
                isCustom: holiday.isCustom || false,
                createdAt: new Date(),
              });

              successCount++;
            } catch (error) {
              console.error(`공휴일 저장 오류 (${holiday.date}):`, error);
              skipCount++;
            }
          }

          console.log(
            `✅ [Holiday API] 대량 저장: ${successCount}건 성공, ${skipCount}건 스킵`
          );

          return res.status(200).json({
            success: true,
            message: `${successCount}건 저장, ${skipCount}건 중복`,
            successCount,
            skipCount,
          });
        }

        // 단일 공휴일 생성
        const { date, name, type = 'custom' } = req.body;

        if (!date || !name) {
          return res.status(400).json({
            success: false,
            message: '날짜와 이름이 필요합니다.',
          });
        }

        const holidayYear = new Date(date).getFullYear();

        // 중복 체크
        const existing = await schedulesCollection.findOne({
          type: '공휴일',
          date,
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: '이미 등록된 날짜입니다.',
          });
        }

        const result = await schedulesCollection.insertOne({
          type: '공휴일',
          year: holidayYear,
          date,
          title: name,
          holidayType: type,
          isCustom: true,
          createdAt: new Date(),
        });

        const holiday = await schedulesCollection.findOne({
          _id: result.insertedId,
        });

        console.log(`✅ [Holiday API] 공휴일 생성: ${date} - ${name}`);

        return res.status(201).json({
          success: true,
          data: holiday,
          message: '공휴일이 등록되었습니다.',
        });
      }

      // ==========================================
      // PUT: 공휴일 수정
      // ==========================================
      case 'PUT': {
        if (!date) {
          return res.status(400).json({
            success: false,
            message: '날짜 파라미터가 필요합니다.',
          });
        }

        const { name, type } = req.body;

        if (!name) {
          return res.status(400).json({
            success: false,
            message: '이름이 필요합니다.',
          });
        }

        const updateData = {
          title: name,
          updatedAt: new Date(),
        };

        if (type) {
          updateData.holidayType = type;
        }

        const result = await schedulesCollection.findOneAndUpdate(
          { type: '공휴일', date },
          { $set: updateData },
          { returnDocument: 'after' }
        );

        if (!result.value) {
          return res.status(404).json({
            success: false,
            message: '해당 공휴일을 찾을 수 없습니다.',
          });
        }

        console.log(`✅ [Holiday API] 공휴일 수정: ${date} - ${name}`);

        return res.status(200).json({
          success: true,
          data: result.value,
          message: '공휴일이 수정되었습니다.',
        });
      }

      // ==========================================
      // DELETE: 공휴일 삭제
      // ==========================================
      case 'DELETE': {
        if (!date) {
          return res.status(400).json({
            success: false,
            message: '날짜 파라미터가 필요합니다.',
          });
        }

        const result = await schedulesCollection.findOneAndDelete({
          type: '공휴일',
          date,
        });

        if (!result.value) {
          return res.status(404).json({
            success: false,
            message: '해당 공휴일을 찾을 수 없습니다.',
          });
        }

        console.log(
          `✅ [Holiday API] 공휴일 삭제: ${date} - ${result.value.title}`
        );

        return res.status(200).json({
          success: true,
          data: result.value,
          message: '공휴일이 삭제되었습니다.',
        });
      }

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
    }
  } catch (error) {
    console.error('❌ [Holiday API] 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message,
    });
  }
};
