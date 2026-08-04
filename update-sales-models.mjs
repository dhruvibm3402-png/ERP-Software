import fs from 'fs';

const path = 'prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

// The exact names to remove block-by-block
const models = [
    'SaleInvoice',
    'SaleItem',
    'SalePayment',
    'SaleReturn',
    'SaleReturnItem',
    'HoldBill'
];

models.forEach(modelName => {
    const regex = new RegExp(`model ${modelName}\\s+\\{[\\s\\S]*?\\n\\}`, 'g');
    schema = schema.replace(regex, '');
});

// Remove old references in Customer/Branch/Product if needed, safely using simple replace
schema = schema.replace(/\s+saleInvoices\s+SaleInvoice\[\]\n/g, '\n');
schema = schema.replace(/\s+saleItems\s+SaleItem\[\]\n/g, '\n');
schema = schema.replace(/\s+sales\s+SaleInvoice\[\]\n/g, '\n');

const newModels = `
// ─── Sales / POS Management ────────────────────────────────────────────────

model SaleInvoice {
  id              String         @id @default(cuid())
  invoiceNumber   String         @unique
  customerId      String?
  branchId        String?
  cashierId       String?        // Employee ID handling POS
  status          String         @default("COMPLETED") // HOLD, COMPLETED, CANCELLED, RETURNED
  paymentStatus   String         @default("PAID")      // UNPAID, PARTIAL, PAID
  
  subTotal        Float          @default(0)
  totalMaking     Float          @default(0)
  totalWastage    Float          @default(0)
  discount        Float          @default(0)
  gstTotal        Float          @default(0)
  roundOff        Float          @default(0)
  grandTotal      Float          @default(0)
  
  paidAmount      Float          @default(0)
  balanceAmount   Float          @default(0)
  
  oldGoldValue    Float          @default(0)           // If old gold was exchanged
  rewardsRedeemed Float          @default(0)
  remarks         String?
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  customer        Customer?      @relation(fields: [customerId], references: [id])
  branch          Branch?        @relation(fields: [branchId], references: [id])
  
  items           SaleItem[]
  payments        SalePayment[]
  returns         SaleReturn[]
  goldExchanges   GoldExchange[]
}

model SaleItem {
  id              String      @id @default(cuid())
  invoiceId       String
  productId       String
  
  quantity        Int         @default(1)
  grossWeight     Float       @default(0)
  netWeight       Float       @default(0)
  stoneWeight     Float       @default(0)
  
  metalRate       Float       @default(0)
  makingCharge    Float       @default(0)
  wastageCharge   Float       @default(0)
  stoneCharge     Float       @default(0)
  otherCharge     Float       @default(0)
  
  discount        Float       @default(0)
  gstRate         Float       @default(3)
  gstAmount       Float       @default(0)
  amount          Float       @default(0) // Total for this item
  
  isReturn        Boolean     @default(false)
  isExchange      Boolean     @default(false)
  
  invoice         SaleInvoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  product         Product     @relation(fields: [productId], references: [id])
}

model SalePayment {
  id            String      @id @default(cuid())
  invoiceId     String
  amount        Float
  method        String      // CASH, CARD, UPI, BANK_TRANSFER, CHEQUE, STORE_CREDIT
  reference     String?
  createdAt     DateTime    @default(now())
  
  invoice       SaleInvoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
}

model SaleReturn {
  id              String           @id @default(cuid())
  returnNumber    String           @unique
  invoiceId       String
  customerId      String?
  branchId        String?
  
  totalRefund     Float            @default(0)
  reason          String?
  refundMethod    String?          // CASH, ORIGINAL_PAYMENT, STORE_CREDIT
  status          String           @default("COMPLETED")
  
  createdAt       DateTime         @default(now())
  
  invoice         SaleInvoice      @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  items           SaleReturnItem[]
}

model SaleReturnItem {
  id              String      @id @default(cuid())
  returnId        String
  productId       String
  quantity        Int         @default(1)
  weight          Float       @default(0)
  refundAmount    Float       @default(0)
  
  returnRecord    SaleReturn  @relation(fields: [returnId], references: [id], onDelete: Cascade)
  product         Product     @relation(fields: [productId], references: [id])
}
`;

// Inject into Product relation list
const productMatch = schema.match(/model Product\s+\{[\s\S]*?\n\}/);
if (productMatch) {
    let productBlock = productMatch[0];
    if (!productBlock.includes('saleItems')) {
        productBlock = productBlock.replace(/\n\}/, '\n  saleItems SaleItem[]\n  saleReturnItems SaleReturnItem[]\n}');
        schema = schema.replace(productMatch[0], productBlock);
    }
}

// Inject into Customer relation list
const customerMatch = schema.match(/model Customer\s+\{[\s\S]*?\n\}/);
if (customerMatch) {
    let customerBlock = customerMatch[0];
    if (!customerBlock.includes('sales')) {
        customerBlock = customerBlock.replace(/\n\}/, '\n  sales SaleInvoice[]\n}');
        schema = schema.replace(customerMatch[0], customerBlock);
    }
}

// Inject into Branch relation list
const branchMatch = schema.match(/model Branch\s+\{[\s\S]*?\n\}/);
if (branchMatch) {
    let branchBlock = branchMatch[0];
    if (!branchBlock.includes('sales')) {
        branchBlock = branchBlock.replace(/\n\}/, '\n  sales SaleInvoice[]\n}');
        schema = schema.replace(branchMatch[0], branchBlock);
    }
}

if (!schema.includes("model SaleInvoice")) {
    schema = schema + newModels;
    fs.writeFileSync(path, schema);
    console.log('Sales Schema updated successfully.');
} else {
    console.log('Schema already updated for sales.');
}
