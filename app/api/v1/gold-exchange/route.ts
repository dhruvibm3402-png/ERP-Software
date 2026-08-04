import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const itemSchema = z.object({
    itemName: z.string(),
    category: z.string(),
    metalType: z.string(),
    description: z.string().optional(),
    quantity: z.number().default(1),
    grossWeight: z.number(),
    stoneWeight: z.number().default(0),
    netWeight: z.number(),
    purity: z.string().optional(),
    hallmarkNumber: z.string().optional()
});

const exchangeSchema = z.object({
    customerId: z.string(),
    branchId: z.string().optional().nullable(),
    remarks: z.string().optional(),
    items: z.array(itemSchema).min(1, "At least one item required.")
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = exchangeSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            const count = await tx.goldExchange.count();
            const num = `GEX-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

            let totalGrossWeight = 0;
            let totalNetWeight = 0;

            data.items.forEach(i => {
                totalGrossWeight += Number(i.grossWeight);
                totalNetWeight += Number(i.netWeight);
            });

            const exchange = await tx.goldExchange.create({
                data: {
                    exchangeNumber: num,
                    customerId: data.customerId,
                    branchId: data.branchId || null,
                    totalGrossWeight,
                    totalNetWeight,
                    remarks: data.remarks,
                    GoldExchangeItem: {
                        create: data.items.map(i => ({
                            itemName: i.itemName,
                            category: i.category,
                            metalType: i.metalType,
                            description: i.description,
                            quantity: i.quantity,
                            grossWeight: i.grossWeight,
                            stoneWeight: i.stoneWeight,
                            netWeight: i.netWeight,
                            purity: i.purity,
                            hallmarkNumber: i.hallmarkNumber
                        }))
                    }
                },
                include: { GoldExchangeItem: true, Customer: true }
            });
            return exchange;
        });

        return NextResponse.json({ data: result, message: 'Gold Exchange Initiated' });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        const data = await prisma.goldExchange.findMany({
            where: {
                OR: [
                    { exchangeNumber: { contains: search, mode: 'insensitive' } },
                    { Customer: { name: { contains: search, mode: 'insensitive' } } }
                ]
            },
            include: { Customer: true, GoldExchangeItem: true, GoldValuation: true, GoldPurityTest: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ data });
    } catch (error) {
        return handleApiError(error);
    }
}
