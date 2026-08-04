const fs = require('fs');
const txt = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}`;
fs.writeFileSync('prisma/schema.prisma', txt, 'utf8');
const { execSync } = require('child_process');
try {
    execSync('npx prisma db pull --force', { stdio: 'inherit' });
    console.log("DB PULL OK");
} catch (e) {
    console.log(e);
}
