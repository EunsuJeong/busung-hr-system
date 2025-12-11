import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './AppWithSocket';
import TailwindTest from './TailwindTest';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Tailwind 테스트 모드: URL에 ?test=tailwind 추가하면 테스트 화면 표시
const urlParams = new URLSearchParams(window.location.search);
const isTailwindTest = urlParams.get('test') === 'tailwind';

root.render(
  <React.StrictMode>
    {isTailwindTest ? <TailwindTest /> : <App />}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
