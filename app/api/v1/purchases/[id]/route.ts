import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const purchaseItemSchema = z.object({
    id: z.string().optional(), // For updates
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().min(1),
    grossWeight: z.number().default(0),
    netWeight: z.number().default(0),
    stoneWeight: z.number().default(0),
    rate: z.number().min(0),
    makingCharges: z.number().default(0),
    wastage: z.number().default(0),
    gst: z.number().default(0),
    discountTotal: z.number().default(0),
    amount: z.number().min(0),
    remarks: z.string().optional()
});

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
    items: z.array(purchaseItemSchema).min(1, 'At least one item is required')
});

export async function GET(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const purchase = await (prisma as any).purchaseOrder.findUnique({
            where: { id },
            include: {
                Vendor: true,
                Branch: true,
                items: {
                    include: { Product: true }
                },
                invoices: {
                    include: { PurchasePayment: true }
                },
                returns: {
                    include: { PurchaseItem: true }
                }
            }
        });

        if (!purchase) {
            return NextResponse.json({ message: 'Purchase not found' }, { status: 404 });
        }

        return NextResponse.json(purchase);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = purchaseSchema.parse(body);

        const existing = await (prisma as any).purchaseOrder.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ message: 'Purchase Order not found' }, { status: 404 });
        }

        if (existing.status !== 'DRAFT' && existing.status !== 'PENDING_APPROVAL') {
            return NextResponse.json({ message: 'Cannot edit purchase order in this status' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Delete all existing items (simplest way to handle updates without tracking diffs)
            await (tx as any).purchaseOrderItem.deleteMany({
                where: { purchaseOrderId: id }
            });

            // Update main record and recreate items
            const po = await (tx as any).purchaseOrder.update({
                where: { id },
                data: {
                    vendorId: data.vendorId,
                    poDate: data.poDate ? new Date(data.poDate) : new Date(),
                    expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
                    branchId: data.branchId || null,
                    subTotal: data.subTotal,
                    makingChargesTotal: data.makingChargesTotal,
                    wastageTotal: data.wastageTotal,
                    discountTotal: data.discountTotal,
                    gstTotal: data.gstTotal,
                    grandTotal: data.grandTotal,
                    roundOff: data.roundOff,
                    netPayable: data.netPayable,
                    amountDue: data.netPayable - existing.amountPaid,
                    remarks: data.remarks,
                    items: {
                        create: data.PurchaseItem.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            grossWeight: item.grossWeight,
                            netWeight: item.netWeight,
                            stoneWeight: item.stoneWeight,
                            rate: item.rate,
                            makingChargesTotal: item.makingCharges,
                            wastage: item.wastage,
                            gstTotal: item.gst,
                            discountTotal: item.discount,
                            amount: item.amount,
                            remarks: item.remarks
                        }))
                    }
                },
                include: { PurchaseItem: true }
            });

            return po;
        });

        return NextResponse.json({ message: 'Purchase Order updated successfully', data: result });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const result = await (prisma as any).purchaseOrder.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
        return NextResponse.json({ message: 'Purchase order cancelled successfully', data: result });
    } catch (error) {
        return handleApiError(error);
    }
}
