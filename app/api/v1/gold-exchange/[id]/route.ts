import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
import { z } from 'zod';

// ─── Allowed status transitions ───────────────────────────────────────────────
const TRANSITIONS: Record<string, string[]> = {
    INITIATED: ['WEIGHED', 'CANCELLED'],
    WEIGHED: ['PURITY_TESTED', 'CANCELLED'],
    PURITY_TESTED: ['DEDUCTED', 'CANCELLED'],
    DEDUCTED: ['VALUED', 'CANCELLED'],
    VALUED: ['EXCHANGED', 'CANCELLED'],
    EXCHANGED: ['INVOICED'],
    INVOICED: [],
    CANCELLED: [],
};

// ─── Step-specific update schemas ─────────────────────────────────────────────

const weightSchema = z.object({
    step: z.literal('WEIGHT'),
    grossWeight: z.number().positive(),
    netWeight: z.number().positive(),
    remarks: z.string().optional(),
});

const puritySchema = z.object({
    step: z.literal('PURITY'),
    purityPercent: z.number().min(0).max(100),
    purityLabel: z.string().min(1),
    touchMethod: z.enum(['TOUCHSTONE', 'XRF', 'ACID']),
    remarks: z.string().optional(),
});

const deductionSchema = z.object({
    step: z.literal('DEDUCTION'),
    stoneWeight: z.number().min(0).default(0),
    wastagePercent: z.number().min(0).max(100).default(0),
    otherDeductions: z.number().min(0).default(0),
    remarks: z.string().optional(),
});

const updateSchema = z.discriminatedUnion('step', [weightSchema, puritySchema, deductionSchema]);

// Helper: include spec for the full exchange record
const fullInclude = {
    customer: {
        select: { id: true, customerId: true, name: true, mobile: true, email: true, tier: true, loyaltyPoints: true },
    },
    GoldExchangeItem: true,
    payments: true,
    history: { orderBy: { createdAt: 'asc' as const } },
    saleInvoice: {
        include: { items: { include: { Product: { select: { id: true, name: true, sku: true } } } }, payments: true },
    },
};

// ─── GET /api/v1/gold-exchange/[id] ───────────────────────────────────────────

export async function GET(_request: Request, context: any) {
    try {
        const { id } = await context.params;

        const exchange = await prisma.goldExchange.findUnique({
            where: { id },
            include: fullInclude,
        });

        if (!exchange) {
            return NextResponse.json({ message: 'Gold Exchange not found' }, { status: 404 });
        }

        return NextResponse.json(exchange);
    } catch (error) {
        return handleApiError(error);
    }
}

// ─── PUT /api/v1/gold-exchange/[id]  (step-by-step updates) ──────────────────
//
//  step = "WEIGHT"    → records gross/net weight, transitions to WEIGHED
//  step = "PURITY"    → records purity info, transitions to PURITY_TESTED
//  step = "DEDUCTION" → computes final weight, transitions to DEDUCTED

export async function PUT(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = updateSchema.parse(body);

        const existing = await prisma.goldExchange.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ message: 'Gold Exchange not found' }, { status: 404 });
        }
        if (existing.status === 'CANCELLED') {
            return NextResponse.json({ message: 'Cannot update a cancelled exchange' }, { status: 400 });
        }
        if (existing.status === 'INVOICED') {
            return NextResponse.json({ message: 'Exchange is already invoiced' }, { status: 400 });
        }

        let updateData: any = {};
        let nextStatus = existing.status;
        let action = '';

        if (data.step === 'WEIGHT') {
            if (!TRANSITIONS[existing.status]?.includes('WEIGHED')) {
                return NextResponse.json(
                    { message: `Cannot record weight from status "${existing.status}"` },
                    { status: 400 }
                );
            }
            updateData = {
                grossWeight: data.grossWeight,
                netWeight: data.netWeight,
                remarks: data.remarks ?? existing.remarks,
                status: 'WEIGHED',
            };
            nextStatus = 'WEIGHED';
            action = 'WEIGHT_RECORDED';
        } else if (data.step === 'PURITY') {
            if (!TRANSITIONS[existing.status]?.includes('PURITY_TESTED')) {
                return NextResponse.json(
                    { message: `Cannot record purity from status "${existing.status}"` },
                    { status: 400 }
                );
            }
            updateData = {
                purityPercent: data.purityPercent,
                purityLabel: data.purityLabel,
                touchMethod: data.touchMethod,
                remarks: data.remarks ?? existing.remarks,
                status: 'PURITY_TESTED',
            };
            nextStatus = 'PURITY_TESTED';
            action = 'PURITY_TESTED';
        } else if (data.step === 'DEDUCTION') {
            if (!TRANSITIONS[existing.status]?.includes('DEDUCTED')) {
                return NextResponse.json(
                    { message: `Cannot apply deductions from status "${existing.status}"` },
                    { status: 400 }
                );
            }

            const baseWeight = existing.totalNetWeight ?? existing.totalGrossWeight ?? 0;
            const afterStone = baseWeight - (data.stoneWeight ?? 0);
            const wastageDeduct = afterStone * ((data.wastagePercent ?? 0) / 100);
            const finalWeight = Math.max(0, afterStone - wastageDeduct);

            updateData = {
                stoneWeight: data.stoneWeight,
                wastagePercent: data.wastagePercent,
                otherDeductions: data.otherDeductions,
                finalWeight,
                remarks: data.remarks ?? existing.remarks,
                status: 'DEDUCTED',
            };
            nextStatus = 'DEDUCTED';
            action = 'DEDUCTIONS_APPLIED';
        }

        const updated = await prisma.$transaction(async (tx) => {
            const gex = await tx.goldExchange.update({
                where: { id },
                data: updateData,
                include: fullInclude,
            });

            

            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'GoldExchange',
                    entityId: id,
                    details: `${action} on exchange ${existing.exchangeNumber}`,
                },
            });

            return gex;
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

// ─── DELETE /api/v1/gold-exchange/[id]  (cancel) ─────────────────────────────

export async function DELETE(_request: Request, context: any) {
    try {
        const { id } = await context.params;

        const existing = await prisma.goldExchange.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ message: 'Gold Exchange not found' }, { status: 404 });
        }
        if (['INVOICED', 'CANCELLED'].includes(existing.status)) {
            return NextResponse.json(
                { message: `Cannot cancel an exchange that is already ${existing.status}` },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.goldExchange.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });

            

            await tx.auditLog.create({
                data: {
                    action: 'CANCEL',
                    entity: 'GoldExchange',
                    entityId: id,
                    details: `Gold Exchange ${existing.exchangeNumber} cancelled`,
                },
            });
        });

        return NextResponse.json({ success: true, message: 'Exchange cancelled' });
    } catch (error) {
        return handleApiError(error);
    }
}
