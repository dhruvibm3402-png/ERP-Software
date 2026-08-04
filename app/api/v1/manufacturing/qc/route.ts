import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const qcSchema = z.object({
    manufacturingOrderId: z.string(),
    weightVerified: z.boolean().default(false),
    purityVerified: z.boolean().default(false),
    stoneVerified: z.boolean().default(false),
    hallmarkVerified: z.boolean().default(false),
    packagingStatus: z.boolean().default(false),
    finishQuality: z.string().optional(),
    status: z.string().default('APPROVED'), // APPROVED, REJECTED, REWORK
    remarks: z.string().optional()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = qcSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            const qc = await (tx as any).qualityCheck.create({
                data: {
                    manufacturingOrderId: data.manufacturingOrderId,
                    checkedById: 'SYSTEM', // Authentication mock
                    weightVerified: data.weightVerified,
                    purityVerified: data.purityVerified,
                    stoneVerified: data.stoneVerified,
                    hallmarkVerified: data.hallmarkVerified,
                    packagingStatus: data.packagingStatus,
                    finishQuality: data.finishQuality,
                    status: data.status,
                    remarks: data.remarks
                }
            });

            // Update Job Status based on QC outcome
            if (data.status === 'APPROVED') {
                await (tx as any).manufacturingOrder.update({
                    where: { id: data.manufacturingOrderId },
                    data: { status: 'COMPLETED' }
                });
            }

            return qc;
        });

        return NextResponse.json({ data: result, message: 'Quality Check registered successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
