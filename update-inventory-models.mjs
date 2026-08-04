import fs from 'fs';

const path = 'prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

const blocksToRemove = [
    /model Inventory\s+\{[\s\S]*?\n\}/g,
    /model InventoryLedger\s+\{[\s\S]*?\n\}/g,
    /model StockTransfer\s+\{[\s\S]*?\n\}/g,
];

blocksToRemove.forEach(regex => {
    schema = schema.replace(regex, '');
});

// Remove relation 'inventory' and 'inventoryLedgers' and 'StockTransfer' from Product
schema = schema.replace(/\s+inventory\s+Inventory\[\]\n/g, '\n');
schema = schema.replace(/\s+inventoryLedgers\s+InventoryLedger\[\]\n/g, '\n');
schema = schema.replace(/\s+StockTransfer\s+StockTransfer\[\]\n/g, '\n');

// Also remove branch relations
schema = schema.replace(/\s+inventory\s+Inventory\[\]\n/g, '\n');
schema = schema.replace(/\s+transfersOut\s+StockTransfer\[\]\s+@relation\("TransferFrom"\)\n/g, '\n');
schema = schema.replace(/\s+transfersIn\s+StockTransfer\[\]\s+@relation\("TransferTo"\)\n/g, '\n');


const newModels = `
// ─── Inventory Management ──────────────────────────────────────────────────

model Inventory {
  id             String    @id @default(cuid())
  productId      String
  branchId       String?
  quantity       Int       @default(0)
  reservedStock  Int       @default(0)
  availableStock Int       @default(0)
  grossWeight    Float     @default(0)
  netWeight      Float     @default(0)
  minimumStock   Int       @default(5)
  maximumStock   Int       @default(100)
  status         String    @default("IN_STOCK") // IN_STOCK, LOW_STOCK, OUT_OF_STOCK
  lastUpdated    DateTime  @default(now())

  product        Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  branch         Branch?   @relation(fields: [branchId], references: [id])
}

model InventoryMovement {
  id              String   @id @default(cuid())
  productId       String
  branchId        String?
  type            String   // STOCK_IN, STOCK_OUT, ADJUSTMENT, TRANSFER, PURCHASE, SALE, MANUFACTURING, REPAIR, RETURN
  quantity        Int      @default(0)
  weight          Float    @default(0)
  previousStock   Int      @default(0)
  currentStock    Int      @default(0)
  referenceId     String?
  reason          String?
  userId          String?
  createdAt       DateTime @default(now())

  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  branch          Branch?  @relation(fields: [branchId], references: [id])
}

model StockAdjustment {
  id              String   @id @default(cuid())
  adjustmentNo    String   @unique
  productId       String
  branchId        String?
  type            String   // INCREASE, DECREASE
  quantity        Int
  reason          String   // DAMAGE, LOST, FOUND, CORRECTION, PHYSICAL_COUNT
  status          String   @default("APPROVED") // PENDING, APPROVED, REJECTED
  remarks         String?
  approvedBy      String?
  createdAt       DateTime @default(now())

  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  branch          Branch?  @relation(fields: [branchId], references: [id])
}

model StockTransfer {
  id              String   @id @default(cuid())
  transferNumber  String   @unique
  sourceBranchId  String
  destBranchId    String
  transferDate    DateTime @default(now())
  status          String   @default("PENDING") // PENDING, APPROVED, COMPLETED, CANCELLED
  remarks         String?
  createdAt       DateTime @default(now())

  sourceBranch    Branch   @relation("TransferFrom", fields: [sourceBranchId], references: [id])
  destBranch      Branch   @relation("TransferTo", fields: [destBranchId], references: [id])
  items           StockTransferItem[]
}

model StockTransferItem {
  id              String   @id @default(cuid())
  transferId      String
  productId       String
  quantity        Int
  weight          Float    @default(0)
  
  transfer        StockTransfer @relation(fields: [transferId], references: [id], onDelete: Cascade)
  product         Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model InventoryAudit {
  id              String   @id @default(cuid())
  auditNumber     String   @unique
  branchId        String?
  auditDate       DateTime @default(now())
  status          String   @default("DRAFT") // DRAFT, COMPLETED
  remarks         String?
  completedBy     String?
  createdAt       DateTime @default(now())

  branch          Branch?  @relation(fields: [branchId], references: [id])
  items           InventoryAuditItem[]
}

model InventoryAuditItem {
  id               String   @id @default(cuid())
  auditId          String
  productId        String
  expectedQuantity Int
  actualQuantity   Int
  difference       Int      @default(0) // actual - expected
  remarks          String?

  audit            InventoryAudit @relation(fields: [auditId], references: [id], onDelete: Cascade)
  product          Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model LowStockRule {
  id              String   @id @default(cuid())
  productId       String   @unique
  minimumStock    Int      @default(5)
  maximumStock    Int      @default(100)
  safetyStock     Int      @default(10)
  notifyEmail     String?
  isActive        Boolean  @default(true)
  
  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}
`;

// Inject into Product relation list
const productMatch = schema.match(/model Product\s+\{[\s\S]*?\n\}/);
if (productMatch) {
    let productBlock = productMatch[0];
    productBlock = productBlock.replace(/\n\}/, '\n  inventories Inventory[]\n  inventoryMovements InventoryMovement[]\n  stockAdjustments StockAdjustment[]\n  stockTransferItems StockTransferItem[]\n  inventoryAuditItems InventoryAuditItem[]\n  lowStockRule LowStockRule?\n}');
    schema = schema.replace(productMatch[0], productBlock);
}

// Inject into Branch relation list
const branchMatch = schema.match(/model Branch\s+\{[\s\S]*?\n\}/);
if (branchMatch) {
    let branchBlock = branchMatch[0];
    branchBlock = branchBlock.replace(/\n\}/, '\n  inventories Inventory[]\n  inventoryMovements InventoryMovement[]\n  stockAdjustments StockAdjustment[]\n  transfersOut StockTransfer[] @relation("TransferFrom")\n  transfersIn StockTransfer[] @relation("TransferTo")\n  inventoryAudits InventoryAudit[]\n}');
    schema = schema.replace(branchMatch[0], branchBlock);
}

if (!schema.includes("model StockAdjustment")) {
    schema = schema + newModels;
    fs.writeFileSync(path, schema);
    console.log('Inventory Schema updated successfully.');
} else {
    console.log('Schema already updated for inventory.');
}
