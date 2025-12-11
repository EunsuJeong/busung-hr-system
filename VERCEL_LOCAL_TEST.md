# Vercel 로컬 테스트 가이드

## 📋 목차

1. [Vercel CLI 설치](#1-vercel-cli-설치)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [로컬 Vercel Dev 실행](#3-로컬-vercel-dev-실행)
4. [API와 프론트엔드 동시 테스트](#4-api와-프론트엔드-동시-테스트)
5. [테스트 시나리오](#5-테스트-시나리오)
6. [문제 해결](#6-문제-해결)

---

## 1. Vercel CLI 설치

### 1-1. 전역 설치 (권장)

```powershell
# npm 사용
npm install -g vercel

# 또는 yarn 사용
yarn global add vercel
```

### 1-2. 설치 확인

```powershell
vercel --version
# 출력 예: Vercel CLI 33.0.1
```

### 1-3. Vercel 로그인

```powershell
vercel login
```

터미널에서 이메일 입력 또는 브라우저에서 GitHub/GitLab 계정으로 로그인

---

## 2. 환경 변수 설정

### 2-1. `.env.local` 파일 확인

프로젝트 루트에 `.env.local` 파일이 있는지 확인:

```env
# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017/busung_hr
DB_NAME=busung_hr

# JWT 설정
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Firebase 설정 (선택사항)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id

# 포트 설정
PORT=3000
API_PORT=5000

# Node 환경
NODE_ENV=development
```

### 2-2. Vercel 환경 변수 다운로드 (선택사항)

Vercel 대시보드에 설정된 환경 변수를 로컬로 가져오기:

```powershell
vercel env pull .env.vercel.local
```

---

## 3. 로컬 Vercel Dev 실행

### 3-1. 기본 실행 방법

프로젝트 루트 디렉토리에서:

```powershell
# Vercel Dev 서버 시작
vercel dev
```

첫 실행 시 프로젝트 설정 질문:

- **Set up and develop "path/to/project"?** → Yes
- **Which scope should contain your Project?** → 계정 선택
- **Link to existing project?** → No (처음) / Yes (기존 프로젝트)
- **What's your project's name?** → busung-hr-system
- **In which directory is your code located?** → ./ (엔터)

### 3-2. 포트 지정 실행

```powershell
# 특정 포트로 실행 (기본: 3000)
vercel dev --listen 3001
```

### 3-3. 디버그 모드 실행

```powershell
# 상세 로그 출력
vercel dev --debug
```

---

## 4. API와 프론트엔드 동시 테스트

### 4-1. Vercel Dev 실행 (추천 방법)

Vercel Dev는 API와 프론트엔드를 동시에 실행합니다:

```powershell
# 1. MongoDB 시작 (별도 터미널)
npm run start:mongodb

# 2. Vercel Dev 실행 (메인 터미널)
vercel dev
```

**접속 URL:**

- 프론트엔드: http://localhost:3000
- API 엔드포인트: http://localhost:3000/api/\*

### 4-2. 개별 실행 방법 (디버깅용)

두 개의 터미널에서 실행:

**터미널 1 - API 서버:**

```powershell
cd api
node admin.js
# 또는
nodemon admin.js
```

**터미널 2 - 프론트엔드:**

```powershell
cd client
npm start
# 또는
npm run start:frontend
```

### 4-3. 통합 실행 (package.json 스크립트 사용)

```powershell
# MongoDB + API + 프론트엔드 동시 실행
npm start
```

---

## 5. 테스트 시나리오

### 5-1. API 엔드포인트 테스트

#### curl 사용:

```powershell
# 로그인 테스트
curl -X POST http://localhost:3000/api/admin/login `
  -H "Content-Type: application/json" `
  -d '{\"employeeNumber\":\"admin\",\"password\":\"admin123\"}'

# 직원 목록 조회
curl -X GET http://localhost:3000/api/employees `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PowerShell 사용:

```powershell
# 로그인 테스트
$body = @{
    employeeNumber = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/login" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

### 5-2. 프론트엔드 테스트

1. **로그인 페이지 접속**

   - URL: http://localhost:3000
   - 관리자 계정으로 로그인

2. **주요 기능 테스트**

   - ✅ 대시보드 데이터 로드
   - ✅ 직원 목록 조회
   - ✅ 근태 기록 생성/수정
   - ✅ 휴가 신청 및 승인
   - ✅ 급여 조회

3. **네트워크 탭 확인**
   - 브라우저 개발자 도구 (F12)
   - Network 탭에서 API 호출 확인
   - Status 200 확인

### 5-3. 환경별 테스트

```powershell
# Development 환경
vercel dev --env .env.development

# Production 환경 시뮬레이션
vercel dev --env .env.production
```

---

## 6. 문제 해결

### 6-1. 일반적인 문제

#### ❌ 문제: Port already in use

```
Error: Port 3000 is already in use
```

**해결방법:**

```powershell
# 포트 사용 프로세스 확인
netstat -ano | findstr :3000

# 프로세스 종료 (PID는 위 명령어 결과에서 확인)
taskkill /PID <PID> /F

# 또는 다른 포트 사용
vercel dev --listen 3001
```

#### ❌ 문제: MongoDB connection failed

```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**해결방법:**

```powershell
# MongoDB 실행 확인
npm run start:mongodb

# 또는 수동 시작
.\start-mongodb.bat

# MongoDB 연결 테스트
node check-db.js
```

#### ❌ 문제: API routes not found

```
404: NOT_FOUND
```

**해결방법:**

1. `vercel.json` 확인:

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

2. API 파일 경로 확인:
   - `api/admin.js` ✅
   - `api/routes/admin.js` ❌ (vercel.json 수정 필요)

### 6-2. 환경 변수 문제

#### ❌ 문제: 환경 변수가 로드되지 않음

**해결방법:**

```powershell
# 1. .env 파일 확인
Get-Content .env.local

# 2. Vercel 환경 변수 다운로드
vercel env pull

# 3. 수동으로 환경 변수 설정
$env:MONGODB_URI="mongodb://localhost:27017/busung_hr"
vercel dev
```

### 6-3. 빌드 오류

#### ❌ 문제: Build failed

**해결방법:**

```powershell
# 1. node_modules 재설치
Remove-Item -Recurse -Force node_modules
npm install

# 2. 캐시 클리어
vercel dev --clean

# 3. 로컬 빌드 테스트
npm run build
```

### 6-4. CORS 문제

#### ❌ 문제: CORS policy error

**해결방법:**

`api/admin.js` (또는 해당 API 파일) 확인:

```javascript
// CORS 헤더 추가
module.exports = async (req, res) => {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // API 로직...
};
```

---

## 7. 유용한 명령어 모음

```powershell
# Vercel CLI 명령어
vercel dev              # 로컬 개발 서버 시작
vercel dev --debug      # 디버그 모드
vercel dev --listen 3001 # 포트 지정
vercel env pull         # 환경 변수 다운로드
vercel env ls           # 환경 변수 목록
vercel logs             # 로그 확인
vercel list             # 프로젝트 목록

# 프로젝트 명령어
npm run start:mongodb   # MongoDB 시작
npm start               # 전체 시스템 시작
npm run build           # 프로덕션 빌드
node check-db.js        # DB 연결 확인
```

---

## 8. 테스트 체크리스트

배포 전 반드시 확인:

### 기능 테스트

- [ ] 로그인/로그아웃
- [ ] 직원 CRUD
- [ ] 근태 관리
- [ ] 휴가 신청/승인
- [ ] 급여 조회
- [ ] 공지사항
- [ ] 파일 업로드/다운로드

### API 테스트

- [ ] 모든 엔드포인트 응답 확인
- [ ] 인증 토큰 검증
- [ ] 에러 핸들링
- [ ] 데이터 유효성 검사

### 성능 테스트

- [ ] 페이지 로딩 속도
- [ ] API 응답 시간
- [ ] 대용량 데이터 처리

### 보안 테스트

- [ ] JWT 토큰 만료 확인
- [ ] 권한 검증
- [ ] SQL Injection 방지
- [ ] XSS 방지

---

## 9. 다음 단계

로컬 테스트 완료 후:

1. ✅ **프로덕션 빌드 테스트**

   ```powershell
   npm run build
   vercel dev --prod
   ```

2. ✅ **Vercel 프리뷰 배포**

   ```powershell
   vercel
   ```

3. ✅ **프로덕션 배포**
   ```powershell
   vercel --prod
   ```

---

## 📚 참고 자료

- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [Vercel Dev 문서](https://vercel.com/docs/cli/dev)
- [환경 변수 관리](https://vercel.com/docs/concepts/projects/environment-variables)
- [Node.js API 라우팅](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)

---

**작성일:** 2025-12-11  
**버전:** 1.0.0
