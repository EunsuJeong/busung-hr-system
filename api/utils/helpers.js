/**
 * Vercel Serverless Functions - 공통 헬퍼 함수
 * 모든 API에서 재사용 가능한 유틸리티 함수들
 */

// CORS 헤더 정의
const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * CORS 헤더를 응답에 설정
 * @param {Object} res - Vercel response 객체
 */
const setCorsHeaders = (res) => {
  Object.keys(CORS_HEADERS).forEach((key) => {
    res.setHeader(key, CORS_HEADERS[key]);
  });
};

/**
 * OPTIONS 메서드 처리 (CORS preflight)
 * @param {Object} req - Vercel request 객체
 * @param {Object} res - Vercel response 객체
 * @returns {boolean} OPTIONS 요청인 경우 true
 */
const handleOptions = (req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).json({ success: true });
    return true;
  }
  return false;
};

/**
 * 에러 응답 전송
 * @param {Object} res - Vercel response 객체
 * @param {Error|string} error - 에러 객체 또는 에러 메시지
 * @param {number} statusCode - HTTP 상태 코드 (기본값: 500)
 * @param {Object} additionalData - 추가 데이터
 */
const errorResponse = (res, error, statusCode = 500, additionalData = {}) => {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error.message || '서버 오류가 발생했습니다.';

  console.error(`❌ API Error [${statusCode}]:`, errorMessage);
  if (error instanceof Error) {
    console.error('Stack:', error.stack);
  }

  return res.status(statusCode).json({
    success: false,
    error: errorMessage,
    message: errorMessage,
    ...additionalData,
  });
};

/**
 * 성공 응답 전송
 * @param {Object} res - Vercel response 객체
 * @param {any} data - 응답 데이터
 * @param {number} statusCode - HTTP 상태 코드 (기본값: 200)
 * @param {string} message - 성공 메시지
 * @param {Object} additionalData - 추가 데이터
 */
const successResponse = (
  res,
  data,
  statusCode = 200,
  message = null,
  additionalData = {}
) => {
  const response = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...additionalData,
  };

  return res.status(statusCode).json(response);
};

/**
 * 필수 필드 검증
 * @param {Object} req - Vercel request 객체
 * @param {Array<string>} requiredFields - 필수 필드 목록
 * @returns {Object} { isValid: boolean, missingFields: Array<string> }
 */
const validateRequest = (req, requiredFields) => {
  const data = req.method === 'GET' ? req.query : req.body;
  const missingFields = [];

  for (const field of requiredFields) {
    // 중첩된 필드 지원 (예: 'user.name')
    const fieldPath = field.split('.');
    let value = data;

    for (const path of fieldPath) {
      value = value?.[path];
    }

    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * 필수 필드 검증 및 에러 응답
 * @param {Object} req - Vercel request 객체
 * @param {Object} res - Vercel response 객체
 * @param {Array<string>} requiredFields - 필수 필드 목록
 * @returns {boolean} 검증 통과 여부
 */
const validateAndRespond = (req, res, requiredFields) => {
  const { isValid, missingFields } = validateRequest(req, requiredFields);

  if (!isValid) {
    errorResponse(
      res,
      `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
      400,
      { missingFields }
    );
    return false;
  }

  return true;
};

/**
 * 페이지네이션 파라미터 파싱
 * @param {Object} query - 쿼리 파라미터
 * @param {number} defaultLimit - 기본 limit 값
 * @returns {Object} { page, limit, skip }
 */
const parsePagination = (query, defaultLimit = 20) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || defaultLimit;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * 페이지네이션 메타데이터 생성
 * @param {number} page - 현재 페이지
 * @param {number} limit - 페이지당 항목 수
 * @param {number} total - 전체 항목 수
 * @returns {Object} 페이지네이션 메타데이터
 */
const createPaginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
};

/**
 * MongoDB ObjectId 검증
 * @param {string} id - 검증할 ID
 * @returns {boolean} 유효한 ObjectId 여부
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * 안전한 JSON 파싱
 * @param {string} str - JSON 문자열
 * @param {any} defaultValue - 파싱 실패 시 기본값
 * @returns {any} 파싱된 객체 또는 기본값
 */
const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('JSON 파싱 실패:', error.message);
    return defaultValue;
  }
};

/**
 * 날짜 문자열 검증 (YYYY-MM-DD 형식)
 * @param {string} dateStr - 날짜 문자열
 * @returns {boolean} 유효한 날짜 형식 여부
 */
const isValidDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * 숫자 안전하게 파싱
 * @param {any} value - 파싱할 값
 * @param {number} defaultValue - 기본값
 * @returns {number} 파싱된 숫자
 */
const parseNumber = (value, defaultValue = 0) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,원]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

/**
 * 로그 출력 헬퍼
 * @param {string} type - 로그 타입 (info, success, error, warn)
 * @param {string} message - 로그 메시지
 * @param {any} data - 추가 데이터
 */
const log = (type, message, data = null) => {
  const emoji = {
    info: '🔍',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  };

  const prefix = emoji[type] || '📝';
  const timestamp = new Date().toISOString();

  if (data) {
    console.log(`${prefix} [${timestamp}] ${message}`, data);
  } else {
    console.log(`${prefix} [${timestamp}] ${message}`);
  }
};

/**
 * 에러를 안전하게 처리하는 래퍼
 * @param {Function} handler - 비동기 핸들러 함수
 * @returns {Function} 래핑된 핸들러
 */
const asyncHandler = (handler) => async (req, res) => {
  try {
    // CORS 헤더 설정
    setCorsHeaders(res);

    // OPTIONS 요청 처리
    if (handleOptions(req, res)) {
      return;
    }

    // 실제 핸들러 실행
    await handler(req, res);
  } catch (error) {
    console.error('❌ Async Handler Error:', error);
    errorResponse(res, error);
  }
};

module.exports = {
  // CORS 관련
  setCorsHeaders,
  handleOptions,
  CORS_HEADERS,

  // 응답 헬퍼
  errorResponse,
  successResponse,

  // 검증
  validateRequest,
  validateAndRespond,
  isValidObjectId,
  isValidDateString,

  // 페이지네이션
  parsePagination,
  createPaginationMeta,

  // 유틸리티
  safeJsonParse,
  parseNumber,
  log,
  asyncHandler,
};
