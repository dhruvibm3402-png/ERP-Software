import fs from 'fs';

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const newModels = `
model ManufacturingOrder {
  id              String             @id @default(uuid())
  orderNumber     String             @unique
  orderDate       DateTime           @default(now())
  expectedDate    DateTime?
  branchId        String?
  priority        String             @default("NORMAL")
  status          String             @default("DRAFT")
  productId       String?
  designNumber    String?
  totalCost       Float              @default(0)
  totalWeight     Float              @default(0)
  notes           String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  isDeleted       Boolean            @default(false)
  
  Product         Product?           @relation(fields: [productId], references: [id])
  Items           ManufacturingItem[]
  Stages          ProductionStage[]
  Costs           ManufacturingCost[]
  Wastages        ManufacturingWastage[]
  Issues          MaterialIssue[]
  Returns         MaterialReturn[]
  Assignments     KarigarAssignment[]
}

model ManufacturingItem {
  id                   String             @id @default(uuid())
  manufacturingOrderId String
  metalType            String?
  purity               String?
  grossWeight          Float              @default(0)
  netWeight            Float              @default(0)
  stoneQuantity        Int                @default(0)
  
  ManufacturingOrder   ManufacturingOrder @relation(fields: [manufacturingOrderId], references: [id], onDelete: Cascade)
}

model MaterialIssue {
  id                   String             @id @default(uuid())
  manufacturingOrderId String
  materialType         String             // GOLD, SILVER, STONE, OTHER
  metalType            String?
  purity               String?
  grossWeight          Float              @default(0)
  netWeight            Float              @default(0)
  quantity             Int                @default(1)
  issueDate            DateTime           @default(now())
  issuedById           String?
  receivedById         String?
  remarks              String?
  createdAt            DateTime           @default(now())
  
  ManufacturingOrder   ManufacturingOrder @relation(fields: [manufacturingOrderId], references: [id], onDelete: Cascade)
}

model MaterialReturn {
  id                   String             @id @default(uuid())
  manufacturingOrderId String
  materialType         String             // GOLD, SILVER, STONE, OTHER
  returnWeight         Float              @default(0)
  returnQuantity       Int                @default(1)
  returnDate           DateTime           @default(now())
  remarks              String?
  createdAt            DateTime           @default(now())
  
  ManufacturingOrder   ManufacturingOrder @relation(fields: [manufacturingOrderId], references: [id], onDelete: Cascade)
}

model ProductionStage {
  id                   String             @id @default(uuid())
  manufacturingOrderId String
  stageName            String             // DESIGN, WAX, CASTING, FILING, STONE_SETTING, POLISHING, HALLMARK, QC, FINISHED
  startDate            DateTime?
  endDate              DateTime?
  assignedToId         String?
  completionPercent    Int                @default(0)
  status               String             @default("PENDING")
  
  ManufacturingOrder   ManufacturingOrder @relation(fields: [manufacturingOrderId], references: [id], onDelete: Cascade)
}

model QualityCheck {
  id                   String             @id @default(uuid())
  manufacturingOrderId String
  checkDate            DateTime           @default(now())
  checkedById          String?
  weightVerified       Boolean            @default(false)
  purityVerified       Boolean            @default(false)
  stoneVerified        Boolean            @default(false)
  hallmarkVerified     Boolean            @default(false)
  finishQuality        String?
  packagingStatus      Boolean            @default(false)
  status               String             @default("PENDING") // APPROVED, REJECTED, REWORK
  remarks              String?
}

model FinishedGoods {
  id                   String             @id @default(uuid())
  manufacturingOrderId String             @unique
  productId            String?
  sku                  String?            @unique
  barcode              String?            @unique
  qrCode               String?            @unique
  grossWeight          Float              @default(0)
  netWeight            Float              @default(0)
  readyDate            DateTime           @default(now())
}

model ManufacturingCost {
  id                   String             @id @default(uuid())
  manufacturingOrderId String
  costType             String             // MATERIAL, LABOUR, STONE, MAKING, OVERHEAD, GST
  amount               Float              @default(0)
  notes                String?
  
  ManufacturingOrder   ManufacturingOrder @relation(fields: [manufacturingOrderId], references: [id], onDelete: Cascade)
}

model ManufacturingWastage {
  id                   String             @id @default(uuid())
  manufacturingOrderId String
  materialType         String
  lossType             String             // DUST, MELTING, OTHER
  lossWeight           Float              @default(0)
  recoveryWeight       Float              @default(0)
  lossPercent          Float              @default(0)
  costImpact           Float              @default(0)
  
  ManufacturingOrder   ManufacturingOrder @relation(fields: [manufacturingOrderId], references: [id], onDelete: Cascade)
}

model KarigarAssignment {
  id                   String             @id @default(uuid())
  manufacturingOrderId String
  karigarId            String
  assignedDate         DateTime           @default(now())
  expectedCompletion   DateTime?
  notes                String?
  status               String             @default("ACTIVE")
  
  ManufacturingOrder   ManufacturingOrder @relation(fields: [manufacturingOrderId], references: [id], onDelete: Cascade)
  Karigar              Karigar            @relation(fields: [karigarId], references: [id], onDelete: Cascade)
}
`;

if (!schema.includes('model ManufacturingOrder')) {
    schema += "\n\n" + newModels;

    // Add relation to Product for FinishedGoods backwards mapping
    if (schema.includes('model Product {') && !schema.includes('ManufacturingOrder   ManufacturingOrder[]')) {
        schema = schema.replace(/model Product \{([\s\S]*?)\}/, "model Product {$1\n  ManufacturingOrder   ManufacturingOrder[]\n}");
    }

    // Add relation to Karigar
    if (schema.includes('model Karigar {') && !schema.includes('KarigarAssignment    KarigarAssignment[]')) {
        schema = schema.replace(/model Karigar \{([\s\S]*?)\}/, "model Karigar {$1\n  KarigarAssignment    KarigarAssignment[]\n}");
    }

    fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
    console.log('Schema updated successfully!');
} else {
    console.log('Schema already has Manufacturing models.');
}
