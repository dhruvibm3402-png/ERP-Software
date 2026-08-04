const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Strip out existing SaaS models injected by `fixSaaS.cjs` or `superadmin` scripts to avoid conflicts
const modelsToRemove = [
    'Tenant', 'SubscriptionPlan', 'FeatureFlag', 'BillingHistory',
    'TenantSubscription', 'PlatformPayment', 'PlatformUser', 'PlatformRole',
    'PlatformPermission', 'PlatformRolePermission', 'Feature', 'TenantFeature',
    'UsageMetric', 'SupportTicket', 'SupportMessage', 'PlatformNotification',
    'PlatformAuditLog', 'ImpersonationSession', 'SystemHealthLog',
    'TenantSettings', 'TenantDomain', 'TenantUser', 'TenantInvitation',
    'TenantStorage', 'TenantUsage', 'TenantAuditLog', 'SubscriptionInvoice',
    'SubscriptionPayment'
];

modelsToRemove.forEach(modelName => {
    const regex = new RegExp(`model\\s+${modelName}\\s+\\{[^}]+\\}`, 'g');
    schema = schema.replace(regex, '');
});

const modelsToAdd = `
// ==========================================
// MULTI-TENANT SAAS MODELS
// ==========================================

model Tenant {
  id                  String               @id @default(uuid())
  name                String
  subdomain           String               @unique
  isActive            Boolean              @default(true)
  isSuspended         Boolean              @default(false)
  
  // Customization & Settings
  logoUrl             String?
  companyAddress      String?
  gstDetails          String?
  financialYear       String?
  currency            String               @default("USD")
  timezone            String               @default("UTC")
  
  // Relations
  Settings            TenantSettings?
  Subscription        TenantSubscription?
  Features            TenantFeature[]
  Domains             TenantDomain[]
  Users               TenantUser[]
  Invitations         TenantInvitation[]
  Usage               TenantUsage[]
  Storage             TenantStorage?
  AuditLogs           TenantAuditLog[]
  Invoices            SubscriptionInvoice[]

  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  deletedAt           DateTime?
  createdBy           String?
  updatedBy           String?
}

model TenantSettings {
  id                  String               @id @default(uuid())
  tenantId            String               @unique
  Tenant              Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  invoicePrefix       String?              @default("INV-")
  barcodeFormat       String?              @default("QR")
  defaultTaxRate      Float?               @default(0)
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
}

model SubscriptionPlan {
  id                  String               @id @default(uuid())
  name                String               // Free Trial, Basic, Professional, Enterprise
  description         String?
  priceMonthly        Float
  priceYearly         Float
  
  // Limits
  userLimit           Int                  @default(1)
  branchLimit         Int                  @default(1)
  storageLimitMb      Int                  @default(1024)
  apiLimitPerMonth    Int                  @default(1000)
  
  // Config
  trialDurationDays   Int                  @default(14)
  features            String               // JSON array of feature codes
  
  Subscriptions       TenantSubscription[]
  Invoices            SubscriptionInvoice[]
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
}

model TenantSubscription {
  id                  String               @id @default(uuid())
  tenantId            String               @unique
  Tenant              Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  planId              String
  Plan                SubscriptionPlan     @relation(fields: [planId], references: [id])
  
  status              String               @default("TRIAL") // TRIAL, ACTIVE, GRACE_PERIOD, CANCELLED, PAST_DUE
  billingCycle        String               @default("MONTHLY") // MONTHLY, YEARLY
  
  trialStartDate      DateTime?
  trialEndDate        DateTime?
  currentPeriodStart  DateTime?
  currentPeriodEnd    DateTime?
  cancelAtPeriodEnd   Boolean              @default(false)
  
  autoRenew           Boolean              @default(true)
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
}

model SubscriptionInvoice {
  id                  String               @id @default(uuid())
  tenantId            String
  Tenant              Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  planId              String
  Plan                SubscriptionPlan     @relation(fields: [planId], references: [id])
  
  amount              Float
  currency            String               @default("USD")
  status              String               @default("PENDING") // PENDING, PAID, FAILED, REFUNDED
  
  invoiceUrl          String?
  dueDate             DateTime?
  paidAt              DateTime?
  
  Payments            SubscriptionPayment[]
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
}

model SubscriptionPayment {
  id                  String               @id @default(uuid())
  invoiceId           String
  Invoice             SubscriptionInvoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  amount              Float
  currency            String               @default("USD")
  paymentMethod       String?              // STRIPE, RAZORPAY
  transactionId       String?              @unique
  status              String               @default("COMPLETED")
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
}

model TenantFeature {
  id                  String               @id @default(uuid())
  tenantId            String
  Tenant              Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  featureCode         String               // POS, INVENTORY, MANUFACTURING
  isEnabled           Boolean              @default(true)
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  
  @@unique([tenantId, featureCode])
}

model TenantDomain {
  id                  String               @id @default(uuid())
  tenantId            String
  Tenant              Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  domain              String               @unique
  isPrimary           Boolean              @default(false)
  isVerified          Boolean              @default(false)
  isSslReady          Boolean              @default(false)
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
}

model TenantUser {
  id                  String               @id @default(uuid())
  tenantId            String
  Tenant              Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  userId              String               @unique // Maps to global User ID
  role                String               @default("ADMIN") // ADMIN, MANAGER, CASHIER
  branchId            String?              // If restricted to a specific branch
  
  isActive            Boolean              @default(true)
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
}

model TenantInvitation {
  id                  String               @id @default(uuid())
  tenantId            String
  Tenant              Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  email               String
  role                String               @default("MANAGER")
  token               String               @unique
  expiresAt           DateTime
  isAccepted          Boolean              @default(false)
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
}

model TenantStorage {
  id                  String               @id @default(uuid())
  tenantId            String               @unique
  Tenant              Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  usedBytes           BigInt               @default(0)
  lastCalculatedAt    DateTime             @default(now())
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
}

model TenantUsage {
  id                  String               @id @default(uuid())
  tenantId            String
  Tenant              Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  month               Int
  year                Int
  apiKeyRequests      Int                  @default(0)
  activeUsersCount    Int                  @default(0)
  branchCount         Int                  @default(0)
  storageUsedMb       Float                @default(0)
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  
  @@unique([tenantId, month, year])
}

model TenantAuditLog {
  id                  String               @id @default(uuid())
  tenantId            String
  Tenant              Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  userId              String?
  action              String
  entity              String?
  entityId            String?
  details             String?
  ipAddress           String?
  
  createdAt           DateTime             @default(now())
}
`;

fs.writeFileSync(schemaPath, schema + "\n" + modelsToAdd);
console.log("Schema rewritten successfully.");
