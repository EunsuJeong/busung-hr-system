const crypto = require('crypto');
const { AttendanceStats } = require('../models');

/**
 * Attendance 데이터의 해시값 생성 (변경 감지용)
 */
function generateAttendanceHash(records) {
  const data = records
    .map((r) => `${r.employeeId}_${r.date}_${r.checkIn}_${r.checkOut}`)
    .join('|');
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * 시간 문자열을 분 단위로 변환 (HH:MM 형식)
 */
function timeToMinutes(timeStr) {
  if (!timeStr || timeStr === '00:00') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 근무 시간 계산 (분 단위)
 */
function calculateWorkMinutes(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const checkInMin = timeToMinutes(checkIn);
  const checkOutMin = timeToMinutes(checkOut);

  // 자정을 넘어가는 경우 처리
  if (checkOutMin < checkInMin) {
    return 24 * 60 - checkInMin + checkOutMin;
  }

  return checkOutMin - checkInMin;
}

/**
 * 근무 시간 분류 (기본/조출/연장/심야/휴일)
 */
function categorizeWorkHours(checkIn, checkOut, shiftType = '주간', isHoliday = false) {
  const result = {
    regularHours: 0,
    earlyHours: 0,
    overtimeHours: 0,
    nightHours: 0,
    holidayHours: 0,
  };

  if (!checkIn || !checkOut) return result;

  // 휴일 근무인 경우 (주말)
  if (isHoliday) {
    const totalMinutes = calculateWorkMinutes(checkIn, checkOut);
    const lunchMinutes = 60; // 점심시간 1시간 제외
    result.holidayHours = Math.max(0, (totalMinutes - lunchMinutes) / 60);
    return result;
  }

  const checkInMin = timeToMinutes(checkIn);
  const checkOutMin = timeToMinutes(checkOut);

  if (shiftType === '주간') {
    // 주간 근무: 09:00 ~ 18:00 (점심시간 1시간 제외)
    const standardStart = 9 * 60; // 09:00
    const standardEnd = 18 * 60; // 18:00
    const lunchStart = 12 * 60; // 12:00
    const lunchEnd = 13 * 60; // 13:00

    // 조출 계산 (09:00 이전)
    if (checkInMin < standardStart) {
      result.earlyHours = (standardStart - checkInMin) / 60;
    }

    // 기본 근무 계산
    const workStart = Math.max(checkInMin, standardStart);
    const workEnd = Math.min(checkOutMin, standardEnd);

    if (workEnd > workStart) {
      let regularMinutes = workEnd - workStart;

      // 점심시간 제외
      if (workStart < lunchEnd && workEnd > lunchStart) {
        const lunchOverlap =
          Math.min(workEnd, lunchEnd) - Math.max(workStart, lunchStart);
        regularMinutes -= lunchOverlap;
      }

      result.regularHours = regularMinutes / 60;
    }

    // 연장 근무 계산 (18:00 이후)
    if (checkOutMin > standardEnd) {
      result.overtimeHours = (checkOutMin - standardEnd) / 60;
    }

    // 심야 근무 계산 (22:00 ~ 06:00)
    const nightStart = 22 * 60; // 22:00
    const nightEnd = 6 * 60; // 06:00 (다음날)

    if (checkOutMin >= nightStart) {
      result.nightHours = (checkOutMin - nightStart) / 60;
    }
  } else if (shiftType === '야간') {
    // 야간 근무: 21:00 ~ 06:00 (다음날)
    const totalMinutes = calculateWorkMinutes(checkIn, checkOut);
    result.regularHours = Math.min(totalMinutes / 60, 9); // 최대 9시간
    result.nightHours = totalMinutes / 60; // 야간 근무는 전체가 심야

    if (totalMinutes > 9 * 60) {
      result.overtimeHours = (totalMinutes - 9 * 60) / 60;
    }
  }

  return result;
}

/**
 * 직원별 월간 근태 통계 계산
 */
function calculateEmployeeMonthlyStats(
  employeeId,
  attendanceRecords,
  year,
  month
) {
  const stats = {
    employeeId,
    year: parseInt(year),
    month: parseInt(month),
    totalWorkMinutes: 0,
    regularHours: 0,
    earlyHours: 0,
    overtimeHours: 0,
    nightHours: 0,
    holidayHours: 0,
    workDays: 0,
    lateDays: 0,
    earlyLeaveDays: 0,
    absentDays: 0,
    annualLeaveDays: 0,
    morningHalfDays: 0,
    afternoonHalfDays: 0,
    attendanceRecordCount: attendanceRecords.length,
  };

  attendanceRecords.forEach((record) => {
    const { checkIn, checkOut, shiftType, status } = record;

    // 근무 시간 계산
    if (checkIn && checkOut) {
      const workMinutes = calculateWorkMinutes(checkIn, checkOut);
      stats.totalWorkMinutes += workMinutes;

      // 시간 분류
      const categorized = categorizeWorkHours(checkIn, checkOut, shiftType);
      stats.regularHours += categorized.regularHours;
      stats.earlyHours += categorized.earlyHours;
      stats.overtimeHours += categorized.overtimeHours;
      stats.nightHours += categorized.nightHours;
    }

    // 출근 상태 집계
    if (status) {
      if (status === '출근') stats.workDays++;
      else if (status === '지각') {
        stats.workDays++;
        stats.lateDays++;
      } else if (status === '조퇴') {
        stats.workDays++;
        stats.earlyLeaveDays++;
      } else if (status === '결근') stats.absentDays++;
      else if (status === '연차') stats.annualLeaveDays++;
      else if (status === '반차(오전)') {
        stats.workDays++;
        stats.morningHalfDays++;
      } else if (status === '반차(오후)') {
        stats.workDays++;
        stats.afternoonHalfDays++;
      }
    } else if (checkIn && checkOut) {
      // status가 없지만 출퇴근 기록이 있으면 출근으로 간주
      stats.workDays++;
    }
  });

  // 소수점 둘째자리까지 반올림
  stats.regularHours = Math.round(stats.regularHours * 100) / 100;
  stats.earlyHours = Math.round(stats.earlyHours * 100) / 100;
  stats.overtimeHours = Math.round(stats.overtimeHours * 100) / 100;
  stats.nightHours = Math.round(stats.nightHours * 100) / 100;

  return stats;
}

/**
 * AttendanceStats 계산 및 저장
 */
async function calculateAndSaveStats(attendanceRecords, year, month) {
  try {
    // 직원별로 그룹화
    const employeeGroups = {};
    attendanceRecords.forEach((record) => {
      const empId = record.employeeId;
      if (!employeeGroups[empId]) {
        employeeGroups[empId] = [];
      }
      employeeGroups[empId].push(record);
    });

    const results = {
      updated: 0,
      inserted: 0,
      unchanged: 0,
      errors: 0,
    };

    // 각 직원별로 통계 계산 및 저장
    for (const [employeeId, records] of Object.entries(employeeGroups)) {
      try {
        // 직원별 해시값 생성 (해당 직원의 데이터만 사용)
        const currentHash = generateAttendanceHash(records);

        // 기존 통계 조회
        const existingStats = await AttendanceStats.findOne({
          employeeId,
          year: parseInt(year),
          month: parseInt(month),
        });

        // 해시값이 같으면 변경 없음 (해당 직원의 데이터가 변경되지 않음)
        if (existingStats && existingStats.attendanceHash === currentHash) {
          results.unchanged++;
          continue;
        }

        // 통계 계산
        const stats = calculateEmployeeMonthlyStats(
          employeeId,
          records,
          year,
          month
        );
        stats.attendanceHash = currentHash; // 직원별 해시값 저장
        stats.lastCalculatedAt = new Date();

        // DB에 저장 (upsert)
        await AttendanceStats.findOneAndUpdate(
          { employeeId, year: parseInt(year), month: parseInt(month) },
          { $set: stats },
          { upsert: true, new: true }
        );

        if (existingStats) {
          results.updated++;
        } else {
          results.inserted++;
        }
      } catch (error) {
        console.error(
          `[AttendanceStats] 직원 ${employeeId} 통계 저장 실패:`,
          error
        );
        results.errors++;
      }
    }

    console.log(
      `[AttendanceStats] 저장 완료: ${results.inserted}건 추가, ${results.updated}건 업데이트, ${results.unchanged}건 변경없음, ${results.errors}건 실패`
    );

    return { success: true, results };
  } catch (error) {
    console.error('[AttendanceStats] 계산 및 저장 실패:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateAttendanceHash,
  timeToMinutes,
  calculateWorkMinutes,
  categorizeWorkHours,
  calculateEmployeeMonthlyStats,
  calculateAndSaveStats,
};
