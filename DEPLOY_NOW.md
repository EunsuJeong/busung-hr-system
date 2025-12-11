# 🚀 Vercel 배포 - 빠른 시작 가이드

## 📦 생성된 파일 요약

### 📚 문서

1. **[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)** - 상세 배포 가이드 (10단계)
2. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - 배포 체크리스트
3. **[VERCEL_LOCAL_TEST.md](VERCEL_LOCAL_TEST.md)** - 로컬 테스트 가이드

### 🔧 자동화 스크립트

1. **[setup-vercel-env.ps1](setup-vercel-env.ps1)** - 환경 변수 설정
2. **[deploy-vercel.ps1](deploy-vercel.ps1)** - 배포 자동화
3. **[test-vercel-deployment.ps1](test-vercel-deployment.ps1)** - 배포 후 테스트

---

## ⚡ 5분 안에 배포하기

### Step 1: Vercel CLI 설치 (1분)

```powershell
npm install -g vercel
vercel login
```

### Step 2: 환경 변수 설정 (2분)

```powershell
# 대화형으로 환경 변수 설정
npm run deploy:setup
```

필요한 정보:

- MongoDB Atlas 연결 문자열
- DB 이름 (busung_hr)
- JWT Secret (자동 생성 가능)

### Step 3: 프리뷰 배포 (1분)

```powershell
# 자동 배포 스크립트
npm run deploy:preview
```

### Step 4: 테스트 (30초)

```powershell
# 배포된 URL로 자동 테스트
npm run deploy:test -- -Url "https://your-project.vercel.app"
```

### Step 5: 프로덕션 배포 (30초)

테스트 통과 후:

```powershell
npm run deploy:production
```

---

## 🎯 배포 방법 선택

### 방법 1: 자동화 스크립트 (권장) ⭐

```powershell
# 1. 환경 변수 설정
npm run deploy:setup

# 2. 프리뷰 배포
npm run deploy:preview

# 3. 테스트
npm run deploy:test -- -Url "https://your-url.vercel.app"

# 4. 프로덕션 배포
npm run deploy:production
```

**장점:**

- ✅ 자동 사전 체크
- ✅ 빌드 테스트 자동 실행
- ✅ 에러 시 자동 중단
- ✅ 단계별 진행 상황 표시

### 방법 2: 수동 배포

```powershell
# 프리뷰
vercel

# 프로덕션
vercel --prod

# 강제 재배포
vercel --prod --force
```

### 방법 3: GitHub 연동 (CI/CD)

1. GitHub 저장소에 푸시
2. Vercel 대시보드에서 Import
3. 환경 변수 설정
4. 자동 배포 시작

**장점:**

- ✅ 코드 푸시 시 자동 배포
- ✅ PR마다 프리뷰 배포
- ✅ 롤백 쉬움

---

## 📋 필수 준비사항

### 1. MongoDB Atlas (클라우드 DB)

무료 계정 생성:

```
https://www.mongodb.com/cloud/atlas
```

연결 문자열 형식:

```
mongodb+srv://username:password@cluster.mongodb.net/busung_hr
```

### 2. 환경 변수

| 변수명           | 설명                | 예시                |
| ---------------- | ------------------- | ------------------- |
| `MONGODB_URI`    | MongoDB 연결 문자열 | `mongodb+srv://...` |
| `DB_NAME`        | 데이터베이스 이름   | `busung_hr`         |
| `JWT_SECRET`     | JWT 비밀키 (32자+)  | 자동 생성 가능      |
| `JWT_EXPIRES_IN` | 토큰 만료 시간      | `24h`               |

---

## 🧪 배포 후 테스트

### 자동 테스트

```powershell
.\test-vercel-deployment.ps1 -Url "https://your-project.vercel.app"
```

테스트 항목:

- ✅ 홈페이지 로드
- ✅ 관리자 로그인
- ✅ 직원 API (목록, 통계)
- ✅ 근태 API (오늘, 통계, 월별)
- ✅ 휴가 API (공휴일)
- ✅ 급여 API
- ✅ 커뮤니케이션 API
- ✅ 안전 API
- ✅ 시스템 API

### 수동 테스트

브라우저에서:

1. 배포 URL 접속
2. 로그인 (admin / admin123)
3. 대시보드 확인
4. 각 메뉴 테스트

---

## 🔄 데이터 마이그레이션

로컬 MongoDB → Atlas로 데이터 이전:

```powershell
# 1. 로컬 백업
npm run backup

# 2. Atlas로 복원
$ATLAS_URI = "mongodb+srv://user:pass@cluster.mongodb.net"
mongorestore --uri="$ATLAS_URI" --db=busung_hr ./backups/[폴더]/busung_hr
```

---

## 📊 배포 명령어 모음

### NPM 스크립트

```powershell
# 환경 변수 설정
npm run deploy:setup

# 프리뷰 배포
npm run deploy:preview

# 프로덕션 배포
npm run deploy:production

# 배포 테스트
npm run deploy:test -- -Url "https://your-url.vercel.app"

# Vercel Dev (로컬)
npm run vercel:dev

# 환경 변수 다운로드
npm run vercel:env

# 로그 확인
npm run vercel:logs
```

### Vercel CLI 직접 사용

```powershell
# 로그인
vercel login

# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod

# 강제 재배포
vercel --prod --force

# 환경 변수 관리
vercel env ls                  # 목록
vercel env add VAR_NAME        # 추가
vercel env rm VAR_NAME         # 삭제
vercel env pull               # 다운로드

# 로그 확인
vercel logs                    # 실시간
vercel logs --follow          # 계속 보기
vercel logs [deployment-url]  # 특정 배포

# 프로젝트 관리
vercel list                   # 배포 목록
vercel inspect [url]          # 배포 상세
vercel remove [deployment]    # 배포 삭제
```

---

## 🚨 문제 해결

### 로그 확인

```powershell
# 실시간 로그
npm run vercel:logs

# 또는
vercel logs --follow
```

### 일반적인 문제

#### 1. MongoDB 연결 실패

```
MongoNetworkError: connection timed out
```

**해결:**

- Atlas Network Access에서 0.0.0.0/0 허용
- 연결 문자열 비밀번호 URL 인코딩
- 환경 변수 재확인

#### 2. API 404 오류

```
404: NOT_FOUND
```

**해결:**

- `vercel.json` 라우팅 확인
- API 파일 경로 확인 (`api/*.js`)
- `vercel --prod --force` 재배포

#### 3. 환경 변수 미적용

```
undefined 오류
```

**해결:**

```powershell
vercel env ls                  # 환경 변수 확인
vercel --prod --force         # 재배포
```

---

## 📈 성능 최적화

### 권장 설정

**vercel.json:**

```json
{
  "regions": ["icn1"], // Seoul 리전
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

### 캐싱

```javascript
// API 응답 헤더
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
```

---

## 🎓 학습 리소스

### 공식 문서

- [Vercel 문서](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Node.js Functions](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)

### 프로젝트 문서

- [상세 배포 가이드](VERCEL_DEPLOYMENT_GUIDE.md)
- [배포 체크리스트](DEPLOYMENT_CHECKLIST.md)
- [로컬 테스트](VERCEL_LOCAL_TEST.md)

---

## ✅ 배포 완료 후

### 즉시 할 일

- [ ] 팀에 URL 공유
- [ ] 관리자 계정 배포
- [ ] 사용 가이드 공유

### 모니터링

- [ ] Vercel Analytics 활성화
- [ ] 에러 추적 설정
- [ ] 정기 백업 스케줄

### 유지보수

- [ ] 주간 로그 리뷰
- [ ] 월간 성능 분석
- [ ] 분기별 보안 점검

---

## 🎉 축하합니다!

모든 준비가 완료되었습니다!

다음 명령어로 지금 바로 배포하세요:

```powershell
npm run deploy:setup
npm run deploy:preview
```

---

**작성일:** 2025-12-11  
**상태:** ✅ Phase 4 완료  
**다음 단계:** 배포 실행
