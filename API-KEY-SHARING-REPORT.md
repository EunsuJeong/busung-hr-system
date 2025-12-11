# 🔍 API Key 공유 여부 검증 리포트

## 검증 일시
- **날짜**: 2025-10-10
- **대상**: 부성스틸 HR 시스템 관리자 모드
- **범위**: AI 추천사항(대시보드), AI 챗봇, 시스템 관리 > AI 모델 설정

---

## 📋 검증 요약

### ✅ 결론
**시스템 관리 > AI 모델 설정의 API Key는 AI 추천사항과 공유되지만, AI 챗봇과는 공유되지 않습니다.**

---

## 🔬 상세 분석

### 1. **시스템 관리 > AI 모델 설정** (API Key 입력/저장 영역)

#### 위치
- **파일**: `src/App.js`
- **라인**: 3932-3934, 20473-20644

#### 상태 변수
```javascript
const [geminiApiKey, setGeminiApiKey] = useState('');
const [chatgptApiKey, setChatgptApiKey] = useState('');
const [claudeApiKey, setClaudeApiKey] = useState('');
```

#### 저장 로직
- **입력 핸들러**: `onChange={(e) => setXxxApiKey(e.target.value)}`
- **저장 함수**: `saveKey('OPENAI_API_KEY', chatgptApiKey)` 등
- **저장 방식**: 서버 API (`/api/system/update-key`) 호출
- **라인**: 5337-5375

#### 특징
- localStorage 사용 ❌ (이전 패치로 제거됨)
- 서버 위임 저장 ✅
- 입력 후 저장 버튼 클릭 시 서버 전송

---

### 2. **AI 추천사항** (대시보드 2개 섹션)

#### 위치
- **파일**: `src/App.js`
- **라인**: 2957-3008, 19819-19920

#### API Key 사용 여부

##### ✅ **공유됨 (단, 백엔드 API 경유)**

**근거:**
1. **백엔드 API 호출**
   ```javascript
   // 라인 2957-2992
   const analyzeDataWithAI = async (summary) => {
     const API_BASE_URL =
       process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

     const safeModel = getSafeModelOrBlock(selectedModel);

     const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         model: safeModel,
         prompt: summary,
         context: { ... }
       }),
     });
     // ...
   };
   ```

2. **자동 분석 트리거**
   ```javascript
   // 라인 5222-5234
   React.useEffect(() => {
     const currentApiKey =
       selectedAiModel === 'gemini' ? geminiApiKey : chatgptApiKey;
     if (
       activeTab === 'dashboard' &&
       currentApiKey &&  // ← API Key 존재 확인
       !isAnalyzing &&
       aiRecommendations.length === 0
     ) {
       generateAiRecommendations();
     }
   }, [activeTab, geminiApiKey, chatgptApiKey, selectedAiModel]);
   ```

3. **상태 체크 로직**
   ```javascript
   // 라인 12863-12868
   const hasApiKey =
     (modelUsageStatus.chatgpt && chatgptApiKey) ||
     (modelUsageStatus.gemini && geminiApiKey) ||
     (modelUsageStatus.claude && claudeApiKey);
   ```

**공유 방식:**
- **간접 공유**: 프론트엔드는 `geminiApiKey`, `chatgptApiKey` 상태 변수를 체크하여 API Key 존재 여부 확인
- **실제 전송**: 백엔드 `/api/ai/analyze` 엔드포인트로 요청 전송
- **백엔드 처리**: 서버에서 저장된 API Key를 사용하여 실제 AI 모델 호출

**현재 상황:**
- 시스템 관리에서 API Key 입력 → `setGeminiApiKey()` 상태 업데이트
- 대시보드로 이동 시 `useEffect` 트리거 → API Key 존재 확인
- 백엔드 API 호출 → 서버에서 저장된 Key로 AI 분석 실행

---

### 3. **AI 챗봇** (AI 어시스턴트)

#### 위치
- **파일**: `src/App.js`
- **라인**: 19064-19175, 20952-21008

#### API Key 사용 여부

##### ❌ **공유 안 됨 (자체 로직 사용)**

**근거:**
1. **자체 응답 생성**
   ```javascript
   // 라인 19064-19175
   const handleAiQuery = () => {
     if (!aiInput.trim()) return;

     // 내부 데이터 기반 응답 생성 (하드코딩)
     const responses = {
       출근: `📊 **${currentUser.name}님의 출근 현황** ...`,
       연차: `🏝️ **${currentUser.name}님의 연차 현황** ...`,
       급여: `💰 **급여 관리 현황** ...`,
       평가: `📈 **인사평가 현황** ...`,
       default: `안녕하세요! 부성스틸 HR 관리 시스템입니다. ...`
     };

     const response = responses[aiInput] || responses.default;

     setAiMessages((prev) => [
       ...prev,
       { type: 'user', message: aiInput },
       { type: 'ai', message: response },
     ]);
     setAiInput('');
   };
   ```

2. **외부 API 호출 없음**
   - `fetch()` 호출 없음
   - 백엔드 연동 없음
   - API Key 참조 없음

3. **UI 확인**
   ```javascript
   // 라인 20962-20966
   <p className="text-xs mt-3 bg-blue-50 rounded px-2 py-1 inline-block">
     현재 모델:{' '}
     {selectedAiModel === 'gemini' ? 'Google Gemini' : 'ChatGPT'}
   </p>
   ```
   - 모델 이름은 표시하지만 실제로는 사용하지 않음

**현재 상황:**
- 시스템 관리에서 API Key 입력해도 AI 챗봇은 무시
- 챗봇은 순수하게 프론트엔드 내부 데이터만 사용
- 하드코딩된 템플릿 응답만 제공

---

## 📊 비교표

| 항목 | 시스템 관리 (Key 입력) | AI 추천사항 | AI 챗봇 |
|------|----------------------|------------|---------|
| **API Key 입력** | ✅ | - | - |
| **상태 변수 사용** | `geminiApiKey`, `chatgptApiKey`, `claudeApiKey` | ✅ 체크만 | ❌ 미사용 |
| **백엔드 API 호출** | ✅ `/api/system/update-key` | ✅ `/api/ai/analyze` | ❌ 없음 |
| **실제 AI 모델 사용** | - | ✅ (백엔드에서) | ❌ 하드코딩 응답 |
| **API Key 필요성** | - | ✅ 필수 | ❌ 불필요 |

---

## 🔍 기술적 세부사항

### API Key 상태 흐름

```
[시스템 관리]
   ├─ 사용자 입력: geminiApiKey = "AIza..."
   ├─ onChange 트리거
   ├─ setGeminiApiKey("AIza...")
   └─ "저장" 버튼 클릭
       └─ saveKey('GEMINI_API_KEY', geminiApiKey)
           └─ POST /api/system/update-key
               └─ 서버에 저장

[AI 추천사항]
   ├─ 대시보드 활성화 (activeTab === 'dashboard')
   ├─ useEffect 트리거
   ├─ currentApiKey = geminiApiKey (상태 변수 참조)
   ├─ if (currentApiKey) → generateAiRecommendations()
   │   └─ analyzeDataWithAI(summary)
   │       └─ POST /api/ai/analyze { model: 'gpt-4o', prompt: ... }
   │           └─ 백엔드에서 저장된 API Key로 실제 AI 호출
   └─ 분석 결과 UI 표시

[AI 챗봇]
   ├─ 사용자 입력: "출근"
   ├─ handleAiQuery() 호출
   ├─ responses['출근'] 조회 (하드코딩 객체)
   ├─ 템플릿 문자열 생성
   └─ setAiMessages([...]) (UI만 업데이트)
```

---

## ⚠️ 문제점 및 개선 제안

### 1. **AI 챗봇의 이름 불일치**
- **현상**: UI에 "현재 모델: Google Gemini" 표시되지만 실제로는 AI 모델을 사용하지 않음
- **문제**: 사용자 혼란 가능성
- **제안**:
  - UI 텍스트 변경: "내부 데이터 기반 응답" 또는 "로컬 응답 모드"
  - 또는 실제 AI 모델 연동으로 업그레이드

### 2. **API Key 검증 부족**
- **현상**: 프론트엔드는 API Key 존재만 확인, 유효성은 미검증
- **문제**: 잘못된 Key로도 분석 시도 가능
- **제안**:
  - API Key 저장 시 백엔드에서 즉시 검증
  - 검증 실패 시 저장 차단 및 에러 표시

### 3. **AI 추천사항 오프라인 동작 불가**
- **현상**: 백엔드 API 필수, 오프라인 시 동작 불가
- **문제**: 서버 다운 시 대시보드 기능 마비
- **제안**:
  - 폴백 로직 추가 (로컬 템플릿 응답)
  - 캐시 기반 최근 분석 결과 재사용

---

## ✅ 검증 결과

### 질문: "시스템 관리 > AI 모델 설정의 API Key가 AI 추천사항 및 챗봇과 공유되는가?"

**답변:**
- **AI 추천사항**: ✅ **예** (간접 공유 - 상태 변수 체크 + 백엔드 저장 Key 사용)
- **AI 챗봇**: ❌ **아니오** (완전 독립 - 자체 하드코딩 응답)

### 권장 사항
1. AI 챗봇을 실제 AI 모델과 연동하려면 별도 개발 필요
2. AI 추천사항은 정상 동작 (현재 구현 유지)
3. UI 일관성을 위해 챗봇 모델 표시 텍스트 수정 권장

---

**작성자**: Claude Code
**검증 방법**: 소스 코드 정적 분석 (src/App.js)
**도구**: Grep, Read, 코드 트레이싱
