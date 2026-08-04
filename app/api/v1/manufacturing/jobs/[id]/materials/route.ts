import { NextResponse } from 'next/server';
import prisma from '../../../../../../../lib/prisma';

export async function GET(req: Request, context: any) {
    try {
        const { id } = await context.params;
        const materials = await prisma.jobMaterial.findMany({ where: { jobId: id } });
        return NextResponse.json({ success: true, materials });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request, context: any) {
    try {
        const { id } = await context.params;
        const data = await req.json();
        const material = await prisma.jobMaterial.create({
            data: { ...data, jobId: id }
        });
        return NextResponse.json({ success: true, material });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
