
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

export async function GET(req: Request) {
    try {
        const data = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ data });
    } catch (error) {
        return handleApiError(error);
    }
}
