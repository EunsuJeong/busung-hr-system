# 배포 후 자동 테스트 스크립트
# Vercel 배포 후 모든 API 엔드포인트를 자동으로 테스트합니다

# 인코딩 설정
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

param(
    [Parameter(Mandatory=$true)]
    [string]$Url,
    [string]$AdminUser = "admin",
    [string]$AdminPassword = "admin123"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Vercel 배포 테스트" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "테스트 대상: $Url" -ForegroundColor Yellow
Write-Host ""

$results = @()
$token = $null
$startTime = Get-Date

# 테스트 함수
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$Token,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "  $Name..." -NoNewline
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$Url$Endpoint"
            Method = $Method
            Headers = $headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $start = Get-Date
        
        try {
            $response = Invoke-RestMethod @params
            $elapsed = ((Get-Date) - $start).TotalMilliseconds
            
            Write-Host " [PASS] $($elapsed.ToString('F0'))ms" -ForegroundColor Green
            
            return @{
                Name = $Name
                Endpoint = $Endpoint
                Status = "PASS"
                ResponseTime = $elapsed
                Response = $response
            }
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.Value__
            $elapsed = ((Get-Date) - $start).TotalMilliseconds
            
            if ($statusCode -eq $ExpectedStatus) {
                Write-Host " [PASS] $($elapsed.ToString('F0'))ms (Status: $statusCode)" -ForegroundColor Green
                return @{
                    Name = $Name
                    Endpoint = $Endpoint
                    Status = "PASS"
                    ResponseTime = $elapsed
                }
            } else {
                throw
            }
        }
    }
    catch {
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        Write-Host " [FAIL] $($elapsed.ToString('F0'))ms" -ForegroundColor Red
        
        $errorMessage = $_.Exception.Message
        if ($_.ErrorDetails.Message) {
            $errorMessage = $_.ErrorDetails.Message
        }
        
        Write-Host "    오류: $errorMessage" -ForegroundColor Red
        
        return @{
            Name = $Name
            Endpoint = $Endpoint
            Status = "FAIL"
            ResponseTime = $elapsed
            Error = $errorMessage
        }
    }
}

# 1. 기본 연결 테스트
Write-Host "--- 기본 연결 테스트 ---" -ForegroundColor Cyan
$result = Test-Endpoint -Name "홈페이지 로드" -Method "GET" -Endpoint "/"
$results += $result
Write-Host ""

# 2. 인증 테스트
Write-Host "--- 인증 테스트 ---" -ForegroundColor Cyan
$loginBody = @{
    employeeNumber = $AdminUser
    password = $AdminPassword
}
$result = Test-Endpoint -Name "관리자 로그인" -Method "POST" -Endpoint "/api/admin/login" -Body $loginBody
$results += $result

if ($result.Status -eq "PASS" -and $result.Response.token) {
    $token = $result.Response.token
    Write-Host "    토큰 획득 성공" -ForegroundColor Gray
}

Write-Host ""

# 3. 직원 API 테스트
if ($token) {
    Write-Host "--- 직원 API 테스트 ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "직원 목록 조회" -Method "GET" -Endpoint "/api/employees" -Token $token
    $results += $result
    
    $result = Test-Endpoint -Name "직원 통계" -Method "GET" -Endpoint "/api/employees?action=stats" -Token $token
    $results += $result
    
    Write-Host ""
}

# 4. 근태 API 테스트
if ($token) {
    Write-Host "--- 근태 API 테스트 ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "오늘 근태 조회" -Method "GET" -Endpoint "/api/attendance?action=today" -Token $token
    $results += $result
    
    $result = Test-Endpoint -Name "근태 통계" -Method "GET" -Endpoint "/api/attendance?action=stats" -Token $token
    $results += $result
    
    $result = Test-Endpoint -Name "월별 근태" -Method "GET" -Endpoint "/api/attendance?action=monthly" -Token $token
    $results += $result
    
    Write-Host ""
}

# 5. 휴가 API 테스트
if ($token) {
    Write-Host "--- 휴가 API 테스트 ---" -ForegroundColor Cyan
    
    $currentYear = (Get-Date).Year
    $result = Test-Endpoint -Name "공휴일 목록" -Method "GET" -Endpoint "/api/holiday/holidays?year=$currentYear" -Token $token
    $results += $result
    
    Write-Host ""
}

# 6. 급여 API 테스트
if ($token) {
    Write-Host "--- 급여 API 테스트 ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "급여 목록" -Method "GET" -Endpoint "/api/payroll" -Token $token
    $results += $result
    
    Write-Host ""
}

# 7. 커뮤니케이션 API 테스트
if ($token) {
    Write-Host "--- 커뮤니케이션 API 테스트 ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "공지사항 목록" -Method "GET" -Endpoint "/api/communication?type=notices" -Token $token
    $results += $result
    
    $result = Test-Endpoint -Name "알림 목록" -Method "GET" -Endpoint "/api/communication?type=notifications" -Token $token
    $results += $result
    
    Write-Host ""
}

# 8. 안전 API 테스트
if ($token) {
    Write-Host "--- 안전 API 테스트 ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "안전 교육 목록" -Method "GET" -Endpoint "/api/safety?action=trainings" -Token $token
    $results += $result
    
    Write-Host ""
}

# 9. 시스템 API 테스트
if ($token) {
    Write-Host "--- 시스템 API 테스트 ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "대시보드 통계" -Method "GET" -Endpoint "/api/system?action=dashboard" -Token $token
    $results += $result
    
    Write-Host ""
}

# 테스트 결과 요약
$endTime = Get-Date
$totalTime = ($endTime - $startTime).TotalSeconds

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   테스트 결과 요약" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $results.Count

Write-Host "총 테스트: $totalCount" -ForegroundColor White
Write-Host "성공: $passCount" -ForegroundColor Green
Write-Host "실패: $failCount" -ForegroundColor Red
Write-Host "소요 시간: $($totalTime.ToString('F2'))초" -ForegroundColor Gray
Write-Host ""

# 성능 통계
$responseTimes = $results | Where-Object { $_.ResponseTime } | Select-Object -ExpandProperty ResponseTime
if ($responseTimes.Count -gt 0) {
    $avgResponseTime = ($responseTimes | Measure-Object -Average).Average
    $maxResponseTime = ($responseTimes | Measure-Object -Maximum).Maximum
    $minResponseTime = ($responseTimes | Measure-Object -Minimum).Minimum
    
    Write-Host "응답 시간 통계:" -ForegroundColor Cyan
    Write-Host "  평균: $($avgResponseTime.ToString('F0'))ms" -ForegroundColor White
    Write-Host "  최소: $($minResponseTime.ToString('F0'))ms" -ForegroundColor White
    Write-Host "  최대: $($maxResponseTime.ToString('F0'))ms" -ForegroundColor White
    Write-Host ""
}

# 실패한 테스트 상세
if ($failCount -gt 0) {
    Write-Host "실패한 테스트:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  • $($_.Name)" -ForegroundColor Red
        Write-Host "    엔드포인트: $($_.Endpoint)" -ForegroundColor Gray
        Write-Host "    오류: $($_.Error)" -ForegroundColor Gray
    }
    Write-Host ""
}

# 느린 응답 경고
$slowThreshold = 2000 # 2초
$slowTests = $results | Where-Object { $_.ResponseTime -gt $slowThreshold }
if ($slowTests.Count -gt 0) {
    Write-Host "느린 응답 (>2초):" -ForegroundColor Yellow
    $slowTests | ForEach-Object {
        Write-Host "  • $($_.Name): $($_.ResponseTime.ToString('F0'))ms" -ForegroundColor Yellow
    }
    Write-Host ""
}

# 결과를 JSON으로 저장
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$resultFile = "vercel-test-results-$timestamp.json"
$testReport = @{
    Timestamp = $timestamp
    Url = $Url
    TotalTests = $totalCount
    Passed = $passCount
    Failed = $failCount
    TotalTime = $totalTime
    Results = $results
}
$testReport | ConvertTo-Json -Depth 10 | Out-File $resultFile -Encoding UTF8
Write-Host "상세 결과 저장: $resultFile" -ForegroundColor Gray
Write-Host ""

# 최종 결과
if ($failCount -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   모든 테스트 통과! ✓" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "배포가 성공적으로 완료되었습니다! 🎉" -ForegroundColor Green
    exit 0
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   일부 테스트 실패" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "문제 해결:" -ForegroundColor Yellow
    Write-Host "  1. Vercel 로그 확인: vercel logs" -ForegroundColor White
    Write-Host "  2. 환경 변수 확인: vercel env ls" -ForegroundColor White
    Write-Host "  3. MongoDB 연결 확인" -ForegroundColor White
    Write-Host "  4. API 파일 확인" -ForegroundColor White
    Write-Host ""
    exit 1
}
