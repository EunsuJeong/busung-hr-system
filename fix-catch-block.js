const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// Find the line and add the missing catch block
const searchStr = `      }
    }

  // [2_관리자 모드] 2.1_대시보드 - 통계 계산`;

const replaceStr = `      }
    }

      devLog(\`\\n📊 엑셀 파싱 완료\\n  ✅ 업데이트된 셀: \${updatedCount}개\\n  📥 출근 업데이트: \${checkInUpdates}개\\n  📤 퇴근 업데이트: \${checkOutUpdates}개\\n  👥 처리된 직원: \${Array.from(processedEmployees).join(', ')} (\${processedEmployees.size}명)\\n  ⏭️ 스킵된 행: \${skippedRows.length}개\`);

      if (unmatchedNames.length > 0) {
        devLog(\`\\n⚠️ 미등록 직원들: \${unmatchedNames.join(', ')}\`);
        alert(
          \`엑셀 파일에서 다음 직원들을 찾을 수 없습니다:\\n\${unmatchedNames.join('\\n')}\\n\\n먼저 직원 관리에서 등록해주세요.\`
        );
      }

      if (updatedCount > 0) {
        alert(\`엑셀 데이터를 성공적으로 불러왔습니다!\\n\\n출근: \${checkInUpdates}개\\n퇴근: \${checkOutUpdates}개\\n총 \${updatedCount}개 셀 업데이트\`);
      } else {
        alert('업데이트된 근태 데이터가 없습니다.');
      }
    } catch (error) {
      devLog('❌ 엑셀 파싱 중 오류 발생:', error);
      alert(\`엑셀 파일 처리 중 오류가 발생했습니다.\\n\${error.message}\`);
    }
  };

  // [2_관리자 모드] 2.1_대시보드 - 통계 계산`;

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(path, content, 'utf8');
console.log('✅ Added catch block to parseAttendanceFromExcel function');
