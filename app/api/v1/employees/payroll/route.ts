import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        if (!employeeId) return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });

        const payroll = await prisma.payroll.findMany({
            where: { employeeId },
            orderBy: [{ year: 'desc' }, { month: 'desc' }]
        });
        return NextResponse.json({ data: payroll });
    } catch (error) {
        return handleApiError(error);
    }
}
