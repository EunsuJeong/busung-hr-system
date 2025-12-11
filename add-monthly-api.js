const fs = require('fs');

const filePath = './server/routes/attendance.js';
let content = fs.readFileSync(filePath, 'utf8');

const monthlyAPI = `
/**
 * @route   GET /api/attendance/monthly/:year/:month
 * @desc    월별 근태 데이터 조회
 * @access  Private
 */
router.get('/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    console.log(\`[근태 조회] \${year}년 \${month}월 데이터 조회 시작\`);

    const startDate = \`\${year}-\${String(month).padStart(2, '0')}-01\`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = \`\${year}-\${String(month).padStart(2, '0')}-\${String(daysInMonth).padStart(2, '0')}\`;

    console.log(\`[근태 조회] 날짜 범위: \${startDate} ~ \${endDate}\`);

    const attendanceRecords = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ employeeId: 1, date: 1 });

    console.log(\`[근태 조회] ✅ \${attendanceRecords.length}건 조회 완료\`);

    res.json({
      success: true,
      data: attendanceRecords,
      count: attendanceRecords.length,
    });
  } catch (error) {
    console.error('[근태 조회] ❌ 오류:', error);
    res.status(500).json({
      success: false,
      message: '월별 근태 데이터 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/attendance/monthly/:year/:month
 * @desc    월별 근태 데이터 대량 저장/업데이트
 * @access  Private
 */
router.post('/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const { attendanceData } = req.body;

    console.log(\`[근태 저장] \${year}년 \${month}월 데이터 저장 시작\`);
    console.log(\`[근태 저장] 총 \${attendanceData ? attendanceData.length : 0}건\`);

    if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: 'attendanceData 배열이 필요합니다.',
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const record of attendanceData) {
      try {
        const { employeeId, date, checkIn, checkOut, shiftType, status, remarks } = record;

        if (!employeeId || !date) {
          errorCount++;
          errors.push({ employeeId, date, error: '필수 필드 누락' });
          continue;
        }

        await Attendance.findOneAndUpdate(
          { employeeId, date },
          {
            $set: {
              checkIn: checkIn || '',
              checkOut: checkOut || '',
              shiftType: shiftType || '주간',
              status: status || '',
              remarks: remarks || '',
            },
          },
          { upsert: true, new: true }
        );

        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({ employeeId: record.employeeId, date: record.date, error: error.message });
      }
    }

    console.log(\`[근태 저장] ✅ 완료: \${successCount}건 성공, \${errorCount}건 실패\`);

    res.json({
      success: true,
      message: \`\${successCount}건 저장 완료, \${errorCount}건 실패\`,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[근태 저장] ❌ 오류:', error);
    res.status(500).json({
      success: false,
      message: '월별 근태 데이터 저장 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});
`;

content = content.replace('module.exports = router;', monthlyAPI + '\nmodule.exports = router;');

fs.writeFileSync(filePath, content);
console.log('✅ 백엔드 월별 API 추가 완료');
