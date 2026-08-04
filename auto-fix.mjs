import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles();

const fieldMap = {
    'totalAmount': 'grandTotal',
    'totalPrice': 'grandTotal',
    'netPayable': 'grandTotal',
    // 'subtotal': 'subTotal',  // Handled carefully 
};
const relMap = {
    'customer': 'Customer',
    'branch': 'Branch',
    'product': 'Product',
    'vendor': 'Vendor',
    'employee': 'Employee',
    'user': 'User',
    'supplier': 'Supplier'
};

let fixedCount = 0;

for (const sf of sourceFiles) {
    let modified = false;

    // Helper to fix specific known AST nodes safely

    // 1. Fix PropertyAccess (e.g. order.customer -> order.Customer, order.totalAmount -> order.grandTotal)
    sf.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression).forEach(p => {
        const name = p.getName();
        if (relMap[name] && (p.getText().includes('include') || p.getText().includes('order.') || p.getText().includes('invoice.'))) {
            // We'll use a safer regex approach for 'include' objects below.
        }
    });

    // We can also just get the raw text and do safe replacements on known Prisma query structures
    let text = sf.getFullText();
    let ogText = text;

    // Replace include: { customer: true } with include: { Customer: true }
    text = text.replace(/include\s*:\s*{([^}]+)}/g, (match, inner) => {
        let newInner = inner
            .replace(/\bcustomer(\s*:)/g, 'Customer$1')
            .replace(/\bbranch(\s*:)/g, 'Branch$1')
            .replace(/\bproduct(\s*:)/g, 'Product$1')
            .replace(/\bvendor(\s*:)/g, 'Vendor$1')
            .replace(/\bemployee(\s*:)/g, 'Employee$1')
            .replace(/\buser(\s*:)/g, 'User$1')
            .replace(/\bsupplier(\s*:)/g, 'Supplier$1');
        return `include: {${newInner}}`;
    });

    // Replace select: { customer: true }
    text = text.replace(/select\s*:\s*{([^}]+)}/g, (match, inner) => {
        let newInner = inner
            .replace(/\bcustomer(\s*:)/g, 'Customer$1')
            .replace(/\bbranch(\s*:)/g, 'Branch$1')
            .replace(/\bproduct(\s*:)/g, 'Product$1')
            .replace(/\bvendor(\s*:)/g, 'Vendor$1')
            .replace(/\bemployee(\s*:)/g, 'Employee$1')
            .replace(/\buser(\s*:)/g, 'User$1')
            .replace(/\bsupplier(\s*:)/g, 'Supplier$1');
        return `select: {${newInner}}`;
    });

    // Replace common wrong field creations inside Prisma create/update payloads
    text = text.replace(/data\s*:\s*{([\s\S]*?)}/g, (match, inner) => {
        let newInner = inner
            .replace(/\btotalAmount\s*:/g, 'grandTotal:')
            .replace(/\bsubtotal\s*:/g, 'subTotal:')
            .replace(/\bmakingCharges\s*:/g, 'makingChargesTotal:')
            .replace(/\bdiscount\s*:/g, 'discountTotal:')
            .replace(/\bgst\s*:/g, 'gstTotal:');
        return match.replace(inner, newInner);
    });

    // Same for plain objects that might be Prisma insertions or calculations
    text = text.replace(/\.totalAmount/g, '.grandTotal');
    text = text.replace(/\.subtotal/g, '.subTotal');
    // text = text.replace(/\.amountPaid/g, '.paidAmount'); // depends on model!

    if (text !== ogText) {
        sf.replaceWithText(text);
        modified = true;
    }

    // Check if it's CustomOrder api which has estimatedTotal, balance
    if (sf.getFilePath().includes('custom-orders')) {
        let t = sf.getFullText();
        let changed = false;

        t = t.replace(/grandTotal/g, 'estimatedTotal'); // CustomOrder uses estimatedTotal!

        if (t !== sf.getFullText()) {
            sf.replaceWithText(t);
            modified = true;
        }
    }

    if (modified) {
        sf.saveSync();
        fixedCount++;
        console.log(`Saved: ${sf.getFilePath()}`);
    }
}
console.log(`Fixed ${fixedCount} files`);
