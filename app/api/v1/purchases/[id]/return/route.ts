import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../../utils/errorHandler';
import prisma from '../../../../../../lib/prisma';
import { z } from 'zod';

const returnSchema = z.object({
    reason: z.string().optional(),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        weight: z.number().default(0),
        amount: z.number().min(0)
    })).min(1)
});

export async function POST(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = returnSchema.parse(body);

        const existing = await (prisma as any).purchaseOrder.findUnique({
            where: { id },
            include: { PurchaseItem: true }
        });

        if (!existing) {
            return NextResponse.json({ message: 'Purchase Order not found' }, { status: 404 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const count = await (tx as any).purchaseReturn.count();
            const totalReturnAmt = data.PurchaseItem.reduce((sum, item) => sum + item.amount, 0);

            const pr = await (tx as any).purchaseReturn.create({
                data: {
                    returnNumber: `PR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`,
                    purchaseOrderId: existing.id,
                    totalAmount: totalReturnAmt,
                    reason: data.reason,
                    items: {
                        create: data.PurchaseItem.map(i => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            weight: i.weight,
                            amount: i.amount
                        }))
                    }
                }
            });

            // Revert Stock
            for (const item of data.PurchaseItem) {
                // Remove Stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });

                // Audit Log
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: 'OUT',
                        quantity: item.quantity,
                        weight: item.weight,
                        referenceId: pr.id,
                        reference: 'RETURN',
                        remarks: `Returned against Purchase: ${existing.poNumber}`
                    }
                });
            }

            // Ledger Credit Note Simulation (Revert Ledger)
            await tx.vendorLedger.create({
                data: {
                    vendorId: existing.vendorId,
                    type: 'DEBIT',
                    amount: totalReturnAmt,
                    balance: 0, // Simplified
                    referenceId: pr.id,
                    description: `Purchase Return for PO: ${existing.poNumber}`
                }
            });

            return pr;
        });

        return NextResponse.json({ message: 'Purchase Return created successfully', data: result });
    } catch (error) {
        return handleApiError(error);
    }
}
