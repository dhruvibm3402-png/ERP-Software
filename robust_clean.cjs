const fs = require('fs');
let lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');

// 1. Clean out the duplicate models at the end of the file.
// Let's find the FIRST occurrence of "model Subscription" which was our first appended model
let cutoff = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'model Subscription {') {
        cutoff = i;
        break;
    }
}
if (cutoff !== -1) {
    lines = lines.slice(0, cutoff);
}

// 2. Clean out the added relation fields from Tenant
let inTenant = false;
let cleanedLines = [];
for (let line of lines) {
    if (line.trim() === 'model Tenant {') {
        inTenant = true;
    }
    if (inTenant && line.trim() === '}') {
        inTenant = false;
    }

    if (inTenant) {
        const t = line.trim();
        if (t.startsWith('Subscription ') ||
            t.startsWith('PlatformPayment ') ||
            t.startsWith('Payment ') ||
            t.startsWith('TenantFeature ') ||
            t.startsWith('UsageMetric ') ||
            t.startsWith('SupportTicket ') ||
            t.startsWith('ImpersonationSession ')) {
            continue; // Drop line
        }
    }
    cleanedLines.push(line);
}

fs.writeFileSync('prisma/schema.prisma', cleanedLines.join('\n'));
console.log('Cleaned schema!');
