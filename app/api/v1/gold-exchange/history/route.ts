import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const customerId = searchParams.get('customerId') || '';
        const status = searchParams.get('status') || '';
        const from = searchParams.get('from') || '';
        const to = searchParams.get('to') || '';
        const search = searchParams.get('search') || '';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
        const skip = (page - 1) * limit;

        const where: any = {};

        if (customerId) where.customerId = customerId;
        if (status) where.status = status;

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = toDate;
            }
        }

        if (search) {
            where.OR = [
                { exchangeNumber: { contains: search, mode: 'insensitive' } },
                { Customer: { name: { contains: search, mode: 'insensitive' } } },
                { Customer: { mobile: { contains: search, mode: 'insensitive' } } },
                { Customer: { customerId: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [exchanges, total] = await Promise.all([
            prisma.goldExchange.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    Customer: {
                        select: {
                            id: true,
                            customerId: true,
                            name: true,
                            mobile: true,
                            email: true,
                        },
                    },
                    GoldExchangeItem: true,
                    ExchangePayment: true,
                    SaleInvoice: true
                }
            }),
            prisma.goldExchange.count({ where })
        ]);

        return NextResponse.json({
            data: exchanges,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (e) {
        return handleApiError(e);
    }
}
