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
 * Vercel Serverless Function - 직원 관리 API
 * @route /api/employees
 * @methods GET, POST, PUT, DELETE
 */
module.exports = async (req, res) => {
  // CORS 헤더 설정
  setCorsHeaders(res);

  // OPTIONS 요청 처리
  if (handleOptions(req, res)) return;

  try {
    const { db } = await connectToDatabase();
    const employeesCollection = db.collection('employees');

    switch (req.method) {
      // ==========================================
      // GET: 직원 조회
      // ==========================================
      case 'GET': {
        const { id, department, status, page = 1, limit = 50 } = req.query;

        // 특정 직원 조회 (ID 파라미터가 있는 경우)
        if (id) {
          const employee = await employeesCollection.findOne(
            { employeeId: id },
            { projection: { password: 0 } } // 비밀번호 제외
          );

          if (!employee) {
            return errorResponse(res, '직원을 찾을 수 없습니다.', 404);
          }

          return successResponse(res, employee);
        }

        // 전체 직원 조회 (필터링 및 페이지네이션)
        const filter = {};
        if (department) filter.department = department;
        if (status) filter.status = status;

        const { skip, limit: pageLimit } = parsePagination(req.query);

        const [employees, total] = await Promise.all([
          employeesCollection
            .find(filter, { projection: { password: 0 } })
            .skip(skip)
            .limit(pageLimit)
            .sort({ createdAt: -1 })
            .toArray(),
          employeesCollection.countDocuments(filter),
        ]);

        const pagination = createPaginationMeta(
          parseInt(page),
          pageLimit,
          total
        );

        return successResponse(res, employees, 200, null, { pagination });
      }

      // ==========================================
      // POST: 새 직원 등록
      // ==========================================
      case 'POST': {
        const {
          employeeId,
          name,
          email,
          password,
          department,
          position,
          hireDate,
        } = req.body;

        // 필수 필드 확인
        if (
          !validateAndRespond(req, res, [
            'employeeId',
            'name',
            'password',
            'department',
            'position',
          ])
        ) {
          return;
        }

        // 중복 확인
        const existingEmployee = await employeesCollection.findOne({
          $or: [{ employeeId }, ...(email ? [{ email }] : [])],
        });

        if (existingEmployee) {
          return errorResponse(res, '이미 등록된 사번 또는 이메일입니다.', 400);
        }

        // 직원 데이터 생성 (비밀번호는 평문 저장 - 기존 시스템과 동일)
        const newEmployee = {
          ...req.body,
          status: req.body.status || 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await employeesCollection.insertOne(newEmployee);

        // 생성된 직원 조회
        const createdEmployee = await employeesCollection.findOne(
          { _id: result.insertedId },
          { projection: { password: 0 } }
        );

        log('success', `직원 등록: ${name} (${employeeId})`);

        return successResponse(
          res,
          createdEmployee,
          201,
          '직원이 성공적으로 등록되었습니다.'
        );
      }

      // ==========================================
      // PUT: 직원 정보 수정
      // ==========================================
      case 'PUT': {
        const { id } = req.query;

        if (!id) {
          return errorResponse(res, '직원 ID가 필요합니다.', 400);
        }

        const { _id, createdAt, ...updateData } = req.body;
        updateData.updatedAt = new Date();

        const result = await employeesCollection.findOneAndUpdate(
          { employeeId: id },
          { $set: updateData },
          { returnDocument: 'after', projection: { password: 0 } }
        );

        if (!result.value) {
          return errorResponse(res, '직원을 찾을 수 없습니다.', 404);
        }

        log('success', `직원 수정: ${id}`);

        return successResponse(
          res,
          result.value,
          200,
          '직원 정보가 수정되었습니다.'
        );
      }

      // ==========================================
      // DELETE: 직원 삭제 (퇴사 처리)
      // ==========================================
      case 'DELETE': {
        const { id } = req.query;

        if (!id) {
          return errorResponse(res, '직원 ID가 필요합니다.', 400);
        }

        const result = await employeesCollection.findOneAndUpdate(
          { employeeId: id },
          {
            $set: {
              status: 'terminated',
              updatedAt: new Date(),
            },
          },
          { returnDocument: 'after', projection: { password: 0 } }
        );

        if (!result.value) {
          return errorResponse(res, '직원을 찾을 수 없습니다.', 404);
        }

        log('success', `직원 퇴사 처리: ${id}`);

        return successResponse(
          res,
          result.value,
          200,
          '직원이 퇴사 처리되었습니다.'
        );
      }

      // ==========================================
      // 지원하지 않는 메서드
      // ==========================================
      default:
        return errorResponse(res, 'Method not allowed', 405);
    }
  } catch (error) {
    return errorResponse(res, error);
  }
};
