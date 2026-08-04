import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { handleApiError } from '../../../../../../utils/errorHandler';
import { z } from 'zod';

// ─── Validation ────────────────────────────────────────────────────────────────

const sendNotificationSchema = z.object({
    type: z.enum(['SMS', 'EMAIL', 'WHATSAPP', 'IN_APP']),
    message: z.string().min(5, 'Message is required'),
    recipient: z.string().optional(), // Override default recipient if needed
});

const markSentSchema = z.object({
    notificationId: z.string().min(1),
    status: z.enum(['SENT', 'FAILED']),
    failReason: z.string().optional(),
});

// ─── GET /api/v1/repairs/[id]/notifications ───────────────────────────────────
//
// Returns all notifications for this repair job with optional status filter

export async function GET(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || '';

        const job = await (prisma as any).repairJob.findUnique({
            where: { id },
            select: { id: true, jobNumber: true },
        });
        if (!job) {
            return NextResponse.json({ message: 'Repair job not found' }, { status: 404 });
        }

        const where: any = { repairJobId: id };
        if (status) where.status = status;

        const notifications = await prisma.repairNotification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        const stats = {
            total: notifications.length,
            sent: notifications.filter((n) => n.status === 'SENT').length,
            pending: notifications.filter((n) => n.status === 'PENDING').length,
            failed: notifications.filter((n) => n.status === 'FAILED').length,
        };

        return NextResponse.json({ jobNumber: job.jobNumber, stats, data: notifications });
    } catch (error) {
        return handleApiError(error);
    }
}

// ─── POST /api/v1/repairs/[id]/notifications ──────────────────────────────────
//
// Manually send or queue a custom notification to the customer

export async function POST(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = sendNotificationSchema.parse(body);

        const job = await (prisma as any).repairJob.findUnique({
            where: { id },
            include: {
                Customer: { select: { name: true, mobile: true, email: true } },
            },
        });
        if (!job) {
            return NextResponse.json({ message: 'Repair job not found' }, { status: 404 });
        }

        // Resolve recipient: provided override, or default by channel
        let recipient = data.recipient;
        if (!recipient) {
            if (data.type === 'EMAIL') {
                recipient = job.Customer.email ?? '';
                if (!recipient) {
                    return NextResponse.json({ message: 'Customer has no email address on file' }, { status: 400 });
                }
            } else {
                recipient = job.Customer.mobile;
            }
        }

        const notification = await prisma.$transaction(async (tx) => {
            const notif = await tx.repairNotification.create({
                data: {
                    repairJobId: id,
                    type: data.type,
                    recipient,
                    message: data.message,
                    status: 'PENDING',
                },
            });

            await tx.auditLog.create({
                data: {
                    action: 'NOTIFICATION_QUEUED',
                    entity: 'RepairJob',
                    entityId: id,
                    details: `${data.type} notification queued for repair job ${job.jobNumber}`,
                },
            });

            return notif;
        });

        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}

// ─── PATCH /api/v1/repairs/[id]/notifications ─────────────────────────────────
//
// Mark a notification as SENT or FAILED (called by the notification delivery service)

export async function PATCH(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = markSentSchema.parse(body);

        const notification = await prisma.repairNotification.findFirst({
            where: { id: data.notificationId, repairJobId: id },
        });
        if (!notification) {
            return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
        }

        const updated = await prisma.repairNotification.update({
            where: { id: data.notificationId },
            data: {
                status: data.status,
                sentAt: data.status === 'SENT' ? new Date() : null,
                failReason: data.status === 'FAILED' ? (data.failReason ?? 'Unknown error') : null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
