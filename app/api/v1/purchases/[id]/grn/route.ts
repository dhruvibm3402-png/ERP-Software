import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';

export async function POST(req: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        const grn = await prisma.$transaction(async (tx) => {
            const note = await tx.goodsReceivedNote.create({
                data: {
                    grnNumber: body.grnNumber || `GRN-${Date.now()}`,
                    purchaseOrderId: id,
                    items: {
                        create: body.PurchaseItem.map((i: any) => ({ productId: i.productId, quantity: i.quantity }))
                    }
                },
                include: { PurchaseItem: true }
            });

            for (const grnItem of note.PurchaseItem) {
                const poItem = await (tx as any).purchaseOrderItem.findFirst({
                    where: { purchaseOrderId: id, productId: grnItem.productId }
                });

                if (poItem) {
                    await (tx as any).purchaseOrderItem.update({
                        where: { id: poItem.id },
                        data: { receivedQty: poItem.receivedQty + grnItem.quantity }
                    });
                }

                const inventory = await (tx as any).inventory.findFirst({
                    where: { productId: grnItem.productId }
                });

                if (inventory) {
                    await (tx as any).inventory.update({
                        where: { id: inventory.id },
                        data: { quantity: inventory.quantity + grnItem.quantity }
                    });
                } else {
                    await (tx as any).inventory.create({
                        data: {
                            productId: grnItem.productId,
                            quantity: grnItem.quantity,
                            type: 'IN',
                            remarks: `Received via ${note.grnNumber}`
                        }
                    });
                }
            }

            const currentOrder = await (tx as any).purchaseOrder.findUnique({
                where: { id },
                include: { PurchaseItem: true }
            });
            const isFull = currentOrder?.PurchaseItem.every(item => item.receivedQty >= item.quantity);
            await (tx as any).purchaseOrder.update({
                where: { id },
                data: { status: isFull ? 'RECEIVED' : 'PARTIAL_RECEIVED' }
            });

            return note;
        });

        return NextResponse.json(grn);
    } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
