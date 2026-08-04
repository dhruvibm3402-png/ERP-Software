import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: any = {
            OR: [
                { product: { name: { contains: search, mode: 'insensitive' } } },
                { product: { category: { contains: search, mode: 'insensitive' } } },
                { product: { sku: { contains: search, mode: 'insensitive' } } }
            ]
        };

        const [records, total] = await Promise.all([
            (prisma as any).inventory.findMany({
                where,
                include: {
                    Product: true,
                    Branch: true
                },
                skip,
                take: limit,
                orderBy: { product: { name: 'asc' } }
            }),
            (prisma as any).inventory.count({ where })
        ]);

        return NextResponse.json({
            data: records,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
