import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
import { z } from 'zod';

const approveSchema = z.object({
  customOrderId: z.string().min(1),
  stage: z.string(), // DESIGN, QUOTATION, FINAL
  status: z.string(), // APPROVED, REJECTED
  remarks: z.string().optional(),
  approvedBy: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = approveSchema.parse(body);

    const order = await prisma.customOrder.findUnique({ where: { id: data.customOrderId } });
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      const approval = await tx.customOrderApproval.create({
        data: {
          ...data,
          approvedAt: new Date(),
        },
      });

      await tx.customOrderTimeline.create({
        data: {
          customOrderId: order.id,
          action: `CUSTOMER_APPROVAL_${data.status}`,
          remarks: `Customer ${data.status} for ${data.stage} stage. Remarks: ${data.remarks || 'None'}`,
        },
      });

      return approval;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
