# Vercel 배포 체크리스트

## ✅ 배포 전 준비사항

### 1단계: 도구 설치

- [ ] Node.js 설치 확인 (`node --version`)
- [ ] Vercel CLI 설치 (`npm install -g vercel`)
- [ ] Vercel 로그인 완료 (`vercel login`)

### 2단계: MongoDB Atlas 설정

- [ ] MongoDB Atlas 계정 생성
- [ ] 클러스터 생성 (Seoul 또는 Singapore 리전)
- [ ] 데이터베이스 사용자 생성
- [ ] 네트워크 접근 허용 (0.0.0.0/0 또는 Vercel IP)
- [ ] 연결 문자열 복사
  ```
  mongodb+srv://username:password@cluster.mongodb.net/busung_hr
  ```

### 3단계: 로컬 테스트 완료

- [ ] `npm run test:local` 성공
- [ ] 모든 API 엔드포인트 작동 확인
- [ ] 프론트엔드 기능 테스트 완료
- [ ] API 테스트 스크립트 통과

### 4단계: 빌드 테스트

- [ ] 클라이언트 빌드 성공 (`cd client && npm run build`)
- [ ] build 폴더 생성 확인
- [ ] 빌드 크기 확인 (권장: < 5MB)

---

## 🚀 배포 실행

### 방법 1: 자동화 스크립트 (권장)

```powershell
# 1. 환경 변수 설정
.\setup-vercel-env.ps1

# 2. 프리뷰 배포
.\deploy-vercel.ps1

# 3. 프로덕션 배포
.\deploy-vercel.ps1 -Production
```

### 방법 2: 수동 배포

```powershell
# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

## ✅ 배포 후 확인사항

### 1단계: 환경 변수 설정

- [ ] Vercel 대시보드 → Settings → Environment Variables
- [ ] `MONGODB_URI` 설정 (Production, Preview)
- [ ] `DB_NAME` 설정 (Production, Preview)
- [ ] `JWT_SECRET` 설정 (Production, Preview)
- [ ] `JWT_EXPIRES_IN` 설정 (Production, Preview)
- [ ] 환경 변수 적용 후 재배포

### 2단계: 배포 테스트

```powershell
# 자동 테스트 실행
.\test-vercel-deployment.ps1 -Url "https://your-project.vercel.app"
```

수동 테스트:

- [ ] 배포 URL 접속 가능
- [ ] 홈페이지 로드 확인
- [ ] 로그인 성공
- [ ] 대시보드 데이터 표시
- [ ] API 응답 확인 (Network 탭)

### 3단계: 기능 테스트

- [ ] 직원 관리 (CRUD)
- [ ] 근태 관리 (출퇴근 기록)
- [ ] 휴가 신청/승인
- [ ] 급여 조회
- [ ] 공지사항 작성/조회
- [ ] 파일 업로드/다운로드

### 4단계: 성능 확인

- [ ] 페이지 로딩 < 3초
- [ ] API 응답 < 1초
- [ ] 이미지 로딩 정상
- [ ] 모바일 반응형 확인

### 5단계: 보안 확인

- [ ] HTTPS 적용 확인
- [ ] JWT 토큰 작동
- [ ] 인증 없이 API 접근 차단
- [ ] 권한별 접근 제어

---

## 🔄 데이터 마이그레이션

### 로컬 → 클라우드

```powershell
# 1. 로컬 데이터 백업
npm run backup

# 2. MongoDB Atlas로 복원
$ATLAS_URI = "mongodb+srv://username:password@cluster.mongodb.net"
mongorestore --uri="$ATLAS_URI" --db=busung_hr ./backups/[백업폴더]/busung_hr

# 3. 데이터 확인
# MongoDB Atlas 대시보드에서 Collections 확인
```

---

## 📊 모니터링 설정

### Vercel 대시보드

- [ ] Analytics 활성화
- [ ] Logs 확인 설정
- [ ] 알림 설정 (선택사항)

### 로그 확인

```powershell
# 실시간 로그
vercel logs --follow

# 특정 배포 로그
vercel logs [deployment-url]
```

---

## 🚨 문제 해결

### MongoDB 연결 오류

```
MongoNetworkError: connection timed out
```

- [ ] Atlas Network Access 확인
- [ ] 연결 문자열 비밀번호 URL 인코딩
- [ ] Vercel 환경 변수 재확인

### API 404 오류

```
404: NOT_FOUND
```

- [ ] `vercel.json` 라우팅 확인
- [ ] API 파일 경로 확인
- [ ] 재배포: `vercel --prod --force`

### 빌드 오류

```
Error: Build failed
```

- [ ] 로컬 빌드 테스트
- [ ] node_modules 재설치
- [ ] package.json 의존성 확인

### 환경 변수 미적용

```
process.env.MONGODB_URI is undefined
```

- [ ] Vercel 환경 변수 확인: `vercel env ls`
- [ ] 환경 변수 설정 후 재배포
- [ ] 변수명 오타 확인

---

## 📝 배포 완료 보고

### 배포 정보

```
프로젝트명: _______________________
프리뷰 URL: _______________________
프로덕션 URL: _____________________
배포 일시: _______________________
배포자: ___________________________
```

### 테스트 결과

```
로그인: ___________________________
직원관리: _________________________
근태관리: _________________________
휴가관리: _________________________
급여조회: _________________________
공지사항: _________________________
```

### 성능 메트릭

```
페이지 로딩: _______ 초
API 응답: _______ ms
빌드 시간: _______ 분
```

### 알려진 이슈

```
1. _______________________________
2. _______________________________
3. _______________________________
```

---

## 🎯 다음 단계

### 즉시

- [ ] 팀에 배포 URL 공유
- [ ] 관리자 계정 배포
- [ ] 사용 가이드 배포

### 1주일 내

- [ ] 사용자 피드백 수집
- [ ] 버그 수정
- [ ] 성능 최적화

### 1개월 내

- [ ] 정기 백업 자동화
- [ ] 모니터링 리뷰
- [ ] 기능 개선

---

## 📚 참고 문서

- [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) - 상세 배포 가이드
- [VERCEL_LOCAL_TEST.md](VERCEL_LOCAL_TEST.md) - 로컬 테스트
- [DATABASE_GUIDE.md](DATABASE_GUIDE.md) - DB 관리
- [START_GUIDE.md](START_GUIDE.md) - 시작 가이드

---

**작성일:** 2025-12-11  
**버전:** 1.0.0
