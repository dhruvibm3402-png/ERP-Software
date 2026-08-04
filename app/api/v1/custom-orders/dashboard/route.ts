import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            todayOrders,
            pendingQuotations,
            waitingApproval,
            designInProgress,
            manufacturingInProg,
            qcPending,
            readyDelivery,
            delivered,
            cancelled,
            todayRevenue,
            monthlyOrders,
            recentOrders
        ] = await Promise.all([
            prisma.customOrder.count({ where: { createdAt: { gte: today } } }),
            prisma.customOrder.count({ where: { status: 'DRAFT' } }), // Pending quotation conceptually
            prisma.customOrder.count({ where: { status: 'QUOTATION' } }), // Waiting customer approval
            prisma.customOrder.count({ where: { status: 'CUSTOMER_APPROVAL' } }), // Design in progress conceptually mapped
            prisma.customOrder.count({ where: { status: 'MANUFACTURING' } }),
            prisma.customOrder.count({ where: { status: 'QC' } }), // assuming intermediate QC status
            prisma.customOrder.count({ where: { status: 'READY' } }),
            prisma.customOrder.count({ where: { status: 'DELIVERED' } }),
            prisma.customOrder.count({ where: { status: 'CANCELLED' } }),
            prisma.customOrderPayment.aggregate({
                where: { createdAt: { gte: today } },
                _sum: { amount: true }
            }),
            prisma.customOrder.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
            prisma.customOrder.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { Customer: { select: { name: true } }, CustomOrderItem: true }
            })
        ]);

        return NextResponse.json({
            data: {
                todayOrders,
                pendingQuotations,
                waitingApproval,
                designInProgress,
                manufacturingInProgress: manufacturingInProg,
                qcPending,
                readyForDelivery: readyDelivery,
                deliveredOrders: delivered,
                cancelledOrders: cancelled,
                todayRevenue: todayRevenue._sum.amount || 0,
                monthlyCustomOrders: monthlyOrders,
                recentOrders
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
