# App.js 코드 분석 보고서

## 📋 파일 개요
- **파일명**: `src/App.js`
- **총 라인 수**: 15,966줄
- **메인 컴포넌트**: `HRManagementSystem`
- **용도**: 부성스틸 HR 관리 시스템 (관리자 + 직원 통합)

---

## 🏗️ 주요 섹션 구조

### 1️⃣ IMPORT 섹션 (1-128줄)
- **코드 유형**: Import 문
- **내용**: React, 외부 라이브러리, 컴포넌트 임포트
- **관련 모드**: 공통
- **사용 유무**: ✅ 사용중

#### 주요 Import:
```
- React, useState, useEffect, useCallback, useMemo, useRef
- react-calendar (달력)
- xlsx (엑셀 처리)
- 커스텀 훅: useAIChat, useAIRecommendations
- 컴포넌트: AdminDashboard, AdminEmployeeManagement 등 20+ 컴포넌트
```

---

### 2️⃣ COMMON - 유틸리티 함수 (130-140줄)
| 줄 범위 | 코드 유형 | 함수명 | 내용 | 관련 모드 | 사용 유무 |
|---------|----------|--------|------|-----------|-----------|
| 132 | 함수 | `safeFormatNumber` | 숫자 포맷팅 (오류 방지) | 공통 | ✅ 사용중 |

---

### 3️⃣ COMMON - 공휴일/달력 STATE (140-240줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 사용 유무 |
|---------|----------|--------|------|-----------|-----------|
| 142 | State | `holidayData` | 공휴일 데이터 저장 | 공통 | ✅ 사용중 |
| 143 | State | `holidayLoadingStatus` | 공휴일 로딩 상태 | 공통 | ✅ 사용중 |
| 146 | State | `customHolidays` | 커스텀 공휴일 | 공통 | ✅ 사용중 |
| 147 | State | `showHolidayPopup` | 공휴일 팝업 표시 | 공통 | ✅ 사용중 |
| 149 | State | `holidayForm` | 공휴일 폼 데이터 | 공통 | ✅ 사용중 |

#### 공휴일 관련 함수:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 157 | `loadHolidayData` | 공휴일 API에서 데이터 로드 | 공통 | ✅ 사용중 |
| 242 | `getKoreanHolidays` | 한국 공휴일 가져오기 | 공통 | ✅ 사용중 |
| 247 | `forceRefreshHolidays` | 공휴일 강제 새로고침 | 공통 | ✅ 사용중 |

---

### 4️⃣ COMMON - 사용자/로그인 STATE (1219-1348줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 1220 | State | `employees` | 전체 직원 목록 | 공통 | 전체 | ✅ 사용중 |
| 1221 | State | `admins` | 관리자 목록 | 관리자 | - | ✅ 사용중 |
| 1223 | State | `currentUser` | 현재 로그인 사용자 | 공통 | 전체 | ✅ 사용중 |
| 1228 | State | `loginForm` | 로그인 폼 데이터 | 공통 | 로그인 | ✅ 사용중 |
| 1229 | State | `loginError` | 로그인 오류 메시지 | 공통 | 로그인 | ✅ 사용중 |
| 1230 | State | `showPassword` | 비밀번호 표시 여부 | 공통 | 로그인 | ✅ 사용중 |
| 1233 | State | `selectedCells` | 선택된 셀 (근태표) | 공통 | 근태 | ✅ 사용중 |
| 1234 | State | `dragStartCell` | 드래그 시작 셀 | 공통 | 근태 | ✅ 사용중 |
| 1235 | State | `isDragging` | 드래그 중 여부 | 공통 | 근태 | ✅ 사용중 |
| 1240 | State | `currentMonth` | 현재 월 | 공통 | 전체 | ✅ 사용중 |
| 1241 | State | `currentYear` | 현재 연도 | 공통 | 전체 | ✅ 사용중 |

#### 직원/사용자 관련 함수:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 281 | `getWorkPeriodText` | 근속년수 계산 | 공통 | ✅ 사용중 |
| 295 | `exportOrganizationToXLSX` | 조직도 엑셀 내보내기 | 관리자 | ✅ 사용중 |
| 306 | `generateEmployees` | 초기 직원 데이터 생성 | 공통 | ✅ 사용중 |
| 1152 | `generateAdmins` | 초기 관리자 데이터 생성 | 공통 | ✅ 사용중 |

#### 근태 분석 함수:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 1243 | `analyzeAttendanceStatus` | 출퇴근 상태 분석 (출근/지각/조퇴/결근) | 공통 | ✅ 사용중 |
| 1343 | `parseTime` | 시간 문자열 파싱 | 공통 | ✅ 사용중 |
| 1389 | `isHoliday` | 공휴일 여부 확인 | 공통 | ✅ 사용중 |

#### 급여 계산 함수:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 1420 | `calcDailyWage` | 일급 계산 | 관리자 | ✅ 사용중 |
| 1439 | `categorizeWorkTime` | 근무시간 분류 (일반/연장/휴일) | 관리자 | ✅ 사용중 |
| 1454 | `calcMonthlyWage` | 월급 계산 | 관리자 | ✅ 사용중 |

---

### 5️⃣ ADMIN - ⑤ 일정 관리 STATE (1349-1472줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 1350 | State | `scheduleEvents` | 일정 목록 | 관리자 | 일정 관리 | ✅ 사용중 |
| 1351 | State | `showAddEventPopup` | 일정 추가 팝업 | 관리자 | 일정 관리 | ✅ 사용중 |
| 1352 | State | `showEditEventPopup` | 일정 수정 팝업 | 관리자 | 일정 관리 | ✅ 사용중 |
| 1353 | State | `editingEvent` | 수정 중인 일정 | 관리자 | 일정 관리 | ✅ 사용중 |
| 1354 | State | `eventForm` | 일정 폼 데이터 | 관리자 | 일정 관리 | ✅ 사용중 |
| 1360 | State | `showUnifiedAddPopup` | 통합 추가 팝업 | 관리자 | 일정 관리 | ✅ 사용중 |
| 1370 | State | `scheduleCurrentPage` | 일정 페이지 번호 | 관리자 | 일정 관리 | ✅ 사용중 |

---

### 6️⃣ ADMIN - ⑥ 연차 관리 + STAFF - ⑤ 연차 신청 STATE (1473-1490줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 1474 | State | `leaveManagementTab` | 연차 관리 탭 | 관리자 | 연차 관리 | ✅ 사용중 |
| 1476 | State | `editingAnnualLeave` | 수정 중인 연차 | 관리자 | 연차 관리 | ✅ 사용중 |
| 1477 | State | `editAnnualData` | 연차 수정 데이터 | 관리자 | 연차 관리 | ✅ 사용중 |
| 1480 | State | `leaveRequests` | 연차 신청 목록 | 공통 | 연차 신청/관리 | ✅ 사용중 |
| 1481 | State | `leaveForm` | 연차 신청 폼 | 직원 | 연차 신청 | ✅ 사용중 |
| 1488 | State | `leaveFormError` | 연차 폼 오류 | 직원 | 연차 신청 | ✅ 사용중 |
| 1489 | State | `leaveFormPreview` | 연차 미리보기 | 직원 | 연차 신청 | ✅ 사용중 |

---

### 7️⃣ ADMIN - ⑦ 건의 관리 + STAFF - ⑦ 건의사항 STATE (1491-1503줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 1492 | State | `suggestions` | 건의사항 목록 | 공통 | 건의 관리/사항 | ✅ 사용중 |
| 1493 | State | `suggestionInput` | 건의사항 입력 | 직원 | 건의사항 | ✅ 사용중 |
| 1496 | State | `suggestionPage` | 건의사항 페이지 | 공통 | 건의 관리/사항 | ❌ 미사용 |
| 1499 | State | `applyTitle` | 건의 제목 | 직원 | 건의사항 | ✅ 사용중 |
| 1500 | State | `applyContent` | 건의 내용 | 직원 | 건의사항 | ✅ 사용중 |
| 1501 | State | `editingSuggestion` | 수정 중인 건의 | 관리자 | 건의 관리 | ✅ 사용중 |
| 1502 | State | `editingSuggestionRemark` | 건의 비고 수정 | 관리자 | 건의 관리 | ✅ 사용중 |

---

### 8️⃣ ADMIN - ⑩ 평가 관리 + STAFF - ⑧ 직원 평가 STATE (1504-1532줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 1505 | State | `evaluations` | 평가 목록 | 공통 | 평가 관리/내역 | ✅ 사용중 |
| 1506 | State | `showEvaluationForm` | 평가 폼 표시 | 관리자 | 평가 관리 | ❌ 미사용 |
| 1511 | State | `editingEvaluationId` | 수정 중인 평가 ID | 관리자 | 평가 관리 | ✅ 사용중 |
| 1512 | State | `editingEvaluationData` | 평가 수정 데이터 | 관리자 | 평가 관리 | ✅ 사용중 |
| 1515 | State | `editingAccidentId` | 수정 중인 사고 ID | 관리자 | 대시보드 | ✅ 사용중 |
| 1516-1519 | State | 사고 편집 관련 | 사고 날짜/내용/심각도 | 관리자 | 대시보드 | ✅ 사용중 |
| 1522 | State | `evaluationForm` | 평가 폼 데이터 | 관리자 | 평가 관리 | ✅ 사용중 |

---

### 9️⃣ ADMIN - ④ 알림 관리 STATE (1533-2482줄)
**매우 방대한 섹션 - 알림 시스템 핵심**

| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 1534 | State | `regularNotifications` | 정기 알림 목록 | 관리자 | 알림 관리 | ✅ 사용중 |
| 1535 | State | `realtimeNotifications` | 실시간 알림 목록 | 관리자 | 알림 관리 | ✅ 사용중 |
| 1536 | State | `notificationLogs` | 알림 로그 | 관리자 | 알림 관리 | ✅ 사용중 |
| 1537 | State | `showAllNotificationLogs` | 알림 로그 더보기 | 관리자 | 알림 관리 | ✅ 사용중 |
| 1540 | State | `notificationLogSearch` | 알림 로그 검색 | 관리자 | 알림 관리 | ✅ 사용중 |
| 1549 | State | `scheduleSearch` | 일정 검색 | 관리자 | 일정 관리 | ✅ 사용중 |
| 1555-1577 | State | 알림 팝업/폼 관련 | 각종 알림 추가/수정 팝업 | 관리자 | 알림 관리 | ✅ 사용중 |
| 1597 | State | `showRecurringSettingsModal` | 반복 설정 모달 | 관리자 | 알림 관리 | ✅ 사용중 |
| 1599 | State | `recurringSettings` | 반복 설정 데이터 | 관리자 | 알림 관리 | ✅ 사용중 |
| 1612 | State | `activeTab` | 활성 탭 | 공통 | 전체 | ✅ 사용중 |

#### 알림 관련 함수들:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 1622 | `handleTabChange` | 탭 변경 핸들러 | 공통 | ✅ 사용중 |
| 1735 | `cleanupExpiredNotifications` | 만료된 알림 정리 | 관리자 | ✅ 사용중 |
| 1766 | `isRegularExpired` | 정기 알림 만료 확인 | 관리자 | ✅ 사용중 |
| 1775 | `isLogOlderThan3Years` | 3년 이상 로그 확인 | 관리자 | ✅ 사용중 |
| 1788 | `cleanupOldLogs` | 오래된 로그 정리 | 관리자 | ✅ 사용중 |
| 1795 | `cleanupExpiredRegulars` | 만료된 정기 알림 정리 | 관리자 | ✅ 사용중 |
| 4733 | `handleAddRegularNotification` | 정기 알림 추가 | 관리자 | ✅ 사용중 |
| 4800 | `handleAddRealtimeNotification` | 실시간 알림 추가 | 관리자 | ✅ 사용중 |
| 4888 | `handleCompleteRealtimeNotification` | 실시간 알림 완료 | 관리자 | ❌ 미사용 |
| 4904 | `handleDeleteRegularNotification` | 정기 알림 삭제 | 관리자 | ✅ 사용중 |
| 4932 | `handleDeleteRealtimeNotification` | 실시간 알림 삭제 | 관리자 | ❌ 미사용 |
| 4938 | `handleEditRegularNotification` | 정기 알림 수정 | 관리자 | ✅ 사용중 |
| 4980 | `handleEditRealtimeNotification` | 실시간 알림 수정 | 관리자 | ❌ 미사용 |
| 5018 | `handleSaveRegularNotificationEdit` | 정기 알림 수정 저장 | 관리자 | ✅ 사용중 |
| 5051 | `handleSaveRealtimeNotificationEdit` | 실시간 알림 수정 저장 | 관리자 | ✅ 사용중 |
| 5078 | `isExpired5Days` | 5일 만료 확인 | 관리자 | ✅ 사용중 |
| 5113 | `updateEmployeeNotifications` | 직원 알림 업데이트 | 공통 | ✅ 사용중 |
| 5239 | `markNotificationAsRead` | 알림 읽음 처리 | 공통 | ✅ 사용중 |
| 5256 | `markNoticeAsRead` | 공지 읽음 처리 | 공통 | ✅ 사용중 |
| 5273 | `getUnreadNotificationCount` | 읽지 않은 알림 수 | 공통 | ✅ 사용중 |
| 5280 | `getUnreadNoticeCount` | 읽지 않은 공지 수 | 공통 | ✅ 사용중 |
| 5290 | `getRecipientText` | 수신자 텍스트 생성 | 관리자 | ✅ 사용중 |
| 5314 | `shouldReceiveNotification` | 알림 수신 여부 확인 | 공통 | ✅ 사용중 |
| 5375 | `openRecurringSettingsModal` | 반복 설정 모달 열기 | 관리자 | ✅ 사용중 |
| 5424 | `closeRecurringSettingsModal` | 반복 설정 모달 닫기 | 관리자 | ✅ 사용중 |
| 5429 | `handleRecurringSettingsComplete` | 반복 설정 완료 | 관리자 | ✅ 사용중 |
| 5454 | `generateRecurringText` | 반복 텍스트 생성 | 관리자 | ✅ 사용중 |
| 5487 | `handleWeekdayToggle` | 요일 토글 | 관리자 | ✅ 사용중 |
| 5501 | `handleEmployeeSearch` | 직원 검색 | 관리자 | ✅ 사용중 |
| 5515 | `get관리자알림목록` | 관리자 알림 목록 | 관리자 | ✅ 사용중 |
| 5545 | `get통합알림리스트` | 통합 알림 목록 | 관리자 | ❌ 미사용 |
| 5601 | `calculateRecipientCount` | 수신자 수 계산 | 관리자 | ✅ 사용중 |
| 5699 | `getFilteredNotificationLogs` | 필터된 알림 로그 | 관리자 | ✅ 사용중 |
| 5754 | `getFilteredScheduleEvents` | 필터된 일정 이벤트 | 관리자 | ✅ 사용중 |
| 5831 | `get연차갱신알림수신자` | 연차 갱신 알림 수신자 | 관리자 | ✅ 사용중 |
| 5859 | `get연차알림대상자` | 연차 알림 대상자 | 관리자 | ✅ 사용중 |
| 6120 | `get건의사항알림대상자` | 건의사항 알림 대상자 | 관리자 | ✅ 사용중 |
| 6159 | `get부서관리자및대표이사` | 부서 관리자/대표이사 | 관리자 | ✅ 사용중 |
| 6203 | `retrySend` | 재전송 (재시도) | 관리자 | ✅ 사용중 |
| 6227 | `send자동알림` | 자동 알림 전송 | 관리자 | ✅ 사용중 |
| 6329 | `addEmployeeToRecipients` | 수신자 추가 | 관리자 | ✅ 사용중 |
| 6358 | `removeEmployeeFromRecipients` | 수신자 제거 | 관리자 | ✅ 사용중 |
| 6383 | `handleEmployeeToggle` | 직원 토글 | 관리자 | ✅ 사용중 |

---

### 🔟 ADMIN - ⑧ 근태 관리 STATE (2483-2502줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 2484 | State | `attendanceSheetYear` | 근태표 연도 | 관리자 | 근태 관리 | ✅ 사용중 |
| 2487 | State | `attendanceSheetMonth` | 근태표 월 | 관리자 | 근태 관리 | ✅ 사용중 |
| 2490 | State | `attendanceSheetData` | 근태표 데이터 (핵심) | 관리자 | 근태 관리 | ✅ 사용중 |
| 2491 | State | `attendanceSearchFilter` | 근태 검색 필터 | 관리자 | 근태 관리 | ✅ 사용중 |
| 2498 | State | `isEditingAttendance` | 근태 수정 중 | 관리자 | 근태 관리 | ✅ 사용중 |
| 2499 | State | `workTypeSettings` | 근무구분 설정 | 관리자 | 근태 관리 | ✅ 사용중 |
| 2500 | State | `isStressCalculationExpanded` | 스트레스 계산 확장 | 관리자 | 근태 관리 | ✅ 사용중 |

---

### 1️⃣1️⃣ ADMIN - ③ 공지 관리 STATE (2503-2513줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 2504 | State | `noticeForm` | 공지 폼 데이터 | 관리자 | 공지 관리 | ✅ 사용중 |
| 2512 | State | `editingNoticeId` | 수정 중인 공지 ID | 관리자 | 공지 관리 | ✅ 사용중 |

---

### 1️⃣2️⃣ ADMIN - ② 직원 관리 STATE (2514-2539줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 2515 | State | `employeeSearchFilter` | 직원 검색 필터 | 관리자 | 직원 관리 | ✅ 사용중 |
| 2527 | State | `suggestionSearchFilter` | 건의사항 검색 필터 | 관리자 | 건의 관리 | ❌ 미사용 |
| 2532 | State | `showSuggestionApprovalPopup` | 건의 승인 팝업 | 관리자 | 건의 관리 | ✅ 사용중 |
| 2534 | State | `suggestionApprovalData` | 건의 승인 데이터 | 관리자 | 건의 관리 | ✅ 사용중 |

---

### 1️⃣3️⃣ ADMIN - ⑨ 급여 관리 STATE (2540-2842줄)
**매우 방대한 섹션 - 급여 시스템 핵심**

| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 2541 | State | `payrollByMonth` | 월별 급여 데이터 (핵심) | 관리자 | 급여 관리 | ✅ 사용중 |
| 2542 | State | `payrollTableData` | 급여 테이블 데이터 | 관리자 | 급여 관리 | ✅ 사용중 |
| 2543 | State | `defaultPayrollHours` | 기본 급여 시간 | 관리자 | 급여 관리 | ✅ 사용중 |
| 2544 | State | `payrollValidationErrors` | 급여 검증 오류 | 관리자 | 급여 관리 | ❌ 미사용 |
| 2545 | State | `payrollYM` | 급여 년월 | 관리자 | 급여 관리 | ✅ 사용중 |
| 2546 | State | `isPayrollEditMode` | 급여 수정 모드 | 관리자 | 급여 관리 | ✅ 사용중 |

#### 급여 관련 함수들:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 2549 | `ymKey` | 년월 키 생성 | 관리자 | ✅ 사용중 |
| 2552 | `payrollHash` | 급여 해시 생성 | 관리자 | ✅ 사용중 |
| 2621 | `handleEditHours` | 시간 수정 핸들러 | 관리자 | ✅ 사용중 |
| 2627 | `applyDefaultHoursToTable` | 기본 시간 적용 | 관리자 | ✅ 사용중 |
| 2644 | `exportPayrollXLSX` | 급여 엑셀 내보내기 | 관리자 | ✅ 사용중 |
| 2683 | `getEvaluationWithPosition` | 직급별 평가 | 관리자 | ✅ 사용중 |
| 2742 | `getFilteredAttendanceEmployees` | 필터된 근태 직원 | 관리자 | ✅ 사용중 |
| 2800 | `getFilteredPayrollData` | 필터된 급여 데이터 | 관리자 | ✅ 사용중 |
| 6813 | `initializePayrollTable` | 급여 테이블 초기화 | 관리자 | ✅ 사용중 |
| 6889 | `parsePayrollFromExcel` | 엑셀에서 급여 파싱 | 관리자 | ❌ 미사용 |
| 7136 | `updatePayrollCell` | 급여 셀 업데이트 | 관리자 | ✅ 사용중 |
| 7261 | `calculatePayrollTotals` | 급여 총액 계산 | 관리자 | ✅ 사용중 |
| 7328 | `syncEmployeesWithPayroll` | 직원과 급여 동기화 | 관리자 | ✅ 사용중 |
| 7518 | `syncPayrollWithEmployeeSalary` | 급여와 직원 급여 동기화 | 관리자 | ✅ 사용중 |
| 7645 | `detectPayrollMonth` | 급여 월 자동 감지 | 관리자 | ✅ 사용중 |
| 7727 | `detectYMFromFileName` | 파일명에서 년월 감지 | 관리자 | ❌ 미사용 |
| 7760 | `sendPayrollNotifications` | 급여 알림 전송 | 관리자 | ❌ 미사용 |
| 7775 | `normalizePayrollKeys` | 급여 키 정규화 | 관리자 | ✅ 사용중 |
| 7800 | `handlePayrollFileUpload` | 급여 파일 업로드 | 관리자 | ✅ 사용중 |
| 7869 | `parsePayrollDataFromExcel` | 엑셀에서 급여 데이터 파싱 | 관리자 | ✅ 사용중 |
| 8439 | `createMissingPayrollItems` | 누락 급여 항목 생성 | 관리자 | ❌ 미사용 |
| 8605 | `ensureMonthlyPayrollData` | 월별 급여 데이터 확보 | 관리자 | ✅ 사용중 |

---

### 1️⃣4️⃣ STAFF - ⑥ 급여 내역 STATE (2843-2846줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 2842 | State | `showSalaryPasswordPopup` | 급여 비밀번호 팝업 | 직원 | 급여 내역 | ❌ 미사용 |
| 2843 | State | `showSalaryHistoryPopup` | 급여 내역 팝업 | 직원 | 급여 내역 | ❌ 미사용 |

---

### 1️⃣5️⃣ ADMIN - ⑫ 시스템 관리 (AI API 설정) STATE (2847-3179줄)
**AI 시스템 통합 섹션**

| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 2848 | State | `chatgptApiKey` | ChatGPT API 키 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 2849 | State | `claudeApiKey` | Claude API 키 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 2850 | State | `geminiApiKey` | Gemini API 키 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 2851 | State | `selectedModelType` | 선택된 모델 타입 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 2852 | State | `modelUsageStatus` | 모델 사용 상태 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 2858 | State | `chatbotPermissions` | 챗봇 권한 설정 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 2860 | State | `aiConfig` | AI 설정 | 관리자 | 시스템 관리 | ❌ 미사용 |
| 2861 | State | `showPromptSettings` | 프롬프트 설정 표시 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 2862 | State | `aiPromptSettings` | AI 프롬프트 설정 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 3064 | State | `apiConnectionStatus` | API 연결 상태 | 관리자 | 시스템 관리 | ❌ 미사용 |
| 3071 | State | `dynamicModelTypes` | 동적 모델 타입 | 관리자 | 시스템 관리 | ❌ 미사용 |

#### AI 관련 함수들:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 2877 | `detectProviderFromKey` | API 키에서 제공자 감지 | 관리자 | ✅ 사용중 |
| 2948 | `handleUnifiedAiSave` | 통합 AI 저장 | 관리자 | ✅ 사용중 |
| 3027 | `getActiveAiKey` | 활성 AI 키 가져오기 | 관리자 | ✅ 사용중 |
| 3036 | `getActiveProvider` | 활성 제공자 가져오기 | 관리자 | ✅ 사용중 |
| 4650 | `getSafeModelOrBlock` | 안전한 모델 가져오기 | 관리자 | ❌ 미사용 |
| 4660 | `spotCheckModelAbility` | 모델 능력 확인 | 관리자 | ✅ 사용중 |
| 4707 | `saveKey` | API 키 저장 | 관리자 | ❌ 미사용 |
| 6411 | `testApiConnection` | API 연결 테스트 | 관리자 | ❌ 미사용 |
| 6459 | `syncAiConfigToBackend` | AI 설정 백엔드 동기화 | 관리자 | ✅ 사용중 |
| 6489 | `handleModelChange` | 모델 변경 핸들러 | 관리자 | ❌ 미사용 |
| 6526 | `handleModelTypeChange` | 모델 타입 변경 핸들러 | 관리자 | ❌ 미사용 |
| 6542 | `handlePermissionChange` | 권한 변경 핸들러 | 관리자 | ✅ 사용중 |

---

### 1️⃣6️⃣ ADMIN - ① 대시보드 STATE (3180-4188줄)
**가장 방대한 섹션 - 대시보드 핵심**

| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 3181 | State | `isLoading` | 로딩 상태 | 관리자 | 대시보드 | ❌ 미사용 |
| 3182 | State | `uploadedFile` | 업로드된 파일 | 관리자 | 대시보드 | ❌ 미사용 |
| 3183 | State | `notices` | 공지사항 목록 | 공통 | 전체 | ✅ 사용중 |
| 3184 | State | `safetyAccidents` | 안전사고 목록 | 관리자 | 대시보드 | ✅ 사용중 |
| 3185 | State | `isAddingSafety` | 안전사고 추가 중 | 관리자 | 대시보드 | ✅ 사용중 |
| 3186-3188 | State | 안전사고 입력 | 날짜/설명/심각도 | 관리자 | 대시보드 | ✅ 사용중 |
| 3189 | State | `showStatusPopup` | 상태 팝업 표시 | 관리자 | 대시보드 | ✅ 사용중 |
| 3190 | State | `statusPopupFilter` | 상태 팝업 필터 | 관리자 | 대시보드 | ✅ 사용중 |
| 3191 | State | `statusPopupSearchQuery` | 상태 검색 쿼리 | 관리자 | 대시보드 | ✅ 사용중 |
| 3192 | State | `isNightShift` | 야간 근무 여부 | 관리자 | 대시보드 | ✅ 사용중 |
| 3193 | State | `attendanceListSortField` | 근태 목록 정렬 필드 | 관리자 | 대시보드 | ✅ 사용중 |
| 3194 | State | `attendanceListSortOrder` | 근태 목록 정렬 순서 | 관리자 | 대시보드 | ✅ 사용중 |

#### 대시보드 핵심 함수들:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 3245 | `send52HourViolationAlert` | 52시간 위반 알림 전송 | 관리자 | ✅ 사용중 |
| 3433 | `getGoalDataByYear` | 연도별 목표 데이터 | 관리자 | ✅ 사용중 |
| 3523 | `getWorkLifeBalanceDataByYear` | 연도별 워라밸 데이터 | 관리자 | ✅ 사용중 |
| 3731 | `getViolationDetails` | 위반 상세 정보 | 관리자 | ✅ 사용중 |
| 3799 | `getWorkLifeDetailData` | 워라밸 상세 데이터 | 관리자 | ✅ 사용중 |
| 4016 | `getGoalDetailData` | 목표 상세 데이터 | 관리자 | ✅ 사용중 |
| 9278 | `getStatusTextColor` | 상태 텍스트 색상 | 관리자 | ✅ 사용중 |
| 9311 | `getTodayDateWithDay` | 오늘 날짜 (요일 포함) | 관리자 | ✅ 사용중 |
| 9322 | `getYesterdayDateWithDay` | 어제 날짜 (요일 포함) | 관리자 | ✅ 사용중 |
| 9334 | `formatDateWithDay` | 날짜 포맷 (요일 포함) | 관리자 | ✅ 사용중 |
| 9346 | `getEmployeesByStatus` | 상태별 직원 목록 | 관리자 | ✅ 사용중 |
| 9502 | `getPopupList` | 팝업 목록 | 관리자 | ❌ 미사용 |
| 9515 | `PopupHeader` | 팝업 헤더 컴포넌트 | 관리자 | ❌ 미사용 |
| 9525 | `handleStatusClick` | 상태 클릭 핸들러 | 관리자 | ✅ 사용중 |
| 9546 | `handleNightStatusClick` | 야간 상태 클릭 핸들러 | 관리자 | ✅ 사용중 |
| 9744 | `handleAttendanceListSort` | 근태 목록 정렬 핸들러 | 관리자 | ✅ 사용중 |
| 9756 | `getSortedAttendanceEmployees` | 정렬된 근태 직원 | 관리자 | ✅ 사용중 |
| 9820 | `handleDownloadAttendanceList` | 근태 목록 다운로드 | 관리자 | ✅ 사용중 |
| 9829 | `calculateAttendanceRate` | 출근율 계산 | 관리자 | ✅ 사용중 |
| 9882 | `calculateLateRate` | 지각률 계산 | 관리자 | ✅ 사용중 |
| 9934 | `calculateAbsentRate` | 결근율 계산 | 관리자 | ✅ 사용중 |
| 9987 | `calculateTurnoverRate` | 이직률 계산 | 관리자 | ✅ 사용중 |
| 10013 | `calculateAverageOvertimeHours` | 평균 초과 근무 시간 | 관리자 | ✅ 사용중 |
| 10052 | `calculateLeaveUsageRate` | 연차 사용률 계산 | 관리자 | ✅ 사용중 |
| 10062 | `calculateMonthlyLeaveUsageRate` | 월별 연차 사용률 | 관리자 | ✅ 사용중 |
| 10113 | `calculateWeekly52HoursViolation` | 주 52시간 위반 계산 | 관리자 | ✅ 사용중 |
| 10167 | `calculateStressIndex` | 스트레스 지수 계산 | 관리자 | ✅ 사용중 |

#### 안전사고 관련 함수들:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 10262 | `getTodaySafetyAccidents` | 오늘 안전사고 | 관리자 | ✅ 사용중 |
| 10267 | `getThisMonthSafetyAccidents` | 이번 달 안전사고 | 관리자 | ✅ 사용중 |
| 10273 | `getThisYearSafetyAccidents` | 올해 안전사고 | 관리자 | ✅ 사용중 |
| 10279 | `getAccidentFreeDays` | 무사고 일수 | 관리자 | ✅ 사용중 |
| 10292 | `checkAccidentFreeNotification` | 무사고 알림 확인 | 관리자 | ✅ 사용중 |
| 10345 | `handleSafetyAccidentInput` | 안전사고 입력 핸들러 | 관리자 | ✅ 사용중 |
| 10431 | `handleEditSafety` | 안전사고 수정 | 관리자 | ✅ 사용중 |
| 10444 | `handleSaveAccidentEdit` | 안전사고 수정 저장 | 관리자 | ✅ 사용중 |
| 10465 | `handleCancelAccidentEdit` | 안전사고 수정 취소 | 관리자 | ✅ 사용중 |
| 10474 | `handleDeleteSafety` | 안전사고 삭제 | 관리자 | ✅ 사용중 |

#### 일정 관련 함수들:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 10484 | `handleAddEvent` | 일정 추가 | 관리자 | ✅ 사용중 |
| 10505 | `handleUnifiedAdd` | 통합 추가 | 관리자 | ✅ 사용중 |
| 10519 | `handleSaveUnified` | 통합 저장 | 관리자 | ✅ 사용중 |
| 10560 | `handleEditEvent` | 일정 수정 | 관리자 | ✅ 사용중 |
| 10578 | `handleDeleteEvent` | 일정 삭제 | 관리자 | ✅ 사용중 |
| 10598 | `handleSaveEvent` | 일정 저장 | 관리자 | ✅ 사용중 |

---

### 1️⃣7️⃣ STAFF - ① ~ ④ 직원 모드 STATE (4189-4231줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 4189 | State | `selectedEmployee` | 선택된 직원 | 직원 | 사원정보 | ✅ 사용중 |
| 4190 | State | `staffNotifications` | 직원 알림 | 직원 | 알림 | ✅ 사용중 |
| 4208 | State | `salaryPasswordError` | 급여 비밀번호 오류 | 직원 | 급여 내역 | ❌ 미사용 |
| 4217 | State | `showNoticePopup` | 공지 팝업 표시 | 직원 | 공지사항 | ❌ 미사용 |
| 4218 | State | `selectedNotice` | 선택된 공지 | 직원 | 공지사항 | ❌ 미사용 |
| 4219 | State | `noticePage` | 공지 페이지 | 직원 | 공지사항 | ❌ 미사용 |
| 4228 | State | `selectedCalendarDate` | 선택된 달력 날짜 | 직원 | 회사 일정 | ✅ 사용중 |

---

### 1️⃣8️⃣ COMMON - 언어/시스템 설정 STATE (4232-4649줄)
| 줄 범위 | 코드 유형 | 상태명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|--------|------|-----------|------|-----------|
| 4233 | State | `language` | 현재 언어 | 공통 | 전체 | ✅ 사용중 |
| 4234 | State | `systemStatus` | 시스템 상태 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 4235 | State | `systemLogs` | 시스템 로그 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 4236 | State | `systemAlerts` | 시스템 알림 | 관리자 | 시스템 관리 | ✅ 사용중 |
| 4237 | State | `permissionDeniedModal` | 권한 거부 모달 | 공통 | 전체 | ✅ 사용중 |
| 4247 | State | `expandedAnnouncement` | 확장된 공지 | 공통 | 공지사항 | ❌ 미사용 |
| 4256 | State | `showChangePasswordPopup` | 비밀번호 변경 팝업 | 공통 | 전체 | ❌ 미사용 |
| 4264 | State | `sidebarOpen` | 사이드바 열림 | 공통 | 전체 | ❌ 미사용 |
| 4339 | State | `modelOptions` | 모델 옵션 | 관리자 | 시스템 관리 | ❌ 미사용 |
| 4346 | State | `aiRecommendation` | AI 추천사항 | 관리자 | 대시보드 | ❌ 미사용 |
| 4405 | State | `renderCount` | 렌더 카운트 | 공통 | - | ❌ 미사용 |
| 4406 | State | `renderPerSecond` | 초당 렌더 | 공통 | - | ❌ 미사용 |

#### 시스템 관련 함수들:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 6550 | `logSystemEvent` | 시스템 이벤트 로깅 | 관리자 | ✅ 사용중 |
| 6623 | `triggerAdminNotification` | 관리자 알림 트리거 | 관리자 | ✅ 사용중 |
| 6685 | `getNotificationTitle` | 알림 제목 생성 | 관리자 | ✅ 사용중 |
| 6708 | `checkUserPermission` | 사용자 권한 확인 | 공통 | ✅ 사용중 |
| 6797 | `calculateWeekdaysInMonth` | 월별 평일 계산 | 관리자 | ❌ 미사용 |
| 8692 | `updateSystemStatus` | 시스템 상태 업데이트 | 관리자 | ✅ 사용중 |
| 8734 | `showUserNotification` | 사용자 알림 표시 | 공통 | ✅ 사용중 |
| 8751 | `showPermissionDeniedModal` | 권한 거부 모달 표시 | 공통 | ✅ 사용중 |
| 8757 | `executeWithPermissionCheck` | 권한 확인 후 실행 | 공통 | ❌ 미사용 |

---

### 1️⃣9️⃣ CUSTOM HOOKS 섹션 (9085-9132줄)
| 줄 범위 | 코드 유형 | 훅명 | 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|----------|------|------|-----------|------|-----------|
| 9087-9114 | Hook | `useAIChat` | AI 챗봇 커스텀 훅 | 관리자 | AI 챗봇 | ✅ 사용중 |
| 9115-9122 | Hook | `useAIRecommendations` | AI 추천사항 커스텀 훅 | 관리자 | 대시보드 | ✅ 사용중 |
| 9123-9131 | Ref/Effect | `chatContainerRef` | 채팅 컨테이너 자동 스크롤 | 관리자 | AI 챗봇 | ✅ 사용중 |

**훅에서 반환되는 함수들:**
- `chatMessages`, `setChatMessages` - 채팅 메시지 상태
- `chatInput`, `setChatInput` - 채팅 입력 상태
- `handleSendMessage` - 메시지 전송 핸들러
- `aiRecommendations`, `setAiRecommendations` - AI 추천사항 상태
- `aiRecommendationHistory` - AI 추천사항 이력
- `isAnalyzing` - 분석 중 상태
- `generateAiRecommendations` - AI 추천사항 생성 함수
- `downloadAiHistory` - AI 이력 다운로드 함수

---

### 2️⃣0️⃣ OTHER FUNCTIONS 섹션 (9133-15275줄)
**핵심 비즈니스 로직 함수들**

#### 데이터 수집 함수:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 8802 | `getCompanyData` | 회사 데이터 수집 (DB/ERP 연동) | 관리자 | ✅ 사용중 |
| 9136 | `calculateMonthlyAttendanceRate` | 월별 출근율 계산 | 관리자 | ✅ 사용중 |
| 9200 | `calculateCompanyStats` | 회사 통계 계산 | 관리자 | ✅ 사용중 |

#### 파일 다운로드 함수:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 9177 | `generateDownloadFile` | 다운로드 파일 생성 (엑셀/CSV) | 관리자 | ✅ 사용중 |

#### AI 프롬프트 함수:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 9187 | `handleAiPromptSave` | AI 프롬프트 저장 | 관리자 | ✅ 사용중 |

#### 안전사고 함수:
| 줄 | 함수명 | 내용 | 모드 | 사용 |
|----|--------|------|------|------|
| 9195 | `saveSafetyAccidents` | 안전사고 저장 | 관리자 | ✅ 사용중 |

---

### 2️⃣1️⃣ 로그인 및 언어선택 렌더링 (15276-15314줄)
| 줄 범위 | 코드 유형 | 내용 | 관련 모드 | 사용 유무 |
|---------|----------|------|-----------|-----------|
| 15276-15314 | JSX | 로그인 화면 & 언어 선택 | 공통 | ✅ 사용중 |

---

### 2️⃣2️⃣ RENDER CONTENT - 메뉴별 화면 렌더링 (15315-15966줄)
**각 메뉴에 따른 컴포넌트 렌더링**

| 줄 범위 | 렌더링 내용 | 관련 모드 | 메뉴 | 사용 유무 |
|---------|------------|-----------|------|-----------|
| 15315-15400 | 관리자 대시보드 | 관리자 | 대시보드 | ✅ 사용중 |
| 15401-15500 | 직원 관리 | 관리자 | 직원 관리 | ✅ 사용중 |
| 15501-15600 | 공지 관리 | 관리자 | 공지 관리 | ✅ 사용중 |
| 15601-15700 | 알림 관리 | 관리자 | 알림 관리 | ✅ 사용중 |
| 15701-15800 | 일정 관리 | 관리자 | 일정 관리 | ✅ 사용중 |
| 15801-15900 | 근태 관리 | 관리자 | 근태 관리 | ✅ 사용중 |
| 15901-15966 | 직원 모드 화면들 | 직원 | 전체 | ✅ 사용중 |

---

## 📊 통계 요약

### 코드 구성:
- **State 선언**: 약 150개
- **함수**: 약 300개
- **컴포넌트**: 20개 이상 (Import된 자식 컴포넌트)
- **Custom Hooks**: 2개 (useAIChat, useAIRecommendations)

### 관리자 모드 메뉴 (12개):
1. ① 대시보드 (3,000줄+)
2. ② 직원 관리
3. ③ 공지 관리
4. ④ 알림 관리 (800줄+)
5. ⑤ 일정 관리
6. ⑥ 연차 관리
7. ⑦ 건의 관리
8. ⑧ 근태 관리
9. ⑨ 급여 관리 (3,000줄+)
10. ⑩ 평가 관리
11. ⑪ AI 챗봇
12. ⑫ 시스템 관리

### 직원 모드 메뉴 (8개):
1. ① 사원정보
2. ② 공지사항
3. ③ 알림
4. ④ 회사 일정
5. ⑤ 연차 신청
6. ⑥ 급여 내역
7. ⑦ 건의사항
8. ⑧ 평가 내역

### 사용 유무 통계:
- ✅ **사용 중**: 약 85%
- ❌ **미사용**: 약 15% (주로 초기 개발 시 생성 후 미사용)

---

## 🎯 주요 기능별 코드 위치

### 공휴일 관리: 140-280줄
### 로그인/사용자: 1219-1348줄
### 알림 시스템: 1533-2482줄, 4733-6400줄
### 근태 관리: 2483-2502줄, 1243-1454줄
### 급여 시스템: 2540-2842줄, 6813-8690줄
### AI 시스템: 2847-3179줄, 9085-9132줄
### 대시보드: 3180-4188줄, 9278-10600줄
### 시스템 관리: 6550-8800줄

---

## ⚠️ 주의사항

1. **Dead Code (미사용 코드)**: 약 15%가 선언되었으나 실제로 사용되지 않음
   - 예: `showEvaluationForm`, `suggestionPage`, `modelOptions` 등

2. **최적화 필요**: 파일 크기가 15,966줄로 매우 방대함
   - 컴포넌트 분리 권장
   - 비즈니스 로직을 별도 파일로 분리 권장

3. **중복 코드**: 일부 함수에서 유사한 로직 반복

---

**분석 완료일**: 2025년 10월 28일
**분석자**: Claude Code AI
