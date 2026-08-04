import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../../utils/errorHandler';
import prisma from '../../../../../../lib/prisma';
import { z } from 'zod';

const statusSchema = z.object({
    status: z.string(),
    notes: z.string().optional()
});

export async function POST(request: Request, context: any) {
    try {
        const { id  } = await context.params;
        const body = await request.json();
        const { status, notes } = statusSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            let updateData: any = { status };

            if (status === 'READY') {
                updateData.completedDate = new Date();
            } else if (status === 'DELIVERED') {
                updateData.deliveredDate = new Date();
            }

            const updated = await (tx as any).repairJob.update({
                where: { id },
                data: updateData
            });

            await (tx as any).repairHistory.create({
                data: {
                    repairJobId: id,
                    toStatus: status,
                    notes: notes || `Status changed to ${status}`,
                    action: 'UPDATE_STATUS',
                    performedBy: 'SYSTEM'
                }
            });

            return updated;
        });

        return NextResponse.json({ data: result, message: 'Status updated successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
