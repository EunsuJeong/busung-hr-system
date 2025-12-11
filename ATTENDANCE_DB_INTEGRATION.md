# 근태 관리 DB 연동 구현 완료

## 📋 개요

관리자 모드의 근태 관리(AdminAttendanceManagement)에서 업로드된 엑셀 파일의 파싱된 데이터를 MongoDB에 저장하는 기능을 구현했습니다.

## 🎯 구현 내용

### 1. 백엔드 API 추가

**파일**: `server/routes/attendance.js`

#### 📤 POST /api/attendance/bulk

- **기능**: 근태 데이터 일괄 저장 (엑셀 업로드 후 파싱 데이터)
- **요청 본문**:
  ```json
  {
    "attendanceData": [
      {
        "employeeId": "E001",
        "date": "2024-01-15",
        "checkIn": "09:00",
        "checkOut": "18:00",
        "shiftType": "주간",
        "status": "출근",
        "totalWorkMinutes": 540,
        "overtimeHours": 0,
        "holidayHours": null,
        "nightHours": null,
        "remarks": "",
        "autoDetermined": true
      }
    ],
    "year": 2024,
    "month": 1
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "message": "근태 데이터가 저장되었습니다. (신규: 10, 업데이트: 5, 오류: 0)",
    "stats": {
      "total": 15,
      "inserted": 10,
      "updated": 5,
      "errors": 0
    }
  }
  ```
- **처리 로직**:
  - 각 데이터를 `employeeId`와 `date`로 중복 확인
  - 기존 데이터가 있으면 업데이트, 없으면 신규 삽입 (upsert)
  - 필수 필드 검증 (`employeeId`, `date`)

#### 📥 GET /api/attendance/month/:year/:month

- **기능**: 월별 근태 데이터 조회 (전체 직원 또는 특정 직원)
- **쿼리 파라미터**: `employeeId` (optional)
- **응답**:
  ```json
  {
    "success": true,
    "data": [...],
    "count": 50
  }
  ```

### 2. 프론트엔드 API 클라이언트

**파일**: `src/api/attendance.js`

```javascript
export const AttendanceAPI = {
  // 기존 메서드...

  // 근태 데이터 일괄 저장
  bulkSave: async (attendanceData, year, month) => {
    return api.post('/attendance/bulk', {
      attendanceData,
      year,
      month,
    });
  },

  // 월별 근태 데이터 조회
  getMonthlyData: async (year, month, employeeId = null) => {
    const q = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
    return api.get(`/attendance/month/${year}/${month}${q}`);
  },
};
```

### 3. 업로드 함수 수정

**파일**: `src/components/common/common_admin_attendance.js`

```javascript
const uploadAttendanceXLSX = useCallback(
  (file, saveToDBCallback) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // 엑셀 파일 읽기 및 파싱
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        parseAttendanceFromExcel(data);

        // DB 저장 콜백 실행
        if (saveToDBCallback && typeof saveToDBCallback === 'function') {
          await saveToDBCallback();
        }

        alert('엑셀 파일이 성공적으로 업로드되었습니다.');
      } catch (error) {
        console.error('[uploadAttendanceXLSX] 에러:', error);
        alert('엑셀 파일 읽기에 실패했습니다: ' + error.message);
      }
    };
    reader.readAsBinaryString(file);
  },
  [parseAttendanceFromExcel]
);
```

### 4. App.js - DB 저장 함수

**파일**: `src/App.js`

```javascript
const saveAttendanceDataToDB = React.useCallback(async () => {
  try {
    // attendanceSheetData를 DB 형식으로 변환
    // 형식: { "employeeId_YYYY-MM-DD": { checkIn, checkOut, shiftType, ... } }
    const attendanceRecords = [];

    Object.entries(attendanceSheetData).forEach(([key, value]) => {
      const [employeeId, date] = key.split('_');

      // checkIn 또는 checkOut이 있는 경우만 저장
      if (!value.checkIn && !value.checkOut) return;

      // 근무 시간 계산
      let totalWorkMinutes = 0;
      if (value.checkIn && value.checkOut) {
        // 시간 계산 로직...
      }

      const record = {
        employeeId,
        date,
        checkIn: value.checkIn || '',
        checkOut: value.checkOut || '',
        shiftType: value.shiftType || null,
        status: status,
        totalWorkMinutes,
        overtimeHours: value.overtimeHours || null,
        holidayHours: value.specialWorkHours
          ? parseFloat(value.specialWorkHours)
          : null,
        nightHours: value.nightHours || null,
        remarks: value.remarks || '',
        autoDetermined: value.shiftType ? true : false,
      };

      attendanceRecords.push(record);
    });

    // API 호출
    const response = await AttendanceAPI.bulkSave(
      attendanceRecords,
      attendanceSheetYear,
      attendanceSheetMonth
    );

    if (response.data.success) {
      alert(
        `근태 데이터가 DB에 저장되었습니다!\n신규: ${stats.inserted}건\n업데이트: ${stats.updated}건`
      );
    }
  } catch (error) {
    console.error('❌ DB 저장 실패:', error);
    throw error;
  }
}, [attendanceSheetData, attendanceSheetYear, attendanceSheetMonth]);
```

### 5. UI 컴포넌트 수정

**파일**: `src/components/admin/AdminAttendanceManagement.js`

#### 업로드 버튼 수정

```javascript
<input
  type="file"
  onChange={(e) => {
    if (e.target.files[0]) {
      uploadAttendanceXLSX(e.target.files[0], saveAttendanceDataToDB);
      e.target.value = '';
    }
  }}
  accept=".xlsx,.xls"
/>
```

#### DB 저장 버튼 추가

```javascript
<button
  onClick={async () => {
    if (saveAttendanceDataToDB) {
      await saveAttendanceDataToDB();
    }
  }}
  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
>
  DB 저장
</button>
```

## 🔄 데이터 흐름

1. **엑셀 업로드**

   ```
   사용자가 엑셀 파일 선택
   ↓
   uploadAttendanceXLSX 호출
   ↓
   AttendanceExcelParser로 파싱
   ↓
   setCheckInTime/setCheckOutTime으로 상태 업데이트
   ↓
   saveAttendanceDataToDB 콜백 실행
   ↓
   attendanceSheetData → DB 형식 변환
   ↓
   POST /api/attendance/bulk 호출
   ↓
   MongoDB 저장 (upsert)
   ```

2. **수동 저장**
   ```
   사용자가 'DB 저장' 버튼 클릭
   ↓
   saveAttendanceDataToDB 호출
   ↓
   현재 attendanceSheetData를 DB로 전송
   ```

## 📊 데이터베이스 스키마

**Collection**: `attendance`

```javascript
{
  employeeId: String (indexed),
  date: String (indexed, "YYYY-MM-DD"),
  checkIn: String ("HH:MM"),
  checkOut: String ("HH:MM"),
  shiftType: String (enum: ["주간", "야간"]),
  status: String (enum: ["출근", "지각", "조퇴", "결근", "연차", "반차(오전)", "반차(오후)", "휴직", "휴일", "기타"]),
  totalWorkMinutes: Number,
  overtimeHours: Number,
  holidayHours: Number,
  nightHours: Number,
  remarks: String,
  autoDetermined: Boolean,
  createdAt: Date (default: Date.now)
}
```

**인덱스**:

- `{ employeeId: 1, date: 1 }` - unique composite index for upsert

## ✅ 테스트 시나리오

### 1. 엑셀 업로드 테스트

1. 관리자 모드 → 근태 관리 진입
2. '업로드' 버튼 클릭하여 엑셀 파일 선택
3. 파싱 완료 후 화면에 데이터 표시 확인
4. 자동으로 DB 저장 알림 확인
5. MongoDB에서 데이터 확인:
   ```javascript
   db.attendance.find({ date: { $regex: '^2024-01' } });
   ```

### 2. 수동 저장 테스트

1. 근태 데이터 수정 (편집 모드)
2. 'DB 저장' 버튼 클릭
3. 저장 결과 알림 확인
4. DB에서 업데이트된 데이터 확인

### 3. 중복 데이터 테스트

1. 동일 월의 엑셀 파일을 두 번 업로드
2. 두 번째 업로드 시 "업데이트" 건수 확인
3. DB에 중복 데이터가 없음을 확인

## 🔍 주요 특징

### 1. Upsert 로직

- `employeeId`와 `date` 조합으로 기존 데이터 확인
- 있으면 업데이트, 없으면 신규 삽입
- 데이터 중복 방지

### 2. 근무 시간 자동 계산

- `checkIn`과 `checkOut`에서 `totalWorkMinutes` 자동 계산
- 야간 근무 고려 (퇴근 시간 < 출근 시간인 경우 다음날로 처리)

### 3. 자동 교대 판정

- 생산 부서 특정 하위부서(열, 표면, 구부 등)
- 시급 직원 대상
- 출근 시간에 따라 '주간'/'야간' 자동 판정
- `autoDetermined: true` 플래그 설정

### 4. 상태 관리

- `attendanceSheetData` (state) → UI 표시
- MongoDB → 영구 저장
- 페이지 새로고침 후에도 데이터 유지

### 5. 에러 처리

- 필수 필드 검증
- 개별 레코드 저장 실패 시 계속 진행
- 오류 건수 및 상세 내역 반환

## 📝 추가 기능 제안

### 1. 데이터 로딩

현재는 저장만 가능합니다. 화면 로딩 시 DB에서 데이터를 불러오는 기능 추가 가능:

```javascript
const loadAttendanceFromDB = async () => {
  const response = await AttendanceAPI.getMonthlyData(
    attendanceSheetYear,
    attendanceSheetMonth
  );

  // DB 데이터를 attendanceSheetData 형식으로 변환
  const sheetData = {};
  response.data.data.forEach((record) => {
    const key = `${record.employeeId}_${record.date}`;
    sheetData[key] = {
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      shiftType: record.shiftType,
      // ...
    };
  });

  setAttendanceSheetData(sheetData);
};
```

### 2. 변경 사항 추적

- 편집 모드에서 변경된 데이터만 저장
- `dirty` 플래그로 변경 여부 추적

### 3. 백업/복원

- 기존 backup/restore 스크립트에 attendance 컬렉션 포함
- 이미 구현되어 있음 (20개 컬렉션 전체 백업)

## 🎉 완료 사항

✅ POST /api/attendance/bulk API 엔드포인트 구현  
✅ GET /api/attendance/month/:year/:month API 엔드포인트 구현  
✅ AttendanceAPI 클라이언트 메서드 추가  
✅ uploadAttendanceXLSX 함수 수정 (saveToDBCallback 지원)  
✅ saveAttendanceDataToDB 함수 구현  
✅ AdminAttendanceManagement에 'DB 저장' 버튼 추가  
✅ 데이터 변환 로직 (attendanceSheetData → DB 형식)  
✅ Upsert 로직 (중복 방지)  
✅ 근무 시간 자동 계산  
✅ 에러 처리 및 통계 반환

## 🚀 사용 방법

1. **서버 시작**

   ```bash
   npm run start:ai
   ```

2. **프론트엔드 시작**

   ```bash
   npm start
   ```

3. **엑셀 업로드**

   - 관리자 계정으로 로그인
   - 근태 관리 메뉴 진입
   - 엑셀 파일 업로드
   - 자동으로 DB에 저장됨

4. **수동 저장**
   - 근태 데이터 수정 후
   - 'DB 저장' 버튼 클릭

## 📚 관련 파일

- `server/routes/attendance.js` - 백엔드 API
- `server/models/hr/attendance.js` - MongoDB 스키마
- `src/api/attendance.js` - API 클라이언트
- `src/App.js` - DB 저장 함수
- `src/components/common/common_admin_attendance.js` - 업로드 로직
- `src/components/admin/AdminAttendanceManagement.js` - UI 컴포넌트
