const fs = require('fs');
const path = require('path');
const glob = require('glob');

const hooksDir = path.join(__dirname, '../src/hooks');

console.log('🔧 hooks 파일들의 중복 import 제거 중...\n');

// hooks_*.js 파일들 찾기
const files = fs.readdirSync(hooksDir).filter(f => f.startsWith('hooks_') && f.endsWith('.js'));

let totalFixed = 0;

files.forEach(fileName => {
  const filePath = path.join(hooksDir, fileName);
  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // 모든 import 라인 찾기
  const importLines = [];
  const importStatements = new Set();

  lines.forEach((line, index) => {
    if (line.trim().startsWith('import') && line.includes('react')) {
      importLines.push({ index, line });

      // import 내용 파싱
      const match = line.match(/import\s+\{([^}]+)\}\s+from\s+['"]react['"]/);
      if (match) {
        const imports = match[1].split(',').map(s => s.trim());
        imports.forEach(imp => importStatements.add(imp));
      }
    }
  });

  if (importLines.length > 1) {
    console.log(`📝 ${fileName}: ${importLines.length}개 import 발견`);

    // 첫 번째 import를 모든 import를 포함하도록 업데이트
    const allImports = Array.from(importStatements).sort();
    const newImport = `import { ${allImports.join(', ')} } from 'react';`;

    // 첫 번째 import 교체
    lines[importLines[0].index] = newImport;

    // 나머지 중복 import 제거 (뒤에서부터 제거)
    for (let i = importLines.length - 1; i > 0; i--) {
      lines[importLines[i].index] = '';
    }

    // 파일 저장
    content = lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');

    console.log(`  ✓ 통합된 import: ${newImport}`);
    console.log(`  ✓ ${importLines.length - 1}개 중복 제거\n`);
    totalFixed++;
  }
});

console.log(`\n✅ 총 ${totalFixed}개 파일 수정 완료!`);
