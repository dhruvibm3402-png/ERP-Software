import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');
        const limit = Number(searchParams.get('limit')) || 50;

        let where: any = {};
        if (productId) {
            where.productId = productId;
        }

        const events = await (prisma as any).inventoryLedger.findMany({
            where,
            include: { Product: true },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return NextResponse.json(events);
    } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
