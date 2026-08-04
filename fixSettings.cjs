const fs = require('fs');
const schemaPath = 'prisma/schema.prisma';

let additions = `

// ─── Global Configuration & System Settings ─────────────────────────────────────

model SystemSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String?  // Stored as JSON string mapped dynamically
  category  String   // e.g. "COMPANY", "INVOICE", "EMAIL", "WHATSAPP", "PRINTER", "ROLE", "BACKUP", "CURRENCY"
  updatedAt DateTime @updatedAt
}
`;

let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('model SystemSetting')) {
    fs.appendFileSync(schemaPath, additions);
}
