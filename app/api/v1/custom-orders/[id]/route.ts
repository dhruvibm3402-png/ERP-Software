import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
import { z } from 'zod';

export async function GET(request: Request, context: any) {
  try {
    const { id } = await context.params;

    const order = await prisma.customOrder.findUnique({
      where: { id },
      include: {
        Customer: true,
        CustomOrderItem: true,
        CustomOrderImage: true,
        CustomOrderTimeline: { orderBy: { createdAt: 'desc' } },
        CustomOrderPayment: { orderBy: { createdAt: 'desc' } },
        CustomOrderMaterial: true,
        CustomOrderEmployee: { include: { Employee: true } },
        CustomOrderApproval: true,
        CustomOrderStatusHistory: { orderBy: { changedAt: 'desc' } },
        CustomOrderQuotation: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return handleApiError(error);
  }
}

const updateSchema = z.object({
  description: z.string().optional(),
  targetDate: z.string().optional(),
});

export async function PUT(request: Request, context: any) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const order = await prisma.customOrder.update({
      where: { id },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.targetDate && { targetDate: new Date(data.targetDate) }),
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { id } = await context.params;
    await prisma.customOrder.delete({ where: { id } });
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
