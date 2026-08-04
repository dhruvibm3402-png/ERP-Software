const fs = require('fs');

let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

// The new SystemSetting block at 921 is:
/*
model SystemSetting {
  id          String   @id @default(cuid())
  tenantId    String?
  category    String   // COMPANY, TAX, INVOICE, NOTIFICATION, SECURITY, etc.
  key         String   @unique
  value       String   // Stringified JSON
  updatedAt   DateTime @updatedAt
}
*/

// The old SystemSetting block at 962 is:
/*
model SystemSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String?  
  category  String
  updatedAt DateTime @updatedAt
}
*/

// Remove the old one at 962.
content = content.replace(/model SystemSetting \{\s+id\s+String\s+\@id \@default\(cuid\(\)\)\s+key\s+String\s+\@unique\s+value\s+String\?\s+category\s+String\s+updatedAt\s+DateTime\s+\@updatedAt\s+\}/g, '');

fs.writeFileSync('prisma/schema.prisma', content);
