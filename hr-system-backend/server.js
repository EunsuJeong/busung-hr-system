const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정 - 프론트엔드에서만 접근 허용
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'HR System Backend Server is running!' });
});

// OpenAI API 프록시 엔드포인트
app.post('/api/openai/chat', async (req, res) => {
  try {
    const { messages, apiKey, model = 'gpt-4', maxTokens = 3000, temperature = 0.7 } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        error: 'API 키가 필요합니다.',
        code: 'NO_API_KEY'
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: '메시지 배열이 필요합니다.',
        code: 'INVALID_MESSAGES'
      });
    }

    console.log(`🤖 OpenAI API 호출 - Model: ${model}, Messages: ${messages.length}개`);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30초 타임아웃
      }
    );

    console.log('✅ OpenAI API 응답 성공');
    res.json({
      success: true,
      data: response.data,
      message: 'OpenAI API 호출 성공'
    });

  } catch (error) {
    console.error('❌ OpenAI API 오류:', error.message);

    if (error.response) {
      // OpenAI API에서 오류 응답을 받은 경우
      const status = error.response.status;
      const errorData = error.response.data;

      let errorMessage = 'OpenAI API 오류가 발생했습니다.';
      let errorCode = 'API_ERROR';

      switch (status) {
        case 401:
          errorMessage = 'API 키가 유효하지 않습니다. 올바른 API 키를 확인해주세요.';
          errorCode = 'INVALID_API_KEY';
          break;
        case 403:
          errorMessage = 'API 접근이 거부되었습니다. 계정 상태를 확인해주세요.';
          errorCode = 'ACCESS_DENIED';
          break;
        case 429:
          errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
          errorCode = 'RATE_LIMIT_EXCEEDED';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'OpenAI 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
          errorCode = 'SERVER_ERROR';
          break;
        default:
          errorMessage = errorData?.error?.message || errorMessage;
      }

      return res.status(status).json({
        error: errorMessage,
        code: errorCode,
        details: errorData
      });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: '네트워크 연결 문제가 발생했습니다. 인터넷 연결을 확인해주세요.',
        code: 'NETWORK_ERROR'
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(408).json({
        error: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
        code: 'TIMEOUT_ERROR'
      });
    }

    // 기타 오류
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

// Claude API 프록시 엔드포인트
app.post('/api/claude/chat', async (req, res) => {
  try {
    const { message, apiKey, maxTokens = 3000 } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        error: 'Claude API 키가 필요합니다.',
        code: 'NO_API_KEY'
      });
    }

    console.log('🤖 Claude API 호출');

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-opus-20240229',
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    console.log('✅ Claude API 응답 성공');
    res.json({
      success: true,
      data: response.data,
      message: 'Claude API 호출 성공'
    });

  } catch (error) {
    console.error('❌ Claude API 오류:', error.message);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      return res.status(status).json({
        error: errorData?.error?.message || 'Claude API 오류가 발생했습니다.',
        code: 'CLAUDE_API_ERROR',
        details: errorData
      });
    }

    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

// Gemini API 프록시 엔드포인트
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, apiKey, maxTokens = 3000, temperature = 0.7 } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        error: 'Gemini API 키가 필요합니다.',
        code: 'NO_API_KEY'
      });
    }

    console.log('🤖 Gemini API 호출');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: message
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Gemini API 응답 성공');
    res.json({
      success: true,
      data: response.data,
      message: 'Gemini API 호출 성공'
    });

  } catch (error) {
    console.error('❌ Gemini API 오류:', error.message);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      return res.status(status).json({
        error: errorData?.error?.message || 'Gemini API 오류가 발생했습니다.',
        code: 'GEMINI_API_ERROR',
        details: errorData
      });
    }

    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: '요청한 엔드포인트를 찾을 수 없습니다.',
    code: 'NOT_FOUND',
    availableEndpoints: [
      'GET /health',
      'POST /api/openai/chat',
      'POST /api/claude/chat',
      'POST /api/gemini/chat'
    ]
  });
});

// 전역 에러 핸들러
app.use((error, req, res, next) => {
  console.error('🚨 서버 오류:', error);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 HR System Backend Server가 포트 ${PORT}에서 실행 중입니다!`);
  console.log(`📍 Health Check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI API Proxy: http://localhost:${PORT}/api/`);
  console.log(`🔧 CORS 설정: http://localhost:3000 허용`);
});