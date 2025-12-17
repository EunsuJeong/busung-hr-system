# Busung HR System

부성 인사관리 시스템 - React + Node.js + MongoDB

## 📱 모바일 앱 다운로드

### QR 코드로 빠른 다운로드

`download-qr.html` 파일을 브라우저로 열어 QR 코드를 스캔하세요!

### 다운로드 링크

- 📗 **Android APK**: [GitHub Actions에서 다운로드](https://github.com/EunsuJeong/busung-hr-system/actions/workflows/android-build.yml)
- 📘 **iOS IPA**: [GitHub Actions에서 다운로드](https://github.com/EunsuJeong/busung-hr-system/actions/workflows/ios-build.yml)
- 🧪 **iOS 테스트**: [시뮬레이터 테스트 결과](https://github.com/EunsuJeong/busung-hr-system/actions/workflows/ios-test.yml)

자세한 설치 가이드는 [DOWNLOAD.md](./DOWNLOAD.md)를 참고하세요.

## 📚 Documentation

### 시작하기

- [시작 가이드](START_GUIDE.md) - 전체 시스템 설정 및 실행
- [데이터베이스 가이드](DATABASE_GUIDE.md) - MongoDB 설정 및 관리
- [백업 가이드](BACKUP_GUIDE.md) - 데이터 백업 및 복원

### 배포하기 🚀

- **[지금 배포하기](DEPLOY_NOW.md)** - 5분 안에 배포 완료 ⭐
- [Vercel 배포 가이드](VERCEL_DEPLOYMENT_GUIDE.md) - 상세 배포 절차 (10단계)
- [배포 체크리스트](DEPLOYMENT_CHECKLIST.md) - 배포 전후 확인사항
- [Vercel 로컬 테스트](VERCEL_LOCAL_TEST.md) - 배포 전 로컬 테스트

## 🚀 Quick Start

### 일반 개발 환경

```powershell
# 1. MongoDB + API + Frontend 모두 실행
npm start

# 2. 브라우저에서 접속
# http://localhost:3000
```

### Vercel 로컬 테스트

```powershell
# 방법 1: 스크립트 사용 (권장)
.\start-vercel-dev.ps1

# 방법 2: npm 스크립트
npm run test:local

# 방법 3: 직접 실행
npm run start:mongodb
vercel dev
```

### Vercel 배포

```powershell
# 5분 안에 배포 완료!
npm run deploy:setup      # 환경 변수 설정
npm run deploy:preview    # 프리뷰 배포
npm run deploy:production # 프로덕션 배포

# 배포 후 테스트
npm run deploy:test -- -Url "https://your-project.vercel.app"
```

👉 **자세한 내용:** [DEPLOY_NOW.md](DEPLOY_NOW.md)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
