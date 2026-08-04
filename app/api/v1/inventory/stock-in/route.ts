import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const stockInSchema = z.object({
    productId: z.string().min(1),
    branchId: z.string().optional().nullable(),
    quantity: z.number().min(1),
    grossWeight: z.number().default(0),
    netWeight: z.number().default(0),
    type: z.string().default('STOCK_IN'),
    referenceId: z.string().optional(),
    reason: z.string().optional(),
    remarks: z.string().optional()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = stockInSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            // Find or create inventory record
            let inv = await (tx as any).inventory.findFirst({
                where: {
                    productId: data.productId,
                    branchId: data.branchId || null
                }
            });

            const previousStock = inv ? inv.quantity : 0;
            const newStock = previousStock + data.quantity;

            if (inv) {
                inv = await (tx as any).inventory.update({
                    where: { id: inv.id },
                    data: {
                        quantity: newStock,
                        availableStock: inv.availableStock + data.quantity,
                        grossWeight: inv.grossWeight + data.grossWeight,
                        netWeight: inv.netWeight + data.netWeight,
                        lastUpdated: new Date()
                    }
                });
            } else {
                inv = await (tx as any).inventory.create({
                    data: {
                        productId: data.productId,
                        branchId: data.branchId || null,
                        quantity: newStock,
                        availableStock: newStock,
                        grossWeight: data.grossWeight,
                        netWeight: data.netWeight
                    }
                });
            }

            // Also update Product overall stock
            await tx.product.update({
                where: { id: data.productId },
                data: { stock: { increment: data.quantity } }
            });

            // Create Movement
            const movement = await (tx as any).inventoryMovement.create({
                data: {
                    productId: data.productId,
                    branchId: data.branchId || null,
                    type: data.type,
                    quantity: data.quantity,
                    weight: data.netWeight,
                    previousStock,
                    currentStock: newStock,
                    referenceId: data.referenceId,
                    reason: data.reason || 'DIRECT_STOCK_IN'
                }
            });

            return { inventory: inv, movement };
        });

        return NextResponse.json({ message: 'Stock added successfully', data: result });
    } catch (error) {
        return handleApiError(error);
    }
}
