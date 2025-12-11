# Git Commit Pre-check Script
# Encoding setup
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git Commit Pre-check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true
$issues = @()

# Test 1: Check .env in .gitignore
Write-Host "[1/8] Checking .env files..." -NoNewline
$envInGitignore = Get-Content .gitignore | Select-String "\.env"
if ($envInGitignore) {
    $envTracked = git ls-files | Select-String "^\.env$"
    if ($envTracked) {
        Write-Host " [FAIL]" -ForegroundColor Red
        $issues += ".env file is being tracked by Git!"
        $allPassed = $false
    } else {
        Write-Host " [PASS]" -ForegroundColor Green
    }
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    $issues += ".env not found in .gitignore"
    $allPassed = $false
}

# Test 2: Check API files
Write-Host "[2/8] Checking API files..." -NoNewline
$apiFiles = @("admin.js", "attendance.js", "communication.js", "employees.js", "holiday.js", "payroll.js", "safety.js", "system.js")
$missingApiFiles = @()
foreach ($file in $apiFiles) {
    if (-not (Test-Path "api/$file")) {
        $missingApiFiles += $file
    }
}
if ($missingApiFiles.Count -eq 0) {
    Write-Host " [PASS]" -ForegroundColor Green
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    $issues += "Missing API files: $($missingApiFiles -join ', ')"
    $allPassed = $false
}

# Test 3: Check client folder structure
Write-Host "[3/8] Checking client structure..." -NoNewline
$clientFolders = @("src", "public")
$missingClientFolders = @()
foreach ($folder in $clientFolders) {
    if (-not (Test-Path "client/$folder")) {
        $missingClientFolders += $folder
    }
}
if ($missingClientFolders.Count -eq 0 -and (Test-Path "client/package.json")) {
    Write-Host " [PASS]" -ForegroundColor Green
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    if ($missingClientFolders.Count -gt 0) {
        $issues += "Missing client folders: $($missingClientFolders -join ', ')"
    }
    if (-not (Test-Path "client/package.json")) {
        $issues += "client/package.json not found"
    }
    $allPassed = $false
}

# Test 4: Check vercel.json
Write-Host "[4/8] Checking vercel.json..." -NoNewline
if (Test-Path "vercel.json") {
    try {
        $vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
        
        # Check for deprecated 'name' property
        if ($vercelConfig.PSObject.Properties.Name -contains "name") {
            Write-Host " [WARN]" -ForegroundColor Yellow
            $issues += "vercel.json contains deprecated 'name' property"
        }
        
        # Check for builds and functions conflict
        if (($vercelConfig.PSObject.Properties.Name -contains "builds") -and 
            ($vercelConfig.PSObject.Properties.Name -contains "functions")) {
            Write-Host " [FAIL]" -ForegroundColor Red
            $issues += "vercel.json has both 'builds' and 'functions' (not allowed)"
            $allPassed = $false
        } else {
            Write-Host " [PASS]" -ForegroundColor Green
        }
    }
    catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        $issues += "vercel.json is not valid JSON"
        $allPassed = $false
    }
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    $issues += "vercel.json not found"
    $allPassed = $false
}

# Test 5: Check Socket.io dependencies
Write-Host "[5/8] Checking Socket.io removal..." -NoNewline
$socketInPackage = Get-Content package.json | Select-String "socket\.io"
$socketInClientPackage = Get-Content client/package.json | Select-String "socket\.io"

if ($socketInPackage -or $socketInClientPackage) {
    Write-Host " [FAIL]" -ForegroundColor Red
    $issues += "Socket.io dependencies still present in package.json"
    $allPassed = $false
} else {
    Write-Host " [PASS]" -ForegroundColor Green
}

# Test 6: Check build folders in .gitignore
Write-Host "[6/8] Checking build exclusions..." -NoNewline
$buildInGitignore = Get-Content .gitignore | Select-String "build"
$nodeModulesInGitignore = Get-Content .gitignore | Select-String "node_modules"

if ($buildInGitignore -and $nodeModulesInGitignore) {
    Write-Host " [PASS]" -ForegroundColor Green
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    if (-not $buildInGitignore) {
        $issues += "/build not in .gitignore"
    }
    if (-not $nodeModulesInGitignore) {
        $issues += "node_modules not in .gitignore"
    }
    $allPassed = $false
}

# Test 7: Check backups and uploads exclusion
Write-Host "[7/8] Checking backup/upload exclusions..." -NoNewline
$backupsInGitignore = Get-Content .gitignore | Select-String "backup"
$uploadsInGitignore = Get-Content .gitignore | Select-String "upload"

if ($backupsInGitignore -and $uploadsInGitignore) {
    Write-Host " [PASS]" -ForegroundColor Green
} else {
    Write-Host " [WARN]" -ForegroundColor Yellow
    if (-not $backupsInGitignore) {
        $issues += "backups/ not in .gitignore (warning)"
    }
    if (-not $uploadsInGitignore) {
        $issues += "uploads/ not in .gitignore (warning)"
    }
}

# Test 8: Check .vercel folder exclusion
Write-Host "[8/8] Checking .vercel exclusion..." -NoNewline
$vercelInGitignore = Get-Content .gitignore | Select-String "\.vercel"

if ($vercelInGitignore) {
    Write-Host " [PASS]" -ForegroundColor Green
} else {
    Write-Host " [WARN]" -ForegroundColor Yellow
    $issues += ".vercel/ not in .gitignore (warning)"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allPassed -and $issues.Count -eq 0) {
    Write-Host "All checks passed! Ready to commit." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Review changes: git status" -ForegroundColor White
    Write-Host "  2. Stage files: git add ." -ForegroundColor White
    Write-Host "  3. Commit: git commit -m 'Your message'" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    if ($allPassed) {
        Write-Host "All critical checks passed (with warnings)." -ForegroundColor Yellow
    } else {
        Write-Host "Some checks failed!" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Issues found:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor $(if ($issue -match "warning") { "Yellow" } else { "Red" })
    }
    Write-Host ""
    Write-Host "Please fix the issues before committing." -ForegroundColor Yellow
    Write-Host "See: GIT_COMMIT_CHECKLIST.md for details" -ForegroundColor Gray
    Write-Host ""
    
    if (-not $allPassed) {
        exit 1
    }
}
