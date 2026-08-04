const fs = require('fs');

let s = fs.readFileSync('prisma/schema.prisma', 'utf8');

const modelsToAdd = `
model Subscription {
  id                    String   @id @default(cuid())
  tenantId              String   @unique
  planId                String
  status                String   @default("ACTIVE") // ACTIVE, PAST_DUE, CANCELED, UNPAID
  startDate             DateTime @default(now())
  endDate               DateTime?
  trialEndDate          DateTime?
  nextBillingDate       DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  Tenant                Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}

model PlatformPayment {
  id                    String   @id @default(cuid())
  tenantId              String
  amount                Float
  currency              String   @default("INR")
  status                String   @default("COMPLETED") // PENDING, COMPLETED, FAILED, REFUNDED
  paymentMethod         String?
  transactionId         String?  @unique
  invoiceUrl            String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  Tenant                Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}

model PlatformUser {
  id                    String   @id @default(cuid())
  email                 String   @unique
  name                  String
  password              String
  roleId                String?
  isActive              Boolean  @default(true)
  lastLogin             DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  PlatformRole          PlatformRole? @relation(fields: [roleId], references: [id])
}

model PlatformRole {
  id                    String   @id @default(cuid())
  name                  String   @unique
  description           String?
  createdAt             DateTime @default(now())
  PlatformUser          PlatformUser[]
  PlatformRolePermission PlatformRolePermission[]
}

model PlatformPermission {
  id                    String   @id @default(cuid())
  name                  String   @unique // e.g. "MANAGE_TENANTS"
  module                String
  createdAt             DateTime @default(now())
  PlatformRolePermission PlatformRolePermission[]
}

model PlatformRolePermission {
  roleId                String
  permissionId          String
  createdAt             DateTime @default(now())
  PlatformRole          PlatformRole       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  PlatformPermission    PlatformPermission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
}

model Feature {
  id                    String   @id @default(cuid())
  key                   String   @unique
  name                  String
  description           String?
  isEnabledGlobally     Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  TenantFeature         TenantFeature[]
}

model TenantFeature {
  id                    String   @id @default(cuid())
  tenantId              String
  featureId             String
  isEnabled             Boolean  @default(true)
  createdAt             DateTime @default(now())
  Tenant                Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  Feature               Feature  @relation(fields: [featureId], references: [id], onDelete: Cascade)
  @@unique([tenantId, featureId])
}

model UsageMetric {
  id                    String   @id @default(cuid())
  tenantId              String
  metricKey             String   // e.g. "STORAGE_BYTES", "API_REQUESTS"
  value                 Float
  recordedAt            DateTime @default(now())
  Tenant                Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}

model SupportTicket {
  id                    String   @id @default(cuid())
  tenantId              String
  subject               String
  status                String   @default("OPEN")
  priority              String   @default("MEDIUM")
  assignedTo            String?  // References PlatformUser ID
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  Tenant                Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  SupportMessage        SupportMessage[]
}

model SupportMessage {
  id                    String   @id @default(cuid())
  ticketId              String
  senderId              String   // Either User ID or PlatformUser ID
  senderType            String   // "TENANT_USER", "PLATFORM_USER"
  content               String
  createdAt             DateTime @default(now())
  SupportTicket         SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}

model PlatformNotification {
  id                    String   @id @default(cuid())
  title                 String
  content               String
  priority              String   @default("NORMAL")
  targetAudience        String   // "ALL", "SPECIFIC_TENANTS", "SPECIFIC_PLANS"
  targetIds             String?  // JSON array of strings
  scheduledFor          DateTime?
  expiresAt             DateTime?
  createdAt             DateTime @default(now())
}

model PlatformAuditLog {
  id                    String   @id @default(cuid())
  userId                String?  // PlatformUser ID performing action
  action                String
  details               String?
  ipAddress             String?
  userAgent             String?
  targetEntityStatus    String?
  createdAt             DateTime @default(now())
}

model ImpersonationSession {
  id                    String   @id @default(cuid())
  platformUserId        String
  tenantId              String
  targetUserId          String?
  startedAt             DateTime @default(now())
  endedAt               DateTime?
  reason                String?
  Tenant                Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}

model SystemHealthLog {
  id                    String   @id @default(cuid())
  component             String   // "DATABASE", "REDIS", "BULLMQ", "API"
  status                String   // "HEALTHY", "DEGRADED", "DOWN"
  latencyMs             Int?
  message               String?
  createdAt             DateTime @default(now())
}
`;

const tenantClosing = s.indexOf('}', s.indexOf('model Tenant {'));
if (tenantClosing > -1 && !s.includes('model Subscription {')) {
    let newSchema = s.slice(0, tenantClosing);
    newSchema += `  Subscription       Subscription?\n`;
    newSchema += `  PlatformPayment    PlatformPayment[]\n`;
    newSchema += `  TenantFeature      TenantFeature[]\n`;
    newSchema += `  UsageMetric        UsageMetric[]\n`;
    newSchema += `  SupportTicket      SupportTicket[]\n`;
    newSchema += `  ImpersonationSession ImpersonationSession[]\n`;
    newSchema += s.slice(tenantClosing);
    fs.writeFileSync('prisma/schema.prisma', newSchema + '\n' + modelsToAdd);
} else {
    console.log('Skipped adding models');
}
