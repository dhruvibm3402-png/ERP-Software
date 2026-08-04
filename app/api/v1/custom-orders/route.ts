import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { handleApiError } from '../../../../utils/errorHandler';
import { z } from 'zod';

const createCustomOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  branchId: z.string().optional(),
  description: z.string().optional(),
  targetDate: z.string().optional(), // ISO string
  advancePaid: z.number().min(0).default(0),
  items: z
    .array(
      z.object({
        itemName: z.string().min(1),
        category: z.string().optional(),
        description: z.string().optional(),
        metal: z.string().optional(),
        purity: z.string().optional(),
        expectedWeight: z.number().optional(),
      })
    )
    .min(1, 'At least one item is required'),
  designerId: z.string().optional(), // Employee ID
  salesExecutiveId: z.string().optional(), // Employee ID
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const customerId = searchParams.get('customerId') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.customOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          Customer: { select: { id: true, name: true, mobile: true } },
          CustomOrderItem: true,
        },
      }),
      prisma.customOrder.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createCustomOrderSchema.parse(body);

    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, isDeleted: false },
    });
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    const orderNumber = `CO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.customOrder.create({
        data: {
          orderNumber,
          customerId: data.customerId,
          branchId: data.branchId,
          description: data.description,
          targetDate: data.targetDate ? new Date(data.targetDate) : null,
          advancePaid: data.advancePaid,
          balance: -data.advancePaid, // negative balance until quotation sets estimates
          CustomOrderItem: {
            create: data.items.map((item) => ({
              itemName: item.itemName,
              category: item.category,
              description: item.description,
              metal: item.metal,
              purity: item.purity,
              expectedWeight: item.expectedWeight,
            })),
          },
        },
      });

      const employeesToAssign = [];
      if (data.designerId)
        employeesToAssign.push({
          employeeId: data.designerId,
          role: 'DESIGNER',
          customOrderId: newOrder.id,
        });
      if (data.salesExecutiveId)
        employeesToAssign.push({
          employeeId: data.salesExecutiveId,
          role: 'SALES_EXECUTIVE',
          customOrderId: newOrder.id,
        });

      if (employeesToAssign.length > 0) {
        await tx.customOrderEmployee.createMany({ data: employeesToAssign });
      }

      if (data.advancePaid > 0) {
        await tx.customOrderPayment.create({
          data: {
            customOrderId: newOrder.id,
            amount: data.advancePaid,
            method: 'CASH',
            type: 'ADVANCE',
          },
        });
      }

      await tx.customOrderTimeline.create({
        data: {
          customOrderId: newOrder.id,
          action: 'CREATED',
          remarks: `Custom order ${orderNumber} created.`,
        },
      });
      await tx.customOrderStatusHistory.create({
        data: {
          customOrderId: newOrder.id,
          fromStatus: null,
          toStatus: 'DRAFT',
          remarks: 'Order Initialized',
        },
      });
      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'CustomOrder',
          entityId: newOrder.id,
          details: `Custom order ${orderNumber} created for customer ${customer.name}`,
        },
      });

      return tx.customOrder.findUnique({
        where: { id: newOrder.id },
        include: { CustomOrderItem: true, CustomOrderEmployee: true },
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
