const fs = require('fs');
const schemaPath = 'prisma/schema.prisma';

let additions = `

// ─── Employee Management (HRMS) ──────────────────────────────────────────────────

model Attendance {
  id            String   @id @default(cuid())
  employeeId    String
  employee      Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  date          DateTime
  punchIn       DateTime?
  punchOut      DateTime?
  status        String   @default("PRESENT")
  deviceId      String?  
  
  @@unique([employeeId, date])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Leave {
  id            String   @id @default(cuid())
  employeeId    String
  employee      Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  type          String
  startDate     DateTime
  endDate       DateTime
  reason        String?
  status        String   @default("PENDING")
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Payroll {
  id            String   @id @default(cuid())
  employeeId    String
  employee      Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  month         Int
  year          Int
  basicSalary   Float
  incentives    Float    @default(0) 
  deductions    Float    @default(0) 
  netSalary     Float
  status        String   @default("PENDING")
  paidDate      DateTime?
  
  @@unique([employeeId, month, year])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model PerformanceReview {
  id            String   @id @default(cuid())
  employeeId    String
  employee      Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  reviewDate    DateTime @default(now())
  rating        Int
  comments      String?
  reviewer      String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// ─── Accounting & Finance ────────────────────────────────────────────────────────

model LedgerAccount {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  type        String
  group       String?
  balance     Float    @default(0) 
  isSystem    Boolean  @default(false)
  
  lines       JournalLine[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model JournalEntry {
  id          String   @id @default(cuid())
  entryNumber String   @unique
  date        DateTime @default(now())
  reference   String?
  narration   String
  totalAmount Float    @default(0) 
  
  lines       JournalLine[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model JournalLine {
  id          String   @id @default(cuid())
  entryId     String
  entry       JournalEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
  accountId   String
  account     LedgerAccount @relation(fields: [accountId], references: [id])
  
  type        String
  amount      Float
  
  createdAt   DateTime @default(now())
}

// ─── Notifications & CRM ─────────────────────────────────────────────────────────

model NotificationLog {
  id          String   @id @default(cuid())
  targetPhone String?
  targetEmail String?
  type        String
  channel     String
  message     String
  status      String   @default("SENT")
  createdAt   DateTime @default(now())
}

model LoyaltyTransaction {
  id          String   @id @default(cuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  points      Int      
  type        String
  description String
  createdAt   DateTime @default(now())
}

// ─── Multi-Branch Management ─────────────────────────────────────────────────────

model StockTransfer {
  id           String   @id @default(cuid())
  fromBranchId String
  toBranchId   String
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  quantity     Int
  status       String   @default("PENDING") // PENDING, IN_TRANSIT, RECEIVED, CANCELED
  remarks      String?
  
  fromBranch   Branch   @relation("TransferFrom", fields: [fromBranchId], references: [id])
  toBranch     Branch   @relation("TransferTo", fields: [toBranchId], references: [id])

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
`;

let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('model StockTransfer')) {
    fs.appendFileSync(schemaPath, additions);
    schema = fs.readFileSync(schemaPath, 'utf8');
}

// Also let's patch the existing Employee and Customer models with the exact missing fields and reverse relations.
// For Employee : add baseSalary, biometricId, attendances Attendance[], leaves Leave[], payrolls Payroll[], performanceReviews PerformanceReview[]
// Wait, Employee has `role` already? Let's add baseSalary and biometricId.
if (!schema.includes('baseSalary')) {
    schema = schema.replace(
        'role        String',
        'role        String\n    baseSalary  Float @default(0)\n    biometricId String? @unique'
    );
    schema = schema.replace(
        'repairJobs        RepairJob[]',
        'repairJobs        RepairJob[]\n    attendances Attendance[]\n    leaves Leave[]\n    payrolls Payroll[]\n    performanceReviews PerformanceReview[]'
    );
}

// For Customer : add loyaltyHistory
if (!schema.includes('loyaltyHistory')) {
    schema = schema.replace(
        'repairJobs        RepairJob[]',
        'repairJobs        RepairJob[]\n    loyaltyHistory LoyaltyTransaction[]'
    );
}

// Wait, Branch Model. It exists. Let's add reverse relations for transfers.
if (!schema.includes('transfersOut')) {
    schema = schema.replace(
        'products  Product[]',
        'products  Product[]\n    transfersOut StockTransfer[] @relation("TransferFrom")\n    transfersIn  StockTransfer[] @relation("TransferTo")'
    );
}

// Also Employee needs branchId?
if (!schema.includes('branchId')) {
    schema = schema.replace(
        'department  String?',
        'department  String?\n    branchId    String?'
    );
    // Add relation to branch in Employee?
    // Let's just keep branchId as String? for now to keep it simple, or add the proper relation. 
    // It's safer to just run Prisma format to check syntax.
}

fs.writeFileSync(schemaPath, schema);
