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

            // Fix property accesses
            content = content.replace(/\.customer(?=[\.\s;\|])/g, '.Customer');
            content = content.replace(/\.branch(?=[\.\s;\|])/g, '.Branch');
            content = content.replace(/\.product(?=[\.\s;\|])/g, '.Product');
            content = content.replace(/\.employee(?=[\.\s;\|])/g, '.Employee');
            content = content.replace(/\.vendor(?=[\.\s;\|])/g, '.Vendor');
            content = content.replace(/\.supplier(?=[\.\s;\|])/g, '.Supplier');

            content = content.replace(/\.payments\b/g, '.ExchangePayment');
            // Wait, SaleInvoice uses SalePayment! Which is it? Better let's just make it context-aware or use it carefully.
            if (fullPath.includes('sales')) {
                content = content.replace(/\.ExchangePayment\b/g, '.SalePayment');
                content = content.replace(/payments\s*:\s*true/g, 'SalePayment: true');
            }
            if (fullPath.includes('custom-orders')) {
                content = content.replace(/\.ExchangePayment\b/g, '.CustomOrderPayment');
                content = content.replace(/payments\s*:\s*true/g, 'CustomOrderPayment: true');
            }
            if (fullPath.includes('purchases')) {
                content = content.replace(/\.ExchangePayment\b/g, '.PurchasePayment');
                content = content.replace(/payments\s*:\s*true/g, 'PurchasePayment: true');
            }

            // Fix SaleInvoice discount
            if (fullPath.includes('exchange') && content.includes('discountTotal:')) {
                content = content.replace(/discountTotal\s*:/g, 'discount:');
            }
            if (fullPath.includes('sales') && content.includes('discountTotal:')) {
                content = content.replace(/discountTotal\s*:/g, 'discount:');
            }

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed', fullPath);
            }
        }
    }
}

processDir(path.join(process.cwd(), 'app/api'));
processDir(path.join(process.cwd(), 'src/components'));
