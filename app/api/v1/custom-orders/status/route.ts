import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
import { z } from 'zod';

const statusSchema = z.object({
  customOrderId: z.string().min(1),
  status: z.enum([
    'DRAFT',
    'DESIGN_DISCUSSION',
    'QUOTATION',
    'CUSTOMER_APPROVAL',
    'ADVANCE_PAYMENT',
    'MATERIAL_ALLOCATION',
    'MANUFACTURING',
    'STONE_SETTING',
    'POLISHING',
    'QUALITY_CHECK',
    'READY',
    'INVOICE',
    'DELIVERED',
  ]),
  remarks: z.string().optional(),
  materials: z
    .array(
      z.object({
        productId: z.string(),
        materialType: z.string(),
        weight: z.number(),
        quantity: z.number().default(1),
        purity: z.string().optional(),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customOrderId, status, remarks, materials } = statusSchema.parse(body);

    const order = await prisma.customOrder.findUnique({
      where: { id: customOrderId },
      include: { Customer: true },
    });
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.customOrder.update({
        where: { id: customOrderId },
        data: { status },
      });

      await tx.customOrderStatusHistory.create({
        data: {
          customOrderId,
          fromStatus: order.status,
          toStatus: status,
          remarks,
        },
      });

      let actionName = 'STATUS_UPDATED';
      let notifyMsg = null;

      if (status === 'CUSTOMER_APPROVAL') {
        notifyMsg = 'Waiting for your approval.';
        actionName = 'WAITING_APPROVAL';
      }

      if (status === 'MANUFACTURING') {
        notifyMsg = 'Manufacturing has started.';
        actionName = 'MANUFACTURING_STARTED';

        // Process materials and reduce inventory
        if (materials && materials.length > 0) {
          for (const mat of materials) {
            await tx.customOrderMaterial.create({
              data: {
                customOrderId,
                materialType: mat.materialType,
                weight: mat.weight,
                quantity: mat.quantity,
                purity: mat.purity,
              },
            });

            // Reduce product inventory stock
            const existingProduct = await tx.product.findUnique({ where: { id: mat.productId } });
            if (existingProduct) {
              await tx.product.update({
                where: { id: mat.productId },
                data: { stock: existingProduct.stock - mat.quantity },
              });

              // Add to inventory movement
              await (tx as any).inventoryMovement.create({
                data: {
                  productId: mat.productId,
                  type: 'CUSTOM_ORDER_ALLOCATION',
                  quantity: -mat.quantity,
                  previousStock: existingProduct.stock,
                  currentStock: existingProduct.stock - mat.quantity,
                  reason: `Allocated to Custom Order ${order.orderNumber}`,
                },
              });
            }
          }
        }
      }

      if (status === 'READY') {
        notifyMsg = 'Order is ready for delivery!';
        actionName = 'ORDER_READY';
      }
      if (status === 'DELIVERED') {
        actionName = 'DELIVERED';
      }

      await tx.customOrderTimeline.create({
        data: {
          customOrderId,
          action: actionName,
          remarks: remarks || `Status changed to ${status}`,
        },
      });

      if (notifyMsg && order.Customer?.mobile) {
        await tx.notificationLog.create({
          data: {
            targetPhone: order.Customer.mobile,
            type: 'CUSTOM_ORDER_UPDATE',
            channel: 'SMS',
            message: `Dear ${order.Customer.name}, your custom order ${order.orderNumber} status update: ${notifyMsg}`,
          },
        });
      }

      return updated;
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
