import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // { productId, type (STOCK_IN | STOCK_OUT | ADJUSTMENT | TRANSFER), quantity, remarks }
        if (!body.productId || !body.type || !body.quantity) {
            return NextResponse.json({ error: 'Invalid Payload' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({ where: { id: body.productId } });
            if (!product) throw new Error('Product not found');

            const previousQty = product.stock;
            const absoluteQty = Math.abs(Number(body.quantity));

            // Calculate direction and new stock
            const isIn = ['STOCK_IN', 'RETURN_IN'].includes(body.type) || (body.type === 'ADJUSTMENT' && body.quantity > 0);
            const multiplier = isIn ? 1 : -1;
            const newQty = previousQty + (absoluteQty * multiplier);

            if (newQty < 0) throw new Error(`Insufficient stock! Currently ${previousQty}`);

            // Update Product master stock
            await tx.product.update({
                where: { id: body.productId },
                data: { stock: newQty }
            });

            // Create Inventory Ledger entry
            const ledger = await (tx as any).inventoryLedger.create({
                data: {
                    productId: body.productId,
                    type: body.type,
                    quantity: absoluteQty,
                    direction: isIn ? 'IN' : 'OUT',
                    previousQty,
                    newQty,
                    remarks: body.remarks || ''
                }
            });

            // Create Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'INVENTORY_UPDATE',
                    entity: 'Product',
                    entityId: body.productId,
                    details: `Inventory ${isIn ? 'IN' : 'OUT'} of ${absoluteQty} (${body.type}). New Stock: ${newQty}`
                }
            });

            return ledger;
        });

        return NextResponse.json(result);
    } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
