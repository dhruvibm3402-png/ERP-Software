const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schemaStr = fs.readFileSync(schemaPath, 'utf8');

const newModels = `
// ─── Extended Accounting Modules ───────────────────────────────────────────────

model CashBook {
  id          String   @id @default(cuid())
  date        DateTime @default(now())
  description String
  type        String   // IN | OUT
  amount      Float
  balance     Float
  referenceId String?  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model BankBook {
  id            String   @id @default(cuid())
  date          DateTime @default(now())
  description   String
  type          String   // DEPOSIT | WITHDRAWAL
  amount        Float
  balance       Float
  referenceId   String?
  bankAccountId String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Expense {
  id          String   @id @default(cuid())
  date        DateTime @default(now())
  title       String
  category    String
  amount      Float
  status      String   // PENDING | APPROVED | PAID
  approvedBy  String?
  receiptUrl  String?
  vendorId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Income {
  id          String   @id @default(cuid())
  date        DateTime @default(now())
  title       String
  category    String
  amount      Float
  referenceId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Payment {
  id          String   @id @default(cuid())
  entityType  String   // CUSTOMER | VENDOR | EMPLOYEE
  entityId    String
  amount      Float
  method      String   // CASH | UPI | CARD | BANK_TRANSFER
  status      String   // SUCCESS | PENDING | FAILED
  paymentDate DateTime @default(now())
  referenceId String?
  splitDetails String? // JSON string
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TaxRate {
  id          String   @id @default(cuid())
  hsnCode     String   @unique
  description String?
  cgst        Float
  sgst        Float
  igst        Float
  isActive    Boolean  @default(true)
}

model GSTTransaction {
  id          String   @id @default(cuid())
  type        String   // INPUT | OUTPUT
  amount      Float
  cgst        Float
  sgst        Float
  igst        Float
  invoiceRef  String?
  transactionDate DateTime @default(now())
  createdAt   DateTime @default(now())
}

`;

if (!schemaStr.includes('model CashBook {')) {
    fs.appendFileSync(schemaPath, newModels);
    console.log('Appended models');
} else {
    console.log('Models already exist');
}
