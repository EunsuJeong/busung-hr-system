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
 * Vercel Serverless Function - 안전 관리 API
 * @route /api/safety
 * @methods GET, POST, PUT, DELETE
 */
module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const { db } = await connectToDatabase();
    const accidentsCollection = db.collection('safetyaccidents');
    const weatherCacheCollection = db.collection('weathercaches');

    const { type, id, date, location } = req.query;

    switch (req.method) {
      // ==========================================
      // GET: 조회
      // ==========================================
      case 'GET': {
        // 날씨 캐시 조회
        if (type === 'weather') {
          const weatherCache = await weatherCacheCollection.findOne({
            location: location || 'default',
          });

          return res.status(200).json({
            success: true,
            data: weatherCache || {},
          });
        }

        // 특정 날짜 사고 목록
        if (date) {
          const accidents = await accidentsCollection
            .find({ date })
            .sort({ createdAt: -1 })
            .toArray();

          console.log(
            `✅ [Safety API] ${date} 안전사고 조회: ${accidents.length}건`
          );

          return res.status(200).json({
            success: true,
            data: accidents,
          });
        }

        // 특정 사고 조회
        if (id) {
          const { ObjectId } = require('mongodb');
          const accident = await accidentsCollection.findOne({
            _id: new ObjectId(id),
          });

          if (!accident) {
            return res.status(404).json({
              success: false,
              message: '안전사고를 찾을 수 없습니다.',
            });
          }

          console.log(`✅ [Safety API] 안전사고 조회: ${id}`);

          return res.status(200).json({
            success: true,
            data: accident,
          });
        }

        // 전체 안전사고 조회 (날짜 범위 지원)
        const { startDate, endDate, page = 1, limit = 50 } = req.query;
        const filter = {};

        if (startDate && endDate) {
          filter.date = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
          filter.date = { $gte: startDate };
        } else if (endDate) {
          filter.date = { $lte: endDate };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [accidents, total] = await Promise.all([
          accidentsCollection
            .find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ date: -1, createdAt: -1 })
            .toArray(),
          accidentsCollection.countDocuments(filter),
        ]);

        console.log(`✅ [Safety API] 안전사고 조회: ${accidents.length}건`);

        return res.status(200).json({
          success: true,
          data: accidents,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        });
      }

      // ==========================================
      // POST: 안전사고 등록
      // ==========================================
      case 'POST': {
        const data = {
          ...req.body,
          createdAt: new Date(),
        };

        const result = await accidentsCollection.insertOne(data);
        const created = await accidentsCollection.findOne({
          _id: result.insertedId,
        });

        console.log(
          `✅ [Safety API] 안전사고 등록: ${data.date}, ${data.severity}`
        );

        return res.status(201).json({
          success: true,
          data: created,
        });
      }

      // ==========================================
      // PUT: 안전사고 수정
      // ==========================================
      case 'PUT': {
        if (!id) {
          return res.status(400).json({
            success: false,
            message: '사고 ID가 필요합니다.',
          });
        }

        const { ObjectId } = require('mongodb');
        const { _id, createdAt, ...updateData } = req.body;
        updateData.updatedAt = new Date();

        const result = await accidentsCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );

        if (!result.value) {
          return res.status(404).json({
            success: false,
            message: '안전사고를 찾을 수 없습니다.',
          });
        }

        console.log(`✅ [Safety API] 안전사고 수정: ${id}`);

        return res.status(200).json({
          success: true,
          data: result.value,
        });
      }

      // ==========================================
      // DELETE: 안전사고 삭제
      // ==========================================
      case 'DELETE': {
        if (!id) {
          return res.status(400).json({
            success: false,
            message: '사고 ID가 필요합니다.',
          });
        }

        const { ObjectId } = require('mongodb');
        const result = await accidentsCollection.findOneAndDelete({
          _id: new ObjectId(id),
        });

        if (!result.value) {
          return res.status(404).json({
            success: false,
            message: '안전사고를 찾을 수 없습니다.',
          });
        }

        console.log(`✅ [Safety API] 안전사고 삭제: ${id}`);

        return res.status(200).json({
          success: true,
          message: '안전사고가 삭제되었습니다.',
          data: result.value,
        });
      }

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
    }
  } catch (error) {
    console.error('❌ [Safety API] 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message,
    });
  }
};
