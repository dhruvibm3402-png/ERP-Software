import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const issueSchema = z.object({
    manufacturingOrderId: z.string(),
    materialType: z.string(),
    metalType: z.string().optional(),
    purity: z.string().optional(),
    grossWeight: z.number().default(0),
    netWeight: z.number().default(0),
    quantity: z.number().default(1),
    remarks: z.string().optional(),
    inventoryId: z.string().optional() // IF linked to specific inventory item
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = issueSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            // Create Issue Record
            const issue = await (tx as any).materialIssue.create({
                data: {
                    manufacturingOrderId: data.manufacturingOrderId,
                    materialType: data.materialType,
                    metalType: data.metalType,
                    purity: data.purity,
                    grossWeight: data.grossWeight,
                    netWeight: data.netWeight,
                    quantity: data.quantity,
                    remarks: data.remarks,
                    issuedById: 'SYSTEM', // Authentication mock
                }
            });

            // Reduce Inventory (Simplified for Job Issue)
            if (data.inventoryId) {
                await (tx as any).inventory.update({
                    where: { id: data.inventoryId },
                    data: {
                        quantity: { decrement: data.quantity },
                        grossWeight: { decrement: data.grossWeight },
                        netWeight: { decrement: data.netWeight }
                    }
                });

                await tx.stockMovement.create({
                    data: {
                        inventoryId: data.inventoryId,
                        type: 'OUT',
                        quantity: data.quantity,
                        weight: data.grossWeight,
                        reference: `MFG_ISSUE_${issue.id}`,
                        reason: 'MANUFACTURING_ISSUE'
                    }
                });
            }

            // Update order status if draft
            await (tx as any).manufacturingOrder.update({
                where: { id: data.manufacturingOrderId },
                data: { status: 'IN_PROGRESS' }
            });

            return issue;
        });

        return NextResponse.json({ data: result, message: 'Material Issued successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
