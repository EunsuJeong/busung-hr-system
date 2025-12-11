// ==========================================
// 백엔드 모델 가드 미들웨어 (Express 예시)
// ==========================================
// 목적: 허용되지 않은 AI 모델로의 요청을 서버에서 차단
// 위치: server.js 또는 routes/api.js에 추가

// 허용 모델 목록 (프론트엔드 ALLOW_MODEL_LIST와 동일하게 유지)
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

// 모델 검증 미들웨어
function modelGuardMiddleware(req, res, next) {
  // AI 관련 엔드포인트만 검증
  if (req.path.startsWith('/api/ai') || req.path.startsWith('/api/chat')) {
    const requestedModel = req.body?.model || '';

    // 허용 목록에 없는 모델 차단
    if (!ALLOW_MODEL_LIST.includes(requestedModel)) {
      // 감사 로그 (선택사항)
      console.warn('[보안] 허용되지 않은 모델 요청 차단:', {
        model: requestedModel,
        userId: req.user?.id || 'unknown',
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      // 403 응답 반환
      return res.status(403).json({
        message: '데이터 분석 불가',
        error: 'MODEL_NOT_ALLOWED',
      });
    }
  }

  // 검증 통과 시 다음 핸들러로
  next();
}

// ==========================================
// 사용 방법 (Express 앱에 적용)
// ==========================================

// 방법 1: 전역 미들웨어로 적용
// app.use(modelGuardMiddleware);

// 방법 2: 특정 라우트에만 적용
// app.post('/api/ai/analyze', modelGuardMiddleware, aiAnalyzeHandler);
// app.post('/api/chat', modelGuardMiddleware, chatHandler);

// 방법 3: 라우터 레벨 적용
// const apiRouter = express.Router();
// apiRouter.use(modelGuardMiddleware);
// app.use('/api', apiRouter);

module.exports = modelGuardMiddleware;
