import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const [
            totalProducts,
            inventoryStats,
            movements,
        ] = await Promise.all([
            prisma.product.count(),
            (prisma as any).inventory.aggregate({
                _sum: {
                    quantity: true,
                    availableStock: true,
                    reservedStock: true,
                    grossWeight: true
                }
            }),
            (prisma as any).inventoryMovement.findMany({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                },
                select: { type: true, quantity: true }
            })
        ]);

        let todayStockIn = 0;
        let todayStockOut = 0;

        movements.forEach(m => {
            if (m.type === 'STOCK_IN' || m.type === 'PURCHASE') {
                todayStockIn += m.quantity;
            } else if (m.type === 'STOCK_OUT' || m.type === 'SALE') {
                todayStockOut += Math.abs(m.quantity);
            }
        });

        const dashboardData = {
            totalProducts,
            totalQuantity: inventoryStats._sum.quantity || 0,
            availableStock: inventoryStats._sum.availableStock || 0,
            reservedStock: inventoryStats._sum.reservedStock || 0,
            totalGrossWeight: inventoryStats._sum.grossWeight || 0,
            todayStockIn,
            todayStockOut
        };

        return NextResponse.json({ data: dashboardData });
    } catch (error) {
        return handleApiError(error);
    }
}
