import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { handleApiError } from '../../../../utils/errorHandler';

export async function GET(request: Request) {
    try {
        const departments = await prisma.department.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json({ data: departments });
    } catch (error) {
        return handleApiError(error);
    }
}
