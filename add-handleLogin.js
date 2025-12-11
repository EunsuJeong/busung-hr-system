const fs = require('fs');
const path = 'C:/hr-system/src/App.js';
let content = fs.readFileSync(path, 'utf8');

// Add handleLogin function after showPassword state
const searchStr = `  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  //---[1_공통] 1.3.5_테이블 셀 선택 STATE---//`;

const replaceStr = `  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // [1_공통] 로그인 핸들러
  const handleLogin = (e) => {
    e.preventDefault();

    const admin = admins.find(
      (admin) =>
        (admin.id === loginForm.id || admin.adminId === loginForm.id) &&
        admin.password === loginForm.password
    );

    if (admin) {
      const adminUser = { ...admin, isAdmin: true };
      setCurrentUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      setLoginError('');
      setSelectedLanguage('ko');
      setShowLanguageSelection(false);

      const savedTab = localStorage.getItem('activeTab');
      if (!savedTab) {
        handleTabChange('dashboard');
      }

      const now = new Date();
      setCurrentYear(now.getFullYear());
      setCurrentMonth(now.getMonth() + 1);
      return;
    }

    const employee = employees.find(
      (emp) =>
        (emp.id === loginForm.id || emp.name === loginForm.id) &&
        emp.password === loginForm.password
    );

    if (employee) {
      if (employee.status === '퇴사') {
        setLoginError('퇴사한 직원은 로그인할 수 없습니다.');
        return;
      }

      const employeeUser = { ...employee, isAdmin: false };
      setCurrentUser(employeeUser);
      localStorage.setItem('currentUser', JSON.stringify(employeeUser));
      setLoginError('');
      setShowLanguageSelection(true);

      const now = new Date();
      setCurrentYear(now.getFullYear());
      setCurrentMonth(now.getMonth() + 1);
      return;
    }

    setLoginError(
      getText(
        '아이디 및 비밀번호를 확인 후 다시 로그인해주세요.',
        'Please check your ID and password and try logging in again.'
      )
    );
  };

  //---[1_공통] 1.3.5_테이블 셀 선택 STATE---//`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Added handleLogin function');
