import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { handleApiError } from '../../../../../../utils/errorHandler';
import { z } from 'zod';

const valuationSchema = z.object({
    goldRatePerGram: z.number().positive('Gold rate must be positive'),
    makingChargeDeduction: z.number().min(0).default(0),
    remarks: z.string().optional(),
});

// ─── POST /api/v1/gold-exchange/[id]/valuation ────────────────────────────────
//
// Requires status = DEDUCTED (finalWeight must be set).
// Computes:
//   grossValue        = finalWeight * (purityPercent / 100) * goldRatePerGram
//   totalExchangeValue  = grossValue - makingChargeDeduction
// Transitions status → VALUED

export async function POST(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = valuationSchema.parse(body);

        const existing: any = await prisma.goldExchange.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ message: 'Gold Exchange not found' }, { status: 404 });
        }
        if (existing.status !== 'DEDUCTED') {
            return NextResponse.json(
                { message: `Valuation requires status DEDUCTED. Current: ${existing.status}` },
                { status: 400 }
            );
        }
        if (!existing.finalWeight || existing.finalWeight <= 0) {
            return NextResponse.json(
                { message: 'Final weight not set. Complete the deduction step first.' },
                { status: 400 }
            );
        }

        const purity = existing.purityPercent ?? 100;
        const pureWeight = existing.finalWeight * (purity / 100);
        const grossValue = pureWeight * data.goldRatePerGram;
        const totalExchangeValue = Math.max(0, grossValue - data.makingChargeDeduction);

        const updated = await prisma.$transaction(async (tx) => {
            const gex = await (tx.goldExchange.update as any)({
                where: { id },
                data: {
                    goldRatePerGram: data.goldRatePerGram,
                    makingChargeDeduction: data.makingChargeDeduction,
                    grossValue,
                    totalExchangeValue,
                    status: 'VALUED',
                    remarks: data.remarks ?? existing.remarks,
                },
                include: {
                    Customer: {
                        select: { id: true, customerId: true, name: true, mobile: true },
                    },
                    GoldExchangeItem: true,
                },
            });

            

            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'GoldExchange',
                    entityId: id,
                    details: `Valuation set on ${existing.exchangeNumber}: net value ₹${totalExchangeValue.toFixed(2)}`,
                },
            });

            return gex;
        });

        return NextResponse.json({
            ...updated,
            valuation: {
                finalWeight: existing.finalWeight,
                purityPercent: purity,
                pureWeight: parseFloat(pureWeight.toFixed(4)),
                goldRatePerGram: data.goldRatePerGram,
                grossValue: parseFloat(grossValue.toFixed(2)),
                makingChargeDeduction: data.makingChargeDeduction,
                totalExchangeValue: parseFloat(totalExchangeValue.toFixed(2)),
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
