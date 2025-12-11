const mongoose = require('mongoose');
require('dotenv').config();

const AttendanceSchema = new mongoose.Schema({
  employeeId: String,
  date: String,
  checkIn: String,
  checkOut: String,
  shiftType: String,
}, { collection: 'attendances' });

const EmployeeSchema = new mongoose.Schema({
  id: String,
  name: String,
  department: String,
  subDepartment: String,
  workType: String,
  salaryType: String,
}, { collection: 'employees' });

const Attendance = mongoose.model('Attendance', AttendanceSchema);
const Employee = mongoose.model('Employee', EmployeeSchema);

async function checkLateData() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 2025년 8월 데이터 조회
    const startDate = '2025-08-01';
    const endDate = '2025-08-31';

    const records = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
      checkIn: { $exists: true, $ne: '', $ne: '연차' }
    }).lean();

    console.log(`📊 2025년 8월 출근 기록 총 ${records.length}건\n`);

    // 직원 정보 로드
    const employees = await Employee.find().lean();
    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.id] = emp;
    });

    // 시프터 판정 함수
    function determineShiftType(employee, checkInTime) {
      if (!employee || !checkInTime) return null;

      const targetSubdepartments = ['열', '표면', '구부', '인발', '교정·절단', '검사'];
      if (
        employee.department !== '생산' ||
        !targetSubdepartments.includes(employee.subDepartment) ||
        employee.salaryType !== '시급'
      ) {
        return null;
      }

      const [hours, minutes] = checkInTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;

      // 04:00 ~ 12:00 출근 → 주간, 16:00 ~ 23:00 출근 → 야간
      if (totalMinutes >= 240 && totalMinutes <= 720) {
        return '주간';
      } else if (totalMinutes >= 960 && totalMinutes <= 1380) {
        return '야간';
      }
      return null;
    }

    // 주말/휴일 체크 (간단히 토/일만 체크)
    function isWeekend(dateStr) {
      const date = new Date(dateStr);
      const day = date.getDay();
      return day === 0 || day === 6;
    }

    // 지각 체크
    let lateCount = 0;
    let lateRecords = [];

    records.forEach(record => {
      if (isWeekend(record.date)) {
        return; // 주말 제외
      }

      const employee = employeeMap[record.employeeId];
      if (!employee) return;

      const autoShiftType = !record.shiftType
        ? determineShiftType(employee, record.checkIn)
        : null;

      const workType = record.shiftType || autoShiftType || employee.workType || '주간';

      let isLate = false;
      if (workType === '야간') {
        if (record.checkIn > '19:00') {
          isLate = true;
        }
      } else {
        if (record.checkIn > '08:30') {
          isLate = true;
        }
      }

      if (isLate) {
        lateCount++;
        lateRecords.push({
          날짜: record.date,
          직원: employee.name,
          부서: `${employee.department}/${employee.subDepartment}`,
          출근: record.checkIn,
          판정: workType,
          저장된ShiftType: record.shiftType || 'null',
          자동판정: autoShiftType || 'null'
        });
      }
    });

    console.log(`🔍 지각 판정 결과: ${lateCount}건\n`);

    if (lateCount > 0) {
      console.log('📋 지각 상세 내역 (최대 20건):');
      lateRecords.slice(0, 20).forEach((rec, idx) => {
        console.log(`${idx + 1}. ${rec.날짜} | ${rec.직원} (${rec.부서}) | 출근: ${rec.출근} | 판정: ${rec.판정} | DB shiftType: ${rec.저장된ShiftType} | 자동판정: ${rec.자동판정}`);
      });

      if (lateCount > 20) {
        console.log(`\n... 외 ${lateCount - 20}건`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ 완료');
  } catch (error) {
    console.error('❌ 오류:', error);
    await mongoose.connection.close();
  }
}

checkLateData();
