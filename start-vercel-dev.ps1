# Vercel Local Test Quick Start Script (PowerShell)
# This script helps you start Vercel development server with MongoDB

# 인코딩 설정
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Vercel Local Test Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check if Vercel CLI is installed
if (-not (Test-Command "vercel")) {
    Write-Host "[ERROR] Vercel CLI is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install it first:" -ForegroundColor Yellow
    Write-Host "  npm install -g vercel" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Vercel CLI found" -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
$mongoTest = node check-db.js 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] MongoDB is not running" -ForegroundColor Yellow
    Write-Host "Starting MongoDB..." -ForegroundColor Yellow
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "start:mongodb"
    Start-Sleep -Seconds 3
}

Write-Host "[OK] MongoDB is ready" -ForegroundColor Green
Write-Host ""

# Check .env.local file
if (-not (Test-Path ".env.local")) {
    Write-Host "[WARNING] .env.local not found" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Write-Host "Creating .env.local from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env.local"
    } else {
        Write-Host "[ERROR] .env.example not found" -ForegroundColor Red
        Write-Host "Please create .env.local manually" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "[OK] Environment variables ready" -ForegroundColor Green
Write-Host ""

# Prompt user for options
Write-Host "Select an option:" -ForegroundColor Cyan
Write-Host "  1. Start Vercel Dev (default port 3000)" -ForegroundColor White
Write-Host "  2. Start Vercel Dev with debug mode" -ForegroundColor White
Write-Host "  3. Start Vercel Dev on port 3001" -ForegroundColor White
Write-Host "  4. Download environment variables from Vercel" -ForegroundColor White
Write-Host "  5. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Starting Vercel Dev Server..." -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Access your application at:" -ForegroundColor Green
        Write-Host "  http://localhost:3000" -ForegroundColor White
        Write-Host ""
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        vercel dev
    }
    "2" {
        Write-Host ""
        Write-Host "Starting Vercel Dev Server (Debug Mode)..." -ForegroundColor Cyan
        Write-Host ""
        vercel dev --debug
    }
    "3" {
        Write-Host ""
        Write-Host "Starting Vercel Dev Server on port 3001..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Access your application at:" -ForegroundColor Green
        Write-Host "  http://localhost:3001" -ForegroundColor White
        Write-Host ""
        vercel dev --listen 3001
    }
    "4" {
        Write-Host ""
        Write-Host "Downloading environment variables from Vercel..." -ForegroundColor Cyan
        vercel env pull .env.vercel.local
        Write-Host ""
        Write-Host "Environment variables saved to .env.vercel.local" -ForegroundColor Green
        Write-Host ""
        Read-Host "Press Enter to continue"
        & $PSCommandPath
    }
    "5" {
        Write-Host ""
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "[ERROR] Invalid choice. Please select 1-5." -ForegroundColor Red
        Start-Sleep -Seconds 2
        & $PSCommandPath
    }
}
