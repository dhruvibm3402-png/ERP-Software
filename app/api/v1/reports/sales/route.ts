import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let whereClause: any = {};

        if (startDate && endDate) {
            whereClause.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        if (status) whereClause.status = status;

        if (search) {
            whereClause.OR = [
                { invoiceNumber: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const data = await prisma.saleInvoice.findMany({
            where: whereClause,
            include: { Customer: true, items: true },
            orderBy: { createdAt: 'desc' }
        });

        // Compute summary manually
        const totalSalesValue = data.reduce((acc, row) => acc + (row.grandTotal || 0), 0);
        const totalPaid = data.reduce((acc, row) => acc + (row.paidAmount || 0), 0);
        const totalDue = data.reduce((acc, row) => acc + (row.balanceAmount || 0), 0);

        return NextResponse.json({
            data,
            meta: {
                count: data.length,
                totalSalesValue,
                totalPaid,
                totalDue
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
