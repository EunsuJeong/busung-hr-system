/**
 * API 설정 및 엔드포인트 상수
 * 환경에 따라 API Base URL을 자동으로 설정합니다.
 */

// ==================== API Base URL 설정 ====================
/**
 * 개발 환경: http://localhost:5000/api
 * 프로덕션 환경: /api (상대 경로 - Vercel에서 자동 라우팅)
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (isProduction ? '/api' : 'http://localhost:5000/api');

console.log(`🌐 API Base URL: ${API_BASE_URL}`);
console.log(`📍 Environment: ${process.env.NODE_ENV}`);

// ==================== API 엔드포인트 경로 ====================

/**
 * 직원 관리 API
 */
export const EMPLOYEE_ENDPOINTS = {
  BASE: '/employees',
  LOGIN: '/hr/login',
  LIST: '/hr/employees',
  BY_ID: (id) => `/hr/employees/${id}`,
  STATS: '/hr/employees/stats/summary',
};

/**
 * 관리자 API
 */
export const ADMIN_ENDPOINTS = {
  BASE: '/admin',
  LOGIN: '/admin/admins/login',
  LIST: '/admin/admins',
  BY_ID: (id) => `/admin/admins/${id}`,
};

/**
 * 근태 관리 API
 */
export const ATTENDANCE_ENDPOINTS = {
  BASE: '/attendance',
  LIST: '/attendance',
  BY_DATE: (date) => `/attendance?date=${date}`,
  MONTHLY: (year, month) => `/attendance/monthly/${year}/${month}`,
  BULK: '/attendance/bulk',
  CHECK_IN: '/attendance/check-in',
  CHECK_OUT: '/attendance/check-out',
  STATS: (year, month) => `/attendance/stats/${year}/${month}`,
};

/**
 * 공휴일 API
 */
export const HOLIDAY_ENDPOINTS = {
  BASE: '/holiday',
  LIST: '/holiday',
  BY_YEAR: (year) => `/holiday?year=${year}`,
  RANGE: (startYear, endYear) =>
    `/holiday?startYear=${startYear}&endYear=${endYear}`,
  STATS: '/holiday?action=stats',
  BULK: '/holiday/bulk',
};

/**
 * 커뮤니케이션 API (공지/알림/건의)
 */
export const COMMUNICATION_ENDPOINTS = {
  BASE: '/communication',
  NOTICES: '/communication?type=notices',
  NOTICE_BY_ID: (id) => `/communication?type=notices&id=${id}`,
  NOTIFICATIONS: '/communication?type=notifications',
  NOTIFICATION_BY_ID: (id) => `/communication?type=notifications&id=${id}`,
  RECENT_NOTIFICATIONS: '/communication?type=notifications&action=recent',
  SUGGESTIONS: '/communication?type=suggestions',
  SUGGESTION_BY_ID: (id) => `/communication?type=suggestions&id=${id}`,
};

/**
 * 급여 관리 API
 */
export const PAYROLL_ENDPOINTS = {
  BASE: '/payroll',
  LIST: '/payroll',
  BY_YEAR_MONTH: (year, month) => `/payroll?year=${year}&month=${month}`,
  BY_EMPLOYEE: (employeeId) => `/payroll?employeeId=${employeeId}`,
  BULK: '/payroll/bulk',
};

/**
 * 시스템 관리 API (일정/로그/세션)
 */
export const SYSTEM_ENDPOINTS = {
  BASE: '/system',
  HEALTH: '/system?action=health',
  SCHEDULES: '/system?type=schedules',
  SCHEDULE_BY_ID: (id) => `/system?type=schedules&id=${id}`,
  LOGS: '/system?type=logs',
  LOG_BY_ID: (id) => `/system?type=logs&id=${id}`,
  SESSIONS: '/system?type=sessions',
  SESSION_BY_ID: (id) => `/system?type=sessions&id=${id}`,
};

/**
 * 안전 관리 API
 */
export const SAFETY_ENDPOINTS = {
  BASE: '/safety',
  LIST: '/safety',
  BY_DATE: (date) => `/safety?date=${date}`,
  BY_LOCATION: (location) => `/safety?location=${location}`,
  WEATHER: '/safety?type=weather',
  WEATHER_BY_DATE: (date) => `/safety?type=weather&date=${date}`,
};

/**
 * 연차/휴가 관리 API
 */
export const LEAVE_ENDPOINTS = {
  BASE: '/leave',
  LIST: '/leave',
  BY_EMPLOYEE: (employeeId) => `/leave?employeeId=${employeeId}`,
  BY_YEAR: (year) => `/leave?year=${year}`,
  STATS: '/leave/stats',
  APPROVE: (id) => `/leave/${id}/approve`,
  REJECT: (id) => `/leave/${id}/reject`,
};

/**
 * 평가 관리 API
 */
export const EVALUATION_ENDPOINTS = {
  BASE: '/evaluation',
  LIST: '/evaluation',
  BY_EMPLOYEE: (employeeId) => `/evaluation?employeeId=${employeeId}`,
  BY_PERIOD: (year, quarter) => `/evaluation?year=${year}&quarter=${quarter}`,
};

// ==================== 헬퍼 함수 ====================

/**
 * 전체 URL 생성 (Base URL + 엔드포인트)
 * @param {string} endpoint - API 엔드포인트 경로
 * @returns {string} 전체 URL
 */
export const buildUrl = (endpoint) => {
  // endpoint가 이미 전체 URL인 경우
  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  // endpoint가 슬래시로 시작하지 않으면 추가
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${API_BASE_URL}${path}`;
};

/**
 * 쿼리 파라미터를 URL에 추가
 * @param {string} endpoint - 기본 엔드포인트
 * @param {Object} params - 쿼리 파라미터 객체
 * @returns {string} 쿼리 파라미터가 추가된 URL
 */
export const buildUrlWithParams = (endpoint, params) => {
  const url = new URL(buildUrl(endpoint), window.location.origin);

  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

  return url.toString();
};

/**
 * 환경 정보
 */
export const ENV_INFO = {
  isDevelopment,
  isProduction,
  nodeEnv: process.env.NODE_ENV,
  apiBaseUrl: API_BASE_URL,
};

// ==================== Export 통합 ====================
export default {
  API_BASE_URL,
  EMPLOYEE_ENDPOINTS,
  ADMIN_ENDPOINTS,
  ATTENDANCE_ENDPOINTS,
  HOLIDAY_ENDPOINTS,
  COMMUNICATION_ENDPOINTS,
  PAYROLL_ENDPOINTS,
  SYSTEM_ENDPOINTS,
  SAFETY_ENDPOINTS,
  LEAVE_ENDPOINTS,
  EVALUATION_ENDPOINTS,
  buildUrl,
  buildUrlWithParams,
  ENV_INFO,
};
