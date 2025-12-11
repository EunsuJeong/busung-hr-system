# Vercel Serverless 배포 가이드

## 📋 배포 전 체크리스트

### 1. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/busung_hr
DB_NAME=busung_hr
```

### 2. 클라이언트 빌드 스크립트 수정

`client/package.json`에 다음 스크립트 추가:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "vercel-build": "cd client && npm install && npm run build"
  }
}
```

### 3. Vercel CLI 설치

```bash
npm install -g vercel
```

## 🚀 배포 방법

### 방법 1: Vercel CLI로 배포

```bash
# 프로젝트 루트에서
vercel

# 프로덕션 배포
vercel --prod
```

### 방법 2: GitHub 연동

1. GitHub 저장소에 프로젝트 푸시
2. Vercel 대시보드에서 "New Project"
3. GitHub 저장소 선택
4. 환경 변수 설정
5. Deploy 클릭

## 📡 API 엔드포인트

배포 후 사용할 API 경로:

```
https://your-domain.vercel.app/api/employees
https://your-domain.vercel.app/api/attendance
https://your-domain.vercel.app/api/holiday
https://your-domain.vercel.app/api/admin
https://your-domain.vercel.app/api/communication
https://your-domain.vercel.app/api/payroll
https://your-domain.vercel.app/api/system
https://your-domain.vercel.app/api/safety
```

## 🔧 변환된 API 파일 목록

- ✅ `api/utils/mongodb.js` - MongoDB 연결 헬퍼
- ✅ `api/employees.js` - 직원 관리
- ✅ `api/attendance.js` - 근태 관리
- ✅ `api/holiday.js` - 공휴일 관리
- ✅ `api/admin.js` - 관리자 관리
- ✅ `api/communication.js` - 공지/알림/건의
- ✅ `api/payroll.js` - 급여 관리
- ✅ `api/system.js` - 시스템/일정
- ✅ `api/safety.js` - 안전 관리

## 🎯 주요 변경사항

1. **MongoDB 연결**: Mongoose → 네이티브 MongoDB 드라이버
2. **CORS**: 모든 origin 허용
3. **Socket.io 제거**: 실시간 이벤트 → 폴링 방식
4. **쿼리 파라미터 기반 라우팅**: `action`, `type` 파라미터 활용

## 📝 클라이언트 API 호출 수정

기존:

```javascript
const response = await axios.get('http://localhost:5000/api/employees');
```

변경:

```javascript
const response = await axios.get('/api/employees');
// 또는
const response = await axios.get(
  'https://your-domain.vercel.app/api/employees'
);
```

## ⚠️ 제한사항

1. **파일 업로드**: Vercel은 최대 4.5MB 제한 (업로드 기능 별도 처리 필요)
2. **WebSocket**: Socket.io 지원 안 함 (폴링으로 대체)
3. **실행 시간**: Serverless 함수는 최대 10초 (Pro 플랜: 60초)
4. **Cold Start**: 첫 요청 시 지연 발생 가능

## 🔍 디버깅

Vercel 로그 확인:

```bash
vercel logs
```

## 📚 추가 참고사항

- Vercel 공식 문서: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Serverless Functions: https://vercel.com/docs/functions/serverless-functions
