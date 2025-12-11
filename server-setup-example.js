// ==========================================
// 서버 설정 예시 - 공통 모델 가드 적용
// ==========================================
// 이 파일은 실제 서버(server.js 또는 app.js)에 적용할 때의 예시입니다.

const express = require('express');
const {
  setupModelGuard,
  setupTestRoutes,
  ALLOW_MODEL_LIST,
} = require('./backend-common-model-guard');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. 기본 미들웨어
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 설정 (필요한 경우)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// ==========================================
// 2. 모델 가드 설정 (한 줄로 세 프로바이더 모두 보호)
// ==========================================
setupModelGuard(app, {
  allowList: ALLOW_MODEL_LIST,
  logger: console,
  providers: ['openai', 'gemini', 'claude'],
});

// ==========================================
// 3. 테스트 라우트 설정 (스폿체크용)
// ==========================================
setupTestRoutes(app);

// ==========================================
// 4. 실제 AI 프로바이더 라우트
// ==========================================

// OpenAI 라우트
app.post('/api/openai/chat', async (req, res) => {
  try {
    const { model, messages, ...options } = req.body;

    // req.body.model은 이미 미들웨어에서 검증됨
    // 실제 OpenAI API 호출 (예시)
    /*
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      ...options,
    });

    return res.json(completion);
    */

    // 스텁 응답
    return res.json({
      provider: 'openai',
      model,
      response: `OpenAI ${model} 응답 예시`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('OpenAI 에러:', error);
    return res.status(500).json({ message: '데이터 분석 불가' });
  }
});

app.post('/api/openai/analyze', async (req, res) => {
  try {
    const { model, prompt, context } = req.body;

    // 실제 구현: OpenAI API 호출
    // 여기서는 스텁 응답
    return res.json({
      analysis: `${model}을 사용한 분석 결과입니다.`,
      context,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('OpenAI 분석 에러:', error);
    return res.status(500).json({ message: '데이터 분석 불가' });
  }
});

// Google Gemini 라우트
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { model, messages, ...options } = req.body;

    // 실제 Gemini API 호출 (예시)
    /*
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model });

    const result = await geminiModel.generateContent(messages);
    return res.json(result);
    */

    // 스텁 응답
    return res.json({
      provider: 'gemini',
      model,
      response: `Gemini ${model} 응답 예시`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Gemini 에러:', error);
    return res.status(500).json({ message: '데이터 분석 불가' });
  }
});

app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { model, prompt, context } = req.body;

    // 실제 구현: Gemini API 호출
    // 여기서는 스텁 응답
    return res.json({
      analysis: `${model}을 사용한 분석 결과입니다.`,
      context,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Gemini 분석 에러:', error);
    return res.status(500).json({ message: '데이터 분석 불가' });
  }
});

// Anthropic Claude 라우트
app.post('/api/claude/chat', async (req, res) => {
  try {
    const { model, messages, ...options } = req.body;

    // 실제 Claude API 호출 (예시)
    /*
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model,
      messages,
      ...options,
    });

    return res.json(message);
    */

    // 스텁 응답
    return res.json({
      provider: 'claude',
      model,
      response: `Claude ${model} 응답 예시`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Claude 에러:', error);
    return res.status(500).json({ message: '데이터 분석 불가' });
  }
});

app.post('/api/claude/analyze', async (req, res) => {
  try {
    const { model, prompt, context } = req.body;

    // 실제 구현: Claude API 호출
    // 여기서는 스텁 응답
    return res.json({
      analysis: `${model}을 사용한 분석 결과입니다.`,
      context,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Claude 분석 에러:', error);
    return res.status(500).json({ message: '데이터 분석 불가' });
  }
});

// ==========================================
// 5. 시스템 엔드포인트
// ==========================================

// 사용 가능한 모델 목록 반환
app.get('/api/system/available-models', (req, res) => {
  res.json({
    models: ALLOW_MODEL_LIST,
    timestamp: new Date().toISOString(),
  });
});

// API Key 업데이트 (보안 강화)
app.post('/api/system/update-key', (req, res) => {
  try {
    const { keyType, keyValue } = req.body;

    // 실제 구현: 환경 변수 또는 보안 저장소에 저장
    // 여기서는 검증만 수행
    if (!keyType || !keyValue) {
      return res.status(400).json({ message: '필수 파라미터 누락' });
    }

    const validKeyTypes = ['OPENAI_API_KEY', 'GEMINI_API_KEY', 'ANTHROPIC_API_KEY'];
    if (!validKeyTypes.includes(keyType)) {
      return res.status(400).json({ message: '유효하지 않은 키 타입' });
    }

    // 보안 저장 로직 (실제 구현 필요)
    console.log(`API Key 업데이트: ${keyType} (길이: ${keyValue.length})`);

    return res.json({
      success: true,
      message: 'API Key가 안전하게 저장되었습니다.',
    });
  } catch (error) {
    console.error('API Key 저장 에러:', error);
    return res.status(500).json({ message: '데이터 분석 불가' });
  }
});

// ==========================================
// 6. 에러 핸들링
// ==========================================

// 404 처리
app.use((req, res) => {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({ message: '데이터 분석 불가' });
});

// ==========================================
// 7. 서버 시작
// ==========================================

app.listen(PORT, () => {
  console.log(`
==========================================
🚀 HR 시스템 서버 시작됨
==========================================
포트: ${PORT}
모델 가드: ✓ 활성화됨
허용 모델: ${ALLOW_MODEL_LIST.length}개
  - OpenAI: ${ALLOW_MODEL_LIST.filter((m) => m.includes('gpt')).join(', ')}
  - Gemini: ${ALLOW_MODEL_LIST.filter((m) => m.includes('gemini')).join(', ')}
  - Claude: ${ALLOW_MODEL_LIST.filter((m) => m.includes('claude')).join(', ')}
==========================================
  `);
});

module.exports = app;
