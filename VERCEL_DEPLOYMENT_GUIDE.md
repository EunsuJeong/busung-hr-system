# Vercel 배포 실행 가이드

## 🎯 현재 단계: 실제 배포

로컬 테스트가 완료되었으므로 이제 Vercel에 배포합니다.

---

## 📋 배포 전 최종 체크리스트

### ✅ 필수 확인사항

- [ ] 로컬 테스트 완료
- [ ] MongoDB Atlas 준비 (클라우드 DB)
- [ ] 환경 변수 준비
- [ ] Vercel 계정 생성 및 로그인
- [ ] 프로덕션 빌드 테스트 완료

---

## Step 1: MongoDB Atlas 설정 (클라우드 DB)

### 1-1. MongoDB Atlas 계정 생성

```
https://www.mongodb.com/cloud/atlas
```

1. 무료 계정 생성 (Free Tier)
2. "Build a Cluster" 선택
3. 리전: Seoul (ap-northeast-2) 또는 Singapore

### 1-2. 데이터베이스 사용자 생성

```
Database Access → Add New Database User
- Username: busung_admin
- Password: [안전한 비밀번호 생성]
- Built-in Role: Read and write to any database
```

### 1-3. 네트워크 접근 허용

```
Network Access → Add IP Address
- Access List Entry: 0.0.0.0/0 (모든 IP 허용)
  또는 Vercel IP만 허용
```

### 1-4. 연결 문자열 복사

```
Clusters → Connect → Connect your application
- Driver: Node.js
- Version: 4.1 or later

연결 문자열 예시:
mongodb+srv://busung_admin:<password>@cluster0.xxxxx.mongodb.net/busung_hr?retryWrites=true&w=majority
```

**⚠️ 중요: `<password>` 부분을 실제 비밀번호로 변경하세요!**

---

## Step 2: 프로덕션 빌드 테스트

배포 전 로컬에서 프로덕션 빌드를 테스트합니다.

```powershell
# 1. 클라이언트 빌드
cd client
npm run build

# 2. 빌드 결과 확인
# client/build 폴더가 생성되었는지 확인

# 3. 빌드 크기 확인
Get-ChildItem -Recurse client\build | Measure-Object -Property Length -Sum

# 4. 루트로 돌아가기
cd ..
```

---

## Step 3: Vercel 프리뷰 배포

### 3-1. 배포 전 마지막 확인

```powershell
# Git 상태 확인 (선택사항)
git status

# 변경사항이 있다면 커밋
git add .
git commit -m "Ready for Vercel deployment"
```

### 3-2. 프리뷰 배포 실행

```powershell
# Vercel 로그인 (아직 안했다면)
vercel login

# 프리뷰 배포
vercel
```

### 3-3. 배포 중 질문 답변

**첫 배포 시:**

```
? Set up and deploy "path/to/project"? [Y/n]
→ Y

? Which scope do you want to deploy to?
→ [본인 계정 선택]

? Link to existing project? [y/N]
→ N (새 프로젝트)

? What's your project's name?
→ busung-hr-system (또는 원하는 이름)

? In which directory is your code located?
→ ./ (엔터)

? Want to modify these settings? [y/N]
→ N
```

**기존 프로젝트에 배포:**

```
? Link to existing project? [y/N]
→ Y

? What's your project's name?
→ [기존 프로젝트 선택]
```

### 3-4. 배포 완료

```
✓ Production: https://busung-hr-system-xxx.vercel.app [copied to clipboard]
✓ Deployed to production
```

**🎉 프리뷰 URL이 생성됩니다!**

---

## Step 4: Vercel 환경 변수 설정

### 4-1. Vercel 대시보드 접속

```
https://vercel.com/dashboard
→ 프로젝트 선택
→ Settings → Environment Variables
```

### 4-2. 환경 변수 추가

#### 필수 환경 변수:

| 변수명           | 값                                                                         | 환경                |
| ---------------- | -------------------------------------------------------------------------- | ------------------- |
| `MONGODB_URI`    | `mongodb+srv://busung_admin:비밀번호@cluster0.xxxxx.mongodb.net/busung_hr` | Production, Preview |
| `DB_NAME`        | `busung_hr`                                                                | Production, Preview |
| `NODE_ENV`       | `production`                                                               | Production          |
| `NODE_ENV`       | `preview`                                                                  | Preview             |
| `JWT_SECRET`     | `[랜덤 문자열 32자+]`                                                      | Production, Preview |
| `JWT_EXPIRES_IN` | `24h`                                                                      | Production, Preview |

#### 선택 환경 변수 (Firebase 사용 시):

| 변수명                 | 값                         | 환경                |
| ---------------------- | -------------------------- | ------------------- |
| `FIREBASE_API_KEY`     | `your-api-key`             | Production, Preview |
| `FIREBASE_AUTH_DOMAIN` | `your-app.firebaseapp.com` | Production, Preview |
| `FIREBASE_PROJECT_ID`  | `your-project-id`          | Production, Preview |

### 4-3. PowerShell 스크립트로 환경 변수 설정

```powershell
# 환경 변수를 Vercel에 추가
vercel env add MONGODB_URI production preview
# 프롬프트에 MongoDB URI 입력

vercel env add DB_NAME production preview
# 프롬프트에 busung_hr 입력

vercel env add JWT_SECRET production preview
# 프롬프트에 랜덤 문자열 입력
```

### 4-4. 환경 변수 확인

```powershell
# 설정된 환경 변수 목록 보기
vercel env ls
```

---

## Step 5: 환경 변수 적용 후 재배포

환경 변수를 추가했으므로 재배포가 필요합니다.

```powershell
# 프리뷰 배포 (자동으로 재배포)
vercel

# 또는 강제 재배포
vercel --force
```

---

## Step 6: 배포 테스트

### 6-1. 프리뷰 URL 접속

```
https://busung-hr-system-xxx.vercel.app
```

### 6-2. 기능 테스트

1. **로그인 테스트**

   - 관리자 계정으로 로그인
   - JWT 토큰 발급 확인

2. **API 테스트**

   ```powershell
   # PowerShell에서 테스트
   $url = "https://busung-hr-system-xxx.vercel.app"

   # 로그인 테스트
   $body = @{
       employeeNumber = "admin"
       password = "admin123"
   } | ConvertTo-Json

   $response = Invoke-RestMethod -Uri "$url/api/admin/login" `
       -Method Post `
       -Body $body `
       -ContentType "application/json"

   Write-Host "Token: $($response.token)"
   ```

3. **데이터 확인**
   - 직원 목록 조회
   - 근태 기록 확인
   - 휴가 데이터 확인

### 6-3. 개발자 도구로 확인

브라우저 F12 → Network 탭:

- ✅ API 응답 200 OK
- ✅ CORS 오류 없음
- ✅ 로딩 속도 확인

---

## Step 7: 프로덕션 배포

프리뷰 테스트가 성공했다면 프로덕션에 배포합니다.

### 7-1. 프로덕션 배포 실행

```powershell
vercel --prod
```

### 7-2. 배포 완료

```
✓ Production: https://busung-hr-system.vercel.app [copied to clipboard]
✓ Deployed to production
✓ Assigned to production domain
```

### 7-3. 커스텀 도메인 설정 (선택사항)

Vercel 대시보드:

```
Settings → Domains → Add Domain
- 도메인 입력: hr.busung.com
- DNS 설정 안내에 따라 설정
```

---

## Step 8: 데이터 마이그레이션

로컬 MongoDB 데이터를 클라우드로 이전합니다.

### 8-1. 로컬 데이터 백업

```powershell
# 백업 스크립트 실행
npm run backup

# 또는 수동 백업
mongodump --db busung_hr --out ./backups/mongodb-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')
```

### 8-2. Atlas로 복원

```powershell
# MongoDB Atlas 연결 문자열로 복원
$ATLAS_URI = "mongodb+srv://busung_admin:비밀번호@cluster0.xxxxx.mongodb.net"

mongorestore --uri="$ATLAS_URI" --db=busung_hr ./backups/[최신백업폴더]/busung_hr
```

### 8-3. 데이터 확인

MongoDB Atlas 대시보드:

```
Collections → busung_hr
- employees 컬렉션 확인
- attendance 컬렉션 확인
- leaves 컬렉션 확인
```

---

## Step 9: 모니터링 설정

### 9-1. Vercel Analytics 활성화

```
Dashboard → 프로젝트 → Analytics
→ Enable Analytics
```

### 9-2. 로그 확인

```powershell
# 실시간 로그 보기
vercel logs

# 특정 배포의 로그
vercel logs [deployment-url]
```

### 9-3. 에러 모니터링

Vercel 대시보드:

```
프로젝트 → Deployments → [최신 배포] → Logs
- Build Logs: 빌드 로그
- Functions: API 함수 로그
```

---

## Step 10: 최종 확인

### ✅ 배포 완료 체크리스트

- [ ] 프로덕션 URL 접속 가능
- [ ] 로그인 정상 작동
- [ ] API 모든 엔드포인트 응답
- [ ] MongoDB Atlas 연결 확인
- [ ] 데이터 조회/저장 정상
- [ ] 파일 업로드 작동
- [ ] 모바일 반응형 확인
- [ ] HTTPS 적용 확인

---

## 🚨 배포 후 문제 해결

### 문제 1: MongoDB 연결 오류

```
MongoNetworkError: connection timed out
```

**해결:**

1. MongoDB Atlas Network Access 확인
2. 연결 문자열에서 비밀번호 특수문자 URL 인코딩
3. Vercel 환경 변수 재확인

```powershell
# 비밀번호에 특수문자가 있다면 인코딩
# 예: P@ssw0rd → P%40ssw0rd
```

### 문제 2: API 404 오류

```
404: NOT_FOUND
```

**해결:**

1. `vercel.json` 라우팅 규칙 확인
2. API 파일 경로 확인 (`api/*.js`)
3. 재배포: `vercel --prod --force`

### 문제 3: 빌드 실패

```
Error: Build failed
```

**해결:**

```powershell
# 로컬에서 빌드 테스트
cd client
npm run build

# node_modules 재설치
Remove-Item -Recurse -Force node_modules
npm install
```

### 문제 4: 환경 변수가 적용되지 않음

**해결:**

```powershell
# 환경 변수 확인
vercel env ls

# 환경 변수 업데이트 후 재배포
vercel --prod --force
```

---

## 📊 배포 완료 리포트

### 배포 정보

```
프로젝트명: busung-hr-system
프리뷰 URL: https://busung-hr-system-xxx.vercel.app
프로덕션 URL: https://busung-hr-system.vercel.app
배포 시간: 2025-12-11
상태: ✅ 성공
```

### 성능 메트릭

- Build Time: ~2-3분
- Function Region: Seoul (icn1)
- Cold Start: <500ms
- API Response: <1s

---

## 🔄 지속적 배포 (CD)

### GitHub 연동 (권장)

1. **GitHub 저장소 생성**

   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/busung-hr-system.git
   git push -u origin main
   ```

2. **Vercel에서 GitHub 연동**

   ```
   Vercel Dashboard → Import Project → GitHub
   → 저장소 선택 → Import
   ```

3. **자동 배포 설정**
   - `main` 브랜치: 프로덕션 자동 배포
   - 다른 브랜치: 프리뷰 자동 배포

### 수동 배포

```powershell
# Git 커밋
git add .
git commit -m "Update feature"

# Vercel 배포
vercel --prod
```

---

## 📱 모바일 앱 연동

React Native 앱이 있다면 API URL을 업데이트:

```javascript
// HRMobileApp/config.js
export const API_BASE_URL = 'https://busung-hr-system.vercel.app/api';
```

---

## 📚 다음 단계

배포 완료 후:

1. ✅ **사용자 교육**

   - 관리자 계정 배포
   - 사용 방법 안내
   - 문서 공유

2. ✅ **백업 자동화**

   - 정기 백업 스케줄
   - 백업 검증

3. ✅ **모니터링**

   - 에러 추적
   - 성능 모니터링
   - 사용량 분석

4. ✅ **최적화**
   - API 응답 속도 개선
   - 캐싱 적용
   - 이미지 최적화

---

## 🎉 축하합니다!

Vercel 배포가 완료되었습니다! 🚀

이제 인터넷 어디서나 부성 HR 시스템을 사용할 수 있습니다.

---

**작성일:** 2025-12-11  
**버전:** 1.0.0
