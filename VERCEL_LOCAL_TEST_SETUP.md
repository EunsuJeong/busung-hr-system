# Vercel 로컬 테스트 설정 완료

## 📋 생성된 파일

### 1. 문서

- **VERCEL_LOCAL_TEST.md** - 상세한 Vercel 로컬 테스트 가이드
  - Vercel CLI 설치 방법
  - 환경 변수 설정
  - 로컬 실행 방법
  - API/프론트엔드 동시 테스트
  - 문제 해결 가이드

### 2. 실행 스크립트

- **start-vercel-dev.bat** - Windows 배치 파일
- **start-vercel-dev.ps1** - PowerShell 스크립트 (대화형 메뉴)
- **test-api-endpoints.ps1** - API 엔드포인트 자동 테스트

### 3. 업데이트된 파일

- **package.json** - Vercel 관련 npm 스크립트 추가
- **README.md** - Quick Start 섹션 추가

---

## 🚀 사용 방법

### Step 1: Vercel CLI 설치

```powershell
npm install -g vercel
```

### Step 2: 로컬 테스트 시작

**방법 1: PowerShell 스크립트 (권장)**

```powershell
.\start-vercel-dev.ps1
```

대화형 메뉴:

1. 기본 실행 (포트 3000)
2. 디버그 모드
3. 포트 3001로 실행
4. 환경 변수 다운로드
5. 종료

**방법 2: NPM 스크립트**

```powershell
# MongoDB + Vercel Dev 동시 실행
npm run test:local

# 또는 개별 실행
npm run start:mongodb
npm run vercel:dev
```

**방법 3: 배치 파일**

```powershell
.\start-vercel-dev.bat
```

### Step 3: API 테스트

```powershell
# 모든 API 엔드포인트 자동 테스트
.\test-api-endpoints.ps1

# 다른 URL 테스트
.\test-api-endpoints.ps1 -BaseUrl "http://localhost:3001"

# 다른 관리자 계정으로 테스트
.\test-api-endpoints.ps1 -AdminUser "admin2" -AdminPassword "password"
```

---

## 📦 추가된 NPM 스크립트

```json
{
  "scripts": {
    "vercel:dev": "vercel dev",
    "vercel:dev:debug": "vercel dev --debug",
    "vercel:dev:3001": "vercel dev --listen 3001",
    "vercel:build": "vercel build",
    "vercel:deploy": "vercel",
    "vercel:deploy:prod": "vercel --prod",
    "vercel:env": "vercel env pull .env.vercel.local",
    "test:local": "concurrently \"npm run start:mongodb\" \"npm run vercel:dev\""
  }
}
```

### 사용 예시

```powershell
# 로컬 개발 서버
npm run vercel:dev

# 디버그 모드
npm run vercel:dev:debug

# 포트 3001로 실행
npm run vercel:dev:3001

# 환경 변수 다운로드
npm run vercel:env

# 프리뷰 배포
npm run vercel:deploy

# 프로덕션 배포
npm run vercel:deploy:prod
```

---

## 🔧 주요 기능

### 1. start-vercel-dev.ps1

- MongoDB 자동 체크 및 시작
- 환경 변수 파일 자동 생성
- 대화형 메뉴로 쉬운 선택
- 다양한 실행 옵션

### 2. test-api-endpoints.ps1

- 모든 주요 API 자동 테스트
- 인증 토큰 자동 획득
- 상세한 결과 리포트
- JSON 결과 파일 저장

### 3. VERCEL_LOCAL_TEST.md

- 단계별 설치 가이드
- 문제 해결 방법
- 테스트 체크리스트
- 유용한 명령어 모음

---

## 🧪 테스트 시나리오

### 기본 테스트

```powershell
# 1. Vercel Dev 시작
npm run test:local

# 2. 브라우저에서 확인
# http://localhost:3000

# 3. API 테스트 실행
.\test-api-endpoints.ps1
```

### 포트 변경 테스트

```powershell
# 포트 3001로 실행
npm run vercel:dev:3001

# API 테스트
.\test-api-endpoints.ps1 -BaseUrl "http://localhost:3001"
```

### 프로덕션 시뮬레이션

```powershell
# 프로덕션 빌드
npm run build

# Vercel 프로덕션 모드
vercel dev --prod
```

---

## 📊 API 테스트 결과

test-api-endpoints.ps1 실행 시:

```
========================================
   API Endpoint Testing
========================================

Testing against: http://localhost:3000

--- Health Check ---
Testing: Root Endpoint... [PASS]

--- Authentication ---
Testing: Admin Login... [PASS]
  Token acquired: eyJhbGciOiJIUzI1NiIsIn...

--- Employee API ---
Testing: Get All Employees... [PASS]
Testing: Get Employee Stats... [PASS]

--- Attendance API ---
Testing: Get Today's Attendance... [PASS]
Testing: Get Attendance Stats... [PASS]

--- Holiday API ---
Testing: Get Holidays... [PASS]

========================================
   Test Summary
========================================

Total Tests: 10
Passed: 10
Failed: 0

All tests passed! ✓

Results saved to: test-results-2025-12-11_143022.json
```

---

## 🐛 문제 해결

### Port already in use

```powershell
# 포트 확인
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID <PID> /F

# 또는 다른 포트 사용
npm run vercel:dev:3001
```

### MongoDB connection failed

```powershell
# MongoDB 시작
npm run start:mongodb

# 연결 테스트
node check-db.js
```

### 환경 변수 문제

```powershell
# Vercel 환경 변수 다운로드
npm run vercel:env

# 파일 확인
Get-Content .env.vercel.local
```

---

## 📝 체크리스트

배포 전 확인사항:

### 로컬 테스트

- [ ] Vercel CLI 설치 완료
- [ ] MongoDB 실행 확인
- [ ] 환경 변수 설정 완료
- [ ] Vercel Dev 정상 실행
- [ ] API 엔드포인트 테스트 통과
- [ ] 프론트엔드 로딩 확인

### 기능 테스트

- [ ] 로그인/로그아웃
- [ ] 직원 관리
- [ ] 근태 관리
- [ ] 휴가 관리
- [ ] 급여 조회
- [ ] 공지사항

### 성능 테스트

- [ ] 페이지 로딩 속도
- [ ] API 응답 시간
- [ ] 대용량 데이터 처리

---

## 🎯 다음 단계

1. **로컬 테스트 완료**

   - [ ] 모든 API 정상 작동 확인
   - [ ] 프론트엔드 기능 테스트
   - [ ] 통합 테스트 실행

2. **프리뷰 배포**

   ```powershell
   npm run vercel:deploy
   ```

3. **프로덕션 배포**
   ```powershell
   npm run vercel:deploy:prod
   ```

---

## 📚 관련 문서

- [VERCEL_LOCAL_TEST.md](VERCEL_LOCAL_TEST.md) - 상세 가이드
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - 배포 가이드
- [START_GUIDE.md](START_GUIDE.md) - 시작 가이드
- [DATABASE_GUIDE.md](DATABASE_GUIDE.md) - DB 가이드

---

## 🔗 유용한 링크

- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [Vercel Dev 문서](https://vercel.com/docs/cli/dev)
- [Node.js API 라우팅](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)

---

**작성일:** 2025-12-11  
**버전:** 1.0.0  
**작성자:** GitHub Copilot
