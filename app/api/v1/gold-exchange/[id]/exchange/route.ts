import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { handleApiError } from '../../../../../../utils/errorHandler';
import { z } from 'zod';

// ─── Validation ────────────────────────────────────────────────────────────────

const exchangeSchema = z.object({
    exchangeMode: z.enum(['PRODUCT_EXCHANGE', 'CASH_CREDIT', 'MIXED']),

    // Products the customer is taking (required if mode involves products)
    saleItems: z
        .array(
            z.object({
                productId: z.string().min(1),
                quantity: z.number().int().positive(),
                unitPrice: z.number().positive(),
                makingCharges: z.number().min(0).default(0),
                wastage: z.number().min(0).default(0),
                gstRate: z.number().min(0).default(3),
                gstAmount: z.number().min(0).default(0),
                totalPrice: z.number().positive(),
            })
        )
        .optional()
        .default([]),

    // Payments settling any balance due from the customer
    payments: z
        .array(
            z.object({
                method: z.enum(['CASH', 'CARD', 'UPI', 'BANK', 'CREDIT_NOTE']),
                amount: z.number().positive(),
                reference: z.string().optional(),
                direction: z.enum(['PAYOUT', 'RECEIPT']).default('RECEIPT'),
            })
        )
        .optional()
        .default([]),

    cashPayout: z.number().min(0).default(0),   // cash given to customer
    creditNote: z.number().min(0).default(0),    // store credit given to customer
    remarks: z.string().optional(),
});

// ─── POST /api/v1/gold-exchange/[id]/exchange ─────────────────────────────────
//
// Finalises the exchange:
//   1. Creates a SaleInvoice (with isExchange flag on all sale items)
//   2. Adjusts inventory for each sold product (OUT) and the old gold item (IN concept logged)
//   3. Settles balance: totalExchangeValue - saleTotal - cashPayout - creditNote = balanceDue
//   4. Records all payments
//   5. Transitions status → EXCHANGED
//   6. Updates customer analytics

export async function POST(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = exchangeSchema.parse(body);

        const existing = await prisma.goldExchange.findUnique({
            where: { id },
            include: { Customer: true },
        });
        if (!existing) {
            return NextResponse.json({ message: 'Gold Exchange not found' }, { status: 404 });
        }
        if (existing.status !== 'VALUED') {
            return NextResponse.json(
                { message: `Exchange requires status VALUED. Current: ${existing.status}` },
                { status: 400 }
            );
        }

        const totalExchangeValue = existing.totalExchangeValue ?? 0;

        // Total value of new products the customer is taking
        const saleSubTotal = data.saleItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
        const saleGstTotal = data.saleItems.reduce((s, i) => s + i.gstAmount, 0);
        const saleGrandTotal = data.saleItems.reduce((s, i) => s + i.totalPrice, 0);

        // How much the exchange value covers towards the new purchase
        const exchangeCredit = Math.min(totalExchangeValue, saleGrandTotal);

        // Balance the customer still needs to pay (positive) or receives back (negative)
        const balanceDue = saleGrandTotal - totalExchangeValue - (data.cashPayout + data.creditNote);

        const result = await prisma.$transaction(async (tx) => {
            let saleInvoiceId: string | null = null;

            // 1. Create sale invoice if products are being exchanged
            if (data.saleItems.length > 0) {
                const invoiceNumber = `INV-GEX-${Date.now()}`;
                const invoice = await tx.saleInvoice.create({
                    data: {
                        invoiceNumber,
                        customerId: existing.customerId,
                        subTotal: saleSubTotal,
                        discount: exchangeCredit,   // exchange value applied as discount
                        gstTotal: saleGstTotal,
                        grandTotal: Math.max(0, saleGrandTotal - exchangeCredit),
                        paidAmount: data.payments
                            .filter((p) => p.direction === 'RECEIPT')
                            .reduce((s, p) => s + p.amount, 0),
                        status: balanceDue <= 0 ? 'PAID' : 'PARTIAL',
                        SaleItem: {
                            create: data.saleItems.map((i) => ({
                                productId: i.productId,
                                quantity: i.quantity,
                                unitPrice: i.unitPrice,
                                makingChargesTotal: i.makingCharges,
                                wastage: i.wastage,
                                gstRate: i.gstRate,
                                gstAmount: i.gstAmount,
                                totalPrice: i.totalPrice,
                                isExchange: true,
                            })),
                        },
                        SalePayment: {
                            create: data.payments
                                .filter((p) => p.direction === 'RECEIPT')
                                .map((p) => ({
                                    method: p.method,
                                    amount: p.amount,
                                    reference: p.reference ?? null,
                                })),
                        },
                    },
                    include: { SaleItem: true, SalePayment: true },
                });

                saleInvoiceId = invoice.id;

                // 2. Adjust inventory for sold items (OUT)
                for (const item of data.saleItems) {
                    const inv = await (tx as any).inventory.findFirst({ where: { productId: item.productId } });
                    if (inv) {
                        await (tx as any).inventory.update({
                            where: { id: inv.id },
                            data: { quantity: inv.quantity - item.quantity },
                        });
                    }

                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    if (product) {
                        await tx.stockMovement.create({
                            data: {
                                productId: item.productId,
                                type: 'GOLD_EXCHANGE_OUT',
                                quantity: item.quantity,
                                referenceId: id,
                                remarks: `Gold Exchange ${existing.exchangeNumber}`,
                            },
                        });
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: product.stock - item.quantity },
                        });
                    }
                }

                // 3. Accounting entry for the sale
                await tx.accountingEntry.create({
                    data: {
                        type: 'CREDIT',
                        category: 'SALES',
                        amount: saleGrandTotal,
                        description: `Gold Exchange Sale ${invoice.invoiceNumber}`,
                        referenceId: invoice.id,
                    },
                });
            }

            // 4. Record payout payments on the exchange
            const payoutPayments = data.payments.filter((p) => p.direction === 'PAYOUT');
            const receiptPayments = data.payments.filter((p) => p.direction === 'RECEIPT');

            const allPaymentRecords = [
                ...payoutPayments.map((p) => ({
                    exchangeId: id,
                    method: p.method,
                    amount: p.amount,
                    reference: p.reference ?? null,
                    direction: 'PAYOUT' as const,
                })),
                ...receiptPayments.map((p) => ({
                    exchangeId: id,
                    method: p.method,
                    amount: p.amount,
                    reference: p.reference ?? null,
                    direction: 'RECEIPT' as const,
                })),
            ];

            if (allPaymentRecords.length > 0) {
                await tx.exchangePayment.createMany({ data: allPaymentRecords });
            }

            // 5. Update the exchange record
            const gex = await tx.goldExchange.update({
                where: { id },
                data: {
                    status: 'EXCHANGED',
                    linkedSaleInvoiceId: saleInvoiceId,
                    remarks: data.remarks ? `${existing.remarks || ''}\nMode: ${data.exchangeMode}\nCash Out: ${data.cashPayout}\nCredit: ${data.creditNote}` : existing.remarks,
                },
                include: {
                    Customer: {
                        select: { id: true, customerId: true, name: true, mobile: true },
                    },
                    GoldExchangeItem: true,
                    ExchangePayment: true,
                    SaleInvoice: { include: { SaleItem: true, SalePayment: true } },
                },
            });


            // 7. Update customer analytics
            const totalSpentIncrease = Math.max(0, balanceDue);
            await tx.customer.update({
                where: { id: existing.customerId },
                data: {
                    totalSpent: { increment: totalSpentIncrease },
                    lastVisit: new Date(),
                    loyaltyPoints: { increment: Math.floor(saleGrandTotal / 100) },
                },
            });

            // 8. Audit
            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'GoldExchange',
                    entityId: id,
                    details: `Gold Exchange ${existing.exchangeNumber} completed. Mode: ${data.exchangeMode}, Net value: ₹${totalExchangeValue.toFixed(2)}`,
                },
            });

            return gex;
        });

        return NextResponse.json(result);
    } catch (error) {
        return handleApiError(error);
    }
}
