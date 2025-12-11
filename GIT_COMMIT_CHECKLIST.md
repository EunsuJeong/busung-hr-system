# Git 커밋 전 체크리스트

## 📋 체크리스트 항목

### ✅ 1. 환경 변수 보안

- [ ] `.env` 파일이 `.gitignore`에 있는지
- [ ] `.env.local` 파일이 `.gitignore`에 있는지
- [ ] `.env.example`만 커밋되는지

**확인 명령어:**

```powershell
# .gitignore에 .env가 있는지 확인
Get-Content .gitignore | Select-String "\.env"

# .env 파일이 git tracking에서 제외되었는지 확인
git check-ignore .env .env.local
# "예상 출력: .env, .env.local" (제외되었다는 의미)
```

---

### ✅ 2. API 파일 구조

- [ ] 모든 API 파일이 `/api` 폴더에 있는지
- [ ] API 파일이 Vercel Serverless 형식인지
- [ ] `module.exports` 사용하는지

**확인 명령어:**

```powershell
# api 폴더의 모든 .js 파일 나열
Get-ChildItem -Path api -Recurse -Filter "*.js" | Select-Object FullName

# API 파일 개수 확인
(Get-ChildItem -Path api -Recurse -Filter "*.js").Count
```

**예상 파일 목록:**

- api/admin.js
- api/attendance.js
- api/communication.js
- api/employees.js
- api/holiday.js
- api/payroll.js
- api/safety.js
- api/system.js
- api/utils/mongodb.js

---

### ✅ 3. Client 폴더 구조

- [ ] `client/` 폴더가 존재하는지
- [ ] `client/src/` 폴더가 있는지
- [ ] `client/public/` 폴더가 있는지
- [ ] `client/package.json`이 있는지

**확인 명령어:**

```powershell
# client 폴더 구조 확인
Get-ChildItem -Path client -Directory | Select-Object Name

# client/package.json 빌드 스크립트 확인
Get-Content client/package.json | Select-String "build"
```

**필수 구조:**

```
client/
├── package.json
├── public/
├── src/
├── craco.config.js
└── tailwind.config.js
```

---

### ✅ 4. vercel.json 설정

- [ ] `vercel.json` 파일이 루트에 있는지
- [ ] `name` 속성이 없는지 (deprecated)
- [ ] `builds`와 `functions`를 동시 사용 안하는지
- [ ] routes 설정이 올바른지

**확인 명령어:**

```powershell
# vercel.json 파일 존재 확인
Test-Path vercel.json

# vercel.json 내용 확인
Get-Content vercel.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# deprecated 속성 확인
Get-Content vercel.json | Select-String "name|builds.*functions"
```

**올바른 vercel.json 구조:**

```json
{
  "version": 2,
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/build",
  "routes": [...],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```

---

### ✅ 5. Socket.io 의존성 제거

- [ ] `package.json`에서 socket.io 제거
- [ ] `client/package.json`에서 socket.io 제거
- [ ] 코드에서 socket.io 사용 제거

**확인 명령어:**

```powershell
# package.json에서 socket.io 검색
Get-Content package.json | Select-String "socket"

# client/package.json에서 socket.io 검색
Get-Content client/package.json | Select-String "socket"

# 코드에서 socket.io 사용 검색
Get-ChildItem -Recurse -Include "*.js","*.jsx" -Exclude "node_modules" | Select-String "socket\.io|io\(" | Select-Object Path, LineNumber, Line
```

**제거 필요:**

- ❌ "socket.io": "^4.8.1"
- ❌ "socket.io-client": "^4.8.1"
- ❌ import io from 'socket.io-client'

---

### ✅ 6. 빌드 산출물 제외

- [ ] `/build` 폴더가 `.gitignore`에 있는지
- [ ] `/client/build` 폴더가 `.gitignore`에 있는지
- [ ] `node_modules`가 `.gitignore`에 있는지

**확인 명령어:**

```powershell
# .gitignore에서 빌드 폴더 확인
Get-Content .gitignore | Select-String "build|node_modules"

# git에서 추적되지 않는 파일 확인
git status --ignored
```

---

### ✅ 7. 백업 및 업로드 파일 제외

- [ ] `/backups` 폴더가 `.gitignore`에 있는지
- [ ] `/uploads` 폴더가 `.gitignore`에 있는지
- [ ] 로그 파일이 제외되는지

**확인 명령어:**

```powershell
# .gitignore에서 확인
Get-Content .gitignore | Select-String "backup|upload|\.log"
```

---

### ✅ 8. Vercel 설정 파일 제외

- [ ] `.vercel` 폴더가 `.gitignore`에 있는지
- [ ] `vercel-env-commands.txt` 같은 임시 파일 제외

**확인 명령어:**

```powershell
# .vercel 폴더 확인
Get-Content .gitignore | Select-String "\.vercel"

# vercel 관련 임시 파일 찾기
Get-ChildItem -Recurse -Filter "*vercel*" -File | Where-Object {$_.Name -notmatch "vercel\.json"}
```

---

## 🔧 자동 체크 스크립트

모든 항목을 자동으로 확인하는 스크립트를 실행하세요:

```powershell
.\check-git-commit.ps1
```

---

## 📝 수동 확인 절차

### Step 1: 환경 변수 확인

```powershell
# .env가 tracking되지 않는지 확인
git ls-files | Select-String "\.env$"
# 출력 없음 = OK

# .env.example은 있는지 확인
git ls-files | Select-String "\.env\.example"
# .env.example = OK
```

### Step 2: API 파일 확인

```powershell
# api 폴더 구조 확인
tree api /F

# 예상 출력:
# api
# ├── admin.js
# ├── attendance.js
# ├── communication.js
# ├── employees.js
# ├── holiday.js
# ├── payroll.js
# ├── safety.js
# ├── system.js
# └── utils
#     └── mongodb.js
```

### Step 3: Client 구조 확인

```powershell
# client 폴더 확인
Get-ChildItem client -Directory | Select-Object Name

# 필수: src, public
```

### Step 4: vercel.json 검증

```powershell
# JSON 유효성 검사
Get-Content vercel.json | ConvertFrom-Json

# 오류 없으면 OK
```

### Step 5: Socket.io 제거 확인

```powershell
# package.json에서 제거되었는지 확인
Get-Content package.json | Select-String "socket"
# 출력 없음 = OK

# 코드에서 사용 확인
Get-ChildItem -Path client/src -Recurse -Filter "*.js" | Select-String "socket\.io" | Select-Object Path, Line
# 출력 없음 = OK
```

---

## ✅ 커밋 전 최종 체크

모든 항목 확인 후:

```powershell
# 1. Git 상태 확인
git status

# 2. 변경 사항 확인
git diff

# 3. 추가할 파일만 stage
git add .

# 4. 커밋
git commit -m "feat: Vercel 배포 준비 완료

- API 파일을 /api로 이동
- vercel.json 설정 완료
- Socket.io 제거
- 환경 변수 보안 처리
- 클라이언트 빌드 최적화"
```

---

## 🚫 절대 커밋하면 안되는 파일

```
❌ .env
❌ .env.local
❌ .env.production
❌ node_modules/
❌ client/build/
❌ backups/
❌ uploads/ (실제 업로드 파일)
❌ *.log
❌ .vercel/
❌ vercel-env-commands.txt
❌ test-results-*.json
```

---

## 📊 커밋 전 체크리스트 요약

| 항목             | 확인 방법                | 상태 |
| ---------------- | ------------------------ | ---- |
| .env 제외        | `git check-ignore .env`  | [ ]  |
| API 파일 위치    | `Get-ChildItem api`      | [ ]  |
| client 구조      | `Get-ChildItem client`   | [ ]  |
| vercel.json      | `Test-Path vercel.json`  | [ ]  |
| Socket.io 제거   | `Select-String "socket"` | [ ]  |
| 빌드 파일 제외   | `git status --ignored`   | [ ]  |
| 백업 파일 제외   | `.gitignore` 확인        | [ ]  |
| Vercel 폴더 제외 | `.gitignore` 확인        | [ ]  |

---

## 🎯 다음 단계

체크리스트 완료 후:

1. ✅ **로컬 테스트**

   ```powershell
   npm start
   ```

2. ✅ **Vercel 배포 테스트**

   ```powershell
   vercel
   ```

3. ✅ **프로덕션 배포**

   ```powershell
   vercel --prod
   ```

4. ✅ **Git 푸시**
   ```powershell
   git push origin main
   ```

---

**작성일:** 2025-12-11  
**버전:** 1.0.0
