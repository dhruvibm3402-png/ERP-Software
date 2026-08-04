import fs from 'fs';

const path = 'prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

const newModels = `
// ─── Repair Management ───────────────────────────────────────────────────

model RepairJob {
  id              String   @id @default(cuid())
  jobNumber       String   @unique
  customerId      String
  status          String   @default("RECEIVED") // RECEIVED, IN_PROGRESS, READY, DELIVERED, CANCELLED
  priority        String   @default("MEDIUM")  // LOW, MEDIUM, HIGH, URGENT
  
  estimatedCost   Float    @default(0)
  advancePaid     Float    @default(0)
  balanceDue      Float    @default(0)
  
  customer        Customer @relation(fields: [customerId], references: [id])
  
  expectedDelivery DateTime?
  assignedToId    String?
  notes           String?
  
  items           RepairItem[]
  history         RepairStatusHistory[]
  payments        RepairPayment[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model RepairItem {
  id              String   @id @default(cuid())
  repairJobId     String
  itemType        String   // RING, CHAIN, etc.
  category        String   // GOLD, SILVER
  metalPurity     String?  // 22K
  grossWeight     Float    @default(0)
  netWeight       Float    @default(0)
  repairType      String   // POLISH, RESIZE
  description     String?
  images          String?  // JSON string array of URLs
  
  job             RepairJob @relation(fields: [repairJobId], references: [id], onDelete: Cascade)
}

model RepairStatusHistory {
  id              String   @id @default(cuid())
  repairJobId     String
  status          String
  notes           String?
  updatedById     String?
  
  job             RepairJob @relation(fields: [repairJobId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
}

model RepairPayment {
  id              String    @id @default(cuid())
  repairJobId     String
  amount          Float
  paymentMethod   String    // CASH, UPI, CARD
  referenceNumber String?
  notes           String?
  
  job             RepairJob @relation(fields: [repairJobId], references: [id], onDelete: Cascade)
  createdAt       DateTime  @default(now())
}
`;

if (!schema.includes("model RepairJob")) {
    schema = schema + "\n" + newModels;
    if (schema.includes('model Customer {') && !schema.includes('repairJobs      RepairJob[]')) {
        schema = schema.replace(
            'model Customer {',
            'model Customer {\n  repairJobs      RepairJob[]'
        );
    }
    fs.writeFileSync(path, schema);
    console.log('Repairs Schema updated successfully.');
} else {
    console.log('Schema already updated for Repairs.');
}
