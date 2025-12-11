const { connectToDatabase } = require('./utils/mongodb');
const {
  setCorsHeaders,
  handleOptions,
  errorResponse,
  successResponse,
  validateAndRespond,
  parsePagination,
  createPaginationMeta,
  log,
} = require('./utils/helpers');

/**
 * Vercel Serverless Function - 커뮤니케이션 API (공지/알림/건의)
 * @route /api/communication
 * @methods GET, POST, PUT, DELETE
 */
module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const { db } = await connectToDatabase();

    // 쿼리 파라미터로 타입 결정
    const { type, id, action } = req.query;

    // 타입별 컬렉션 선택
    let collection;
    if (type === 'notices') {
      collection = db.collection('notices');
    } else if (type === 'notifications') {
      collection = db.collection('notifications');
    } else if (type === 'suggestions') {
      collection = db.collection('suggestions');
    } else {
      return res.status(400).json({
        success: false,
        message:
          'type 파라미터가 필요합니다 (notices/notifications/suggestions)',
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

          console.log(`✅ [Communication API] ${type} 조회: ${id}`);

          return res.status(200).json({
            success: true,
            data: item,
          });
        }

        // 최근 알림 조회 (recent action)
        if (type === 'notifications' && action === 'recent') {
          const { employeeId, limit = 10 } = req.query;

          const filter = {};
          if (employeeId) {
            filter.$or = [{ recipients: employeeId }, { recipients: 'all' }];
          }

          const notifications = await collection
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .toArray();

          console.log(
            `✅ [Communication API] 최근 알림 조회: ${notifications.length}건`
          );

          return res.status(200).json({
            success: true,
            data: notifications,
          });
        }

        // 전체 목록 조회
        const {
          page = 1,
          limit = 20,
          status,
          department,
          category,
          search,
        } = req.query;

        const filter = {};

        // 상태 필터
        if (status) {
          filter.status = status;
        }

        // 부서 필터
        if (department && department !== '전체') {
          filter.department = department;
        }

        // 카테고리 필터
        if (category && category !== '전체') {
          filter.category = category;
        }

        // 검색어 필터
        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
          ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [items, total] = await Promise.all([
          collection
            .find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray(),
          collection.countDocuments(filter),
        ]);

        console.log(
          `✅ [Communication API] ${type} 목록 조회: ${items.length}건`
        );

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
        const data = req.body;

        // 필수 필드 검증
        if (!data.title && !data.content) {
          return res.status(400).json({
            success: false,
            message: '제목 또는 내용이 필요합니다.',
          });
        }

        // 공통 필드 추가
        const newItem = {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 타입별 기본값 설정
        if (type === 'notices') {
          newItem.views = newItem.views || 0;
          newItem.isPinned = newItem.isPinned || false;
        } else if (type === 'notifications') {
          newItem.read = newItem.read || false;
          newItem.type = newItem.type || 'info';
        } else if (type === 'suggestions') {
          newItem.status = newItem.status || '접수';
          newItem.response = newItem.response || null;
        }

        const result = await collection.insertOne(newItem);
        const createdItem = await collection.findOne({
          _id: result.insertedId,
        });

        console.log(
          `✅ [Communication API] ${type} 생성: ${data.title || '제목없음'}`
        );

        return res.status(201).json({
          success: true,
          data: createdItem,
          message: `${type} 항목이 생성되었습니다.`,
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

        // 상태 변경 (알림 읽음 처리 등)
        if (action === 'status') {
          const { status: newStatus, read } = req.body;
          const updateData = { updatedAt: new Date() };

          if (newStatus !== undefined) {
            updateData.status = newStatus;
          }

          if (read !== undefined) {
            updateData.read = read;
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

          console.log(`✅ [Communication API] ${type} 상태 변경: ${id}`);

          return res.status(200).json({
            success: true,
            data: result.value,
          });
        }

        // 전체 수정
        const { _id, createdAt, ...updateData } = req.body;
        updateData.updatedAt = new Date();

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

        console.log(`✅ [Communication API] ${type} 수정: ${id}`);

        return res.status(200).json({
          success: true,
          data: result.value,
          message: `${type} 항목이 수정되었습니다.`,
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

        console.log(`✅ [Communication API] ${type} 삭제: ${id}`);

        return res.status(200).json({
          success: true,
          message: `${type} 항목이 삭제되었습니다.`,
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
    console.error('❌ [Communication API] 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message,
    });
  }
};
