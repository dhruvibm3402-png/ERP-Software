import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const completeSchema = z.object({
    manufacturingOrderId: z.string(),
    productId: z.string().optional(), // if linked to existing product base
    sku: z.string().optional(),
    grossWeight: z.number().default(0),
    netWeight: z.number().default(0)
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = completeSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            // Generate Barcode/SKU logic
            const count = await tx.finishedGoods.count();
            const baseBarcode = `FG-${new Date().getFullYear()}${(count + 1).toString().padStart(5, '0')}`;

            const fg = await tx.finishedGoods.create({
                data: {
                    manufacturingOrderId: data.manufacturingOrderId,
                    productId: data.productId,
                    sku: data.sku || baseBarcode,
                    barcode: baseBarcode,
                    qrCode: `QR-${baseBarcode}`,
                    grossWeight: data.grossWeight,
                    netWeight: data.netWeight
                }
            });

            await (tx as any).manufacturingOrder.update({
                where: { id: data.manufacturingOrderId },
                data: { status: 'COMPLETED' }
            });

            return fg;
        });

        return NextResponse.json({ data: result, message: 'Finished Goods created successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
