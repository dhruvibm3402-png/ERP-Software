const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');
c = c.replace('role      String       \r\n@default("STAFF")', 'role      String       \r\n@default("STAFF")\n  tenantId String?\n  tenant Tenant? @relation("TenantUsers", fields: [tenantId], references: [id])');
c = c.replace('@default("STAFF")', '@default("STAFF")\n  tenantId String?\n  tenant Tenant? @relation("TenantUsers", fields: [tenantId], references: [id])');
fs.writeFileSync('prisma/schema.prisma', c);
