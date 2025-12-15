# 🚀 서버 배포 가이드 (Railway)

## 1️⃣ Railway 계정 생성 및 설정

1. [Railway](https://railway.app) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

## 2️⃣ 배포 방법

### 옵션 A: GitHub 연동 (추천)

```bash
# 1. server 폴더를 별도 Git 저장소로 분리
cd server
git init
git add .
git commit -m "Initial server setup"

# 2. GitHub에 새 저장소 생성 후 연결
git remote add origin <your-github-repo-url>
git push -u origin main
```

그 후 Railway에서:

1. "New Project" → "Deploy from GitHub repo" 선택
2. 방금 만든 저장소 선택
3. 자동으로 배포 시작

### 옵션 B: Railway CLI 사용

```bash
# 1. Railway CLI 설치
npm install -g @railway/cli

# 2. 로그인
railway login

# 3. server 폴더로 이동
cd server

# 4. 프로젝트 초기화 및 배포
railway init
railway up
```

## 3️⃣ 환경 변수 설정

Railway 대시보드에서 다음 환경 변수를 설정:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=production
TZ=Asia/Seoul
```

### MongoDB Atlas 설정 (무료)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 접속
2. 무료 클러스터 생성
3. Database Access에서 사용자 생성
4. Network Access에서 `0.0.0.0/0` 허용
5. Connect → Connect your application에서 연결 문자열 복사
6. Railway 환경 변수 `MONGO_URI`에 붙여넣기

## 4️⃣ 배포 확인

```bash
# Railway에서 제공하는 URL 확인
railway domain

# 서버 상태 확인
curl https://your-app.railway.app
# 응답: "부성스틸 AI 인사관리 서버 정상 동작 중 ✅"
```

## 5️⃣ 프론트엔드 연결

배포된 서버 URL을 프론트엔드에 설정:

1. `client/.env.production` 파일 생성:

```env
REACT_APP_API_URL=https://your-app.railway.app
```

2. Vercel 환경 변수 설정:

```bash
vercel env add REACT_APP_API_URL
# 값: https://your-app.railway.app
```

3. 프론트엔드 재배포:

```bash
vercel --prod
```

## 📊 대안 호스팅 옵션

### Render (무료 티어 있음)

- URL: https://render.com
- 장점: 무료, 자동 배포
- 단점: 무료 플랜은 15분 비활성 후 슬립

### Fly.io

- URL: https://fly.io
- 장점: 무료 플랜, 빠른 속도
- 명령어: `fly launch`, `fly deploy`

### Railway vs Render vs Fly.io 비교

| 기능      | Railway      | Render     | Fly.io       |
| --------- | ------------ | ---------- | ------------ |
| 무료 티어 | $5 크레딧/월 | 750시간/월 | 2,340시간/월 |
| 슬립      | ❌ 없음      | ⚠️ 15분 후 | ❌ 없음      |
| MongoDB   | ✅ 쉬움      | ✅ 쉬움    | ⚠️ 설정 필요 |
| Socket.IO | ✅ 지원      | ✅ 지원    | ✅ 지원      |
| 배포 속도 | ⚡ 빠름      | ⚡ 빠름    | ⚡ 매우 빠름 |

## 🔧 문제 해결

### 배포 실패 시

```bash
# Railway 로그 확인
railway logs

# 로컬에서 테스트
cd server
npm install
npm start
```

### MongoDB 연결 오류

- Network Access에 `0.0.0.0/0` 추가 확인
- 연결 문자열에 비밀번호 특수문자 URL 인코딩
- 예: `p@ssw0rd` → `p%40ssw0rd`

### CORS 오류

- `server.js`에서 프론트엔드 URL 허용 확인
- 프로덕션 URL 추가 필요 시 수정
