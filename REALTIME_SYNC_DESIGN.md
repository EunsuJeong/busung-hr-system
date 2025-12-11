# 실시간 데이터 동기화 설계 (Real-time Data Synchronization Design)

## 개요 (Overview)
HR 시스템의 근태 데이터와 일반직원 모드 간 실시간 동기화를 위한 아키텍처 설계

## 1. 시스템 아키텍처 (System Architecture)

### Frontend (React)
- **React Context/Redux**: 전역 상태 관리
- **WebSocket Client**: 실시간 통신 클라이언트
- **Excel-like Grid**: react-data-grid 기반 UI 컴포넌트
- **Local Storage**: 오프라인 지원을 위한 로컬 캐싱

### Backend (Node.js/Express)
- **REST API**: 기본 CRUD 작업
- **WebSocket Server**: 실시간 데이터 브로드캐스팅
- **Database**: MongoDB/PostgreSQL
- **Redis**: 실시간 세션 및 캐시 관리

### Real-time Layer
- **Socket.IO**: WebSocket 구현 라이브러리
- **Room 기반 구독**: 부서별/팀별 데이터 구독
- **Event Broadcasting**: 변경 사항 실시간 전파

## 2. 데이터 동기화 전략 (Data Synchronization Strategy)

### 2.1 실시간 이벤트 타입
```javascript
const SYNC_EVENTS = {
  ATTENDANCE_UPDATE: 'attendance:update',
  EMPLOYEE_STATUS: 'employee:status',
  WORK_SCHEDULE: 'schedule:update',
  BULK_IMPORT: 'data:bulk_import',
  USER_CONNECTED: 'user:connected',
  USER_DISCONNECTED: 'user:disconnected'
};
```

### 2.2 데이터 구조
```javascript
// 근태 데이터 구조
const AttendanceData = {
  id: 'unique_id',
  employeeId: 'EMP001',
  date: '2025-09-17',
  checkIn: '08:30',
  checkOut: '17:30',
  workType: 'weekday', // weekday, holiday
  workPattern: 'day', // day, night
  modifiedBy: 'user_id',
  modifiedAt: timestamp,
  version: 1 // 충돌 해결용
};
```

## 3. API 엔드포인트 설계 (API Endpoints)

### 3.1 REST API
```
GET    /api/attendance/:year/:month          - 월별 근태 데이터 조회
POST   /api/attendance                       - 근태 데이터 생성
PUT    /api/attendance/:id                   - 근태 데이터 수정
DELETE /api/attendance/:id                   - 근태 데이터 삭제
POST   /api/attendance/bulk                  - 일괄 데이터 업로드
GET    /api/employees/active                 - 활성 직원 목록
```

### 3.2 WebSocket 이벤트
```
attendance:subscribe     - 특정 월 데이터 구독
attendance:unsubscribe   - 구독 해제
attendance:update        - 실시간 데이터 업데이트
attendance:bulk_change   - 대량 데이터 변경
user:join_room          - 룸 참여
user:leave_room         - 룸 떠나기
```

## 4. 충돌 해결 (Conflict Resolution)

### 4.1 낙관적 동시성 제어 (Optimistic Concurrency Control)
- **버전 관리**: 각 레코드에 version 필드 추가
- **Last-Write-Wins**: 타임스탬프 기반 충돌 해결
- **사용자 알림**: 충돌 발생 시 사용자에게 알림

### 4.2 충돌 해결 알고리즘
```javascript
const resolveConflict = (localData, serverData) => {
  if (localData.version < serverData.version) {
    // 서버 데이터가 최신 - 로컬 데이터 업데이트
    return {
      data: serverData,
      action: 'server_wins',
      message: '다른 사용자가 수정한 데이터로 업데이트됩니다.'
    };
  } else if (localData.modifiedAt > serverData.modifiedAt) {
    // 로컬 수정이 최신 - 서버로 전송
    return {
      data: localData,
      action: 'local_wins',
      message: '로컬 변경사항을 서버에 적용합니다.'
    };
  }
  // 사용자 선택 필요
  return {
    data: null,
    action: 'user_choice_required',
    options: { local: localData, server: serverData }
  };
};
```

## 5. 구현 단계 (Implementation Phases)

### Phase 1: 기본 인프라 구축
1. WebSocket 서버 설정 (Socket.IO)
2. MongoDB/Redis 연결 설정
3. 기본 REST API 구현
4. 프론트엔드 WebSocket 클라이언트 구현

### Phase 2: 실시간 동기화 구현
1. 근태 데이터 실시간 업데이트
2. 사용자별 권한 관리
3. 룸 기반 구독/브로드캐스팅
4. 오프라인/온라인 상태 감지

### Phase 3: 충돌 해결 및 최적화
1. 버전 관리 시스템 구현
2. 충돌 해결 UI 개발
3. 성능 최적화 (배치 업데이트, 압축)
4. 에러 처리 및 재연결 로직

### Phase 4: 고급 기능
1. 실시간 협업 표시 (다른 사용자 커서/편집 상태)
2. 변경 히스토리 추적
3. 권한별 접근 제어 강화
4. 모바일 지원

## 6. 기술 스택 (Technology Stack)

### Backend
- **Node.js** + **Express.js**: 서버 프레임워크
- **Socket.IO**: 실시간 통신
- **MongoDB**: 주요 데이터베이스
- **Redis**: 캐시 및 세션 관리
- **Joi/Yup**: 데이터 검증

### Frontend
- **React 19**: UI 라이브러리
- **Socket.IO Client**: 실시간 통신 클라이언트
- **React Context/Redux**: 상태 관리
- **react-data-grid**: Excel-like 인터페이스
- **React Query**: 서버 상태 관리

### DevOps
- **Docker**: 컨테이너화
- **PM2**: 프로세스 관리
- **Nginx**: 리버스 프록시
- **Let's Encrypt**: SSL 인증서

## 7. 보안 고려사항 (Security Considerations)

1. **인증/인가**: JWT 토큰 기반 인증
2. **데이터 암호화**: HTTPS/WSS 연결 강제
3. **입력 검증**: 모든 데이터 서버사이드 검증
4. **Rate Limiting**: API 호출 제한
5. **CORS 설정**: 허용된 도메인만 접근
6. **감사 로그**: 모든 데이터 변경 기록

## 8. 모니터링 및 운영 (Monitoring & Operations)

### 8.1 성능 지표
- WebSocket 연결 수
- 메시지 전송/수신 속도
- 데이터베이스 쿼리 성능
- 메모리/CPU 사용률

### 8.2 로깅
- 사용자 액션 로그
- 에러 로그 (Winston/Bunyan)
- 성능 로그
- 보안 이벤트 로그

## 9. 샘플 구현 코드 (Sample Implementation)

### 9.1 Backend WebSocket Server
```javascript
const express = require('express');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = require('http').createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// JWT 인증 미들웨어
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // 근태 데이터 구독
  socket.on('attendance:subscribe', (data) => {
    const { year, month, department } = data;
    const room = `attendance_${year}_${month}_${department}`;
    socket.join(room);
  });

  // 근태 데이터 업데이트
  socket.on('attendance:update', async (data) => {
    try {
      // 데이터베이스 업데이트
      const updatedRecord = await updateAttendance(data);

      // 같은 룸의 다른 사용자들에게 브로드캐스트
      const room = `attendance_${data.year}_${data.month}_${data.department}`;
      socket.to(room).emit('attendance:updated', {
        ...updatedRecord,
        modifiedBy: socket.userId
      });
    } catch (error) {
      socket.emit('attendance:error', {
        message: 'Failed to update attendance',
        error: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});
```

### 9.2 Frontend WebSocket Client
```javascript
import io from 'socket.io-client';
import { createContext, useContext, useEffect, useState } from 'react';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children, token }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_SERVER_URL, {
      auth: { token }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('attendance:updated', (data) => {
      // 근태 데이터 실시간 업데이트
      updateAttendanceData(data);
    });

    setSocket(socketInstance);

    return () => socketInstance.disconnect();
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
```

## 10. 결론 (Conclusion)

이 설계는 HR 시스템의 실시간 데이터 동기화를 위한 확장 가능하고 안정적인 아키텍처를 제공합니다. WebSocket 기반 실시간 통신, 충돌 해결 메커니즘, 그리고 Excel-like 인터페이스를 통해 사용자 경험을 크게 향상시킬 수 있습니다.

### 다음 단계
1. Phase 1 구현 시작
2. 프로토타입 개발 및 테스트
3. 사용자 피드백 수집
4. 단계별 배포 및 모니터링