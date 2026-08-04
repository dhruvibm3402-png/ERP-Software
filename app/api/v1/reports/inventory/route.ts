import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let whereClause: any = {};
        if (search) {
            whereClause.OR = [
                { product: { name: { contains: search, mode: 'insensitive' } } },
                { product: { barcode: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const data = await (prisma as any).inventory.findMany({
            where: whereClause,
            include: { Product: true },
            orderBy: { updatedAt: 'desc' }
        });

        const totalQuantity = data.reduce((acc, row) => acc + (row.quantity || 0), 0);
        const totalWeight = data.reduce((acc, row) => acc + (row.grossWeight || 0), 0);

        return NextResponse.json({
            data,
            meta: {
                count: data.length,
                totalQuantity,
                totalWeight
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
