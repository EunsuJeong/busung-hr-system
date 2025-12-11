const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// Add getText after handleLanguageSelect
const searchStr = `  // [1_공통] 언어 선택 핸들러
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowLanguageSelection(false);

    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  //---[1_공통] 1.3.5_테이블 셀 선택 STATE---//`;

const replaceStr = `  // [1_공통] 언어 선택 핸들러
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowLanguageSelection(false);

    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  // [1_공통] 다국어 텍스트 가져오기
  const getText = (koText, enText) => {
    return selectedLanguage === 'ko' ? koText : enText;
  };

  //---[1_공통] 1.3.5_테이블 셀 선택 STATE---//`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Added getText function');
