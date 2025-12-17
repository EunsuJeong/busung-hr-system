# 부성스틸 HR 시스템 - 앱 다운로드

## Android 다운로드

### 방법 1: GitHub Actions에서 다운로드 (권장)

1. [GitHub Actions 페이지](https://github.com/EunsuJeong/busung-hr-system/actions)로 이동
2. **"Build Android APK"** 워크플로우 선택
3. 최신 성공한 빌드 클릭
4. 하단의 **Artifacts** 섹션에서 `app-release` 다운로드
5. APK 파일을 Android 기기에 설치

### QR 코드로 빠른 접속

Android APK 다운로드 페이지:

```
https://github.com/EunsuJeong/busung-hr-system/actions/workflows/android-build.yml
```

## iOS 다운로드

### 방법 1: GitHub Actions에서 다운로드

1. [GitHub Actions 페이지](https://github.com/EunsuJeong/busung-hr-system/actions)로 이동
2. **"Build iOS App"** 워크플로우 선택
3. 최신 성공한 빌드 클릭
4. 하단의 **Artifacts** 섹션에서 `ios-app` 다운로드
5. IPA 파일 획득

### QR 코드로 빠른 접속

iOS IPA 다운로드 페이지:

```
https://github.com/EunsuJeong/busung-hr-system/actions/workflows/ios-build.yml
```

### iOS 테스트 결과 확인

시뮬레이터 테스트 결과 및 스크린샷:

1. [GitHub Actions 페이지](https://github.com/EunsuJeong/busung-hr-system/actions)로 이동
2. **"Test iOS App on Simulator"** 워크플로우 선택
3. 최신 테스트 결과 확인
4. **Artifacts** 섹션에서:
   - `ios-screenshots` - 앱 실행 화면
   - `ios-logs` - 앱 실행 로그

## 중요 참고사항

### Android
- APK 파일은 서명되지 않은 릴리즈 버전입니다
- 설치 시 "알 수 없는 출처" 허용 필요
- Google Play Store 배포를 위해서는 추가 서명 작업 필요

### iOS
- IPA 파일은 서명되지 않은 버전입니다
- **일반 사용자는 직접 설치 불가능**
- 설치를 위해서는 다음 중 하나 필요:
  - Apple Developer 계정 (유료, $99/년)
  - TestFlight를 통한 배포
  - Enterprise 인증서
  - Ad-hoc 배포 (특정 디바이스만)

### iOS 앱을 실제 기기에 설치하려면

1. **개발자 계정 필요**
   - [Apple Developer Program](https://developer.apple.com/programs/) 가입 ($99/년)

2. **서명 및 프로비저닝**
   - Xcode에서 Development Certificate 생성
   - 디바이스 UDID 등록
   - Provisioning Profile 생성

3. **Xcode로 설치**
   - Mac에서 Xcode 열기
   - iOS 프로젝트 열기: `client/ios/App/App.xcodeproj`
   - 연결된 iOS 기기 선택
   - Run (⌘R) 버튼 클릭

4. **TestFlight 배포** (추천)
   - App Store Connect 설정
   - Archive 생성
   - TestFlight에 업로드
   - 테스터 초대 및 설치

## 빠른 링크

- **프로젝트 저장소**: https://github.com/EunsuJeong/busung-hr-system
- **Android APK**: [Actions - Build Android APK](https://github.com/EunsuJeong/busung-hr-system/actions/workflows/android-build.yml)
- **iOS IPA**: [Actions - Build iOS App](https://github.com/EunsuJeong/busung-hr-system/actions/workflows/ios-build.yml)
- **iOS 테스트**: [Actions - Test iOS App](https://github.com/EunsuJeong/busung-hr-system/actions/workflows/ios-test.yml)
