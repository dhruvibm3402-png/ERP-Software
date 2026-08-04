import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        /*
          body: {
            customerId: string | null,
            items: [{ productId, quantity, unitPrice, makingCharges, wastage, gstRate, gstAmount, totalPrice, isReturn, isExchange }],
            payments: [{ method, amount, reference }],
            subTotal, discount, gstTotal, grandTotal
          }
        */

        const result = await prisma.$transaction(async (tx) => {
            const invoice = await tx.saleInvoice.create({
                data: {
                    invoiceNumber: `INV-POS-${Date.now()}`,
                    customerId: body.customerId || null,
                    subTotal: body.subTotal,
                    discount: body.discount,
                    gstTotal: body.gstTotal,
                    grandTotal: body.grandTotal,
                    paidAmount: body.SalePayment.reduce((acc: any, p: any) => acc + p.amount, 0),
                    status: 'PAID', // simplified
                    items: {
                        create: body.items.map((i: any) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                            makingCharges: i.makingCharges || 0,
                            wastage: i.wastage || 0,
                            gstRate: i.gstRate || 3,
                            gstAmount: i.gstAmount || 0,
                            totalPrice: i.totalPrice,
                            isReturn: i.isReturn || false,
                            isExchange: i.isExchange || false,
                        }))
                    },
                    payments: {
                        create: body.SalePayment.map((p: any) => ({
                            amount: p.amount,
                            method: p.method,
                            reference: p.reference || null
                        }))
                    }
                },
                include: { items: true, SalePayment: true }
            });

            // Adjust Inventory
            for (const item of body.items) {
                // If it's a return/exchange coming back IN, we add to inventory
                const multiplier = item.isReturn ? 1 : -1;

                const inventory = await (tx as any).inventory.findFirst({
                    where: { productId: item.productId }
                });

                if (inventory) {
                    await (tx as any).inventory.update({
                        where: { id: inventory.id },
                        data: { quantity: inventory.quantity + (item.quantity * multiplier) }
                    });
                } else {
                    await (tx as any).inventory.create({
                        data: {
                            productId: item.productId,
                            quantity: (item.quantity * multiplier),
                            type: item.isReturn ? 'RETURN_IN' : 'SALE_OUT',
                            remarks: `POS ${invoice.invoiceNumber}`
                        }
                    });
                }
            }

            // Create Double-Entry Accounting Record
            // First, ensure system accounts exist
            const ensureAccount = async (code: string, name: string, type: string) => {
                let acc = await tx.ledgerAccount.findUnique({ where: { code } });
                if (!acc) acc = await tx.ledgerAccount.create({ data: { code, name, type, isSystem: true } });
                return acc;
            };

            const cashAcc = await ensureAccount('CASH', 'Cash Account', 'ASSET');
            const salesAcc = await ensureAccount('SALES', 'Sales Account', 'REVENUE');
            let gstOutAcc;
            if (body.gstTotal > 0) {
                gstOutAcc = await ensureAccount('GST_OUT', 'GST Output Tax', 'LIABILITY');
            }

            // Create Journal Entry
            const je = await tx.journalEntry.create({
                data: {
                    entryNumber: `JV-${Date.now()}`,
                    reference: invoice.invoiceNumber,
                    narration: `POS Checkout ${invoice.invoiceNumber}`,
                    totalAmount: body.grandTotal,
                    lines: {
                        create: [
                            { accountId: cashAcc.id, type: 'DEBIT', amount: body.grandTotal },
                            { accountId: salesAcc.id, type: 'CREDIT', amount: body.subTotal },
                            ...(body.gstTotal > 0 ? [{ accountId: gstOutAcc!.id, type: 'CREDIT', amount: body.gstTotal }] : [])
                        ]
                    }
                }
            });

            // Update Balances
            await tx.ledgerAccount.update({ where: { id: cashAcc.id }, data: { balance: { increment: body.grandTotal } } });
            await tx.ledgerAccount.update({ where: { id: salesAcc.id }, data: { balance: { increment: body.subTotal } } });
            if (body.gstTotal > 0) {
                await tx.ledgerAccount.update({ where: { id: gstOutAcc!.id }, data: { balance: { increment: body.gstTotal } } });
            }

            // Audit
            await tx.auditLog.create({
                data: {
                    action: 'CREATE',
                    entity: 'SaleInvoice',
                    entityId: invoice.id,
                    details: `POS transaction created: ${invoice.invoiceNumber}`
                }
            });

            // Customer analytics update
            if (body.customerId && body.grandTotal > 0) {
                const cust = await tx.customer.findUnique({ where: { id: body.customerId } });
                if (cust) {
                    await tx.customer.update({
                        where: { id: body.customerId },
                        data: {
                            totalSpent: cust.totalSpent + body.grandTotal,
                            lastVisit: new Date(),
                            loyaltyPoints: cust.loyaltyPoints + Math.floor(body.grandTotal / 100) // 1% points
                        }
                    });
                }
            }

            return invoice;
        });

        return NextResponse.json(result);
    } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
