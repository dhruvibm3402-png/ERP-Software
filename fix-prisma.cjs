const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Fix prisma top-level access reverting to camelCase
            content = content.replace(/prisma\.Customer\b/g, 'prisma.customer');
            content = content.replace(/tx\.Customer\b/g, 'tx.customer');

            content = content.replace(/prisma\.Branch\b/g, 'prisma.branch');
            content = content.replace(/tx\.Branch\b/g, 'tx.branch');

            content = content.replace(/prisma\.Product\b/g, 'prisma.product');
            content = content.replace(/tx\.Product\b/g, 'tx.product');

            content = content.replace(/prisma\.Employee\b/g, 'prisma.employee');
            content = content.replace(/tx\.Employee\b/g, 'tx.employee');

            content = content.replace(/prisma\.Vendor\b/g, 'prisma.vendor');
            content = content.replace(/tx\.Vendor\b/g, 'tx.vendor');

            content = content.replace(/prisma\.Supplier\b/g, 'prisma.supplier');
            content = content.replace(/tx\.Supplier\b/g, 'tx.supplier');

            // Wait, what about 'app/api/v1/accounting/journal/route.ts:54:9 Type error: Object literal may only specify known properties'?
            // Let's see what else failed. But first fix this.
            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed', fullPath);
            }
        }
    }
}

processDir(path.join(process.cwd(), 'app/api'));
processDir(path.join(process.cwd(), 'src/components'));
