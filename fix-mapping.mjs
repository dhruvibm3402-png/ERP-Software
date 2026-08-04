import fs from 'fs';
import path from 'path';

function fixFile(fullPath) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    content = content.replace(/\bnetExchangeValue\b/g, 'totalExchangeValue');
    content = content.replace(/\.payments\b/g, '.ExchangePayment'); // Or Payment depends on type but let's be careful

    // Fix include items
    if (fullPath.includes('gold-exchange')) {
        content = content.replace(/items\s*:\s*true/g, 'GoldExchangeItem: true');
        content = content.replace(/\.items\b/g, '.GoldExchangeItem');
    }
    if (fullPath.includes('custom-orders')) {
        content = content.replace(/items\s*:\s*true/g, 'CustomOrderItem: true');
        content = content.replace(/\.items\b/g, '.CustomOrderItem');
    }
    if (fullPath.includes('purchases')) {
        content = content.replace(/items\s*:\s*true/g, 'PurchaseItem: true');
        content = content.replace(/\.items\b/g, '.PurchaseItem');
    }

    // Some general field name fixes:
    content = content.replace(/discount\s*:/g, 'discountTotal:'); // dangerous if global?


    if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed file:', fullPath);
    }
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            fixFile(fullPath);
        }
    }
}

processDir(path.join(process.cwd(), 'app/api'));
