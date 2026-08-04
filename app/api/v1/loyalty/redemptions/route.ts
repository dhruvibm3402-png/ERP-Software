
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

export async function GET(req: Request) {
    try {
        const data = await prisma.rewardRedemption.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ data });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = await prisma.rewardRedemption.create({ data: body });
        return NextResponse.json({ data, message: 'Created successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
