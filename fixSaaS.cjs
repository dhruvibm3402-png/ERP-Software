const fs = require('fs');
const schemaPath = 'prisma/schema.prisma';

let additions = `

// ─── Super Admin & SaaS Routing ────────────────────────────────────────────────

model Tenant {
  id                 String   @id @default(cuid())
  name               String
  subdomain          String   @unique
  domain             String?  @unique
  subscriptionStatus String   @default("TRIAL") // TRIAL, ACTIVE, PAST_DUE, CANCELLED
  
  planId             String?
  plan               SubscriptionPlan? @relation(fields: [planId], references: [id])
  
  billingHistory     BillingHistory[]
  users              User[]   @relation("TenantUsers")
  
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model SubscriptionPlan {
  id              String   @id @default(cuid())
  name            String   
  priceMonthly    Float
  priceYearly     Float
  
  maxBranches     Int      @default(1)
  maxEmployees    Int      @default(5)
  maxProducts     Int      @default(1000)
  
  features        FeatureFlag[]
  tenants         Tenant[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model FeatureFlag {
  id              String   @id @default(cuid())
  planId          String
  plan            SubscriptionPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  featureKey      String   // e.g. "MANUFACTURING", "LOYALTY", "MULTI_BRANCH"
  isEnabled       Boolean  @default(true)
}

model BillingHistory {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  amount          Float
  status          String   // SUCCESS, PENDING, FAILED
  paymentDate     DateTime @default(now())
  invoiceUrl      String?
}
`;

let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('model Tenant')) {
    fs.appendFileSync(schemaPath, additions);
    schema = fs.readFileSync(schemaPath, 'utf8');
}

// Ensure User is mapped
if (!schema.includes('tenantId')) {
    schema = schema.replace(
        'role      String       @default("STAFF")',
        'role      String       @default("STAFF")\n  tenantId  String?\n  tenant    Tenant?    @relation("TenantUsers", fields: [tenantId], references: [id])'
    );
}

fs.writeFileSync(schemaPath, schema);
