@echo off
echo ========================================
echo 부성스틸 HR 앱 APK 생성 스크립트
echo ========================================
echo.

cd /d "%~dp0client"

echo [1/5] 프로덕션 빌드 중...
set CI=false
call npm run build
if errorlevel 1 (
    echo 빌드 실패!
    pause
    exit /b 1
)

echo.
echo [2/5] Capacitor 동기화 중...
call npx cap sync android
if errorlevel 1 (
    echo Capacitor 동기화 실패!
    pause
    exit /b 1
)

echo.
echo [3/5] Android Studio 열기...
echo Android Studio에서:
echo 1. Build -^> Build Bundle(s) / APK(s) -^> Build APK(s)
echo 2. 빌드 완료 후 하단에 "locate" 클릭
echo.
call npx cap open android

echo.
echo [완료] APK 위치:
echo client\android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
