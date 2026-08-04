import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            todaySales,
            todayRevenue,
            totalPending,
            recentSales
        ] = await Promise.all([
            prisma.saleInvoice.count({
                where: { createdAt: { gte: today }, status: 'PAID' }
            }),
            prisma.saleInvoice.aggregate({
                where: { createdAt: { gte: today }, status: 'PAID' },
                _sum: { grandTotal: true, paidAmount: true }
            }),
            prisma.saleInvoice.aggregate({
                where: { status: 'PARTIAL' },
                _sum: { grandTotal: true, paidAmount: true }
            }),
            prisma.saleInvoice.findMany({
                where: { status: 'PAID' },
                include: {
                    Customer: {
                        select: { id: true, name: true, mobile: true, customerId: true }
                    }
                },
                take: 5,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const pendingTotal = (totalPending._sum.grandTotal ?? 0) - (totalPending._sum.paidAmount ?? 0);

        return NextResponse.json({
            data: {
                todaySales,
                todayRevenue: todayRevenue._sum.grandTotal ?? 0,
                todayCollection: todayRevenue._sum.paidAmount ?? 0,
                totalPending: Math.max(0, pendingTotal),
                recentSales
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
