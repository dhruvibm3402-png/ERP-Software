import fs from 'fs';
let s = fs.readFileSync('prisma/schema.prisma', 'utf8');
s = s.replace('employeeCode           String                @unique', 'employeeCode           String                @unique @default(cuid())');
s = s.replace('fullName               String', 'fullName               String                @default("Unknown")');
fs.writeFileSync('prisma/schema.prisma', s);
