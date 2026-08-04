import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../../utils/errorHandler';
import prisma from '../../../../../../lib/prisma';
import { z } from 'zod';

const valuationSchema = z.object({
    currentGoldRate: z.number(),
    meltingLossPct: z.number().default(0),
    deductionPct: z.number().default(0),
    stoneDeduction: z.number().default(0),
    labourDeduction: z.number().default(0),
    finalGoldWeight: z.number(),
    finalExchangeValue: z.number(),

    // Also pass purity test to save atomically
    purityPercent: z.number(),
    karat: z.string(),
    testMethod: z.string(),
    testedBy: z.string().optional(),
    notes: z.string().optional()
});

export async function POST(request: Request, context: any) {
    try {
        const { id  } = await context.params;
        const body = await request.json();
        const data = valuationSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            const exchange = await tx.goldExchange.findUnique({ where: { id }, include: { GoldExchangeItem: true } });
            if (!exchange) throw new Error('Gold Exchange record not found');
            if (exchange.status === 'APPROVED') throw new Error('Exchange is already approved');

            // 1. Create Purity Test
            await tx.goldPurityTest.create({
                data: {
                    exchangeId: id,
                    purityPercent: data.purityPercent,
                    karat: data.karat,
                    testMethod: data.testMethod,
                    testedBy: data.testedBy,
                    notes: data.notes
                }
            });

            // 2. Create Valuation
            await tx.goldValuation.create({
                data: {
                    exchangeId: id,
                    currentGoldRate: data.currentGoldRate,
                    meltingLossPct: data.meltingLossPct,
                    deductionPct: data.deductionPct,
                    stoneDeduction: data.stoneDeduction,
                    labourDeduction: data.labourDeduction,
                    finalGoldWeight: data.finalGoldWeight,
                    finalExchangeValue: data.finalExchangeValue
                }
            });

            // 3. Update Exchange Status
            const updated = await tx.goldExchange.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    totalExchangeValue: data.finalExchangeValue
                }
            });

            // 4. Update Inventory (Virtual 'OLD_GOLD' storage movement for reference)
            // Represent Old Gold being received. We don't have a rigid 'OLD_GOLD' product map automatically,
            // but we represent it in Movement logs. (Actual ERPs refine later)
            for (const item of exchange.GoldExchangeItem) {
                // Create raw material placeholder log or if we have an OLD-GOLD SKU we update it.
                // Omitting literal product stock update as 'OLD_GOLD_RAW' sku is standardly generated dynamically off logic,
                // Logging to general ledger for audit tracing:
                await tx.accountingEntry.create({
                    data: {
                        type: 'ASSET_INCREASE',
                        category: 'OLD_GOLD_RECEIVED',
                        amount: data.finalExchangeValue,
                        description: `Received Old Gold - Exchange ${exchange.exchangeNumber}`,
                        referenceId: id
                    }
                });
            }

            return updated;
        });

        return NextResponse.json({ data: result, message: 'Exchange Approved & Valuated' });
    } catch (error) {
        return handleApiError(error);
    }
}
