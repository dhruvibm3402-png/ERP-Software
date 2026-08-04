import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const transferItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
    weight: z.number().default(0)
});

const transferSchema = z.object({
    sourceBranchId: z.string().min(1),
    destBranchId: z.string().min(1),
    remarks: z.string().optional(),
    items: z.array(transferItemSchema).min(1)
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = transferSchema.parse(body);

        if (data.sourceBranchId === data.destBranchId) {
            return NextResponse.json({ message: 'Source and destination branches cannot be the same' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const count = await (tx as any).stockTransfer.count();
            const transfer = await (tx as any).stockTransfer.create({
                data: {
                    transferNumber: `TRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`,
                    sourceBranchId: data.sourceBranchId,
                    destBranchId: data.destBranchId,
                    remarks: data.remarks,
                    items: {
                        create: data.items.map(i => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            weight: i.weight
                        }))
                    }
                },
                include: { items: true }
            });

            // Since it's PENDING by default, we just reserve the stock in the source branch so it can't be sold
            for (const item of data.items) {
                const inv = await (tx as any).inventory.findFirst({
                    where: { productId: item.productId, branchId: data.sourceBranchId }
                });

                if (!inv || inv.availableStock < item.quantity) {
                    throw new Error(`Insufficient stock for Product ID: ${item.productId}`);
                }

                await (tx as any).inventory.update({
                    where: { id: inv.id },
                    data: {
                        availableStock: inv.availableStock - item.quantity,
                        reservedStock: inv.reservedStock + item.quantity
                    }
                });
            }

            return transfer;
        });

        return NextResponse.json({ message: 'Stock Transfer initiated successfully', data: result });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function GET(request: Request) {
    try {
        const transfers = await (prisma as any).stockTransfer.findMany({
            include: {
                sourceBranch: true,
                destBranch: true,
                items: { include: { Product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ data: transfers });
    } catch (error) {
        return handleApiError(error);
    }
}
