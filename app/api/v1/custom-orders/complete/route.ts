import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
import { z } from 'zod';

const completeSchema = z.object({
  customOrderId: z.string().min(1),
  productName: z.string().min(1),
  category: z.string().min(1),
  metal: z.string().min(1),
  purity: z.string().min(1),
  grossWeight: z.number().min(0.01),
  netWeight: z.number().min(0.01),
  stoneWeight: z.number().default(0),
  wastage: z.number().default(0),
  makingCharges: z.number().default(0),
  gst: z.number().default(3),
  price: z.number().min(0),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = completeSchema.parse(body);

    const order = await prisma.customOrder.findUnique({
      where: { id: data.customOrderId },
      include: { Customer: true },
    });
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    if (order.productId)
      return NextResponse.json(
        { message: 'Product already generated for this order' },
        { status: 400 }
      );

    const result = await prisma.$transaction(async (tx) => {
      const sku = `CO-SKU-${Date.now()}`;
      const barcode = `BC-${Date.now()}`;
      const qrCode = `QR-${Date.now()}`;

      const product = await tx.product.create({
        data: {
          sku,
          barcode,
          qrCode,
          name: data.productName,
          category: data.category,
          metal: data.metal,
          purity: data.purity,
          grossWeight: data.grossWeight,
          netWeight: data.netWeight,
          stoneWeight: data.stoneWeight,
          wastage: data.wastage,
          makingCharges: data.makingCharges,
          gst: data.gst,
          price: data.price,
          stock: 1, // Ready for billing
          images: '[]', // Placeholder, optionally pull from customOrder images  
          CustomOrder: { connect: { id: order.id } },
        },
      });

      await (tx as any).inventory.create({
        data: {
          productId: product.id,
          branchId: order.branchId,
          quantity: 1,
          availableStock: 1,
        },
      });

      await tx.customOrder.update({
        where: { id: order.id },
        data: { status: 'READY', productId: product.id },
      });

      await tx.customOrderStatusHistory.create({
        data: {
          customOrderId: order.id,
          fromStatus: order.status,
          toStatus: 'READY',
          remarks: 'Product generated, Ready for Billing',
        },
      });

      await tx.customOrderTimeline.create({
        data: {
          customOrderId: order.id,
          action: 'PRODUCT_CREATED',
          remarks: `Generated product ${data.productName} (SKU: ${sku})`,
        },
      });

      if (order.Customer?.mobile) {
        await tx.notificationLog.create({
          data: {
            targetPhone: order.Customer.mobile,
            type: 'CUSTOM_ORDER_READY',
            channel: 'SMS',
            message: `Dear ${order.Customer.name}, your custom order ${order.orderNumber} is ready for pickup/delivery!`,
          },
        });
      }

      return product;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
