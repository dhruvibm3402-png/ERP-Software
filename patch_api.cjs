const fs = require('fs');

const files = [
    'app/api/v1/notifications/route.ts',
    'app/api/v1/notifications/mark-all/route.ts',
    'app/api/v1/notifications/[id]/route.ts',
    'app/api/v1/notifications/preferences/route.ts'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let text = fs.readFileSync(file, 'utf8');
    if (!text.includes('import prisma')) {
        text = `import prisma from '../../../../../lib/prisma';\n` + text;
    }
    // For route.ts which might need less ../
    text = text.replace(/import prisma from '\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/lib\/prisma';/g, "import prisma from '@/lib/prisma';");

    text = text.replace(/const userId = 'default-user-id';/g, "const userId = (await prisma.user.findFirst())?.id || '';");
    fs.writeFileSync(file, text);
}
console.log('done');
