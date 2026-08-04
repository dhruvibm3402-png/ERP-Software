import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            salesAggregate,
            monthlySales,
            purchasesAggregate,
            outstandingRec,
            outstandingPay,
            inventoryAggregate,
            lowStockCount,
            topProducts,
            recentSales
        ] = await Promise.all([
            // Total sales revenue (PAID invoices)
            prisma.saleInvoice.aggregate({
                where: { status: 'PAID' },
                _sum: { grandTotal: true }
            }),
            // Monthly sales
            prisma.saleInvoice.aggregate({
                where: { createdAt: { gte: firstDayOfMonth }, status: 'PAID' },
                _sum: { grandTotal: true }
            }),
            // Total purchase orders amount
            (prisma as any).purchaseOrder.aggregate({
                _sum: {grandTotal: true}
            }),
            // Outstanding receivables — partial sale invoices
            prisma.saleInvoice.aggregate({
                where: { status: 'PARTIAL' },
                _sum: { grandTotal: true, paidAmount: true }
            }),
            // Outstanding payables — unpaid purchase invoices
            (prisma as any).purchaseInvoice.aggregate({
                where: { status: { in: ['UNPAID', 'PARTIAL'] } },
                _sum: { totalAmount: true, paidAmount: true }
            }),
            // Inventory totals
            (prisma as any).inventory.aggregate({
                _sum: { quantity: true }
            }),
            // Low stock products (stock <= 5)
            prisma.product.count({
                where: { stock: { lte: 5 }, isDeleted: false }
            }),
            // Top 5 products by stock (proxy until sales volume tracking)
            prisma.product.findMany({
                where: { isDeleted: false },
                orderBy: { stock: 'desc' },
                take: 5,
                select: { id: true, name: true, sku: true, category: true, stock: true, price: true }
            }),
            // Recent sales
            prisma.saleInvoice.findMany({
                where: { status: 'PAID' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    Customer: {
                        select: { id: true, name: true, mobile: true, customerId: true }
                    }
                }
            })
        ]);

        const receivables = Math.max(0, (outstandingRec._sum.grandTotal ?? 0) - (outstandingRec._sum.paidAmount ?? 0));
        const payables    = Math.max(0, (outstandingPay._sum.grandTotal ?? 0) - (outstandingPay._sum.paidAmount ?? 0));

        return NextResponse.json({
            data: {
                totalSales:             salesAggregate._sum.grandTotal  ?? 0,
                monthlyRevenue:         monthlySales._sum.grandTotal    ?? 0,
                totalPurchases:         purchasesAggregate._sum.grandTotal ?? 0,
                outstandingReceivables: receivables,
                outstandingPayables:    payables,
                inventoryItems:         inventoryAggregate._sum.quantity ?? 0,
                lowStockCount,
                topProducts,
                recentSales
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
