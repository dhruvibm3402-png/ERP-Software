import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const purchaseItemSchema = z
  .object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().min(1),
    rate: z.number().min(0),
    amount: z.number().min(0),
    remarks: z.string().optional(),
  })
  .passthrough(); // pass through other args so they don't break zod but aren't saved to db

const purchaseSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  poDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
  subTotal: z.number().default(0),
  makingChargesTotal: z.number().default(0),
  wastageTotal: z.number().default(0),
  discountTotal: z.number().default(0),
  gstTotal: z.number().default(0),
  grandTotal: z.number().default(0),
  roundOff: z.number().default(0),
  netPayable: z.number().default(0),
  remarks: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const vendorId = searchParams.get('vendorId') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: 'insensitive' } },
        { VendorRecord: { vendorName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    const [purchases, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          VendorRecord: { select: { vendorName: true, vendorCode: true } },
          Branch: { select: { name: true } },
          _count: { select: { PurchaseOrderItem: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return NextResponse.json({
      data: purchases,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = purchaseSchema.parse(body);

    // Generate PO Number
    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          poNumber,
          vendorId: data.vendorId,
          poDate: data.poDate ? new Date(data.poDate) : new Date(),
          expectedDeliveryDate: data.expectedDeliveryDate
            ? new Date(data.expectedDeliveryDate)
            : null,
          branchId: data.branchId || null,
          subTotal: data.subTotal,
          makingChargesTotal: data.makingChargesTotal,
          wastageTotal: data.wastageTotal,
          discountTotal: data.discountTotal,
          gstTotal: data.gstTotal,
          grandTotal: data.grandTotal,
          roundOff: data.roundOff,
          netPayable: data.netPayable,
          amountDue: data.netPayable,
          remarks: data.remarks,
          PurchaseOrderItem: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.rate,
              totalPrice: item.amount,
            })),
          },
        },
        include: { PurchaseOrderItem: true },
      });

      return po;
    });

    return NextResponse.json(
      { message: 'Purchase Order created successfully', data: result },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
