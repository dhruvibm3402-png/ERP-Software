const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('route.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            const libDir = path.join(process.cwd(), 'lib');
            const relPathStr = path.relative(path.dirname(fullPath), libDir).replace(/\\/g, '/');

            content = content.replace(/import prisma from '.*lib\/prisma';/g, 'import prisma from \'' + relPathStr + '/prisma\';');
            fs.writeFileSync(fullPath, content);
            console.log('Fixed:', fullPath);
        }
    }
}
processDir(path.join(process.cwd(), 'app/api/v1/manufacturing'));
