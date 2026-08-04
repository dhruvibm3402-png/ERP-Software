import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
    customerId: z.string(),
    productType: z.string(),
    productDetails: z.string(),
    metal: z.string().optional(),
    purity: z.string().optional(),
    grossWeight: z.number().optional(),
    issueDescription: z.string(),
    repairType: z.string(),
    estimatedCost: z.number().default(0),
    advancePaid: z.number().default(0),
    priority: z.string().default('NORMAL'),
    estimatedDate: z.string().optional()
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        let whereClause: any = {};
        if (search) {
            whereClause.OR = [
                { jobNumber: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
                { customer: { mobile: { contains: search, mode: 'insensitive' } } }
            ];
        }
        if (status && status !== 'ALL') whereClause.status = status;
        if (priority && priority !== 'ALL') whereClause.priority = priority;

        const data = await (prisma as any).repairJob.findMany({
            where: whereClause,
            include: { Customer: true, Employee: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ data });
    } catch (err) {
        return handleApiError(err);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = createSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            const count = await (tx as any).repairJob.count();
            const jobNumber = `REP-${new Date().getFullYear()}${(count + 1).toString().padStart(4, '0')}`;

            const repair = await (tx as any).repairJob.create({
                data: {
                    jobNumber,
                    customerId: data.customerId,
                    productType: data.productType,
                    productDetails: data.productDetails,
                    metal: data.metal,
                    purity: data.purity,
                    grossWeight: data.grossWeight,
                    issueDescription: data.issueDescription,
                    repairType: data.repairType,
                    estimatedCost: data.estimatedCost,
                    balanceDue: data.estimatedCost - data.advancePaid,
                    advancePaid: data.advancePaid,
                    priority: data.priority,
                    estimatedDate: data.estimatedDate ? new Date(data.estimatedDate) : null,
                    status: 'RECEIVED'
                }
            });

            await (tx as any).repairHistory.create({
                data: {
                    repairJobId: repair.id,
                    toStatus: 'RECEIVED',
                    notes: 'Repair Job created and jewelry received.',
                    action: 'CREATE',
                    performedBy: 'SYSTEM'
                }
            });

            return repair;
        });

        return NextResponse.json({ data: result, message: 'Repair job created successfully' }, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
