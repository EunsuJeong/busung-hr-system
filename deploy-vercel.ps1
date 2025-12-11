# Vercel 배포 자동화 스크립트
# 배포 전 체크리스트를 자동으로 확인하고 배포를 실행합니다

# 인코딩 설정
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

param(
    [switch]$Production,
    [switch]$Force,
    [switch]$SkipTests
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Vercel 배포 자동화" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# 1. 사전 확인
Write-Host "[1/8] 사전 확인 중..." -ForegroundColor Yellow

# Vercel CLI 확인
if (-not (Test-Command "vercel")) {
    Write-Host "  [ERROR] Vercel CLI가 설치되어 있지 않습니다!" -ForegroundColor Red
    Write-Host "  설치: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✓ Vercel CLI 확인" -ForegroundColor Green

# Node.js 확인
if (-not (Test-Command "node")) {
    Write-Host "  [ERROR] Node.js가 설치되어 있지 않습니다!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Node.js 확인" -ForegroundColor Green

# Git 확인 (선택사항)
if (Test-Command "git") {
    Write-Host "  ✓ Git 확인" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Git이 없습니다 (선택사항)" -ForegroundColor Yellow
}

Write-Host ""

# 2. 환경 변수 체크
Write-Host "[2/8] 환경 변수 확인 중..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "  ✓ .env.local 존재" -ForegroundColor Green
} else {
    Write-Host "  ⚠ .env.local이 없습니다" -ForegroundColor Yellow
}

Write-Host ""

# 3. 의존성 확인
Write-Host "[3/8] 의존성 확인 중..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "  ✓ node_modules 존재" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] node_modules가 없습니다. 설치 중..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] npm install 실패!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ 의존성 설치 완료" -ForegroundColor Green
}

if (Test-Path "client/node_modules") {
    Write-Host "  ✓ client/node_modules 존재" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] client/node_modules가 없습니다. 설치 중..." -ForegroundColor Yellow
    Push-Location client
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] client npm install 실패!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "  ✓ 클라이언트 의존성 설치 완료" -ForegroundColor Green
}

Write-Host ""

# 4. 빌드 테스트
Write-Host "[4/8] 프로덕션 빌드 테스트 중..." -ForegroundColor Yellow

if (-not $SkipTests) {
    Push-Location client
    Write-Host "  빌드 중... (시간이 걸릴 수 있습니다)" -ForegroundColor Gray
    
    npm run build 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] 빌드 실패!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    if (Test-Path "build") {
        Write-Host "  ✓ 빌드 성공" -ForegroundColor Green
        
        # 빌드 크기 확인
        $buildSize = (Get-ChildItem -Recurse build | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "  빌드 크기: $($buildSize.ToString('F2')) MB" -ForegroundColor Gray
    } else {
        Write-Host "  [ERROR] build 폴더가 생성되지 않았습니다!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
} else {
    Write-Host "  ⚠ 빌드 테스트 건너뛰기" -ForegroundColor Yellow
}

Write-Host ""

# 5. API 파일 확인
Write-Host "[5/8] API 파일 확인 중..." -ForegroundColor Yellow

$apiFiles = @(
    "api/admin.js",
    "api/employees.js",
    "api/attendance.js",
    "api/holiday.js",
    "api/payroll.js",
    "api/communication.js",
    "api/safety.js",
    "api/system.js"
)

$missingFiles = @()
foreach ($file in $apiFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file 없음" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "  [WARNING] 일부 API 파일이 없습니다:" -ForegroundColor Yellow
    $missingFiles | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
    Write-Host ""
    $continue = Read-Host "  계속하시겠습니까? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "  배포 취소됨" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""

# 6. vercel.json 확인
Write-Host "[6/8] Vercel 설정 확인 중..." -ForegroundColor Yellow

if (Test-Path "vercel.json") {
    Write-Host "  ✓ vercel.json 존재" -ForegroundColor Green
    
    # vercel.json 파싱
    $vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
    if ($vercelConfig.builds) {
        Write-Host "  ✓ builds 설정 확인" -ForegroundColor Green
    }
    if ($vercelConfig.routes) {
        Write-Host "  ✓ routes 설정 확인" -ForegroundColor Green
    }
} else {
    Write-Host "  [ERROR] vercel.json이 없습니다!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 7. Git 상태 확인 (선택사항)
if (Test-Command "git") {
    Write-Host "[7/8] Git 상태 확인 중..." -ForegroundColor Yellow
    
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "  ⚠ 커밋되지 않은 변경사항이 있습니다:" -ForegroundColor Yellow
        Write-Host "$gitStatus" -ForegroundColor Gray
        Write-Host ""
        $commit = Read-Host "  변경사항을 커밋하시겠습니까? (y/N)"
        if ($commit -eq "y" -or $commit -eq "Y") {
            $message = Read-Host "  커밋 메시지를 입력하세요"
            git add .
            git commit -m $message
            Write-Host "  ✓ 커밋 완료" -ForegroundColor Green
        }
    } else {
        Write-Host "  ✓ 작업 디렉토리 깨끗함" -ForegroundColor Green
    }
} else {
    Write-Host "[7/8] Git 확인 건너뛰기" -ForegroundColor Yellow
}

Write-Host ""

# 8. 배포 실행
Write-Host "[8/8] Vercel 배포 시작..." -ForegroundColor Yellow
Write-Host ""

# 배포 명령어 구성
$deployCmd = "vercel"
if ($Production) {
    $deployCmd += " --prod"
    Write-Host "  배포 타입: 프로덕션" -ForegroundColor Cyan
} else {
    Write-Host "  배포 타입: 프리뷰" -ForegroundColor Cyan
}

if ($Force) {
    $deployCmd += " --force"
    Write-Host "  강제 배포: 활성화" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 최종 확인
$confirm = Read-Host "배포를 시작하시겠습니까? (Y/n)"
if ($confirm -eq "n" -or $confirm -eq "N") {
    Write-Host ""
    Write-Host "배포가 취소되었습니다." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "배포 중..." -ForegroundColor Green
Write-Host ""

# 배포 실행
Invoke-Expression $deployCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   배포 완료! 🎉" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "다음 단계:" -ForegroundColor Cyan
    Write-Host "  1. Vercel 대시보드에서 환경 변수 설정" -ForegroundColor White
    Write-Host "  2. MongoDB Atlas 연결 확인" -ForegroundColor White
    Write-Host "  3. 배포된 URL에서 기능 테스트" -ForegroundColor White
    Write-Host ""
    Write-Host "문서: VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   배포 실패" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "문제 해결:" -ForegroundColor Yellow
    Write-Host "  1. 로그 확인: vercel logs" -ForegroundColor White
    Write-Host "  2. 환경 변수 확인: vercel env ls" -ForegroundColor White
    Write-Host "  3. 문서 참조: VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor White
    Write-Host ""
    exit 1
}
