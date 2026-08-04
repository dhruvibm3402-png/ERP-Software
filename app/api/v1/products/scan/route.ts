import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });

        const product = await prisma.product.findFirst({
            where: {
                OR: [
                    { barcode: code },
                    { qrCode: code },
                    { sku: code }
                ]
            },
            include: { inventory: true }
        });

        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        return NextResponse.json(product);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
