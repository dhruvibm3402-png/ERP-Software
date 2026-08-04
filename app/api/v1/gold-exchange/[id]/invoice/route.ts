import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { handleApiError } from '../../../../../../utils/errorHandler';

export async function GET(_request: Request, context: any) {
    try {
        const { id } = await context.params;

        // Use any to bypass strict type checking since GoldExchange models are misaligned
        const exchange: any = await prisma.goldExchange.findUnique({
            where: { id },
            include: {
                Customer: true,
                GoldExchangeItem: true,
                ExchangePayment: { orderBy: { createdAt: 'asc' } },
                SaleInvoice: {
                    include: {
                        SaleItem: { include: { Product: true } },
                        SalePayment: true
                    }
                }
            },
        });

        if (!exchange) return NextResponse.json({ message: 'Gold Exchange not found' }, { status: 404 });

        if (!['EXCHANGED', 'INVOICED'].includes(exchange.status)) {
            return NextResponse.json(
                { message: `Invoice available only after exchange is completed. Current status: ${exchange.status}` },
                { status: 400 }
            );
        }

        if (exchange.status === 'EXCHANGED') {
            await prisma.$transaction(async (tx) => {
                await tx.goldExchange.update({
                    where: { id },
                    data: { status: 'INVOICED' },
                });
                await tx.auditLog.create({
                    data: {
                        action: 'INVOICE',
                        entity: 'GoldExchange',
                        entityId: id,
                        details: `Invoice generated for ${exchange.exchangeNumber}`,
                    },
                });
            });
        }

        const invoice = {
            exchangeNumber: exchange.exchangeNumber,
            date: exchange.updatedAt,
            customer: exchange.Customer,
            oldGold: {
                items: exchange.GoldExchangeItem,
                totalExchangeValue: exchange.totalExchangeValue,
            },
            settlement: {
                payments: exchange.ExchangePayment,
            },
            remarks: exchange.remarks,
        };

        return NextResponse.json(invoice);
    } catch (error) {
        return handleApiError(error);
    }
}
