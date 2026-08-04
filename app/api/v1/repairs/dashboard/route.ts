import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            todayRepairs,
            inProgress,
            ready,
            delivered,
            revenue,
            recent
        ] = await Promise.all([
            (prisma as any).repairJob.count({ where: { createdAt: { gte: today } } }),
            (prisma as any).repairJob.count({ where: { status: 'UNDER_REPAIR' } }),
            (prisma as any).repairJob.count({ where: { status: 'READY' } }),
            (prisma as any).repairJob.count({ where: { status: 'DELIVERED', deliveredDate: { gte: today } } }),
            (prisma as any).repairJob.aggregate({
                where: { createdAt: { gte: today } },
                _sum: { advancePaid: true, finalCost: true }
            }),
            (prisma as any).repairJob.findMany({
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
                todayRepairs,
                inProgress,
                readyCount: ready,
                todayDelivered: delivered,
                todayRevenue: revenue._sum.advancePaid ?? 0,
                recent
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
