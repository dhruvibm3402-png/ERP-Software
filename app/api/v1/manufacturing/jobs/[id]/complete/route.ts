import { NextResponse } from 'next/server';
import prisma from '../../../../../../../lib/prisma';

export async function POST(req: Request, context: any) {
    try {
        const { id } = await context.params;
        const data = await req.json();

        const job = await prisma.manufacturingJob.findUnique({ where: { id } });
        if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });

        const product = await prisma.product.create({
            data: {
                sku: 'SKU-' + Math.floor(Math.random() * 100000),
                barcode: 'BAR-' + Math.floor(Math.random() * 100000),
                qrCode: 'QR-' + Math.floor(Math.random() * 100000),
                name: job.productName || 'Manufactured Product',
                category: job.category || 'Jewellery',
                metal: job.metal || 'Gold',
                purity: job.purity || '22K',
                grossWeight: data.finalGrossWeight || 0,
                netWeight: data.finalNetWeight || 0,
                stoneWeight: data.finalStoneWeight || 0,
                wastage: data.wastage || 0,
                makingChargesTotal: data.makingCharge || 0,
                gstTotal: 3,
                images: '[]',
                price: 0,
                stock: 1
            }
        });

        await (prisma as any).inventory.create({
            data: {
                productId: product.id,
                quantity: 1,
                type: 'RECEIVED',
                remarks: 'Generated from Manufacturing Job ' + job.jobNumber
            }
        });

        const updated = await prisma.manufacturingJob.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedDate: new Date(),
                finalGrossWeight: data.finalGrossWeight,
                finalNetWeight: data.finalNetWeight,
                finalStoneWeight: data.finalStoneWeight,
                wastage: data.wastage,
                makingCharge: data.makingCharge,
                productId: product.id
            },
            include: { karigar: true, materials: true, Product: true }
        });

        return NextResponse.json({ success: true, job: updated });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
