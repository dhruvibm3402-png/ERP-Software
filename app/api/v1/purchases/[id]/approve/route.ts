import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../../utils/errorHandler';
import prisma from '../../../../../../lib/prisma';

export async function POST(request: Request, context: any) {
    try {
        const { id } = await context.params;

        const existing = await (prisma as any).purchaseOrder.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ message: 'Purchase Order not found' }, { status: 404 });
        }

        const po = await (prisma as any).purchaseOrder.update({
            where: { id },
            data: { status: 'APPROVED' }
        });

        return NextResponse.json({ message: 'Purchase Order approved completely', data: po });
    } catch (error) {
        return handleApiError(error);
    }
}
