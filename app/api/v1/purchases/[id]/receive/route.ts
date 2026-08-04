import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../../utils/errorHandler';
import prisma from '../../../../../../lib/prisma';
import { z } from 'zod';

const receiveSchema = z.object({
    items: z.array(z.object({
        itemId: z.string(),
        receivedQty: z.number().min(1)
    })).min(1)
});

export async function POST(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = receiveSchema.parse(body);

        const existing = await (prisma as any).purchaseOrder.findUnique({
            where: { id },
            include: { PurchaseItem: true, Vendor: true }
        });

        if (!existing) {
            return NextResponse.json({ message: 'Purchase Order not found' }, { status: 404 });
        }

        const result = await prisma.$transaction(async (tx) => {
            let fullyReceived = true;

            for (const item of data.PurchaseItem) {
                const poItem = existing.PurchaseItem.find(i => i.id === item.itemId);
                if (!poItem) continue;

                const newReceivedTotal = poItem.receivedQty + item.receivedQty;

                await (tx as any).purchaseOrderItem.update({
                    where: { id: item.itemId },
                    data: { receivedQty: newReceivedTotal }
                });

                if (newReceivedTotal < poItem.quantity) {
                    fullyReceived = false;
                }

                // Create Stock Movement History
                await tx.stockMovement.create({
                    data: {
                        productId: poItem.productId,
                        type: 'IN',
                        quantity: item.receivedQty,
                        weight: (poItem.netWeight / poItem.quantity) * item.receivedQty,
                        referenceId: existing.id,
                        reference: 'PURCHASE',
                        remarks: `Received against PO: ${existing.poNumber}`
                    }
                });

                // Automatically Update Overall Inventory Product
                await tx.product.update({
                    where: { id: poItem.productId },
                    data: { stock: { increment: item.receivedQty } }
                });
            }

            // Check if all items in PO are fully received
            if (!fullyReceived) {
                for (const poItem of existing.PurchaseItem) {
                    const receivedInput = data.PurchaseItem.find(i => i.itemId === poItem.id);
                    const currentReceived = poItem.receivedQty + (receivedInput ? receivedInput.receivedQty : 0);
                    if (currentReceived < poItem.quantity) {
                        fullyReceived = false;
                        break;
                    }
                }
            }

            const updatedPo = await (tx as any).purchaseOrder.update({
                where: { id },
                data: {
                    status: fullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED'
                }
            });

            // Create Vendor Ledger entry if this is the first receive or we want to record the invoice payable
            // Simplification: We log payable when RECEIVED completely or explicitly generating invoice.
            // But per request, Vendor Ledger and Purchase Invoice can also be auto generated. We can generate invoice automatically upon first receive.

            return updatedPo;
        });

        return NextResponse.json({ message: 'Stock received successfully', data: result });
    } catch (error) {
        return handleApiError(error);
    }
}
