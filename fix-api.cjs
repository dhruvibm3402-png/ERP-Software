const fs = require('fs');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = dir + '/' + file;
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Fix relationships
            content = content.replace(/include:\s*{\s*([^}]+)\s*}/g, (match, body) => {
                let newBody = body
                    .replace(/\bcustomer\s*:/g, 'Customer:')
                    .replace(/\bbranch\s*:/g, 'Branch:')
                    .replace(/\bvendor\s*:/g, 'Vendor:')
                    .replace(/\bproduct\s*:/g, 'Product:')
                    .replace(/\buser\s*:/g, 'User:')
                    .replace(/\bemployee\s*:/g, 'Employee:');
                return `include: { ${newBody} }`;
            });

            // Fix field names
            content = content.replace(/\btotalAmount\b/g, 'grandTotal'); // Check prisma schema carefully!
            content = content.replace(/\bsubtotal\b/g, 'subTotal');

            // Wait, before applying blindly, we need AST-aware or strict regex.
            if (original !== content) {
                // fs.writeFileSync(fullPath, content);
                console.log('Would fix:', fullPath);
            }
        }
    }
}
// processDir('./app/api');
// processDir('./src/components');
