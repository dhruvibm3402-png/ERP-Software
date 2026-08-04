const fs = require('fs');
let content = fs.readFileSync('src/components/Reports.tsx', 'utf8');
if (!content.includes('use client')) {
    fs.writeFileSync('src/components/Reports.tsx', '"use client";\n' + content);
}
