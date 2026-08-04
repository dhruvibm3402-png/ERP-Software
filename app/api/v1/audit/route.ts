import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { handleApiError } from '../../../../utils/errorHandler';

export async function GET() {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        return NextResponse.json({ data: logs });
    } catch (error) {
        return handleApiError(error);
    }
}
