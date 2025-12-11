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
 * Vercel Serverless Function - 시스템 관리 API (일정/로그/세션)
 * @route /api/system
 * @methods GET, POST, PUT, DELETE
 */
module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const { db } = await connectToDatabase();

    const { type, id, action } = req.query;

    // 타입별 컬렉션 선택
    let collection;
    if (type === 'schedules') {
      collection = db.collection('schedules');
    } else if (type === 'logs') {
      collection = db.collection('systemlogs');
    } else if (type === 'sessions') {
      collection = db.collection('usersessions');
    } else if (action === 'health') {
      // 헬스 체크
      return res.status(200).json({
        success: true,
        db: {
          state: 'connected',
          name: db.databaseName,
        },
        serverTime: new Date().toISOString(),
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'type 파라미터가 필요합니다 (schedules/logs/sessions)',
      });
    }

    switch (req.method) {
      // ==========================================
      // GET: 조회
      // ==========================================
      case 'GET': {
        // 특정 항목 조회
        if (id) {
          const { ObjectId } = require('mongodb');
          const item = await collection.findOne({ _id: new ObjectId(id) });

          if (!item) {
            return res.status(404).json({
              success: false,
              message: `${type} 항목을 찾을 수 없습니다.`,
            });
          }

          console.log(`✅ [System API] ${type} 조회: ${id}`);

          return res.status(200).json({
            success: true,
            data: item,
          });
        }

        // 일정 목록 조회
        if (type === 'schedules') {
          const { year, month, startDate, endDate } = req.query;
          const filter = {};

          // 연도/월 필터
          if (year) {
            filter.year = parseInt(year);
          }
          if (month) {
            filter.month = parseInt(month);
          }

          // 날짜 범위 필터
          if (startDate && endDate) {
            filter.date = {
              $gte: startDate,
              $lte: endDate,
            };
          }

          const schedules = await collection
            .find(filter)
            .sort({ date: 1 })
            .toArray();

          console.log(`✅ [System API] 일정 조회: ${schedules.length}건`);

          return res.status(200).json({
            success: true,
            data: schedules,
          });
        }

        // 로그/세션 목록 조회
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [items, total] = await Promise.all([
          collection
            .find({})
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray(),
          collection.countDocuments({}),
        ]);

        console.log(`✅ [System API] ${type} 조회: ${items.length}건`);

        return res.status(200).json({
          success: true,
          data: items,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        });
      }

      // ==========================================
      // POST: 생성
      // ==========================================
      case 'POST': {
        const data = {
          ...req.body,
          createdAt: new Date(),
        };

        // 일정의 경우 날짜에서 연도/월 추출
        if (type === 'schedules' && data.date) {
          const dateObj = new Date(data.date);
          data.year = dateObj.getFullYear();
          data.month = dateObj.getMonth() + 1;
        }

        const result = await collection.insertOne(data);
        const created = await collection.findOne({ _id: result.insertedId });

        console.log(`✅ [System API] ${type} 생성`);

        return res.status(201).json({
          success: true,
          data: created,
        });
      }

      // ==========================================
      // PUT: 수정
      // ==========================================
      case 'PUT': {
        if (!id) {
          return res.status(400).json({
            success: false,
            message: 'ID가 필요합니다.',
          });
        }

        const { ObjectId } = require('mongodb');
        const { _id, createdAt, ...updateData } = req.body;
        updateData.updatedAt = new Date();

        // 일정의 경우 날짜 변경 시 연도/월 재계산
        if (type === 'schedules' && updateData.date) {
          const dateObj = new Date(updateData.date);
          updateData.year = dateObj.getFullYear();
          updateData.month = dateObj.getMonth() + 1;
        }

        const result = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );

        if (!result.value) {
          return res.status(404).json({
            success: false,
            message: `${type} 항목을 찾을 수 없습니다.`,
          });
        }

        console.log(`✅ [System API] ${type} 수정: ${id}`);

        return res.status(200).json({
          success: true,
          data: result.value,
        });
      }

      // ==========================================
      // DELETE: 삭제
      // ==========================================
      case 'DELETE': {
        if (!id) {
          return res.status(400).json({
            success: false,
            message: 'ID가 필요합니다.',
          });
        }

        const { ObjectId } = require('mongodb');
        const result = await collection.findOneAndDelete({
          _id: new ObjectId(id),
        });

        if (!result.value) {
          return res.status(404).json({
            success: false,
            message: `${type} 항목을 찾을 수 없습니다.`,
          });
        }

        console.log(`✅ [System API] ${type} 삭제: ${id}`);

        return res.status(200).json({
          success: true,
          message: `${type} 항목이 삭제되었습니다.`,
        });
      }

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
    }
  } catch (error) {
    console.error('❌ [System API] 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message,
    });
  }
};
