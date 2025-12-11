const fs = require('fs');

console.log('🔍 App.js 원본 파일 완벽 분석 시작...\n');

// 원본 파일 읽기
const content = fs.readFileSync('C:/hr-system/src/App.js', 'utf8');
const lines = content.split('\n');

// 모든 주석 패턴 매칭
const patterns = {
  // 대분류 헤더
  majorSection: /\/\* ================================\s*\[(\d+)_(.+?)\]\s*================================ \*\//,

  // 중분류 헤더 (//---X.Y_...)
  mediumSection: /^(\s*)\/\/---(\d+(?:\.\d+)*)[_](.+?)---\/\//,

  // 소분류 헤더 (// *X.Y.Z_...*)
  minorSection: /^(\s*)\/\/ \*(\d+(?:\.\d+)*)[_](.+?)\*$/,

  // 일반 주석
  comment: /^(\s*)\/\//,
};

// 섹션 구조 저장
const structure = {
  header: [],
  sections: {}
};

let currentMajor = null;
let currentMedium = null;
let currentMinor = null;
let currentBlock = structure.header;

// 줄 번호 제한 (1~3993)
const maxLine = 3993;

console.log(`📖 총 ${Math.min(lines.length, maxLine)}줄 분석 중...\n`);

for (let i = 0; i < Math.min(lines.length, maxLine); i++) {
  const line = lines[i];

  // 대분류 검사
  const majorMatch = line.match(patterns.majorSection);
  if (majorMatch) {
    const [, num, desc] = majorMatch;
    currentMajor = num;
    currentMedium = null;
    currentMinor = null;

    const key = `${currentMajor}`;
    if (!structure.sections[key]) {
      structure.sections[key] = {
        type: 'major',
        header: line,
        content: [],
        children: {}
      };
    }
    currentBlock = structure.sections[key].content;
    currentBlock.push(line);
    continue;
  }

  // 중분류 검사
  const mediumMatch = line.match(patterns.mediumSection);
  if (mediumMatch) {
    const [, indent, num, desc] = mediumMatch;
    currentMedium = num;
    currentMinor = null;

    const parentKey = currentMajor || num.split('.')[0];
    if (!structure.sections[parentKey]) {
      structure.sections[parentKey] = {
        type: 'major',
        header: '',
        content: [],
        children: {}
      };
    }

    if (!structure.sections[parentKey].children[num]) {
      structure.sections[parentKey].children[num] = {
        type: 'medium',
        header: line,
        content: [],
        children: {}
      };
    }
    currentBlock = structure.sections[parentKey].children[num].content;
    currentBlock.push(line);
    continue;
  }

  // 소분류 검사
  const minorMatch = line.match(patterns.minorSection);
  if (minorMatch) {
    const [, indent, num, desc] = minorMatch;
    currentMinor = num;

    const parts = num.split('.');
    const majorNum = parts[0];
    const mediumNum = parts.slice(0, Math.min(2, parts.length)).join('.');

    if (!structure.sections[majorNum]) {
      structure.sections[majorNum] = {
        type: 'major',
        header: '',
        content: [],
        children: {}
      };
    }

    const parent = structure.sections[majorNum].children[mediumNum] ||
                   structure.sections[majorNum].children[currentMedium];

    if (parent) {
      if (!parent.children[num]) {
        parent.children[num] = {
          type: 'minor',
          header: line,
          content: []
        };
      }
      currentBlock = parent.children[num].content;
    } else {
      // 부모를 찾지 못한 경우 현재 블록에 추가
      if (!structure.sections[majorNum].children[num]) {
        structure.sections[majorNum].children[num] = {
          type: 'minor',
          header: line,
          content: []
        };
      }
      currentBlock = structure.sections[majorNum].children[num].content;
    }
    currentBlock.push(line);
    continue;
  }

  // 일반 코드/주석은 현재 블록에 추가
  if (currentBlock) {
    currentBlock.push(line);
  }
}

console.log('✅ 분석 완료!\n');

// 발견된 섹션 출력
console.log('📊 발견된 섹션 구조:\n');
const allKeys = Object.keys(structure.sections).sort((a, b) => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal !== bVal) return aVal - bVal;
  }
  return 0;
});

allKeys.forEach(key => {
  const section = structure.sections[key];
  console.log(`[${key}] - ${section.content.length}줄`);

  const childKeys = Object.keys(section.children).sort((a, b) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0;
      const bVal = bParts[i] || 0;
      if (aVal !== bVal) return aVal - bVal;
    }
    return 0;
  });

  childKeys.forEach(childKey => {
    const child = section.children[childKey];
    console.log(`  ├─ [${childKey}] - ${child.content.length}줄`);

    if (child.children) {
      const subKeys = Object.keys(child.children).sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aVal = aParts[i] || 0;
          const bVal = bParts[i] || 0;
          if (aVal !== bVal) return aVal - bVal;
        }
        return 0;
      });

      subKeys.forEach(subKey => {
        const sub = child.children[subKey];
        console.log(`     └─ [${subKey}] - ${sub.content.length}줄`);
      });
    }
  });
});

// 재조립 함수
function reassemble(section, output) {
  if (section.content && section.content.length > 0) {
    output.push(...section.content);
  }

  if (section.children) {
    const childKeys = Object.keys(section.children).sort((a, b) => {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    });

    childKeys.forEach(key => {
      reassemble(section.children[key], output);
    });
  }
}

// 최종 재조립
console.log('\n🔄 완벽한 순서로 재조립 중...\n');

const output = [];
output.push('/* === [App.js 1~3993 완벽 재정렬] === */');
output.push('');

// 헤더 추가
output.push(...structure.header);

// 섹션 순서대로 재조립
allKeys.forEach(key => {
  reassemble(structure.sections[key], output);
});

// 파일 저장
const finalContent = output.join('\n');
fs.writeFileSync('C:/hr-system/src/app_refactoring.js', finalContent, 'utf8');

console.log('✅ 완벽한 재정렬 완료!');
console.log(`📝 총 ${output.length}줄 작성됨\n`);
console.log('💾 저장 위치: C:/hr-system/src/app_refactoring.js');
