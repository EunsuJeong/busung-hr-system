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
 * Vercel Serverless Function - 관리자 관리 API
 * @route /api/admin
 * @methods GET, POST, PUT, DELETE
 */
module.exports = async (req, res) => {
  // CORS 헤더 설정
  setCorsHeaders(res);

  // OPTIONS 요청 처리
  if (handleOptions(req, res)) return;

  try {
    const { db } = await connectToDatabase();
    const adminsCollection = db.collection('admins');

    const { action, adminId } = req.query;

    switch (req.method) {
      // ==========================================
      // GET: 관리자 조회
      // ==========================================
      case 'GET': {
        // 특정 관리자 조회
        if (adminId) {
          const admin = await adminsCollection.findOne({ adminId });

          if (!admin) {
            return errorResponse(res, '관리자를 찾을 수 없습니다.', 404);
          }

          log('success', `관리자 조회: ${admin.name}`);

          // 비밀번호 제외
          const { password, ...adminData } = admin;

          return successResponse(res, adminData);
        }

        // 전체 관리자 조회
        const admins = await adminsCollection
          .find({ status: '재직' })
          .project({ password: 0 }) // 비밀번호 제외
          .sort({ createdAt: -1 })
          .toArray();

        log('success', `관리자 목록 조회: ${admins.length}건`);

        return successResponse(res, admins);
      }

      // ==========================================
      // POST: 관리자 생성/로그인
      // ==========================================
      case 'POST': {
        // 로그인
        if (action === 'login') {
          const { id, password } = req.body;

          log('info', `로그인 요청: id=${id}`);

          // adminId 또는 name으로 검색
          const admin = await adminsCollection.findOne({
            $or: [{ adminId: id }, { name: id }],
            status: '재직',
          });

          if (!admin) {
            return errorResponse(res, '아이디를 찾을 수 없습니다.', 401);
          }

          // 비밀번호 확인
          if (admin.password !== password) {
            return errorResponse(res, '비밀번호가 일치하지 않습니다.', 401);
          }

          log('success', `로그인 성공: ${admin.name}`);

          // 비밀번호 제외하고 반환
          const { password: _, ...adminData } = admin;

          return successResponse(res, { admin: adminData });
        }

        // 관리자 등록
        const {
          adminId,
          name,
          password,
          phone,
          department,
          position,
          joinDate,
          address,
        } = req.body;

        log('info', '관리자 등록 요청', { adminId, name });

        // 중복 체크
        const existingAdmin = await adminsCollection.findOne({ adminId });
        if (existingAdmin) {
          return errorResponse(res, '이미 존재하는 관리자 ID입니다.', 400);
        }

        const newAdmin = {
          adminId,
          name,
          password,
          phone,
          department,
          position,
          joinDate: joinDate ? new Date(joinDate) : new Date(),
          address,
          status: '재직',
          isAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await adminsCollection.insertOne(newAdmin);
        const createdAdmin = await adminsCollection.findOne(
          { _id: result.insertedId },
          { projection: { password: 0 } }
        );

        log('success', `관리자 등록 완료: ${name}`);

        return successResponse(res, createdAdmin, 201);
      }

      // ==========================================
      // PUT: 관리자 수정
      // ==========================================
      case 'PUT': {
        if (!adminId) {
          return errorResponse(res, '관리자 ID가 필요합니다.', 400);
        }

        // 비밀번호 변경
        if (action === 'password') {
          const { currentPassword, newPassword } = req.body;

          log('info', `비밀번호 변경 요청: ${adminId}`);

          // 관리자 찾기
          const admin = await adminsCollection.findOne({
            adminId,
            status: '재직',
          });

          if (!admin) {
            return errorResponse(res, '관리자를 찾을 수 없습니다.', 404);
          }

          // 현재 비밀번호 확인
          if (admin.password !== currentPassword) {
            return errorResponse(
              res,
              '현재 비밀번호가 일치하지 않습니다.',
              401
            );
          }

          // 새 비밀번호 업데이트
          await adminsCollection.updateOne(
            { adminId },
            {
              $set: {
                password: newPassword,
                updatedAt: new Date(),
              },
            }
          );

          log('success', `비밀번호 변경 완료: ${admin.name}`);

          return successResponse(
            res,
            null,
            200,
            '비밀번호가 성공적으로 변경되었습니다.'
          );
        }

        // 관리자 정보 수정
        const { _id, createdAt, password, ...updateData } = req.body;
        updateData.updatedAt = new Date();

        const result = await adminsCollection.findOneAndUpdate(
          { adminId },
          { $set: updateData },
          { returnDocument: 'after', projection: { password: 0 } }
        );

        if (!result.value) {
          return errorResponse(res, '관리자를 찾을 수 없습니다.', 404);
        }

        log('success', `관리자 수정 완료: ${adminId}`);

        return successResponse(res, result.value);
      }

      // ==========================================
      // DELETE: 관리자 삭제 (퇴사 처리)
      // ==========================================
      case 'DELETE': {
        if (!adminId) {
          return errorResponse(res, '관리자 ID가 필요합니다.', 400);
        }

        const result = await adminsCollection.findOneAndUpdate(
          { adminId },
          {
            $set: {
              status: '퇴사',
              updatedAt: new Date(),
            },
          },
          { returnDocument: 'after', projection: { password: 0 } }
        );

        if (!result.value) {
          return errorResponse(res, '관리자를 찾을 수 없습니다.', 404);
        }

        log('success', `관리자 삭제 완료: ${adminId}`);

        return successResponse(
          res,
          result.value,
          200,
          '관리자가 삭제되었습니다.'
        );
      }

      default:
        return errorResponse(res, 'Method not allowed', 405);
    }
  } catch (error) {
    return errorResponse(res, error);
  }
};
