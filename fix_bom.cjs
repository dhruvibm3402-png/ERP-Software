const fs = require('fs');
const content = fs.readFileSync('prisma/schema.prisma');
const clean = Buffer.from(content.toString('utf8').replace(/^\uFEFF/, ''), 'utf8');
fs.writeFileSync('prisma/schema.prisma', clean);
console.log('Fixed BOM');
