import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';

export async function GET(req: Request, context: any) {
    try {
        const { id } = await context.params;
        const job = await prisma.manufacturingJob.findUnique({
            where: { id },
            include: { karigar: true, materials: true, Product: true }
        });
        if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
        return NextResponse.json({ success: true, job });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request, context: any) {
    try {
        const { id } = await context.params;
        const data = await req.json();
        const job = await prisma.manufacturingJob.update({
            where: { id },
            data,
            include: { karigar: true, materials: true }
        });
        return NextResponse.json({ success: true, job });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: any) {
    try {
        const { id } = await context.params;
        await prisma.manufacturingJob.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
