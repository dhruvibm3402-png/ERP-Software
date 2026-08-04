import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const saleItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
    grossWeight: z.number().default(0),
    netWeight: z.number().default(0),
    metalRate: z.number().default(0),
    makingCharge: z.number().default(0),
    wastageCharge: z.number().default(0),
    stoneCharge: z.number().default(0),
    discount: z.number().default(0),
    gstRate: z.number().default(3),
    amount: z.number().min(0)
});

const salePaymentSchema = z.object({
    amount: z.number().min(1),
    method: z.string(), // CASH, CARD, UPI
    reference: z.string().optional()
});

const saleSchema = z.object({
    customerId: z.string().optional().nullable(),
    branchId: z.string().optional().nullable(),
    subTotal: z.number().default(0),
    totalMaking: z.number().default(0),
    totalWastage: z.number().default(0),
    discount: z.number().default(0),
    gstTotal: z.number().default(0),
    oldGoldValue: z.number().default(0),
    roundOff: z.number().default(0),
    grandTotal: z.number().default(0),
    paidAmount: z.number().default(0),
    status: z.string().default('COMPLETED'),
    remarks: z.string().optional(),
    items: z.array(saleItemSchema).min(1, 'At least one item is required'),
    payments: z.array(salePaymentSchema).optional()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = saleSchema.parse(body);

        let balanceAmount = data.grandTotal - data.paidAmount;
        if (balanceAmount < 0) balanceAmount = 0; // Prevent negative balances structurally

        const paymentStatus = balanceAmount <= 0 ? 'PAID' : (data.paidAmount > 0 ? 'PARTIAL' : 'UNPAID');

        const result = await prisma.$transaction(async (tx) => {
            const count = await tx.saleInvoice.count();
            const invNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

            const sale = await tx.saleInvoice.create({
                data: {
                    invoiceNumber: invNumber,
                    customerId: data.customerId || null,
                    branchId: data.branchId || null,
                    status: data.status,
                    paymentStatus,
                    subTotal: data.subTotal,
                    totalMaking: data.totalMaking,
                    totalWastage: data.totalWastage,
                    discount: data.discount,
                    gstTotal: data.gstTotal,
                    roundOff: data.roundOff,
                    grandTotal: data.grandTotal,
                    paidAmount: data.paidAmount,
                    balanceAmount,
                    oldGoldValue: data.oldGoldValue,
                    remarks: data.remarks,
                    items: {
                        create: data.items.map(i => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            grossWeight: i.grossWeight,
                            netWeight: i.netWeight,
                            metalRate: i.metalRate,
                            makingCharge: i.makingCharge,
                            wastageCharge: i.wastageCharge,
                            stoneCharge: i.stoneCharge,
                            discount: i.discount,
                            gstRate: i.gstRate,
                            gstAmount: (i.amount * i.gstRate) / 100, // simplified breakdown map
                            amount: i.amount
                        }))
                    },
                    payments: data.SalePayment && data.SalePayment.length > 0 ? {
                        create: data.SalePayment.map(p => ({
                            amount: p.amount,
                            method: p.method,
                            reference: p.reference
                        }))
                    } : undefined
                },
                include: { items: true, SalePayment: true }
            });

            // Stock Deductions & Movements
            if (data.status === 'COMPLETED') {
                for (const item of data.items) {
                    const inv = await (tx as any).inventory.findFirst({
                        where: { productId: item.productId, branchId: data.branchId || null }
                    });

                    const prevStock = inv ? inv.quantity : 0;
                    const prevAvail = inv ? inv.availableStock : 0;

                    if (inv) {
                        await (tx as any).inventory.update({
                            where: { id: inv.id },
                            data: {
                                quantity: inv.quantity - item.quantity,
                                availableStock: inv.availableStock - item.quantity
                            }
                        });
                    }

                    await (tx as any).inventoryMovement.create({
                        data: {
                            productId: item.productId,
                            branchId: data.branchId || null,
                            type: 'SALE',
                            quantity: -item.quantity,
                            weight: -item.netWeight,
                            previousStock: prevStock,
                            currentStock: prevStock - item.quantity,
                            referenceId: sale.id,
                            reason: `Sale Invoice: ${invNumber}`
                        }
                    });

                    // Overall product tracking
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            }

            return sale;
        });

        return NextResponse.json({ message: 'Sale completed successfully', data: result });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit') || '50');

        const sales = await prisma.saleInvoice.findMany({
            where: {
                OR: [
                    { invoiceNumber: { contains: search, mode: 'insensitive' } },
                    { customer: { name: { contains: search, mode: 'insensitive' } } }
                ]
            },
            include: {
                Customer: true,
                items: true,
                SalePayment: true
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ data: sales });
    } catch (error) {
        return handleApiError(error);
    }
}
