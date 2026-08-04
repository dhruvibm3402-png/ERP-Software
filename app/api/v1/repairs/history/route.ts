import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

// ─── GET /api/v1/repairs/history ──────────────────────────────────────────────
//
// Full repair history with rich filters and aggregate stats.
//
// Query params:
//   ?customerId=      – filter by customer
//   ?status=          – RECEIVED | UNDER_REPAIR | READY | DELIVERED | CANCELLED
//   ?priority=        – LOW | NORMAL | HIGH | URGENT
//   ?repairType=      – RESIZING | POLISHING | ...
//   ?assignedTo=      – Employee ID
//   ?from=            – ISO date (createdAt >=)
//   ?to=              – ISO date (createdAt <=)
//   ?overdue=true     – only jobs past estimated date and not yet delivered
//   ?search=          – jobNumber / customer name / mobile
//   ?page=            – default 1
//   ?limit=           – default 20, max 100

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const customerId = searchParams.get('customerId') || '';
        const status = searchParams.get('status') || '';
        const priority = searchParams.get('priority') || '';
        const repairType = searchParams.get('repairType') || '';
        const assignedTo = searchParams.get('assignedTo') || '';
        const from = searchParams.get('from') || '';
        const to = searchParams.get('to') || '';
        const overdue = searchParams.get('overdue') === 'true';
        const search = searchParams.get('search') || '';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
        const skip = (page - 1) * limit;

        const where: any = {};

        if (customerId) where.customerId = customerId;
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (repairType) where.repairType = repairType;
        if (assignedTo) where.assignedTo = assignedTo;

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = toDate;
            }
        }

        // Overdue: estimatedDate is in the past and status is not DELIVERED/CANCELLED
        if (overdue) {
            where.estimatedDate = { lt: new Date() };
            where.status = { notIn: ['DELIVERED', 'CANCELLED'] };
        }

        if (search) {
            where.OR = [
                { jobNumber: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
                { customer: { mobile: { contains: search, mode: 'insensitive' } } },
                { productDetails: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [jobs, total] = await Promise.all([
            (prisma as any).repairJob.findMany({
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
                            tier: true,
                        },
                    },
                    employee: {
                        select: { id: true, employeeId: true, name: true, role: true },
                    },
                    images: {
                        select: { id: true, imageType: true, caption: true, uploadedAt: true },
                    },
                    history: {
                        orderBy: { createdAt: 'asc' },
                        select: {
                            id: true,
                            fromStatus: true,
                            toStatus: true,
                            action: true,
                            notes: true,
                            createdAt: true,
                        },
                    },
                    _count: { select: { notifications: true } },
                },
            }),
            (prisma as any).repairJob.count({ where }),
        ]);

        // ── Aggregate stats ────────────────────────────────────────────────────
        const allForStats = await (prisma as any).repairJob.findMany({
            where,
            select: {
                status: true,
                priority: true,
                estimatedCost: true,
                finalCost: true,
                balanceDue: true,
                estimatedDate: true,
            },
        });

        const stats = {
            totalJobs: total,
            totalEstimatedRevenue: allForStats.reduce((s, j) => s + (j.estimatedCost ?? 0), 0),
            totalFinalRevenue: allForStats.reduce((s, j) => s + (j.finalCost ?? 0), 0),
            totalBalanceDue: allForStats.reduce((s, j) => s + (j.balanceDue ?? 0), 0),
            overdueCount: allForStats.filter(
                (j) =>
                    j.estimatedDate &&
                    j.estimatedDate < new Date() &&
                    !['DELIVERED', 'CANCELLED'].includes(j.status)
            ).length,
            byStatus: allForStats.reduce(
                (acc, j) => {
                    acc[j.status] = (acc[j.status] ?? 0) + 1;
                    return acc;
                },
                {} as Record<string, number>
            ),
            byPriority: allForStats.reduce(
                (acc, j) => {
                    acc[j.priority] = (acc[j.priority] ?? 0) + 1;
                    return acc;
                },
                {} as Record<string, number>
            ),
        };

        return NextResponse.json({
            data: jobs,
            stats,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
