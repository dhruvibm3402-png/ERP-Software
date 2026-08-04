import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const limit = parseInt(searchParams.get('limit') || '50');

        const where: any = {};
        if (productId) where.productId = productId;

        const history = await (prisma as any).inventoryMovement.findMany({
            where,
            include: {
                Product: true,
                Branch: true
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ data: history });
    } catch (error) {
        return handleApiError(error);
    }
}
