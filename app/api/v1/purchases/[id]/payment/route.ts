import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../../utils/errorHandler';
import prisma from '../../../../../../lib/prisma';
import { z } from 'zod';

const paymentSchema = z.object({
    amount: z.number().min(1),
    paymentMode: z.string(),
    reference: z.string().optional()
});

export async function POST(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = paymentSchema.parse(body);

        const existing = await (prisma as any).purchaseOrder.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ message: 'Purchase Order not found' }, { status: 404 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Find or create an overarching invoice for payments
            let invoice = await (tx as any).purchaseInvoice.findFirst({
                where: { purchaseOrderId: id }
            });

            if (!invoice) {
                const count = await (tx as any).purchaseInvoice.count();
                invoice = await (tx as any).purchaseInvoice.create({
                    data: {
                        invoiceNumber: `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`,
                        purchaseOrderId: id,
                        totalAmount: existing.netPayable,
                        paidAmount: 0,
                    }
                });
            }

            const payment = await (tx as any).purchasePayment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: data.amount,
                    paymentMode: data.paymentMode,
                    reference: data.reference,
                }
            });

            const updatedInvoice = await (tx as any).purchaseInvoice.update({
                where: { id: invoice.id },
                data: {
                    paidAmount: { increment: data.amount },
                    status: (invoice.paidAmount + data.amount) >= invoice.grandTotal ? 'PAID' : 'PARTIALLY_PAID'
                }
            });

            const newAmountPaid = existing.amountPaid + data.amount;
            const newAmountDue = existing.netPayable - newAmountPaid;

            const updatedPo = await (tx as any).purchaseOrder.update({
                where: { id },
                data: {
                    amountPaid: newAmountPaid,
                    amountDue: newAmountDue,
                    paymentStatus: newAmountDue <= 0 ? 'PAID' : 'PARTIAL'
                }
            });

            // Ledger Entry
            await tx.vendorLedger.create({
                data: {
                    vendorId: existing.vendorId,
                    type: 'DEBIT',
                    amount: data.amount,
                    balance: existing.netPayable - newAmountPaid, // simplify logic for scope
                    referenceId: payment.id,
                    description: `Payment against PO: ${existing.poNumber}`
                }
            });

            return updatedPo;
        });

        return NextResponse.json({ message: 'Payment recorded successfully', data: result });
    } catch (error) {
        return handleApiError(error);
    }
}
