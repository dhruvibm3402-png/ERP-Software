import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
import { z } from 'zod';

// ─── Full include spec ─────────────────────────────────────────────────────────

const fullInclude = {
    customer: {
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
        select: { id: true, employeeId: true, name: true, role: true, mobile: true },
    },
    images: { orderBy: { uploadedAt: 'asc' as const } },
    history: { orderBy: { createdAt: 'asc' as const } },
    notifications: { orderBy: { createdAt: 'desc' as const } },
};

// ─── Update schema ─────────────────────────────────────────────────────────────

const updateRepairSchema = z.object({
    productDetails: z.string().min(3).optional(),
    metal: z.enum(['GOLD', 'SILVER', 'PLATINUM', 'DIAMOND', 'OTHER']).optional().nullable(),
    purity: z.string().optional().nullable(),
    grossWeight: z.number().min(0).optional().nullable(),
    issueDescription: z.string().min(5).optional(),
    repairType: z
        .enum(['RESIZING', 'POLISHING', 'STONE_SETTING', 'CHAIN_REPAIR', 'SOLDERING', 'ENGRAVING', 'RHODIUM_PLATING', 'CUSTOM', 'OTHER'])
        .optional(),
    estimatedCost: z.number().min(0).optional(),
    finalCost: z.number().min(0).optional(),
    advancePaid: z.number().min(0).optional(),
    estimatedDate: z.string().optional().nullable(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    assignedTo: z.string().optional().nullable(),
    technicianNotes: z.string().optional().nullable(),
    internalNotes: z.string().optional().nullable(),
    customerNotes: z.string().optional().nullable(),
});

// ─── GET /api/v1/repairs/[id] ─────────────────────────────────────────────────

export async function GET(_request: Request, context: any) {
    try {
        const { id } = await context.params;

        const job = await (prisma as any).repairJob.findUnique({
            where: { id },
            include: fullInclude,
        });

        if (!job) {
            return NextResponse.json({ message: 'Repair job not found' }, { status: 404 });
        }

        return NextResponse.json(job);
    } catch (error) {
        return handleApiError(error);
    }
}

// ─── PUT /api/v1/repairs/[id] (update details, cost, assignment) ──────────────

export async function PUT(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = updateRepairSchema.parse(body);

        const existing = await (prisma as any).repairJob.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ message: 'Repair job not found' }, { status: 404 });
        }
        if (existing.status === 'DELIVERED') {
            return NextResponse.json({ message: 'Cannot update a delivered repair job' }, { status: 400 });
        }

        // Verify new employee if being reassigned
        if (data.assignedTo !== undefined && data.assignedTo !== null) {
            const employee = await prisma.employee.findFirst({
                where: { id: data.assignedTo, isActive: true },
            });
            if (!employee) {
                return NextResponse.json({ message: 'Employee not found or inactive' }, { status: 404 });
            }
        }

        const updated = await prisma.$transaction(async (tx) => {
            // Compute new balance if costs changed
            const estimatedCost = data.estimatedCost ?? existing.estimatedCost ?? 0;
            const finalCost = data.finalCost ?? existing.finalCost ?? 0;
            const advancePaid = data.advancePaid ?? existing.advancePaid ?? 0;
            const costBasis = finalCost > 0 ? finalCost : estimatedCost;
            const balanceDue = Math.max(0, costBasis - advancePaid);

            const updateData: any = {
                ...data,
                balanceDue,
            };
            if (data.estimatedDate !== undefined) {
                updateData.estimatedDate = data.estimatedDate ? new Date(data.estimatedDate) : null;
            }

            const job = await (tx as any).repairJob.update({
                where: { id },
                data: updateData,
                include: fullInclude,
            });

            // Detect meaningful changes for history
            const changes: string[] = [];
            if (data.assignedTo !== undefined && data.assignedTo !== existing.assignedTo) {
                changes.push(`Assigned employee changed`);
            }
            if (data.estimatedCost !== undefined && data.estimatedCost !== existing.estimatedCost) {
                changes.push(`Estimated cost updated to ₹${data.estimatedCost}`);
            }
            if (data.finalCost !== undefined && data.finalCost !== existing.finalCost) {
                changes.push(`Final cost set to ₹${data.finalCost}`);
            }
            if (data.estimatedDate !== undefined) {
                changes.push(`Estimated delivery date updated`);
            }
            if (data.priority !== undefined && data.priority !== existing.priority) {
                changes.push(`Priority changed to ${data.priority}`);
            }

            await (tx as any).repairHistory.create({
                data: {
                    repairJobId: id,
                    fromStatus: existing.status,
                    toStatus: existing.status,
                    action: 'JOB_UPDATED',
                    notes: changes.length > 0 ? changes.join('; ') : 'Job details updated',
                    snapshot: JSON.stringify(data),
                },
            });

            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'RepairJob',
                    entityId: id,
                    details: `Repair job ${existing.jobNumber} updated`,
                },
            });

            return job;
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

// ─── DELETE /api/v1/repairs/[id] (cancel the job) ────────────────────────────

export async function DELETE(_request: Request, context: any) {
    try {
        const { id } = await context.params;

        const existing = await (prisma as any).repairJob.findUnique({
            where: { id },
            include: { Customer: { select: { name: true, mobile: true } } },
        });
        if (!existing) {
            return NextResponse.json({ message: 'Repair job not found' }, { status: 404 });
        }
        if (existing.status === 'DELIVERED') {
            return NextResponse.json({ message: 'Cannot cancel a delivered repair job' }, { status: 400 });
        }
        if (existing.status === 'CANCELLED') {
            return NextResponse.json({ message: 'Repair job is already cancelled' }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            await (tx as any).repairJob.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });

            await (tx as any).repairHistory.create({
                data: {
                    repairJobId: id,
                    fromStatus: existing.status,
                    toStatus: 'CANCELLED',
                    action: 'JOB_CANCELLED',
                    notes: 'Job cancelled by staff',
                },
            });

            // Notify customer about cancellation
            await tx.repairNotification.create({
                data: {
                    repairJobId: id,
                    type: 'SMS',
                    recipient: existing.Customer.mobile,
                    message: `Dear ${existing.Customer.name}, your repair job ${existing.jobNumber} has been cancelled. Please visit us for more information.`,
                    status: 'PENDING',
                },
            });

            await tx.auditLog.create({
                data: {
                    action: 'CANCEL',
                    entity: 'RepairJob',
                    entityId: id,
                    details: `Repair job ${existing.jobNumber} cancelled`,
                },
            });
        });

        return NextResponse.json({ success: true, message: 'Repair job cancelled' });
    } catch (error) {
        return handleApiError(error);
    }
}
