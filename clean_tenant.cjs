const fs = require('fs');
let s = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Wipe all added fields from Tenant
s = s.replace(/  Subscription .+?\\n/g, '');
s = s.replace(/  PlatformPayment .+?\\n/g, '');
s = s.replace(/  Payment .+?\\n/g, '');
s = s.replace(/  TenantFeature .+?\\n/g, '');
s = s.replace(/  UsageMetric .+?\\n/g, '');
s = s.replace(/  SupportTicket .+?\\n/g, '');
s = s.replace(/  ImpersonationSession .+?\\n/g, '');

fs.writeFileSync('prisma/schema.prisma', s);
console.log('Cleaned tenant relations!');
