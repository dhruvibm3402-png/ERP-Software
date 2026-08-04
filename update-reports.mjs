import fs from 'fs';

const path = 'prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

const newModels = `
// ─── Reports & Analytics ───────────────────────────────────────────────────

model SavedReport {
  id              String   @id @default(cuid())
  name            String
  description     String?
  category        String   // SALES, INVENTORY, ACCOUNTING
  filters         String   // JSON string of saved filters
  createdBy       String?
  isPublic        Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ScheduledReport {
  id              String   @id @default(cuid())
  name            String
  reportType      String   // Sales Report, Inventory Report
  frequency       String   // DAILY, WEEKLY, MONTHLY
  emailRecipients String   // Comma separated emails
  format          String   @default("PDF") // PDF, EXCEL, CSV
  lastRun         DateTime?
  nextRun         DateTime?
  isActive        Boolean  @default(true)
  createdBy       String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ReportExport {
  id              String   @id @default(cuid())
  reportType      String
  format          String
  fileUrl         String?
  status          String   @default("PENDING") // PENDING, COMPLETED, FAILED
  requestedBy     String?
  
  createdAt       DateTime @default(now())
  completedAt     DateTime?
}

model ReportTemplate {
  id              String   @id @default(cuid())
  name            String   @unique
  layout          String   // JSON template definition for rendering
  defaultFormat   String   @default("PDF")
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
`;

if (!schema.includes("model SavedReport {")) {
    schema = schema + newModels;
    fs.writeFileSync(path, schema);
    console.log('Reports Schema updated successfully.');
} else {
    console.log('Schema already updated for Reports.');
}
