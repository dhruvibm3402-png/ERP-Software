import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        if (!employeeId) return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });

        const attendance = await prisma.attendance.findMany({
            where: { employeeId },
            orderBy: { date: 'desc' },
            take: 30
        });
        return NextResponse.json({ data: attendance });
    } catch (error) {
        return handleApiError(error);
    }
}
