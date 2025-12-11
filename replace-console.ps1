$content = Get-Content "C:\hr-system\src\App.js" -Raw
$content = $content -replace 'console\.log\(', 'devLog('
$content = $content -replace 'console\.error\(', 'devLog('
Set-Content "C:\hr-system\src\App.js" $content
Write-Host "Console.log replacement complete"
