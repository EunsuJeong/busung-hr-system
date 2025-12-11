@echo off
REM Vercel Local Test Quick Start Script
REM This script helps you start Vercel development server with MongoDB

echo ========================================
echo   Vercel Local Test Environment
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Vercel CLI is not installed!
    echo.
    echo Please install it first:
    echo   npm install -g vercel
    echo.
    pause
    exit /b 1
)

echo [OK] Vercel CLI found
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
node check-db.js >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB is not running
    echo Starting MongoDB...
    start "MongoDB Server" cmd /c "npm run start:mongodb"
    timeout /t 3 >nul
)

echo [OK] MongoDB is ready
echo.

REM Check .env.local file
if not exist ".env.local" (
    echo [WARNING] .env.local not found
    if exist ".env.example" (
        echo Creating .env.local from .env.example...
        copy .env.example .env.local
    ) else (
        echo [ERROR] .env.example not found
        echo Please create .env.local manually
        pause
        exit /b 1
    )
)

echo [OK] Environment variables ready
echo.

REM Start Vercel Dev
echo ========================================
echo Starting Vercel Dev Server...
echo ========================================
echo.
echo Access your application at:
echo   http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

vercel dev

pause
