import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const returnSchema = z.object({
    manufacturingOrderId: z.string(),
    materialType: z.string(), // GOLD, STONE, ETC
    returnWeight: z.number().default(0),
    returnQuantity: z.number().default(1),
    remarks: z.string().optional()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = returnSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            const matReturn = await tx.materialReturn.create({
                data: {
                    manufacturingOrderId: data.manufacturingOrderId,
                    materialType: data.materialType,
                    returnWeight: data.returnWeight,
                    returnQuantity: data.returnQuantity,
                    remarks: data.remarks
                }
            });

            // Here we would normally map it to a specific Inventory bucket
            // or a default raw material bin that auto-increases overall physical stock

            return matReturn;
        });

        return NextResponse.json({ data: result, message: 'Material returned successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
