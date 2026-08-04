import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
import { z } from 'zod';

const paymentSchema = z.object({
  customOrderId: z.string().min(1),
  amount: z.number().min(0.01),
  method: z.string(), // CASH, UPI, CARD, BANK, CHEQUE, MIXED
  type: z.string().default('OUTSTANDING'),
  reference: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = paymentSchema.parse(body);

    const order = await prisma.customOrder.findUnique({ where: { id: data.customOrderId } });
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.customOrderPayment.create({
        data: {
          ...data,
        },
      });

      const newBalance = order.balance - data.amount;

      await tx.customOrder.update({
        where: { id: order.id },
        data: {
          balance: newBalance,
          ...(data.type === 'ADVANCE' && { advancePaid: order.advancePaid + data.amount }),
        },
      });

      await tx.customOrderTimeline.create({
        data: {
          customOrderId: order.id,
          action: 'PAYMENT_RECEIVED',
          remarks: `Received ${data.amount} via ${data.method} (${data.type})`,
        },
      });

      // Accounting ledger entry
      await tx.accountingEntry.create({
        data: {
          type: 'INCOME',
          category: data.type === 'ADVANCE' ? 'CUSTOM_ORDER_ADVANCE' : 'CUSTOM_ORDER_PAYMENT',
          amount: data.amount,
          description: `Payment for Custom Order ${order.orderNumber} via ${data.method}`,
          referenceId: payment.id,
        },
      });

      return payment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
