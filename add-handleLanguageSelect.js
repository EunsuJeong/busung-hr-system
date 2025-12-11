const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// Add handleLanguageSelect after handleLogin
const searchStr = `    setLoginError(
      getText(
        '아이디 및 비밀번호를 확인 후 다시 로그인해주세요.',
        'Please check your ID and password and try logging in again.'
      )
    );
  };

  //---[1_공통] 1.3.5_테이블 셀 선택 STATE---//`;

const replaceStr = `    setLoginError(
      getText(
        '아이디 및 비밀번호를 확인 후 다시 로그인해주세요.',
        'Please check your ID and password and try logging in again.'
      )
    );
  };

  // [1_공통] 언어 선택 핸들러
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowLanguageSelection(false);

    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  //---[1_공통] 1.3.5_테이블 셀 선택 STATE---//`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Added handleLanguageSelect function');
