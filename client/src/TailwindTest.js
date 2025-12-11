import React from 'react';

function TailwindTest() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Tailwind CSS 테스트
        </h1>
        <p className="text-gray-700">
          이 텍스트가 스타일링되어 보인다면 Tailwind가 작동하는 것입니다.
        </p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          버튼 테스트
        </button>
      </div>
    </div>
  );
}

export default TailwindTest;
