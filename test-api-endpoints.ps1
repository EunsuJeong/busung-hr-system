# API Endpoint Test Script
# Tests all major API endpoints to ensure they're working correctly

# 인코딩 설정
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$AdminUser = "admin",
    [string]$AdminPassword = "admin123"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   API Endpoint Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing against: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

$results = @()
$token = $null

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$Token
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$BaseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host " [PASS]" -ForegroundColor Green
        
        return @{
            Name = $Name
            Status = "PASS"
            Response = $response
        }
    }
    catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        
        return @{
            Name = $Name
            Status = "FAIL"
            Error = $_.Exception.Message
        }
    }
}

# Test 1: Health Check
Write-Host "`n--- Health Check ---" -ForegroundColor Cyan
$result = Test-Endpoint -Name "Root Endpoint" -Method "GET" -Endpoint "/"
$results += $result

# Test 2: Login
Write-Host "`n--- Authentication ---" -ForegroundColor Cyan
$loginBody = @{
    employeeNumber = $AdminUser
    password = $AdminPassword
}
$result = Test-Endpoint -Name "Admin Login" -Method "POST" -Endpoint "/api/admin/login" -Body $loginBody
$results += $result

if ($result.Status -eq "PASS" -and $result.Response.token) {
    $token = $result.Response.token
    Write-Host "  Token acquired: $($token.Substring(0, 20))..." -ForegroundColor Gray
}

# Test 3: Employee API (requires authentication)
if ($token) {
    Write-Host "`n--- Employee API ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "Get All Employees" -Method "GET" -Endpoint "/api/employees" -Token $token
    $results += $result
    
    $result = Test-Endpoint -Name "Get Employee Stats" -Method "GET" -Endpoint "/api/employees/stats" -Token $token
    $results += $result
}

# Test 4: Attendance API
if ($token) {
    Write-Host "`n--- Attendance API ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "Get Today's Attendance" -Method "GET" -Endpoint "/api/attendance/today" -Token $token
    $results += $result
    
    $result = Test-Endpoint -Name "Get Attendance Stats" -Method "GET" -Endpoint "/api/attendance/stats" -Token $token
    $results += $result
}

# Test 5: Holiday API
if ($token) {
    Write-Host "`n--- Holiday API ---" -ForegroundColor Cyan
    
    $currentYear = (Get-Date).Year
    $result = Test-Endpoint -Name "Get Holidays" -Method "GET" -Endpoint "/api/holiday/holidays?year=$currentYear" -Token $token
    $results += $result
}

# Test 6: Payroll API
if ($token) {
    Write-Host "`n--- Payroll API ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "Get Payroll List" -Method "GET" -Endpoint "/api/payroll" -Token $token
    $results += $result
}

# Test 7: Communication API
if ($token) {
    Write-Host "`n--- Communication API ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "Get Notices" -Method "GET" -Endpoint "/api/communication/notices" -Token $token
    $results += $result
}

# Test 8: Safety API
if ($token) {
    Write-Host "`n--- Safety API ---" -ForegroundColor Cyan
    
    $result = Test-Endpoint -Name "Get Safety Trainings" -Method "GET" -Endpoint "/api/safety/trainings" -Token $token
    $results += $result
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $results.Count

Write-Host ""
Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "All tests passed! ✓" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Please review the errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Failed tests:" -ForegroundColor Yellow
    $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host ""

# Save results to file
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$resultFile = "test-results-$timestamp.json"
$results | ConvertTo-Json -Depth 10 | Out-File $resultFile
Write-Host "Results saved to: $resultFile" -ForegroundColor Gray
Write-Host ""

# Return exit code
if ($failCount -gt 0) {
    exit 1
} else {
    exit 0
}
