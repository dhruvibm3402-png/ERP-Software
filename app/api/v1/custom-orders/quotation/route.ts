import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
import { z } from 'zod';

const quotationSchema = z.object({
  customOrderId: z.string().min(1),
  goldWeight: z.number().optional(),
  diamondWeight: z.number().optional(),
  stoneWeight: z.number().optional(),
  makingCharges: z.number().optional(),
  labourCharges: z.number().optional(),
  designCharges: z.number().optional(),
  gstAmount: z.number().optional(),
  discount: z.number().optional(),
  advanceAmount: z.number().optional(),
  grandTotal: z.number().min(0, 'Grand total is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = quotationSchema.parse(body);

    const order = await prisma.customOrder.findUnique({
      where: { id: data.customOrderId },
      include: { Customer: true },
    });
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const quotation = await tx.customOrderQuotation.create({
        data: {
          ...data,
        },
      });

      // Update balance and estimated total based on quotation
      await tx.customOrder.update({
        where: { id: data.customOrderId },
        data: {
          estimatedTotal: data.grandTotal,
          balance: data.grandTotal - order.advancePaid,
          status: 'QUOTATION',
        },
      });

      await tx.customOrderStatusHistory.create({
        data: {
          customOrderId: order.id,
          fromStatus: order.status,
          toStatus: 'QUOTATION',
          remarks: 'Quotation Generated',
        },
      });

      await tx.customOrderTimeline.create({
        data: {
          customOrderId: order.id,
          action: 'QUOTATION_GENERATED',
          remarks: `Quotation generated for Grand Total: ${data.grandTotal}`,
        },
      });

      // Send Notification
      if (order.Customer?.mobile) {
        await tx.notificationLog.create({
          data: {
            targetPhone: order.Customer.mobile,
            type: 'CUSTOM_ORDER',
            channel: 'SMS',
            message: `Dear ${order.Customer.name}, a quotation for your custom order ${order.orderNumber} is ready for approval.`,
          },
        });
      }

      return quotation;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
