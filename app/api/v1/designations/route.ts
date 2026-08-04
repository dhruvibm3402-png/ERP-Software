import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { handleApiError } from '../../../../utils/errorHandler';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const departmentId = searchParams.get('departmentId');
        const whereCondition = departmentId ? { departmentId } : {};

        const designations = await prisma.designation.findMany({
            where: whereCondition,
            orderBy: { title: 'asc' }
        });
        return NextResponse.json({ data: designations });
    } catch (error) {
        return handleApiError(error);
    }
}
