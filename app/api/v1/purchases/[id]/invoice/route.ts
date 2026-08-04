import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';

export async function POST(req: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        const invoice = await prisma.$transaction(async (tx) => {
            const inv = await (tx as any).purchaseInvoice.create({
                data: {
                    invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
                    purchaseOrderId: id,
                    totalAmount: body.grandTotal,
                    status: 'UNPAID'
                },
                include: { purchaseOrder: { include: { Supplier: true } } }
            });

            await tx.journalEntry.create({
                data: {
                    entryNumber: `JV-PI-${Date.now()}`,
                    reference: inv.invoiceNumber,
                    narration: `Purchase Invoice from ${inv.purchaseOrder.Supplier.name}`,
                    totalAmount: body.grandTotal,
                    lines: {
                        create: [
                            {
                                account: { connectOrCreate: { where: { code: 'PURCHASE' }, create: { code: 'PURCHASE', name: 'Purchase Account', type: 'EXPENSE', isSystem: true } } },
                                type: 'DEBIT',
                                amount: body.grandTotal
                            },
                            {
                                account: { connectOrCreate: { where: { code: 'AP-VENDORS' }, create: { code: 'AP-VENDORS', name: 'Accounts Payable', type: 'LIABILITY', isSystem: true } } },
                                type: 'CREDIT',
                                amount: body.grandTotal
                            }
                        ]
                    }
                }
            });

            await tx.ledgerAccount.updateMany({ where: { code: 'PURCHASE' }, data: { balance: { increment: body.grandTotal } } });
            await tx.ledgerAccount.updateMany({ where: { code: 'AP-VENDORS' }, data: { balance: { increment: body.grandTotal } } });

            return inv;
        });

        return NextResponse.json(invoice);
    } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
