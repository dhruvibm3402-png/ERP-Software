import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';
import { verifyAccessToken } from '../../../../utils/jwt';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify user role if needed here
    verifyAccessToken(authHeader.split(' ')[1]);

    // Live Aggregations
    const totalCustomers = await prisma.customer.count();

    const products = await prisma.product.findMany();
    const inventoryValue = products.reduce((acc: number, p: any) => acc + p.price * p.stock, 0);

    // In production, we filter these by startOfDay/endOfDay
    const salesTransactions = await prisma.transaction.findMany({ where: { type: 'SALE' } });
    const todaysSales = salesTransactions.reduce((acc: number, t: any) => acc + t.amount, 0);

    const pendingRepairsCount = await (prisma as any).repairJob.count({
      where: { status: { notIn: ['READY', 'DELIVERED'] } },
    });

    // Custom Orders Metrics
    const pendingCustomOrders = await prisma.customOrder.count({ where: { status: 'DRAFT' } });
    const ordersInManufacturing = await prisma.customOrder.count({
      where: { status: 'MANUFACTURING' },
    });
    const ordersReady = await prisma.customOrder.count({ where: { status: 'READY' } });

    return NextResponse.json(
      {
        totalCustomers,
        inventoryValue,
        todaysSales,
        pendingRepairsCount,
        pendingCustomOrders,
        ordersInManufacturing,
        ordersReady,
        // we can add charts data here
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
