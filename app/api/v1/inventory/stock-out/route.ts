import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const stockOutSchema = z.object({
    productId: z.string().min(1),
    branchId: z.string().optional().nullable(),
    quantity: z.number().min(1),
    weight: z.number().default(0),
    type: z.string().default('STOCK_OUT'),
    referenceId: z.string().optional(),
    reason: z.string().optional()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = stockOutSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            const inv = await (tx as any).inventory.findFirst({
                where: {
                    productId: data.productId,
                    branchId: data.branchId || null
                }
            });

            if (!inv || inv.availableStock < data.quantity) {
                throw new Error('Insufficient stock available for deduction.');
            }

            const previousStock = inv.quantity;
            const newStock = previousStock - data.quantity;

            const updatedInv = await (tx as any).inventory.update({
                where: { id: inv.id },
                data: {
                    quantity: newStock,
                    availableStock: inv.availableStock - data.quantity,
                    netWeight: inv.netWeight - data.weight,
                    lastUpdated: new Date()
                }
            });

            await tx.product.update({
                where: { id: data.productId },
                data: { stock: { decrement: data.quantity } }
            });

            const movement = await (tx as any).inventoryMovement.create({
                data: {
                    productId: data.productId,
                    branchId: data.branchId || null,
                    type: data.type,
                    quantity: -data.quantity,
                    weight: -data.weight,
                    previousStock,
                    currentStock: newStock,
                    referenceId: data.referenceId,
                    reason: data.reason || 'DIRECT_STOCK_OUT'
                }
            });

            return { inventory: updatedInv, movement };
        });

        return NextResponse.json({ message: 'Stock issued successfully', data: result });
    } catch (error) {
        return handleApiError(error);
    }
}
