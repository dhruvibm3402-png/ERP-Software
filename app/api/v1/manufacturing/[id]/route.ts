import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request, { params }: any) {
    try {
        const { id  } = await context.params;

        const data = await (prisma as any).manufacturingOrder.findUnique({
            where: { id, isDeleted: false },
            include: {
                Product: true,
                Items: true,
                Assignments: { include: { Karigar: true } },
                Stages: true,
                Issues: true,
                Returns: true,
                Costs: true,
                Wastages: true
            }
        });

        if (!data) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        return NextResponse.json({ data });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: Request, { params }: any) {
    try {
        const { id  } = await context.params;

        await (prisma as any).manufacturingOrder.update({
            where: { id },
            data: { isDeleted: true }
        });

        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
