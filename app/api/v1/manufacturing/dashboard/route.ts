import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            todayJobs,
            pendingJobs,
            inProgressJobs,
            completedJobs,
            qcPending,
            goldIssued,
            wastage,
            recent
        ] = await Promise.all([
            (prisma as any).manufacturingOrder.count({ where: { createdAt: { gte: today }, isDeleted: false } }),
            (prisma as any).manufacturingOrder.count({ where: { status: 'PENDING', isDeleted: false } }),
            (prisma as any).manufacturingOrder.count({ where: { status: 'IN_PROGRESS', isDeleted: false } }),
            (prisma as any).manufacturingOrder.count({ where: { status: 'COMPLETED', isDeleted: false } }),
            (prisma as any).qualityCheck.count({ where: { status: 'PENDING' } }),
            (prisma as any).materialIssue.aggregate({
                where: { issueDate: { gte: today }, materialType: 'GOLD' },
                _sum: { netWeight: true }
            }),
            (prisma as any).manufacturingWastage.aggregate({
                where: { ManufacturingOrder: { createdAt: { gte: today } } },
                _sum: { lossWeight: true }
            }),
            (prisma as any).manufacturingOrder.findMany({
                where: { isDeleted: false },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { Product: { select: { name: true, sku: true } } }
            })
        ]);

        return NextResponse.json({
            data: {
                todayJobs,
                pendingJobs,
                inProgressJobs,
                completedJobs,
                qcPending,
                todayGoldIssued: goldIssued._sum.netWeight || 0,
                todayWastage: wastage._sum.lossWeight || 0,
                recent
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
