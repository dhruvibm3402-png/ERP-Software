import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            todayExchanges,
            todayAggregates,
            initiatedCount,
            valuedCount,
            exchangedCount,
            recent
        ] = await Promise.all([
            prisma.goldExchange.count({
                where: { createdAt: { gte: today } }
            }),
            prisma.goldExchange.aggregate({
                where: { createdAt: { gte: today } },
                _sum: { totalGrossWeight: true, totalExchangeValue: true }
            }),
            prisma.goldExchange.count({ where: { status: 'INITIATED' } }),
            prisma.goldExchange.count({ where: { status: 'VALUED' } }),
            prisma.goldExchange.count({ where: { status: 'EXCHANGED' } }),
            prisma.goldExchange.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    Customer: {
                        select: { id: true, name: true, mobile: true, customerId: true }
                    }
                }
            })
        ]);

        return NextResponse.json({
            data: {
                todayExchanges,
                todayWeight:    todayAggregates._sum.totalGrossWeight      ?? 0,
                todayValue:     todayAggregates._sum.totalExchangeValue ?? 0,
                initiatedCount,
                valuedCount,
                exchangedCount,
                recent
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
