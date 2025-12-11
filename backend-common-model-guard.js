// ==========================================
// 공통 미들웨어 자동 주입형 - GPT · Gemini · Claude 통합 보안 가드
// ==========================================
// 목적: 세 프로바이더(OpenAI, Google Gemini, Anthropic Claude) 모두에
//       동일한 모델 허용 정책과 보안 규칙을 자동으로 적용

// ==========================================
// 1. 허용 모델 목록 (프론트엔드 ALLOW_MODEL_LIST와 동일하게 유지)
// ==========================================
const ALLOW_MODEL_LIST = [
  // OpenAI
  'gpt-5',
  'gpt-4o',
  // Google Gemini
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  // Anthropic Claude
  'claude-3-5-sonnet',
  'claude-3-5-opus',
];

// ==========================================
// 2. 공통 미들웨어 팩토리 함수
// ==========================================
/**
 * 모델 가드 미들웨어를 생성합니다.
 * @param {Object} options - 설정 옵션
 * @param {string[]} options.allowList - 허용할 모델 ID 목록
 * @param {Object} options.logger - 로깅 객체 (warn, error 메서드 필요)
 * @returns {Function} Express 미들웨어 함수
 */
function createModelGuardMiddleware({ allowList = ALLOW_MODEL_LIST, logger = console } = {}) {
  return function modelGuard(req, res, next) {
    try {
      // AI 관련 엔드포인트만 검증
      const isAiEndpoint =
        req.path.includes('/chat') ||
        req.path.includes('/analyze') ||
        req.path.includes('/ask') ||
        req.path.includes('/inference');

      if (!isAiEndpoint) {
        return next();
      }

      const requestedModel = req.body?.model || '';

      // 허용 목록 확인
      if (!allowList.includes(requestedModel)) {
        // 감사 로그
        logger.warn?.({
          event: 'MODEL_BLOCKED',
          user: req.user?.id || req.headers?.['x-user-id'] || 'unknown',
          provider: req.provider || 'unknown',
          requestedModel,
          allowedModels: allowList,
          ip: req.ip || req.connection?.remoteAddress,
          endpoint: req.path,
          timestamp: new Date().toISOString(),
        });

        // 403 응답
        return res.status(403).json({
          message: '데이터 분석 불가',
          error: 'MODEL_NOT_ALLOWED',
        });
      }

      // 검증 통과 - 다음 미들웨어로
      next();
    } catch (error) {
      logger.error?.({
        event: 'MODEL_GUARD_ERROR',
        error: String(error),
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      return res.status(403).json({
        message: '데이터 분석 불가',
        error: 'VALIDATION_ERROR',
      });
    }
  };
}

// ==========================================
// 3. 프로바이더 라우트 자동 주입 유틸
// ==========================================
/**
 * 특정 basePath의 모든 라우트에 미들웨어를 자동으로 주입합니다.
 * @param {Object} app - Express 앱 인스턴스
 * @param {string} basePath - 기본 경로 (예: "/api/openai", "/api/gemini", "/api/claude")
 * @param {Function[]} middlewares - 적용할 미들웨어 배열
 */
function attachGuardToRoutes(app, basePath, middlewares = []) {
  // provider 정보를 request 객체에 자동 주입
  const providerName = basePath.split('/').pop();

  app.use(basePath, (req, res, next) => {
    req.provider = providerName;
    next();
  }, ...middlewares);
}

// ==========================================
// 4. 서버 초기화 예시
// ==========================================
/**
 * Express 앱에 모델 가드를 설정합니다.
 * @param {Object} app - Express 앱 인스턴스
 * @param {Object} options - 설정 옵션
 */
function setupModelGuard(app, options = {}) {
  const {
    allowList = ALLOW_MODEL_LIST,
    logger = console,
    providers = ['openai', 'gemini', 'claude'],
  } = options;

  // 공통 미들웨어 생성
  const modelGuard = createModelGuardMiddleware({ allowList, logger });

  // 각 프로바이더에 자동 적용
  providers.forEach((provider) => {
    const basePath = `/api/${provider}`;
    attachGuardToRoutes(app, basePath, [modelGuard]);
    logger.info?.(`✓ Model guard applied to ${basePath}`);
  });

  return modelGuard;
}

// ==========================================
// 5. 사용 예시
// ==========================================
/*
// server.js 또는 app.js에서:

const express = require('express');
const { setupModelGuard } = require('./backend-common-model-guard');

const app = express();
app.use(express.json());

// 모델 가드 설정 (한 줄로 세 프로바이더 모두 보호)
setupModelGuard(app, {
  allowList: ALLOW_MODEL_LIST, // 커스텀 허용 목록 (선택)
  logger: console,              // 커스텀 로거 (선택)
  providers: ['openai', 'gemini', 'claude'] // 보호할 프로바이더 (선택)
});

// 이후 라우트 정의 (가드가 자동으로 적용됨)
app.post('/api/openai/chat', async (req, res) => {
  // req.body.model은 이미 검증됨
  const { model, messages } = req.body;
  // ... OpenAI API 호출 ...
});

app.post('/api/gemini/chat', async (req, res) => {
  // req.body.model은 이미 검증됨
  const { model, messages } = req.body;
  // ... Gemini API 호출 ...
});

app.post('/api/claude/chat', async (req, res) => {
  // req.body.model은 이미 검증됨
  const { model, messages } = req.body;
  // ... Claude API 호출 ...
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
*/

// ==========================================
// 6. 테스트 라우트 (스폿체크용)
// ==========================================
/**
 * 모델의 내부/외부 데이터 접근 능력을 테스트하는 라우트를 추가합니다.
 * @param {Object} app - Express 앱 인스턴스
 */
function setupTestRoutes(app) {
  app.post('/api/:provider/test-query', async (req, res) => {
    try {
      const { provider } = req.params;
      const { model, query } = req.body || {};

      if (!model || !query) {
        return res.status(400).json({
          message: '데이터 분석 불가',
          error: 'MISSING_PARAMETERS',
        });
      }

      // 실제 구현에서는 각 프로바이더의 API를 호출
      // 여기서는 스텁 응답 반환
      const answer = `[Test Response from ${provider}/${model}] Query: "${query}"`;

      return res.json({ answer, provider, model });
    } catch (error) {
      return res.status(500).json({
        message: '데이터 분석 불가',
        error: 'TEST_QUERY_FAILED',
      });
    }
  });
}

// ==========================================
// 7. Export
// ==========================================
module.exports = {
  ALLOW_MODEL_LIST,
  createModelGuardMiddleware,
  attachGuardToRoutes,
  setupModelGuard,
  setupTestRoutes,
};
