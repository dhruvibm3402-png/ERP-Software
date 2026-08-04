import fs from 'fs';

const path = 'prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

// The exact names to remove block-by-block
const models = [
    'GoldExchange',
    'GoldExchangeItem',
    'GoldPurityTest',
    'GoldValuation',
    'GoldReceipt',
    'ExchangePayment',
    'GoldExchangeHistory',
    'GoldExchangePayment'
];

models.forEach(modelName => {
    const regex = new RegExp(`model ${modelName}\\s+\\{[\\s\\S]*?\\n\\}`, 'g');
    schema = schema.replace(regex, '');
});

// Remove old references
schema = schema.replace(/\s+goldExchanges\s+GoldExchange\[\]\n/g, '\n');

const newModels = `
// ─── Gold Exchange Management ──────────────────────────────────────────────

model GoldExchange {
  id                    String              @id @default(cuid())
  exchangeNumber        String              @unique
  customerId            String
  branchId              String?
  status                String              @default("DRAFT") // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, COMPLETED
  
  totalGrossWeight      Float               @default(0)
  totalNetWeight        Float               @default(0)
  totalExchangeValue    Float               @default(0)
  
  linkedSaleInvoiceId   String?             // If exchanged against a specific POS invoice
  balanceRefund         Float               @default(0)
  
  remarks               String?
  createdBy             String?             // Employee ID
  approvedBy            String?             // Manager Employee ID
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  customer              Customer            @relation(fields: [customerId], references: [id])
  branch                Branch?             @relation(fields: [branchId], references: [id])
  linkedSale            SaleInvoice?        @relation(fields: [linkedSaleInvoiceId], references: [id])
  
  items                 GoldExchangeItem[]
  purityTests           GoldPurityTest[]
  valuations            GoldValuation[]
  receipts              GoldReceipt[]
  payments              ExchangePayment[]
}

model GoldExchangeItem {
  id              String         @id @default(cuid())
  exchangeId      String
  
  itemName        String
  category        String         // GOLD, SILVER, PLATINUM
  metalType       String
  description     String?
  
  quantity        Int            @default(1)
  grossWeight     Float
  stoneWeight     Float          @default(0)
  netWeight       Float
  
  purity          String?        // 22K, 18K etc.
  hallmarkNumber  String?
  
  exchange        GoldExchange   @relation(fields: [exchangeId], references: [id], onDelete: Cascade)
}

model GoldPurityTest {
  id              String         @id @default(cuid())
  exchangeId      String
  
  purityPercent   Float
  karat           String
  testMethod      String         // TOUCH_TEST, XRF, ACID
  testedBy        String?
  notes           String?
  
  createdAt       DateTime       @default(now())
  
  exchange        GoldExchange   @relation(fields: [exchangeId], references: [id], onDelete: Cascade)
}

model GoldValuation {
  id              String         @id @default(cuid())
  exchangeId      String
  
  currentGoldRate Float
  meltingLossPct  Float          @default(0)
  deductionPct    Float          @default(0)
  stoneDeduction  Float          @default(0)
  labourDeduction Float          @default(0)
  
  finalGoldWeight Float
  finalExchangeValue Float
  
  createdAt       DateTime       @default(now())
  
  exchange        GoldExchange   @relation(fields: [exchangeId], references: [id], onDelete: Cascade)
}

model GoldReceipt {
  id              String         @id @default(cuid())
  receiptNumber   String         @unique
  exchangeId      String
  
  pdfUrl          String?
  issuedAt        DateTime       @default(now())
  
  exchange        GoldExchange   @relation(fields: [exchangeId], references: [id], onDelete: Cascade)
}

model ExchangePayment {
  id            String         @id @default(cuid())
  exchangeId    String
  amount        Float
  method        String         // STORE_CREDIT, CASH, UPI, BANK_TRANSFER
  reference     String?
  type          String         @default("REFUND") // REFUND, COLLECT
  createdAt     DateTime       @default(now())
  
  exchange      GoldExchange   @relation(fields: [exchangeId], references: [id], onDelete: Cascade)
}
`;

// Inject into Customer relation list
const customerMatch = schema.match(/model Customer\s+\{[\s\S]*?\n\}/);
if (customerMatch) {
    let customerBlock = customerMatch[0];
    if (!customerBlock.includes('goldExchanges')) {
        customerBlock = customerBlock.replace(/\n\}/, '\n  goldExchanges GoldExchange[]\n}');
        schema = schema.replace(customerMatch[0], customerBlock);
    }
}

// Inject into Branch relation list
const branchMatch = schema.match(/model Branch\s+\{[\s\S]*?\n\}/);
if (branchMatch) {
    let branchBlock = branchMatch[0];
    if (!branchBlock.includes('goldExchanges')) {
        branchBlock = branchBlock.replace(/\n\}/, '\n  goldExchanges GoldExchange[]\n}');
        schema = schema.replace(branchMatch[0], branchBlock);
    }
}

// Inject into SaleInvoice relation list
const saleMatch = schema.match(/model SaleInvoice\s+\{[\s\S]*?\n\}/);
if (saleMatch) {
    let saleBlock = saleMatch[0];
    if (!saleBlock.includes('goldExchanges')) {
        saleBlock = saleBlock.replace(/\n\}/, '\n  goldExchanges GoldExchange[]\n}');
        schema = schema.replace(saleMatch[0], saleBlock);
    }
}

if (!schema.includes("model GoldExchange {")) {
    schema = schema + newModels;
    fs.writeFileSync(path, schema);
    console.log('Gold Exchange Schema updated successfully.');
} else {
    console.log('Schema already updated for Gold Exchange.');
}
