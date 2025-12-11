const express = require("express");
const router = express.Router();
const { AiConfig, AiRecommendation, AiLog, PolicyCache } = require("../models");

// ✅ 모델 실제 테스트 함수 (간단한 요청으로 작동 여부 확인)
async function testModel(provider, model, apiKey, timeout = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let response;

    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 1
        }),
        signal: controller.signal
      });
    } else if (provider === 'gemini') {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'hi' }] }],
          generationConfig: { maxOutputTokens: 1 }
        }),
        signal: controller.signal
      });
    } else if (provider === 'claude') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }]
        }),
        signal: controller.signal
      });
    }

    clearTimeout(timeoutId);

    if (response.ok) {
      return { model, available: true, status: 'active' };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        model,
        available: false,
        status: 'unavailable',
        error: errorData.error?.message || response.statusText
      };
    }
  } catch (error) {
    return {
      model,
      available: false,
      status: 'error',
      error: error.message
    };
  }
}

// ✅ AI 모델 설정 조회
router.get("/config", async (req, res) => {
  try {
    const config = await AiConfig.findOne({ scope: "unified" });
    res.json(config || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 모델 설정 저장 (POST /config)
router.post("/config", async (req, res) => {
  try {
    const { provider, apiKey, model, prompts } = req.body;
    const updateData = {
      provider,
      apiKey,
      model,
      updatedAt: new Date(),
      active: true
    };

    // prompts가 있으면 추가
    if (prompts) {
      updateData.prompts = prompts;
    }

    const updated = await AiConfig.findOneAndUpdate(
      { scope: "unified" },
      updateData,
      { upsert: true, new: true }
    );
    console.log(`✅ AI 설정 저장 완료: provider=${provider}, model=${model}`);
    res.json(updated);
  } catch (err) {
    console.error('❌ AI 설정 저장 실패:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 모델 설정 저장 (레거시)
router.post("/update-key", async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;
    const updated = await AiConfig.findOneAndUpdate(
      { scope: "unified" },
      { provider, apiKey, model, updatedAt: new Date(), active: true },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 추천사항 생성 (통합 AI 설정 사용)
router.post("/recommendations", async (req, res) => {
  try {
    const { useDatabase } = req.body;

    console.log('📊 [POST /ai/recommendations] AI 추천사항 생성 요청');

    // ✅ 통합 AI 설정 조회
    const aiConfig = await AiConfig.findOne({ scope: "unified", active: true });
    if (!aiConfig || !aiConfig.apiKey) {
      console.log('⚠️ [AI 추천사항] AI 설정이 없음');
      return res.json({
        status: 'error',
        message: 'AI 설정이 없습니다. 시스템 관리에서 AI 모델을 설정해주세요.',
        recommendations: []
      });
    }

    const { provider, apiKey, model, prompts } = aiConfig;
    console.log(`🤖 [AI 추천사항] Provider: ${provider}, Model: ${model}`);

    // ✅ MongoDB에서 실제 데이터 조회
    const {
      Employee, Attendance, Leave, Notice, Suggestion,
      Schedule, Payroll, Evaluation, SafetyAccident, Notification
    } = require('../models');

    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    // 직원 관련 데이터
    const employees = await Employee.find().lean();
    const activeEmployees = employees.filter(emp => emp.status !== 'retired');

    // 근태 관련 데이터
    const todayAttendances = await Attendance.find({ date: today }).lean();
    const monthAttendances = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).lean();

    // 연차 관련 데이터
    const approvedLeaves = await Leave.find({ status: 'approved' }).lean();
    const pendingLeaves = await Leave.find({ status: 'pending' }).lean();
    const rejectedLeaves = await Leave.find({ status: 'rejected' }).lean();

    // 공지사항 및 건의사항
    const notices = await Notice.find().sort({ date: -1 }).limit(5).lean();
    const suggestions = await Suggestion.find().sort({ createdAt: -1 }).limit(10).lean();
    const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
    const resolvedSuggestions = suggestions.filter(s => s.status === 'resolved');

    // 일정 관련 데이터
    const schedules = await Schedule.find().sort({ date: -1 }).limit(10).lean();

    // 급여 관련 데이터
    const payrolls = await Payroll.find().sort({ createdAt: -1 }).limit(5).lean();

    // 평가 관련 데이터
    const evaluations = await Evaluation.find().sort({ createdAt: -1 }).limit(10).lean();

    // 안전 관련 데이터
    const safetyAccidents = await SafetyAccident.find().sort({ date: -1 }).limit(10).lean();
    const recentAccidents = safetyAccidents.filter(acc => {
      const accDate = new Date(acc.date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return accDate >= monthAgo;
    });

    // 알림 관련 데이터
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10).lean();
    const unreadNotifications = notifications.filter(n => !n.read);

    // ✅ 이전 추천사항 조회 (중복 방지용)
    const previousRecommendations = await AiRecommendation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const previousTexts = previousRecommendations
      .map(rec => rec.recommendations?.map(r => r.title).join(', '))
      .filter(Boolean)
      .join(' | ');

    // 대시보드 지표 계산
    const attendanceRate = activeEmployees.length > 0
      ? Math.round((todayAttendances.length / activeEmployees.length) * 100)
      : 0;

    // 이번달 목표달성률 계산 (출근율 기반)
    const monthWorkDays = Math.floor((new Date() - new Date(startOfMonth)) / (1000 * 60 * 60 * 24)) + 1;
    const expectedAttendances = activeEmployees.length * monthWorkDays;
    const goalAchievementRate = expectedAttendances > 0
      ? Math.round((monthAttendances.length / expectedAttendances) * 100)
      : 0;

    // 워라밸 지표 계산
    const avgWorkHours = monthAttendances.length > 0
      ? monthAttendances.reduce((sum, att) => {
          if (att.checkIn && att.checkOut) {
            const start = new Date(`2000-01-01 ${att.checkIn}`);
            const end = new Date(`2000-01-01 ${att.checkOut}`);
            const hours = (end - start) / (1000 * 60 * 60);
            return sum + (hours > 0 ? hours : 0);
          }
          return sum;
        }, 0) / monthAttendances.filter(a => a.checkIn && a.checkOut).length
      : 0;

    const workLifeBalance = avgWorkHours <= 8 ? '양호' : avgWorkHours <= 9 ? '보통' : '개선필요';

    // 콘솔 로그로 실제 데이터 확인
    console.log('📊 [AI 추천사항 데이터 확인]');
    console.log(`총 직원 수: ${employees.length}명 (활동: ${activeEmployees.length}명)`);
    console.log(`오늘 출근: ${todayAttendances.length}명 (출근율: ${attendanceRate}%)`);
    console.log(`이번달 출근 기록: ${monthAttendances.length}건`);
    console.log(`연차 - 승인: ${approvedLeaves.length}건, 대기: ${pendingLeaves.length}건, 반려: ${rejectedLeaves.length}건`);
    console.log(`건의사항 - 전체: ${suggestions.length}건, 대기: ${pendingSuggestions.length}건, 해결: ${resolvedSuggestions.length}건`);
    console.log(`공지사항: ${notices.length}건`);
    console.log(`일정: ${schedules.length}건`);
    console.log(`급여 기록: ${payrolls.length}건`);
    console.log(`평가 기록: ${evaluations.length}건`);
    console.log(`안전사고 - 전체: ${safetyAccidents.length}건, 최근 1개월: ${recentAccidents.length}건`);
    console.log(`알림 - 전체: ${notifications.length}건, 읽지않음: ${unreadNotifications.length}건`);
    console.log(`목표달성률: ${goalAchievementRate}%, 평균근무시간: ${avgWorkHours.toFixed(1)}시간, 워라밸: ${workLifeBalance}`);

    // 데이터 요약 생성
    const summary = `
**부성스틸 HR 시스템 현황 (실제 DB 데이터 기반)**

**📊 대시보드 핵심 지표:**
- 이번달 목표달성률: ${goalAchievementRate}%
- 워라밸 지표: ${workLifeBalance} (평균 근무시간: ${avgWorkHours.toFixed(1)}시간/일)
- 안전현황: 최근 1개월 안전사고 ${recentAccidents.length}건

**👥 직원 관리:**
- 총 직원 수: ${employees.length}명 (재직: ${activeEmployees.length}명, 퇴사: ${employees.length - activeEmployees.length}명)
- 오늘 출근: ${todayAttendances.length}명 (출근율: ${attendanceRate}%)
- 이번달 총 출근 기록: ${monthAttendances.length}건

**📅 연차 관리:**
- 승인된 연차: ${approvedLeaves.length}건
- 대기중인 연차: ${pendingLeaves.length}건
- 반려된 연차: ${rejectedLeaves.length}건

**📢 공지 및 건의사항:**
- 최근 공지사항: ${notices.length}건
${notices.slice(0, 3).map(n => `  - ${n.title} (${n.date})`).join('\n')}
- 건의사항: 총 ${suggestions.length}건 (대기: ${pendingSuggestions.length}건, 해결: ${resolvedSuggestions.length}건)
${pendingSuggestions.slice(0, 3).map(s => `  - [대기] ${s.title}`).join('\n')}

**📆 일정 관리:**
- 등록된 일정: ${schedules.length}건
${schedules.slice(0, 3).map(s => `  - ${s.title} (${s.date})`).join('\n')}

**💰 급여 관리:**
- 급여 처리 기록: ${payrolls.length}건

**📈 평가 관리:**
- 평가 기록: ${evaluations.length}건

**⚠️ 안전 관리:**
- 전체 안전사고: ${safetyAccidents.length}건
- 최근 1개월 안전사고: ${recentAccidents.length}건
${recentAccidents.slice(0, 3).map(acc => `  - ${acc.type || '사고'}: ${acc.description || acc.location} (${acc.date})`).join('\n')}

**🔔 알림 관리:**
- 전체 알림: ${notifications.length}건
- 읽지 않은 알림: ${unreadNotifications.length}건

**이전 추천사항 (중복 방지용):**
${previousTexts || '없음'}

**🚨 중요 지시사항:**
1. 위에 제공된 실제 DB 숫자만 사용하세요. 절대 추측하거나 예시 숫자를 사용하지 마세요.
2. 예: "대기중인 연차: ${pendingLeaves.length}건" - 이 숫자가 0이면 "0건", 5이면 "5건"으로 정확히 작성
3. 숫자가 0인 항목은 "없음", "처리완료", "양호" 등으로 긍정적으로 표현하세요.
4. 실제로 문제가 있는 부분(숫자가 높거나 낮은 부분)만 지적하세요.

**요청사항:**
위의 **실제 DB 데이터**를 분석하여 **이전 추천사항과 다른** 새로운 인사이트 4가지를 제안해주세요.
각 추천사항은 다음 형식으로 작성:

1. [카테고리] 제목
   - 상세 설명

카테고리는 다음 중 선택: 생산, 근태, 안전, 교육, 급여, 품질
**중요:** 이전 추천사항(${previousTexts})과 겹치지 않는 새로운 내용으로 작성하세요.`;

    let aiResponse = '';

    // ✅ Provider별 AI 호출 (AI 챗봇과 동일한 방식)
    if (provider === 'openai') {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages: [
            { role: 'system', content: prompts?.dashboard || '당신은 HR 전문가입니다. 반드시 제공된 실제 데이터의 숫자만 사용하세요.' },
            { role: 'user', content: summary }
          ],
          temperature: 0.3, // 정확성 우선
          max_tokens: 1500
        })
      });

      if (!openaiRes.ok) {
        throw new Error('OpenAI API 호출 실패');
      }

      const data = await openaiRes.json();
      aiResponse = data.choices[0]?.message?.content || '';

    } else if (provider === 'gemini') {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: prompts?.dashboard || '당신은 HR 전문가입니다. 반드시 제공된 실제 데이터의 숫자만 사용하세요.' }] },
          contents: [{
            parts: [{ text: summary }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1500
          }
        })
      });

      if (!geminiRes.ok) {
        throw new Error('Gemini API 호출 실패');
      }

      const data = await geminiRes.json();
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else if (provider === 'claude') {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          temperature: 0.3,
          system: prompts?.dashboard || '당신은 HR 전문가입니다. 반드시 제공된 실제 데이터의 숫자만 사용하세요.',
          messages: [
            { role: 'user', content: summary }
          ]
        })
      });

      if (!claudeRes.ok) {
        throw new Error('Claude API 호출 실패');
      }

      const data = await claudeRes.json();
      aiResponse = data.content?.[0]?.text || '';
    }

    console.log(`✅ [AI 추천사항] AI 응답 생성 완료 (${aiResponse.length}자)`);

    // 응답 파싱 (줄 단위로 분리)
    const lines = aiResponse.split('\n').filter(line => line.trim());
    const recommendations = [];

    for (const line of lines) {
      if (/^\d+\./.test(line.trim())) {
        recommendations.push(line.trim());
      }
    }

    // DB에 저장
    const recommendation = new AiRecommendation({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ko-KR'),
      title: `AI 추천사항 분석 (${recommendations.length}건)`,
      content: aiResponse,
      recommendations: recommendations.map(rec => ({
        type: '추천',
        title: rec,
        description: ''
      })),
      createdAt: new Date()
    });
    await recommendation.save();

    console.log(`✅ [POST /ai/recommendations] AI 추천사항 ${recommendations.length}개 생성 및 저장 완료`);

    res.json({
      status: 'success',
      recommendations: recommendations,
      model: model,
      provider: provider
    });

  } catch (err) {
    console.error('❌ [POST /ai/recommendations] 오류:', err);
    res.status(500).json({
      status: 'error',
      error: err.message,
      recommendations: []
    });
  }
});

// ✅ AI 추천사항 조회 (최근 10건)
router.get("/recommendations", async (req, res) => {
  try {
    const recommendations = await AiRecommendation.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(`✅ [GET /ai/recommendations] ${recommendations.length}건 조회`);
    res.json(recommendations);
  } catch (err) {
    console.error('❌ [GET /ai/recommendations] 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 추천사항 다운로드 (한국어 인코딩)
router.get("/recommendations/export", async (req, res) => {
  try {
    const recommendations = await AiRecommendation.find()
      .sort({ createdAt: -1 })
      .lean();

    // CSV 형식으로 변환
    let csv = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    csv += '날짜,시간,제목,내용,추천사항\n';

    recommendations.forEach(rec => {
      const date = rec.date || new Date(rec.createdAt).toLocaleDateString('ko-KR');
      const time = rec.time || new Date(rec.createdAt).toLocaleTimeString('ko-KR');
      const title = (rec.title || '').replace(/"/g, '""');
      const content = (rec.content || '').replace(/"/g, '""').replace(/\n/g, ' ');

      // 추천사항 배열을 문자열로 변환
      const recommendations = rec.recommendations
        ? rec.recommendations.map(r =>
            `[${r.type}] ${r.title}: ${r.description}`
          ).join(' | ').replace(/"/g, '""')
        : '';

      csv += `"${date}","${time}","${title}","${content}","${recommendations}"\n`;
    });

    // 파일명에 현재 날짜 포함
    const filename = `AI추천사항_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(csv);

    console.log(`✅ [GET /ai/recommendations/export] CSV 다운로드 완료 (${recommendations.length}건)`);
  } catch (err) {
    console.error('❌ [GET /ai/recommendations/export] 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 로그 저장
router.post("/logs", async (req, res) => {
  try {
    const log = new AiLog(req.body);
    await log.save();
    console.log(`✅ [POST /ai/logs] AI 로그 저장 완료`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ [POST /ai/logs] 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 로그 조회
router.get("/logs", async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await AiLog.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    console.log(`✅ [GET /ai/logs] ${logs.length}건 조회`);
    res.json(logs);
  } catch (err) {
    console.error('❌ [GET /ai/logs] 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 프롬프트 설정 저장
router.post("/prompts", async (req, res) => {
  try {
    const { prompts } = req.body;

    if (!prompts || typeof prompts !== 'object') {
      return res.status(400).json({
        error: 'prompts 객체가 필요합니다.'
      });
    }

    const updated = await AiConfig.findOneAndUpdate(
      { scope: "unified" },
      {
        prompts: prompts,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`✅ [POST /ai/prompts] AI 프롬프트 저장 완료`);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('❌ [POST /ai/prompts] 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 프롬프트 설정 조회
router.get("/prompts", async (req, res) => {
  try {
    const config = await AiConfig.findOne({ scope: "unified" });

    if (!config || !config.prompts) {
      return res.json({
        dashboard: '',
        chatbot: '',
        analysis: ''
      });
    }

    console.log(`✅ [GET /ai/prompts] AI 프롬프트 조회 완료`);
    res.json(config.prompts);
  } catch (err) {
    console.error('❌ [GET /ai/prompts] 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 정책정보 캐시 조회
router.get("/policy", async (req, res) => {
  try {
    const { query } = req.query;
    const cache = await PolicyCache.findOne({ query });
    res.json(cache || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Provider별 사용 가능한 모델 목록 조회
router.get("/models", async (req, res) => {
  try {
    const { provider } = req.query;

    const modelsByProvider = {
      openai: [
        // GPT-5 시리즈
        'gpt-5.1',
        'gpt-5.1-chat-latest',
        'gpt-5.1-codex',
        'gpt-5',
        'gpt-5-chat-latest',
        'gpt-5-codex',
        'gpt-5-pro',
        'gpt-5-mini',
        'gpt-5-nano',
        // GPT-4.1 시리즈
        'gpt-4.1',
        'gpt-4.1-mini',
        'gpt-4.1-nano',
        // O 시리즈
        'o3-mini',
        'o1',
        'o1-mini',
        'o1-preview',
        // GPT-4o 시리즈
        'gpt-4o',
        'gpt-4o-2024-11-20',
        'gpt-4o-2024-05-13',
        'chatgpt-4o-latest',
        'gpt-4o-mini',
        // GPT-4 시리즈
        'gpt-4-turbo',
        'gpt-4-turbo-preview',
        'gpt-4',
        'gpt-4-0613',
        'gpt-4-0125-preview',
        // GPT-3.5 시리즈
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-0125',
        'gpt-3.5-turbo-1106',
        // Realtime 시리즈
        'gpt-realtime',
        'gpt-realtime-mini'
      ],
      gemini: [
        'gemini-2.0-flash-thinking-exp',
        'gemini-2.0-pro-exp',
        'gemini-2.0-flash-exp',
        'gemini-exp-1206',
        'gemini-exp-1121',
        'gemini-exp-1114',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro-002',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-002',
        'gemini-1.5-flash-8b',
        'gemini-pro'
      ],
      claude: [
        'claude-sonnet-4-5-20250929',
        'claude-3.7-sonnet-20250219',
        'claude-3-5-sonnet-20241022',
        'claude-3-5-sonnet-20240620',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
      ]
    };

    const models = modelsByProvider[provider] || [];

    console.log(`✅ [GET /ai/models] Provider: ${provider}, Models: ${models.length}개`);
    res.json({ provider, models });
  } catch (err) {
    console.error('❌ [GET /ai/models] 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API 키 검증 및 실제 사용 가능한 모델 목록 조회
router.post("/validate-and-get-models", async (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({
        error: 'provider와 apiKey는 필수입니다.'
      });
    }

    console.log(`🔍 [POST /ai/validate-and-get-models] Provider: ${provider}`);

    let models = [];
    let isValid = false;

    // Provider별 API 키 검증 및 모델 목록 조회
    if (provider === 'openai') {
      try {
        // ✅ 실제 API 테스트로 작동하는 모델만 확인
        const stableModels = [
          // GPT-5 시리즈
          'gpt-5.1',
          'gpt-5.1-chat-latest',
          'gpt-5.1-codex',
          'gpt-5',
          'gpt-5-chat-latest',
          'gpt-5-codex',
          'gpt-5-pro',
          'gpt-5-mini',
          'gpt-5-nano',
          // GPT-4.1 시리즈
          'gpt-4.1',
          'gpt-4.1-mini',
          'gpt-4.1-nano',
          // O 시리즈
          'o3-mini',
          'o1',
          'o1-mini',
          'o1-preview',
          'o1-preview-2024-09-12',
          'o1-mini-2024-09-12',
          // GPT-4o 시리즈
          'gpt-4o',
          'gpt-4o-2024-11-20',
          'gpt-4o-2024-08-06',
          'gpt-4o-2024-05-13',
          'chatgpt-4o-latest',
          'gpt-4o-mini',
          'gpt-4o-mini-2024-07-18',
          // GPT-4 시리즈
          'gpt-4-turbo',
          'gpt-4-turbo-2024-04-09',
          'gpt-4-turbo-preview',
          'gpt-4',
          'gpt-4-0613',
          'gpt-4-0125-preview',
          // GPT-3.5 시리즈
          'gpt-3.5-turbo',
          'gpt-3.5-turbo-0125',
          'gpt-3.5-turbo-1106',
          // Realtime 시리즈
          'gpt-realtime',
          'gpt-realtime-mini'
        ];

        console.log(`🔍 [OpenAI] ${stableModels.length}개 모델 실제 API 테스트 시작...`);

        // ✅ 모든 모델을 실제로 테스트 (병렬 처리)
        const testResults = await Promise.allSettled(
          stableModels.map(model => testModel('openai', model, apiKey, 8000))
        );

        // ✅ 테스트 결과를 { model, available } 형태로 변환
        models = testResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              model: stableModels[index],
              available: false,
              status: 'error',
              error: result.reason?.message || 'Test failed'
            };
          }
        });

        // 우선순위 정렬 (최신 모델 우선, 사용 가능한 모델 우선)
        models.sort((a, b) => {
          // 사용 가능 여부 우선
          if (a.available !== b.available) {
            return a.available ? -1 : 1;
          }

          // 같은 available 상태면 우선순위로 정렬
          const priority = {
            // GPT-5 시리즈 (최우선)
            'gpt-5.1': 1,
            'gpt-5.1-chat-latest': 2,
            'gpt-5.1-codex': 3,
            'gpt-5': 4,
            'gpt-5-chat-latest': 5,
            'gpt-5-codex': 6,
            'gpt-5-pro': 7,
            'gpt-5-mini': 8,
            'gpt-5-nano': 9,
            // GPT-4.1 시리즈
            'gpt-4.1': 10,
            'gpt-4.1-mini': 11,
            'gpt-4.1-nano': 12,
            // O 시리즈
            'o3-mini': 13,
            'o1': 14,
            'o1-mini': 15,
            'o1-preview': 16,
            'o1-preview-2024-09-12': 17,
            'o1-mini-2024-09-12': 18,
            // GPT-4o 시리즈
            'gpt-4o': 19,
            'gpt-4o-2024-11-20': 20,
            'chatgpt-4o-latest': 21,
            'gpt-4o-2024-08-06': 22,
            'gpt-4o-2024-05-13': 23,
            'gpt-4o-mini': 24,
            'gpt-4o-mini-2024-07-18': 25,
            // GPT-4 시리즈
            'gpt-4-turbo': 26,
            'gpt-4-turbo-2024-04-09': 27,
            'gpt-4-turbo-preview': 28,
            'gpt-4': 29,
            'gpt-4-0125-preview': 30,
            'gpt-4-0613': 31,
            // GPT-3.5 시리즈
            'gpt-3.5-turbo': 32,
            'gpt-3.5-turbo-0125': 33,
            'gpt-3.5-turbo-1106': 34,
            // Realtime 시리즈
            'gpt-realtime': 35,
            'gpt-realtime-mini': 36
          };
          return (priority[a.model] || 999) - (priority[b.model] || 999);
        });

        // 만약 화이트리스트 모델이 없으면 기본값 사용
        if (models.length === 0) {
          models = [
            'gpt-5.1', 'gpt-5', 'gpt-5-mini', 'gpt-4.1',
            'o3-mini', 'o1-mini', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'
          ].map(model => ({ model, available: false }));
        }

        isValid = true;

        const availableCount = models.filter(m => m.available).length;
        const unavailableCount = models.filter(m => !m.available).length;
        console.log(`✅ OpenAI 모델 ${models.length}개 (사용 가능: ${availableCount}, 사용 불가: ${unavailableCount})`);
        console.log(`📋 사용 가능 모델:`, models.filter(m => m.available).map(m => m.model));
      } catch (error) {
        console.error('❌ OpenAI API 키 검증 실패:', error.message);
        return res.status(401).json({
          error: 'OpenAI API 키가 유효하지 않습니다.',
          details: error.message
        });
      }

    } else if (provider === 'gemini') {
      try {
        // ✅ 실제 API 테스트로 작동하는 모델만 확인
        const stableModels = [
          'gemini-2.0-flash-thinking-exp',
          'gemini-2.0-pro-exp',
          'gemini-2.0-flash-exp',
          'gemini-exp-1206',
          'gemini-exp-1121',
          'gemini-exp-1114',
          'gemini-1.5-pro',
          'gemini-1.5-pro-latest',
          'gemini-1.5-pro-002',
          'gemini-1.5-flash',
          'gemini-1.5-flash-latest',
          'gemini-1.5-flash-002',
          'gemini-1.5-flash-8b',
          'gemini-pro'
        ];

        console.log(`🔍 [Gemini] ${stableModels.length}개 모델 실제 API 테스트 시작...`);

        // ✅ 모든 모델을 실제로 테스트 (병렬 처리)
        const testResults = await Promise.allSettled(
          stableModels.map(model => testModel('gemini', model, apiKey, 8000))
        );

        // ✅ 테스트 결과를 { model, available } 형태로 변환
        models = testResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              model: stableModels[index],
              available: false,
              status: 'error',
              error: result.reason?.message || 'Test failed'
            };
          }
        });

        isValid = true;

        const availableCount = models.filter(m => m.available).length;
        const unavailableCount = models.filter(m => !m.available).length;
        console.log(`✅ Gemini 모델 ${models.length}개 (사용 가능: ${availableCount}, 사용 불가: ${unavailableCount})`);
        console.log(`📋 사용 가능 모델:`, models.filter(m => m.available).map(m => m.model));
      } catch (error) {
        console.error('❌ Gemini API 키 검증 실패:', error.message);
        return res.status(401).json({
          error: 'Gemini API 키가 유효하지 않습니다.',
          details: error.message
        });
      }

    } else if (provider === 'claude') {
      try {
        // Claude API 키 검증 (간단한 테스트 요청)
        const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          })
        });

        if (!testResponse.ok) {
          throw new Error('Claude API 키가 유효하지 않습니다.');
        }

        // Claude는 고정 모델 리스트 (API로 모델 목록 조회 불가)
        // 모든 모델을 available: true로 표시 (API 키가 유효하면 모두 사용 가능)
        const claudeModels = [
          'claude-sonnet-4-5-20250929',
          'claude-3.7-sonnet-20250219',
          'claude-3-5-sonnet-20241022',
          'claude-3-5-sonnet-20240620',
          'claude-3-5-haiku-20241022',
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307'
        ];

        models = claudeModels.map(model => ({
          model: model,
          available: true  // API 키가 유효하면 모두 사용 가능
        }));

        isValid = true;

        console.log(`✅ Claude 모델 ${models.length}개 (모두 사용 가능)`);
      } catch (error) {
        console.error('❌ Claude API 키 검증 실패:', error.message);
        return res.status(401).json({
          error: 'Claude API 키가 유효하지 않습니다.',
          details: error.message
        });
      }

    } else {
      return res.status(400).json({
        error: `지원하지 않는 provider: ${provider}`
      });
    }

    res.json({
      success: true,
      isValid: isValid,
      provider: provider,
      models: models
    });

  } catch (err) {
    console.error('❌ [POST /ai/validate-and-get-models] 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 쿼리 처리 (데이터 수정 기능 포함)
router.post("/query", async (req, res) => {
  try {
    const { query, messages, internalData, externalData, permissions } = req.body;
    const { systemPrompt, user } = externalData || {};

    console.log(`📩 [POST /ai/query] 사용자: ${user?.name}, 질문: ${query?.substring(0, 50)}...`);
    console.log(`💬 [POST /ai/query] 이전 대화: ${messages?.length || 0}개`);
    console.log(`🔐 [POST /ai/query] 권한: 읽기=${permissions?.read}, 수정=${permissions?.modify}, 다운로드=${permissions?.download}`);

    // AI 설정 조회
    const aiConfig = await AiConfig.findOne({ scope: "unified", active: true });
    if (!aiConfig || !aiConfig.apiKey) {
      return res.status(400).json({
        error: 'AI 설정이 없습니다. 시스템 관리에서 AI 모델을 설정해주세요.'
      });
    }

    const { provider, apiKey, model } = aiConfig;
    console.log(`🤖 [AI Query] Provider: ${provider}, Model: ${model}`);

    // ✅ 읽기 권한이 있으면 전체 DB 데이터 조회
    let fullDbData = '';
    if (permissions?.read) {
      const {
        Employee, Attendance, Leave, Notice, Suggestion,
        Schedule, Payroll, Evaluation, SafetyAccident, Notification
      } = require('../models');

      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

      // 모든 데이터 조회
      const [employees, todayAttendances, monthAttendances, allLeaves, notices, suggestions,
             schedules, payrolls, evaluations, safetyAccidents, notifications] = await Promise.all([
        Employee.find().lean(),
        Attendance.find({ date: today }).lean(),
        Attendance.find({ date: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
        Leave.find().lean(),
        Notice.find().sort({ date: -1 }).limit(20).lean(),
        Suggestion.find().sort({ createdAt: -1 }).limit(20).lean(),
        Schedule.find().sort({ date: -1 }).limit(20).lean(),
        Payroll.find().sort({ createdAt: -1 }).limit(20).lean(),
        Evaluation.find().sort({ createdAt: -1 }).limit(20).lean(),
        SafetyAccident.find().sort({ date: -1 }).limit(20).lean(),
        Notification.find().sort({ createdAt: -1 }).limit(20).lean()
      ]);

      fullDbData = `

**📊 전체 DB 데이터 (읽기 권한으로 접근 가능):**

**👥 직원 데이터 (${employees.length}명):**
${JSON.stringify(employees, null, 2)}

**📅 오늘 출근 데이터 (${todayAttendances.length}건):**
${JSON.stringify(todayAttendances, null, 2)}

**📅 이번달 출근 데이터 (${monthAttendances.length}건):**
${JSON.stringify(monthAttendances, null, 2)}

**🏖️ 연차 데이터 (${allLeaves.length}건):**
${JSON.stringify(allLeaves, null, 2)}

**📢 공지사항 데이터 (${notices.length}건):**
${JSON.stringify(notices, null, 2)}

**💡 건의사항 데이터 (${suggestions.length}건):**
${JSON.stringify(suggestions, null, 2)}

**📆 일정 데이터 (${schedules.length}건):**
${JSON.stringify(schedules, null, 2)}

**💰 급여 데이터 (${payrolls.length}건):**
${JSON.stringify(payrolls, null, 2)}

**📈 평가 데이터 (${evaluations.length}건):**
${JSON.stringify(evaluations, null, 2)}

**⚠️ 안전사고 데이터 (${safetyAccidents.length}건):**
${JSON.stringify(safetyAccidents, null, 2)}

**🔔 알림 데이터 (${notifications.length}건):**
${JSON.stringify(notifications, null, 2)}
`;

      console.log(`✅ [AI Query] 읽기 권한으로 전체 DB 데이터 제공 완료`);
    } else {
      console.log(`⚠️ [AI Query] 읽기 권한 없음 - DB 데이터 제공 안 함`);
    }

    // 권한에 따른 시스템 프롬프트 생성
    let permissionInfo = '';

    if (permissions?.read) {
      permissionInfo += `\n\n**✅ 읽기 권한 활성화:** 전체 DB 데이터에 접근 가능합니다.${fullDbData}`;
    }

    if (permissions?.modify) {
      permissionInfo += `\n\n**✅ 수정 권한 활성화:** 데이터 생성/수정/삭제가 가능합니다.
**데이터 수정 방법:**
- 사용자가 데이터 생성/수정/삭제를 요청하면, 반드시 다음 형식으로 명령을 응답에 포함:
- 명령 형식: <COMMAND>{"action":"create|update|delete","dataType":"employee|notice|leave|payroll|evaluation|suggestion|safetyAccident|attendance|schedule|notification","data":{...},"id":"..."}</COMMAND>
- 예시: "공지사항을 생성하겠습니다. <COMMAND>{"action":"create","dataType":"notice","data":{"title":"긴급 회의","content":"내일 10시 회의","author":"관리자","priority":"high","date":"${new Date().toISOString().split('T')[0]}"}}</COMMAND> 생성 완료했습니다."

**지원되는 데이터 타입 및 필수 필드:**
1. **employee** (직원): name, department, position, email, phone, joinDate, workType, status, annualLeave
2. **notice** (공지사항): title, content, author, priority, date
3. **leave** (연차): employeeId, employeeName, startDate, endDate, reason, status
4. **payroll** (급여): employeeId, employeeName, baseSalary, totalSalary, month
5. **evaluation** (평가): employeeId, employeeName, evaluationType, status, score
6. **suggestion** (건의사항): title, content, author, category, status
7. **safetyAccident** (안전사고): type, description, location, date, severity
8. **attendance** (근태): employeeId, date, checkIn, checkOut, status
9. **schedule** (일정): title, date, time, location, description, participants
10. **notification** (알림): title, content, notificationType, status, recipients`;
    } else {
      permissionInfo += `\n\n**⚠️ 수정 권한 없음:** 데이터 조회만 가능하며, 생성/수정/삭제는 불가능합니다.`;
    }

    if (permissions?.download) {
      permissionInfo += `\n\n**✅ 다운로드 권한 활성화:** Excel, CSV, PDF, JSON 파일 생성 및 다운로드가 가능합니다.
**다운로드 방법:**
- 사용자가 데이터 다운로드를 요청하면, 다음 형식으로 응답:
- 명령 형식: <DOWNLOAD>{"format":"excel|csv|pdf|json","dataType":"employee|attendance|leave|payroll|evaluation|suggestion|safetyAccident|notice|schedule|notification","filter":{...}}</DOWNLOAD>

**지원 형식:**
1. **excel**: Excel 파일 (.xlsx) - 스프레드시트 형식, 데이터 분석 및 편집에 적합
2. **csv**: CSV 파일 (.csv) - 간단한 텍스트 형식, 호환성 높음
3. **pdf**: PDF 문서 (.pdf) - 읽기 전용 보고서 형식, 인쇄 및 공유에 적합
4. **json**: JSON 파일 (.json) - 개발자용 데이터 형식

**예시:**
- "직원 데이터를 엑셀로 다운로드하겠습니다. <DOWNLOAD>{"format":"excel","dataType":"employee","filter":{}}</DOWNLOAD> 다운로드 준비가 완료되었습니다."
- "출근 데이터를 PDF로 다운로드하겠습니다. <DOWNLOAD>{"format":"pdf","dataType":"attendance","filter":{}}</DOWNLOAD> PDF 보고서 생성이 완료되었습니다."
- "연차 데이터를 CSV로 다운로드하겠습니다. <DOWNLOAD>{"format":"csv","dataType":"leave","filter":{}}</DOWNLOAD> CSV 파일 다운로드 준비가 완료되었습니다."`;
    } else {
      permissionInfo += `\n\n**⚠️ 다운로드 권한 없음:** 파일 다운로드가 불가능합니다.`;
    }

    const enhancedSystemPrompt = `${systemPrompt}${permissionInfo}`;

    let aiResponse = '';

    // ✅ 이전 대화 내용을 포함한 메시지 배열 생성
    const fullMessages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...(messages || []), // 이전 대화 내용
      { role: 'user', content: query } // 현재 질문
    ];

    // Provider별 API 호출
    if (provider === 'openai') {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages: fullMessages, // ✅ 이전 대화 포함
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!openaiRes.ok) {
        const error = await openaiRes.json();
        throw new Error(`OpenAI API 오류: ${error.error?.message || openaiRes.statusText}`);
      }

      const data = await openaiRes.json();
      aiResponse = data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';

    } else if (provider === 'gemini') {
      // Gemini는 contents 배열 형식으로 변환
      const geminiContents = (messages || []).concat([{ role: 'user', content: query }])
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: enhancedSystemPrompt }] },
          contents: geminiContents, // ✅ 이전 대화 포함
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        })
      });

      if (!geminiRes.ok) {
        const error = await geminiRes.json();
        throw new Error(`Gemini API 오류: ${error.error?.message || geminiRes.statusText}`);
      }

      const data = await geminiRes.json();
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 생성할 수 없습니다.';

    } else if (provider === 'claude') {
      // Claude는 messages 배열 형식 (system은 별도)
      const claudeMessages = (messages || []).concat([{ role: 'user', content: query }]);

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: enhancedSystemPrompt,
          messages: claudeMessages // ✅ 이전 대화 포함
        })
      });

      if (!claudeRes.ok) {
        const error = await claudeRes.json();
        throw new Error(`Claude API 오류: ${error.error?.message || claudeRes.statusText}`);
      }

      const data = await claudeRes.json();
      aiResponse = data.content?.[0]?.text || '응답을 생성할 수 없습니다.';

    } else {
      return res.status(400).json({ error: `지원하지 않는 provider: ${provider}` });
    }

    console.log(`✅ [AI Query] 응답 생성 완료 (${aiResponse.length}자)`);

    // ✅ DB에 대화 기록 저장
    try {
      const aiLog = new AiLog({
        eventType: 'AI_QUERY',
        model: model,
        provider: provider,
        prompt: query,
        response: aiResponse,
        success: true,
        createdAt: new Date()
      });
      await aiLog.save();
      console.log(`✅ [AI Query] DB에 대화 기록 저장 완료`);
    } catch (logError) {
      console.error('⚠️ [AI Query] DB 저장 실패 (계속 진행):', logError);
    }

    // 응답 반환 (프론트엔드에서 COMMAND 파싱 처리)
    res.json({
      response: aiResponse,
      provider: provider,
      model: model
    });

  } catch (err) {
    console.error('❌ [POST /ai/query] 오류:', err);

    // ✅ 오류도 DB에 저장
    try {
      const aiLog = new AiLog({
        eventType: 'ERROR',
        prompt: req.body.query,
        errorMessage: err.message,
        success: false,
        createdAt: new Date()
      });
      await aiLog.save();
    } catch (logError) {
      console.error('⚠️ [AI Query] 오류 로그 저장 실패:', logError);
    }

    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 챗봇 DB 명령 실행 (수정 권한 필요)
router.post("/chatbot/execute", async (req, res) => {
  try {
    const { action, dataType, data, id, permissions } = req.body;

    console.log(`🔧 [POST /ai/chatbot/execute] Action: ${action}, DataType: ${dataType}`);

    // 권한 체크
    if (!permissions?.modify) {
      return res.status(403).json({
        error: '수정 권한이 없습니다. 시스템 관리에서 AI 챗봇 권한을 활성화해주세요.'
      });
    }

    const {
      Employee, Attendance, Leave, Notice, Suggestion,
      Schedule, Payroll, Evaluation, SafetyAccident, Notification
    } = require('../models');

    // 데이터 타입에 따른 모델 선택
    const modelMap = {
      employee: Employee,
      attendance: Attendance,
      leave: Leave,
      notice: Notice,
      suggestion: Suggestion,
      schedule: Schedule,
      payroll: Payroll,
      evaluation: Evaluation,
      safetyAccident: SafetyAccident,
      notification: Notification
    };

    const Model = modelMap[dataType];
    if (!Model) {
      return res.status(400).json({ error: `지원하지 않는 데이터 타입: ${dataType}` });
    }

    let result;

    // 액션 수행
    if (action === 'create') {
      result = await Model.create(data);
      console.log(`✅ [DB Execute] ${dataType} 생성 완료: ${result._id}`);
    } else if (action === 'update') {
      if (!id) {
        return res.status(400).json({ error: 'ID가 필요합니다.' });
      }
      result = await Model.findByIdAndUpdate(id, data, { new: true });
      console.log(`✅ [DB Execute] ${dataType} 수정 완료: ${id}`);
    } else if (action === 'delete') {
      if (!id) {
        return res.status(400).json({ error: 'ID가 필요합니다.' });
      }
      result = await Model.findByIdAndDelete(id);
      console.log(`✅ [DB Execute] ${dataType} 삭제 완료: ${id}`);
    } else {
      return res.status(400).json({ error: `지원하지 않는 액션: ${action}` });
    }

    res.json({
      success: true,
      action,
      dataType,
      result
    });

  } catch (err) {
    console.error('❌ [POST /ai/chatbot/execute] 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI 챗봇 데이터 다운로드 (다운로드 권한 필요)
router.post("/chatbot/download", async (req, res) => {
  try {
    const { format, dataType, filter, permissions } = req.body;

    console.log(`📥 [POST /ai/chatbot/download] Format: ${format}, DataType: ${dataType}`);

    // 권한 체크
    if (!permissions?.download) {
      return res.status(403).json({
        error: '다운로드 권한이 없습니다. 시스템 관리에서 AI 챗봇 권한을 활성화해주세요.'
      });
    }

    const {
      Employee, Attendance, Leave, Notice, Suggestion,
      Schedule, Payroll, Evaluation, SafetyAccident, Notification
    } = require('../models');

    // 데이터 타입에 따른 모델 선택
    const modelMap = {
      employee: Employee,
      attendance: Attendance,
      leave: Leave,
      notice: Notice,
      suggestion: Suggestion,
      schedule: Schedule,
      payroll: Payroll,
      evaluation: Evaluation,
      safetyAccident: SafetyAccident,
      notification: Notification
    };

    const Model = modelMap[dataType];
    if (!Model) {
      return res.status(400).json({ error: `지원하지 않는 데이터 타입: ${dataType}` });
    }

    // 데이터 조회
    const data = await Model.find(filter || {}).lean();
    console.log(`✅ [DB Download] ${dataType} 데이터 ${data.length}건 조회 완료`);

    // 형식에 따라 변환
    let downloadData;
    let contentType;
    let filename;

    if (format === 'csv') {
      // CSV 변환
      if (data.length === 0) {
        downloadData = '';
      } else {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item =>
          Object.values(item).map(val =>
            typeof val === 'object' ? JSON.stringify(val) : val
          ).join(',')
        );
        downloadData = [headers, ...rows].join('\n');
      }
      contentType = 'text/csv';
      filename = `${dataType}_${new Date().toISOString().split('T')[0]}.csv`;

    } else if (format === 'excel') {
      // Excel 변환 (xlsx 라이브러리 사용)
      const XLSX = require('xlsx');

      // 데이터를 평탄화 (중첩 객체를 문자열로 변환)
      const flattenedData = data.map(item => {
        const flattened = {};
        for (const [key, value] of Object.entries(item)) {
          if (typeof value === 'object' && value !== null) {
            flattened[key] = JSON.stringify(value);
          } else {
            flattened[key] = value;
          }
        }
        return flattened;
      });

      // 워크북 생성
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(flattenedData);

      // 워크시트 추가
      XLSX.utils.book_append_sheet(workbook, worksheet, dataType);

      // 버퍼로 변환
      downloadData = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `${dataType}_${new Date().toISOString().split('T')[0]}.xlsx`;

    } else if (format === 'pdf') {
      // PDF 변환 (pdfkit 라이브러리 사용)
      const PDFDocument = require('pdfkit');
      const { Readable } = require('stream');

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          downloadData = Buffer.concat(chunks);
          contentType = 'application/pdf';
          filename = `${dataType}_${new Date().toISOString().split('T')[0]}.pdf`;

          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.send(downloadData);
          resolve();
        });
        doc.on('error', reject);

        // PDF 내용 작성
        doc.fontSize(20).text(`${dataType.toUpperCase()} 데이터`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`생성일: ${new Date().toLocaleString('ko-KR')}`, { align: 'center' });
        doc.moveDown(2);

        // 데이터 테이블 형식으로 출력
        doc.fontSize(10);
        data.forEach((item, index) => {
          doc.fontSize(12).text(`#${index + 1}`, { underline: true });
          doc.fontSize(10);

          for (const [key, value] of Object.entries(item)) {
            if (key === '_id' || key === '__v') continue;
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            doc.text(`${key}: ${displayValue}`, { indent: 20 });
          }

          doc.moveDown();

          // 페이지 넘김 체크
          if (doc.y > 700) {
            doc.addPage();
          }
        });

        doc.end();
      });

    } else if (format === 'json') {
      // JSON 형식
      downloadData = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      filename = `${dataType}_${new Date().toISOString().split('T')[0]}.json`;

    } else {
      return res.status(400).json({ error: `지원하지 않는 형식: ${format}` });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(downloadData);

  } catch (err) {
    console.error('❌ [POST /ai/chatbot/download] 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
